var gulp = require('gulp');
var babel = require('gulp-babel');
var sass = require('gulp-sass');
var flatten = require('gulp-flatten');
var concat = require('gulp-concat');
var uglifycss = require('gulp-uglifycss');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
//var vinylPaths = require('vinyl-paths');

var browserify = require('browserify')
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');

var babelify = require('babelify');
var less = require('gulp-less');
var merge = require('merge-stream');

var fs = require("fs");

// options

var individualsJs = [
  './src/bower_components/uikit/js/uikit.min.js',
  './src/bower_components/jquery/dist/jquery.min.js',
]

var individualsCss = [

]

// Folder what will be remove after default task
var folderToDelete = [
  //'./app/node_modules',
  //'./app/bower_components',
  //'./app/assets'
]


gulp.task('default',['css','js','srcToApp'],function(){

  del(folderToDelete);

});

// functions

// compile and concat sass to css, less to css , css(only concat) and merge them
var mergeCss = function(){
  var streamSass = gulp.src(['./src/assets/**/*.sass','./src/assets/sass/**/*.scss'])
        .pipe(sass().on('error', sass.logError))
        .pipe(flatten())
        .pipe(concat('mainSass.css'));

  var streamLess = gulp.src('./src/assets/**/*.less')
        .pipe(less())
        .pipe(flatten())
        .pipe(concat('mainLess.css'));

  var streamCss = gulp.src('./src/assets/**/*.css')
        .pipe(concat('mainCss.css'));

  return merge(streamSass,streamLess,streamCss)
        .pipe(concat('main.css'))
        .pipe(sourcemaps.init())
          .pipe(uglifycss())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./app/css'));
}

var babelDevelopment = function(){
  var b = browserify({
    entries: [
      './src/bower_components/jquery/dist/jquery.min.js',
      './src/index.js'
    ],
    debug: true
  }).transform(babelify,{presets: ["stage-0","es2015", "react"]});

  return b.bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .on('error', gutil.log)
    //.pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        //.pipe(uglify())
        //.on('error', gutil.log)
    //.pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./app/js/'));
};

// Babel when is in production
// use uglify
var babelProduction = function(){

  var b = browserify({
    entries: './src/index.js',
    debug: true
  }).transform(babelify,{presets: ["stage-0","es2015", "react"]});

  return b.bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./app/js/'));

};

// Use babel in individual javascript files
// and copy them in app/js
var indJs = function(){
  if(process.env.NODE_ENV == 'production'){
    return gulp.src(individualsJs)
          .pipe(babel())
          .pipe(flatten())
          .pipe(uglify())
          .on('error', gutil.log)
          .pipe(gulp.dest('./app/js'))
  }else{
    return gulp.src(individualsJs)
          .pipe(babel())
          .pipe(flatten())
          .pipe(gulp.dest('./app/js'))
  }

}

// sass to css
gulp.task('css',['clean'],function(){
  //sassToCss();
  mergeCss();
});

// babel
gulp.task('js',['clean'],function(){
  if(process.env.NODE_ENV == 'production'){
    babelProduction();
  }else{
    babelDevelopment();
  }
  if(individualsJs.length > 0){
    indJs();
  }
  //babel();
});

// clean all app
gulp.task('clean',function(){
  return del('app/**/*');
});

// clean only css from app
gulp.task('cleanCss',function(){
  return del('app/css/**/*.*');
});

// copy src to app directory
gulp.task('srcToApp',['clean'],function(){
  return gulp.src([
    '!./src/node_modules/**/*.*',
    '!./src/bower_components/**/*.*',
    '!./src/assets/**/*.*',
    './src/**/*.*'
  ])
  .pipe(gulp.dest('./app'))
});

// watch sass files
gulp.watch([
  './src/assets/sass/**/*.sass',
  './src/assets/sass/**/*.less',
  './src/assets/sass/**/*.scss'],function(){
  gutil.log(gutil.colors.magenta('watch'), gutil.colors.cyan('css'));
  //sassToCss();
  mergeCss();
});

// watch javascript files
gulp.watch('./src/**/*.js',function(){
  gutil.log(gutil.colors.magenta('watch'), gutil.colors.cyan('babel'));
  if(process.env.NODE_ENV == 'production'){
    babelProduction();
  }else{
    babelDevelopment();
  }
  if(individualsJs.length > 0){
    indJs();
  }
});

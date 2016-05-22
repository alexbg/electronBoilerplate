var gulp = require('gulp');
var babel = require('gulp-babel');
var sass = require('gulp-sass');
var flatten = require('gulp-flatten');
var concat = require('gulp-concat');
var uglifycss = require('gulp-uglifycss');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var vinylPaths = require('vinyl-paths');

var browserify = require('browserify')
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var browserify = require("browserify");
var babelify = require('babelify');

var fs = require("fs");

gulp.task('default',['sass','js','srcToApp'],function(){

  del('./app/assets');

});

// functions

var sassToCss = function(){
  return gulp.src('./src/assets/**/*.sass')
        .pipe(sass().on('error', sass.logError))
        .pipe(flatten())
        .pipe(concat('main.css'))
        .pipe(sourcemaps.init())
          .pipe(uglifycss())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./app/css'));
};

var babel = function(){
  var b = browserify({
    entries: './src/assets/js/index.js',
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
}

// sass to css
gulp.task('sass',['clean'],function(){
  sassToCss();
});

// babel
gulp.task('js',['clean'],function(){

  babel();

});

gulp.task('clean',function(){
  return del('app/**/*');
});

gulp.task('cleanCss',function(){
  return del('app/css/**/*.*');
});

gulp.task('srcToApp',['clean'],function(){
  return gulp.src('./src/**/*.*')
  .pipe(gulp.dest('./app'))
});

gulp.watch('./src/assets/sass/**/*.sass',function(){
  gutil.log(gutil.colors.magenta('watch'), gutil.colors.cyan('sass'));
  sassToCss();
});

gulp.watch('./src/assets/js/**/*.js',function(){
  gutil.log(gutil.colors.magenta('watch'), gutil.colors.cyan('babel'));
  babel();
});

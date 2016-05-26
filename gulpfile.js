var gulp = require('gulp');
var del = require('del');
var imagemin = require('gulp-imagemin');
var notify = require('gulp-notify');
var sassruby = require('gulp-ruby-sass');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var cssnano = require('gulp-cssnano');
var rename = require('gulp-rename');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var cssnano = require('gulp-cssnano');
var concat = require('gulp-concat');

var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};

var autoprefixerOptions = {
  browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
};

gulp.task('styles', function() {
  return sassruby('app/lib/css/main.scss', { style: 'expanded' })
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest('dist/lib/css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(cssnano())
    .pipe(gulp.dest('dist/lib/css'))
    .pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('copy-html', function(){
  return gulp.src('app/*.html')
      .pipe(gulp.dest('dist'))
});

gulp.task('fonts', function(){
  return gulp.src('app/lib/fonts/**/*')
      .pipe(gulp.dest('dist/lib/fonts'))
});

gulp.task('images', function() {
  return gulp.src('app/lib/image/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/lib/img'))
    .pipe(notify({ message: 'Images task complete' }));
});

gulp.task('clean', function() {
    return del(['dist/lib/css', 'dist/lib/js', 'dist/lib/img', 'dist/*.html', 'app/lib/css/*.css']);
});

//compile sass files to css & reload the browser
gulp.task('sass1', function(){
  return gulp.src('app/lib/scss/*.scss')
      .pipe(concat('app.scss'))
      .pipe(sass())  //compile sass to css
      .pipe(gulp.dest('app/lib/css'))
      .pipe(cssnano())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('dist/lib/css'))
      .pipe(browserSync.reload({
        stream: true
      }))
});

gulp.task('sass', function () {
  return gulp
    .src('app/lib/scss/*.scss')
    .pipe(sourcemaps.init())
    .pipe(concat('app.scss'))
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest('app/lib/css'))
    .pipe(cssnano())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/lib/css'))
});

gulp.task('browserSync',function(){
  browserSync.init({
    server : {
      baseDir : 'app'
    }
  })
});


gulp.task('mytask', function(){


  var MyNum = function(n) {
    this.retValue = n;
    this.add = function(n){
      return this.retValue + n;
    }

  }

  var reduce = function(n){
    return this.retValue - n;
  }

  var show = function(){
    console.log(this.retValue);
  }

  reduce.prototype = Object.create(show.prototype);
  MyNum.add.prototype = Object.create(reduce.prototype);

  MyNum(2).add(5).reduce(6).show();


});

//concatenate all javascript and css embed in html pages and minify it
gulp.task('useref', function(){
  return gulp.src('app/*.html')
      .pipe(useref())
      .pipe(gulpif('*.js', uglify())) //minify js
      .pipe(gulpif('*.css', cssnano())) //minify css
      .pipe(gulp.dest('dist/lib'))
});

gulp.task('watch', ['browserSync', 'sass'], function(){
  gulp.watch('app/lib/**/*.scss', ['sass']);
  //reload the vrowser
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/lib/js/**/*.js', browserSync.reload);
});

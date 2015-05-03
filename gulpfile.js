// --- gulp !
var gulp = require('gulp');

// --- gulp plugins !
var nodemon = require('gulp-nodemon');
var jade = require('gulp-jade');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var bower = require('gulp-bower');

// --- vars (TODO: config ?)
var public = './server/public';
var publicLib = './server/public/vendor';
var jadeFiles = './app/**/*.jade';
var jsFiles = './app/**/*.js';
var finalJs = 'geoneighbours.js';
var finalMinJs = 'geoneighbours.min.js';
var assetsSrc = './assets/**';
var assetsDest = public + '/assets';

// --- Lint
gulp.task('lint', function() {
  return gulp.src(jsFiles)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// --- Concat & uglify
gulp.task('miniglify', function(){
  return gulp.src(jsFiles)
    .pipe(concat(finalJs))
    .pipe(gulp.dest(public))
    .pipe(rename(finalMinJs))
    .pipe(uglify())
    .pipe(gulp.dest(public));
});

// --- Assets
gulp.task('assets', function(){
  gulp.src(assetsSrc)
    .pipe(gulp.dest(assetsDest));
});

// --- Jade to HTML
gulp.task('jade', function() {
  gulp.src(jadeFiles)
    .pipe(jade())
    .pipe(gulp.dest(public))
});

// --- Bower
gulp.task('bower', function(){
  return bower()
    .pipe(gulp.dest(publicLib));
});

// --- Start server
gulp.task('start', function() {
  nodemon({
    script: 'server/server.js',
    env: {'NODE_ENV': 'development'},
  });
});

// --- Watch !!!
gulp.task('watch', function() {
    gulp.watch(jadeFiles, ['jade']);
    gulp.watch(jsFiles, ['lint', 'miniglify']);
});

// --- Default
gulp.task('default', ['assets', 'bower', 'lint', 'miniglify', 'jade', 'start', 'watch']);

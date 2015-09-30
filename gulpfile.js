var gulp = require('gulp');
var jasmine = require('gulp-jasmine');

gulp.task('tests', function () {
  return gulp.src('test/localDataAPI.spec.js')
    .pipe(jasmine({ includeStackTrace: true }));
});
const gulp = require('gulp');
const zip = require('gulp-zip');

gulp.task('build_bar', () => {
  return gulp.src([
    'src/bar/**/*',
    '!src/bar/**/*.example.*'
  ]).pipe(zip('app.bar'))
    .pipe(gulp.dest('dist'))
});
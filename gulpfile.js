// Dependencies
const gulp = require('gulp');
const watch = require('gulp-watch');
const wait = require('gulp-wait');
const concat = require('gulp-concat');
const cleancss = require('gulp-clean-css');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant')
const browserSync = require('browser-sync').create();

// Important folder paths
const PATHS = {
  'docs': './docs',
  'src': {
    'scss': './src/scss',
    'images': './src/images'
  },
  'dist': {
    'css': `./docs/dist/css`,
    'js': `./docs/dist/js`,
    'img': './docs/dist/img'
  }
}

// Compile sass, autoprefix it and concat the files into one bundle
gulp.task('bundle-css-dev', () => {
  // Watch files and rerun on change/add/delete
  return watch(`${PATHS.src.scss}/**/*.scss`, {
    ignoreInitial: false
  }, () => {
    gulp.src(`${PATHS.src.scss}/main.scss`)
      .pipe(wait(500)) // Fixes file not found error on vscode
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefixer())
      .pipe(concat('bundle.css'))
      .pipe(gulp.dest(`${PATHS.dist.css}`));
  })
});

// Compile sass, prefix, concat and minify it
gulp.task('bundle-css-prod', () => {

  return gulp.src(`${PATHS.src.scss}/main.scss`)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(concat('bundle.min.css'))
    .pipe(cleancss())
    .pipe(gulp.dest(`${PATHS.dist.css}`));
});

// Compress images
gulp.task('compress-images', () => {
  gulp.src(`${PATHS.src.images}/*`)
    .pipe(imagemin({
      progressive: true,
      use: [pngquant()]
    }))
    .pipe(gulp.dest(`${PATHS.dist.img}`));
});

// Use browser-sync to serve files over static server
gulp.task('browser-sync', () => {
  // Browser-sync properties
  browserSync.init({
    'notify': false,
    'server': {
      'baseDir': './docs'
    }
  });
  // Reload browser when files in docs folder change
  gulp.watch(`${PATHS.docs}/**/*`).on('change', browserSync.reload);
});

// Master task that bundles every other development task
gulp.task('dev', ['bundle-css-dev', 'browser-sync']);

// Master task that bundles every other production task
gulp.task('prod', ['bundle-css-prod', 'compress-images']);
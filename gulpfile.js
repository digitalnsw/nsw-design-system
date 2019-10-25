const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sourcemaps = require('gulp-sourcemaps');
const browsersync = require('browser-sync').create();
const surge = require('gulp-surge');
const sassLint = require('gulp-sass-lint');
const svgSprite = require('gulp-svg-sprite');
const del = require('del');
const postcssNormalize = require('postcss-normalize');
var sassGlob = require('gulp-sass-glob');

sass.compiler = require('node-sass');

const dir = {
  src : './src/',
  build : './dist/'
}

const svgConfig = {
  src : dir.src + 'assets/svg/*.svg',
  watch : dir.src + 'assets/svg/*.svg',
  build : dir.build + 'assets/svg/',
  svgSprite: {
    "mode": {
      "defs": {
        "dest": "",
        "sprite": "sprite.svg"
      }
    }
  }
}

const scssConfig = {
  src : dir.src + 'main.scss',
  watch : dir.src + '**/*.scss',
  build : dir.build + 'css/'
}

const postcssProcessors = [
  postcssNormalize({ forceImport: true }),
  autoprefixer,
  cssnano
];

const htmlConfig = {
  src : dir.src + '*.html',
  watch : dir.src + '*.html',
  build : dir.build
}

function compileSvg() {
  return src(svgConfig.src)
    .pipe(svgSprite(svgConfig.svgSprite)).on('error', function(error){ console.log(error); })
    .pipe(dest(svgConfig.build))
    .pipe(browsersync.reload({ stream: true }));
}

function buildStyles() {
  return src(scssConfig.src)
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(postcssProcessors))
    .pipe(sourcemaps.write())
    .pipe(dest(scssConfig.build))
    .pipe(browsersync.reload({ stream: true }));
}

function lintStyles(){
  return src(scssConfig.watch)
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
}

function copyHtml() {
  return src(htmlConfig.src)
    .pipe(dest(htmlConfig.build))
    .pipe(browsersync.reload({ stream: true }));
}

function watchFiles(done) {
  watch(scssConfig.watch, styles);
  watch(htmlConfig.watch, copyHtml);
  watch(svgConfig.watch, compileSvg);
  done();
}

function browserSync(done) {
  browsersync.init({
    server: {
       baseDir: dir.build,
       index: 'index.html'
    }
  })
  done();
}

function surgeDeploy(done) {
  return surge({
    project: dir.build,
    domain: 'nswdesignsystem.surge.sh'
  })
  done();
}

function cleanUp() {
    return del(dir.build + '**', {force:true});
}

const styles = series(lintStyles, buildStyles);
const build = series(cleanUp, copyHtml, styles, compileSvg, surgeDeploy);
const dev = series(copyHtml, styles, compileSvg, watchFiles, browserSync)

// Export commands.
exports.scss = buildStyles; // $ gulp sass - compiles the sass
exports.watch = watchFiles; // $ gulp watch - watches the files
exports.lint = lintStyles; // $ gulp lint - lints the sass
exports.svg = compileSvg; // $ gulp lint - lints the sass
exports.build = build; // $ gulp build - builds the files
exports.clean = cleanUp; // $ gulp build - clean the dist directory
exports.default = dev; // $ gulp - default gulp task

const {
  src, dest, watch, series,
} = require('gulp')
const sass = require('gulp-sass')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const sourcemaps = require('gulp-sourcemaps')
const browsersync = require('browser-sync')
const surge = require('gulp-surge')
const zip = require('gulp-zip')
const sassLint = require('gulp-sass-lint')
const svgSprite = require('gulp-svg-sprite')
const del = require('del')
const postcssNormalize = require('postcss-normalize')
const sassGlob = require('gulp-sass-glob')
const Metalsmith = require('metalsmith')
const layouts = require('metalsmith-layouts')
const inplace = require('metalsmith-in-place')
const collections = require('metalsmith-collections')
const ignore = require('metalsmith-ignore')
const discoverPartials = require('metalsmith-discover-partials')
const dataLoader = require('metalsmith-data-loader')
const debug = require('metalsmith-debug-ui')
const discoverHelpers = require('metalsmith-discover-helpers')
const rollup = require('gulp-better-rollup')
const babel = require('rollup-plugin-babel')
const eslint = require('gulp-eslint')
const config = require('./config')

const server = browsersync.create()
sass.compiler = require('node-sass')

const postcssProcessors = [
  postcssNormalize({ forceImport: true }),
  autoprefixer,
  cssnano,
]

function compileSvg() {
  return src(config.svg.src)
    .pipe(svgSprite(config.svg.svgSprite))
    .on('error', (error) => {
      console.log(error)
    })
    .pipe(dest(config.svg.build))
}

function buildStyles() {
  return src(config.scss.src)
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(postcssProcessors))
    .pipe(sourcemaps.write())
    .pipe(dest(config.scss.build))
}

function lintStyles() {
  return src(config.scss.watch)
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
}

function browserSync(done) {
  server.init(config.browsersync)
  done()
}

function reload(done) {
  server.reload()
  done()
}

function surgeDeploy() {
  return surge(config.surge)
}

function cleanUp() {
  return del(`${config.build}**`, { force: true })
}

function cleanBuild(files, metalsmith, done) {
  const fileNames = Object.keys(files)
  fileNames.forEach((path) => {
    const file = path.split('.')
    if (
      file[0].indexOf('assets') > -1
      || file[0].indexOf('global') > -1
      || file[0].indexOf('partials') > -1
      || file[0].indexOf('partials') > -1
      || file[0].indexOf('_') > -1
    ) {
      delete files[path]
    }
  })
  done(null, files)
}

function metalsmithBuild(callback) {
  const metalsmith = new Metalsmith(__dirname)
  // debug.patch(metalsmith)
  metalsmith.metadata(config.metalSmith.metadata)
  metalsmith.source(config.metalSmith.src)
  metalsmith.destination(config.metalSmith.build)
  metalsmith.use(ignore(config.metalSmith.ignoreFiles))
  metalsmith.clean(false)
  metalsmith.use(discoverHelpers(config.metalSmith.helpers))
  metalsmith.use(discoverPartials(config.metalSmith.partials))
  metalsmith.use(dataLoader(config.metalSmith.data))
  metalsmith.use(collections(config.metalSmith.collection))
  metalsmith.use(inplace(config.metalSmith.inplace))
  metalsmith.use(layouts(config.metalSmith.layouts))
  metalsmith.use(cleanBuild)
  metalsmith.build((err) => {
    if (err) {
      throw err
    }
    callback()
  })
}

function compileJS() {
  return src(config.js.src)
    .pipe(
      rollup(
        {
          plugins: [babel()],
        },
        {
          name: 'NSW',
          format: 'umd',
        },
      ),
    )
    .pipe(dest(config.js.build))
}

function lintJavascript() {
  return src(config.js.watch)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
}

function copyFavicon() {
  return src(config.favicon.src)
    .pipe(dest(config.favicon.build))
}

const styles = series(lintStyles, buildStyles)
const javascript = series(lintJavascript, compileJS)

function watchFiles(done) {
  watch(config.scss.watch, series(styles, reload))
  watch(config.js.watch, series(javascript, reload))
  watch(config.svg.watch, series(compileSvg, reload))
  watch(config.metalSmith.watch, series(metalsmithBuild, reload))
  done()
}

function zipDistFolder() {
  return src('./dist/**')
        .pipe(zip('HTMLstarterkit.zip'))
        .pipe(dest('./'));
}

const build = series(
  cleanUp,
  copyFavicon,
  metalsmithBuild,
  styles,
  javascript,
  compileSvg,
  zipDistFolder,
)

const dev = series(
  cleanUp,
  copyFavicon,
  metalsmithBuild,
  styles,
  javascript,
  compileSvg,
  watchFiles,
  browserSync,
)

const deploy = series(
  build,
  surgeDeploy,
)


// Export commands.
exports.scss = buildStyles // $ gulp sass - compiles the sass
exports.watch = watchFiles // $ gulp watch - watches the files
exports.lint = lintStyles // $ gulp lint - lints the sass
exports.svg = compileSvg // $ gulp svg - creates svg sprite
exports.build = build // $ gulp build - builds the files
exports.surge = deploy // $ gulp surge - builds the files and deploys to surge
exports.clean = cleanUp // $ gulp clean - clean the dist directory
exports.metal = metalsmithBuild // gulp metal - generates static site of components
exports.js = javascript // gulp js - compiles the js
exports.default = dev // $ gulp - default gulp task

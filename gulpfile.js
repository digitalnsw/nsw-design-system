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
// const debug = require('metalsmith-debug-ui')
const discoverHelpers = require('metalsmith-discover-helpers')
const rollup = require('gulp-better-rollup')
const babel = require('rollup-plugin-babel')
const eslint = require('gulp-eslint')
const gulpStylelint = require('gulp-stylelint')
const replace = require('gulp-replace')
const inject = require('gulp-inject-string')
const fs = require('fs')
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
    .pipe(sourcemaps.write('.'))
    .pipe(dest(config.scss.build))
}

function lintStyles() {
  return src(config.scss.watch)
    .pipe(gulpStylelint({
      reporters: [
        { formatter: 'string', console: true },
      ],
    }))
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
  return del([`${config.build}**`, `./${config.zipfile.filename}`, config.dir.temp], { force: true })
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
      // eslint-disable-next-line no-param-reassign
      delete files[path]
    }
  })
  done(null, files)
}

function sortByAlpha(a, b) {
  const nameA = a.title.toLowerCase()
  const nameB = b.title.toLowerCase()
  if (nameA < nameB) { return -1 }
  if (nameA > nameB) { return 1 }
  return 0
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
  metalsmith.use(collections({
    components: {
      pattern: config.metalSmith.collection.components.pattern,
      sortBy: sortByAlpha,
    },
    patterns: {
      pattern: config.metalSmith.collection.patterns.pattern,
      sortBy: sortByAlpha,
    },
    styles: {
      pattern: config.metalSmith.collection.styles.pattern,
      sortBy: sortByAlpha,
    },
    pages: {
      pattern: config.metalSmith.collection.pages.pattern,
      sortBy: sortByAlpha,
    },
  }))
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

function zipDistFolder() {
  return src(config.zipfile.src)
    .pipe(zip(config.zipfile.filename))
    .pipe(dest(config.zipfile.build))
}

function copyDist() {
  return src(`${config.dir.build}**/*`)
    .pipe(dest(config.dir.temp))
}

function renamePath() {
  return src(`${config.dir.temp}index.html`)
    .pipe(replace('/css/main.css', './css/main.css'))
    .pipe(replace('/js/main.js', './js/main.js'))
    .pipe(replace('/favicon.ico', './favicon.ico'))
    .pipe(dest(config.dir.temp))
    .pipe(src([`${config.dir.temp}**/*.html`, `!${config.dir.temp}index.html`]))
    .pipe(replace('/css/main.css', '../../css/main.css'))
    .pipe(replace('/js/main.js', '../../js/main.js'))
    .pipe(replace('/favicon.ico', '../../favicon.ico'))
    .pipe(dest(config.dir.temp))
}

function deleteTemp() {
  return del(config.dir.temp, { force: true })
}

function injectSVG() {
  const fileContent = fs.readFileSync('./dist/assets/svg/sprite.svg')

  return src(`${config.dir.temp}**/*.html`)
    .pipe(inject.after('<body>', fileContent))
    .pipe(dest(config.dir.temp))
    .pipe(inject.after(
      'xmlns:xlink="http://www.w3.org/1999/xlink"',
      ' aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;"',
    ))
    .pipe(dest(config.dir.temp))
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

const build = series(
  cleanUp,
  copyFavicon,
  metalsmithBuild,
  styles,
  javascript,
  compileSvg,
  copyDist,
  renamePath,
  injectSVG,
  zipDistFolder,
  deleteTemp,
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

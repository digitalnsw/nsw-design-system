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
const dynamicCollections = require('metalsmith-dynamic-collections')
// const debug = require('metalsmith-debug-ui')
const discoverHelpers = require('metalsmith-discover-helpers')
const rollup = require('gulp-better-rollup')
const sitemap = require('gulp-sitemap')
const babel = require('rollup-plugin-babel')
const eslint = require('gulp-eslint')
const gulpStylelint = require('gulp-stylelint')
const replace = require('gulp-replace')
const inject = require('gulp-inject-string')
const fs = require('fs')
const { argv } = require('yargs')
const bump = require('gulp-bump')
const config = require('./config')
const package = require('./package')

const server = browsersync.create()
sass.compiler = require('node-sass')

const postcssProcessors = [
  postcssNormalize({ forceImport: true }),
  autoprefixer({ grid: true }),
  cssnano,
]

function moveImages() {
  return src(config.images.src)
    .pipe(dest(config.images.build))
}

function moveBrand() {
  return src(config.brand.src)
    .pipe(dest(config.brand.build))
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

function buildCoreStyles() {
  return src(config.scssCore.src)
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(postcssProcessors))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(config.scssCore.build))
}

function buildDocStyles() {
  return src(config.scssDocs.src)
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(postcssProcessors))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(config.scssDocs.build))
}

function lintStyles() {
  return src(config.scss.watch)
    .pipe(gulpStylelint({
      reporters: [
        { formatter: 'string', console: true },
      ],
    }))
}

function generateSitemap() {
  return src(['./dist/**/*.html', '!**/blank.html'], { read: false })
    .pipe(sitemap({ siteUrl: config.baseUrl.full }))
    .pipe(dest(config.dir.build))
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
  return del([config.dir.build, config.dir.temp], { force: true })
}

function cleanBuild(files, metalsmith, done) {
  const fileNames = Object.keys(files)
  fileNames.forEach((path) => {
    const file = path.split('.')
    if (
      file[0].indexOf('assets') > -1
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
  metalsmith.metadata(package)
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
    core: {
      pattern: config.metalSmith.collection.core.pattern,
      sortBy: sortByAlpha,
    },
    templates: {
      pattern: config.metalSmith.collection.templates.pattern,
      sortBy: sortByAlpha,
    },
  }))
  metalsmith.use(dynamicCollections({
    componentsnav: {
      pattern: config.metalSmith.collection.componentsnav.pattern,
      refer: false,
      sortBy: sortByAlpha,
    },
    corenav: {
      pattern: config.metalSmith.collection.corenav.pattern,
      refer: false,
      sortBy: 'order',
    },
    templatesnav: {
      pattern: config.metalSmith.collection.templatesnav.pattern,
      refer: false,
      sortBy: 'order',
    },
    guidancetab: {
      pattern: config.metalSmith.collection.guidancetab.pattern,
      refer: false,
      sortBy: sortByAlpha,
    },
    about: {
      pattern: config.metalSmith.collection.contentnav.about,
      refer: false,
      sortBy: 'order',
    },
    design: {
      pattern: config.metalSmith.collection.contentnav.design,
      refer: false,
      sortBy: 'order',
    },
    develop: {
      pattern: config.metalSmith.collection.contentnav.develop,
      refer: false,
      sortBy: 'order',
    },
    methods: {
      pattern: config.metalSmith.collection.contentnav.methods,
      refer: false,
      sortBy: 'order',
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

function compileDocsJS() {
  return src(config.jsDocs.src)
    .pipe(
      rollup(
        {
          plugins: [babel()],
        },
      ),
    )
    .pipe(dest(config.jsDocs.build))
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

function moveSitemap() {
  return src(config.sitemap.src)
    .pipe(dest(config.sitemap.build))
}

function zipDistFolder() {
  return src(config.zipfile.src)
    .pipe(zip(config.zipfile.filename))
    .pipe(dest(config.zipfile.build))
}

function renamePath() {
  return src(`${config.dir.build}index.html`)
    .pipe(replace('/css/main.css', './css/main.css'))
    .pipe(replace('/js/main.js', './js/main.js'))
    .pipe(replace('/favicon.ico', './favicon.ico'))
    .pipe(dest(config.dir.build))
    .pipe(src([`${config.dir.build}**/*.html`, `!${config.dir.build}index.html`]))
    .pipe(replace('/css/main.css', '../../css/main.css'))
    .pipe(replace('/js/main.js', '../../js/main.js'))
    .pipe(replace('/favicon.ico', '../../favicon.ico'))
    .pipe(dest(config.dir.build))
}

function renamePathForProd() {
  return src(`${config.dir.build}/**/*.html`)
    .pipe(replace('href="/', `href="${config.baseUrl.prod}/`))
    .pipe(replace('src="/', `src="${config.baseUrl.prod}/`))
    .pipe(dest(config.dir.build))
}

function addAnalytics() {
  return src(`${config.dir.build}/**/*.html`)
    .pipe(inject.before('</head>', '<script async src="https://www.googletagmanager.com/gtag/js?id=G-TMEHXHFJXJ"></script>\n'))
    .pipe(inject.before('</head>', '<script>function gtag(){dataLayer.push(arguments)}window.dataLayer=window.dataLayer||[],gtag("js",new Date),gtag("config","G-TMEHXHFJXJ");</script>\n'))
    .pipe(dest(config.dir.build))
}  

function bumping() {
  return src('./package.json')
    .pipe(bump({ type: argv.type }))
    .pipe(dest('./'))
}

const styles = series(lintStyles, buildStyles, buildCoreStyles, buildDocStyles)
const javascript = series(lintJavascript, compileJS, compileDocsJS)

function watchFiles(done) {
  watch(config.scss.watch, series(styles, reload))
  watch(config.js.watch, series(javascript, reload))
  watch(config.jsDocs.watch, series(javascript, reload))
  watch(config.images.watch, series(moveImages, reload))
  watch(config.brand.watch, series(moveBrand, reload))
  watch(config.metalSmith.watch, series(metalsmithBuild, reload))
  done()
}

const buildprod = series(
  cleanUp,
  copyFavicon,
  moveSitemap,
  metalsmithBuild,
  styles,
  javascript,
  moveImages,
  moveBrand,
  renamePathForProd,
  addAnalytics,
  zipDistFolder,
  generateSitemap,
)

const build = series(
  cleanUp,
  copyFavicon,
  moveSitemap,
  metalsmithBuild,
  styles,
  javascript,
  moveImages,
  moveBrand,
  zipDistFolder,
)

const dev = series(
  cleanUp,
  copyFavicon,
  moveSitemap,
  metalsmithBuild,
  styles,
  javascript,
  moveImages,
  moveBrand,
  watchFiles,
  browserSync,
)

const deploy = series(
  surgeDeploy,
)


// Export commands.
exports.scss = buildStyles // gulp sass - compiles the sass
exports.watch = watchFiles // gulp watch - watches the files
exports.lint = lintStyles // gulp lint - lints the sass
exports.images = moveImages // gulp images - moves images
exports.brand = moveBrand // gulp images - moves brand files
exports.buildprod = buildprod // gulp build - builds the files
exports.build = build // gulp build - builds the files
exports.surge = deploy // gulp surge - builds the files and deploys to surge
exports.clean = cleanUp // gulp clean - clean the dist directory
exports.metal = metalsmithBuild // gulp metal - generates static site of components
exports.js = javascript // gulp js - compiles the js
exports.bumping = bumping // gulp bump - bumps the version number in specific files - used for releases
exports.default = dev // gulp - default gulp task

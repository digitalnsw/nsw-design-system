const {
  src, dest, watch, series,
} = require('gulp')
const child = require('child_process');
const sass = require('gulp-sass')(require('sass'))
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
const nodeResolve = require('@rollup/plugin-node-resolve')
const sitemap = require('gulp-sitemap')
const babel = require('@rollup/plugin-babel')
const eslint = require('gulp-eslint-new')
const gulpStylelint = require('gulp-stylelint')
const replace = require('gulp-replace')
const inject = require('gulp-inject-string')
const fs = require('fs')
const { argv } = require('yargs')
const bump = require('gulp-bump')
const config = require('./config')
const package = require('./package')

const server = browsersync.create()
sass.compiler = require('sass')

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

function removeCookieConsentAssets() {
  return src('dist/**/*.js')
    .pipe(
      inject.append(`
        document.addEventListener('DOMContentLoaded', () => {
          // Remove unwanted stylesheet
          const unwantedStylesheet = Array.from(document.querySelectorAll('link')).find(
            link => link.href.includes('cookieconsent.css')
          );
          if (unwantedStylesheet) {
            unwantedStylesheet.remove();
          }

          // Monitor for and remove the default cookie consent element
          const observer = new MutationObserver(() => {
            const defaultCookieConsentElement = document.getElementById('cc-main');
            if (defaultCookieConsentElement) {
              defaultCookieConsentElement.remove();
              observer.disconnect(); // Stop observing
            }
          });
          observer.observe(document.body, { childList: true });
        });
      `)
    )
    .pipe(dest('dist'));
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
    utilities: {
      pattern: config.metalSmith.collection.contentnav.utilities,
      refer: false,
      sortBy: 'order',
    },
    contribute: {
      pattern: config.metalSmith.collection.contentnav.contribute,
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
          plugins: [babel({ babelHelpers: 'bundled' }), nodeResolve()],
        },
        {
          name: 'NSW',
          format: 'umd',
        },
      ),
    )
    .pipe(dest(config.js.build))
}

function compileTypes(done) {
  child.exec('npm run types');
  done();
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

function moveSearch() {
  return src(config.search.src)
    .pipe(dest(config.search.build))
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
  .pipe(inject.after('<head>', `<script data-category="analytics">(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-P2NKBBJZ');</script>
  `))
    .pipe(inject.after('<head>', `<script async data-category="analytics" src="https://www.googletagmanager.com/gtag/js?id=G-49T9M12F86"></script>
<script data-category="analytics">
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-49T9M12F86');
</script>
  `))
.pipe(inject.after('<body>', `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P2NKBBJZ"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    `))
    .pipe(dest(config.dir.build))
}

function bumping() {
  return src('./package.json')
    .pipe(bump({ type: argv.type }))
    .pipe(dest('./'))
}

const styles = series(lintStyles, buildStyles, buildCoreStyles, buildDocStyles)
const javascript = series(lintJavascript, compileJS, compileTypes, compileDocsJS, removeCookieConsentAssets)

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
  moveSearch,
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
  moveSearch,
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
  moveSearch,
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

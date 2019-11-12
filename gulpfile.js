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

const server = browsersync.create()
sass.compiler = require('node-sass')

const dir = {
  src: './src/',
  build: './dist/',
}

const svgConfig = {
  src: `${dir.src}assets/svg/*.svg`,
  watch: `${dir.src}assets/svg/*.svg`,
  build: `${dir.build}assets/svg/`,
  svgSprite: {
    mode: {
      defs: {
        dest: '',
        sprite: 'sprite.svg',
      },
    },
  },
}

const scssConfig = {
  src: `${dir.src}main.scss`,
  watch: `${dir.src}**/*.scss`,
  build: `${dir.build}css/`,
}

const postcssProcessors = [
  postcssNormalize({ forceImport: true }),
  autoprefixer,
  cssnano,
]

const htmlConfig = {
  src: `${dir.src}*.html`,
  watch: `${dir.src}*.html`,
  build: dir.build,
}

const metalsmithConfig = {
  src: dir.src,
  watch: `${dir.src}**/*.hbs`,
  build: dir.build,
  metadata: {
    title: 'Digital NSW Design System',
    description: 'Design system for Digital NSW',
    generator: 'Metalsmith',
    url: '',
  },
  ignoreFiles: [
    'assets/**/*',
    '**/*.scss',
    '**/*.js',
    '**/*.json',
    '**/*.DS_Store',
    'global/**/*',
  ],
  helpers: {
    directory: './src/global/helpers',
    pattern: /\.js$/,
  },
  partials: {
    directory: './src/',
    pattern: /\.hbs$/,
  },
  data: {
    dataProperty: 'model',
  },
  collection: {
    components: ['components/**/*.hbs', '!components/**/_*.hbs'],
    patterns: ['patterns/**/*.hbs', '!patterns/**/_*.hbs'],
    styles: ['styles/**/*.hbs', '!styles/**/_*.hbs'],
  },
  inplace: {
    pattern: '**/*.hbs',
    rename: true,
    engine: 'handlebars',
  },
  layouts: {
    engine: 'handlebars',
    rename: true,
    directory: './src/global/layouts',
    default: 'layout.hbs',
    pattern: '**/*.{hbs,md,html}',
  },
}

function compileSvg() {
  return src(svgConfig.src)
    .pipe(svgSprite(svgConfig.svgSprite))
    .on('error', (error) => {
      console.log(error)
    })
    .pipe(dest(svgConfig.build))
}

function buildStyles() {
  return src(scssConfig.src)
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(postcssProcessors))
    .pipe(sourcemaps.write())
    .pipe(dest(scssConfig.build))
}

function lintStyles() {
  return src(scssConfig.watch)
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
}

function copyHtml() {
  return src(htmlConfig.src).pipe(dest(htmlConfig.build))
}

function browserSync(done) {
  server.init({
    server: {
      baseDir: dir.build,
      index: 'index.html',
    },
  })
  done()
}

function reload(done) {
  server.reload()
  done()
}

function surgeDeploy() {
  return surge({
    project: dir.build,
    domain: 'nswdesignsystem.surge.sh',
  })
}

function cleanUp() {
  return del(`${dir.build}**`, { force: true })
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
  metalsmith.metadata(metalsmithConfig.metadata)
  metalsmith.source(metalsmithConfig.src)
  metalsmith.destination(metalsmithConfig.build)
  metalsmith.use(ignore(metalsmithConfig.ignoreFiles))
  metalsmith.clean(false)
  metalsmith.use(discoverHelpers(metalsmithConfig.helpers))
  metalsmith.use(discoverPartials(metalsmithConfig.partials))
  metalsmith.use(dataLoader(metalsmithConfig.data))
  metalsmith.use(collections(metalsmithConfig.collection))
  metalsmith.use(inplace(metalsmithConfig.inplace))
  metalsmith.use(layouts(metalsmithConfig.layouts))
  metalsmith.use(cleanBuild)
  metalsmith.build((err, files) => {
    if (err) {
      throw err
    }
    callback()
  })
}

const jsConfig = {
  src: `${dir.src}main.js`,
  watch: `${dir.src}**/*.js`,
  build: `${dir.build}js/`,
}

function compileJS() {
  return src(jsConfig.src)
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
    .pipe(dest(jsConfig.build))
}

function lintJavascript() {
  return src(jsConfig.watch)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
}

const styles = series(lintStyles, buildStyles)
const javascript = series(lintJavascript, compileJS)

function watchFiles(done) {
  watch(scssConfig.watch, series(styles, reload))
  watch(jsConfig.watch, series(javascript, reload))
  watch(htmlConfig.watch, series(copyHtml, reload))
  watch(svgConfig.watch, series(compileSvg, reload))
  watch(metalsmithConfig.watch, series(metalsmithBuild, reload))
  done()
}

const build = series(
  cleanUp,
  metalsmithBuild,
  styles,
  javascript,
  compileSvg,
  surgeDeploy,
)
const dev = series(
  copyHtml,
  metalsmithBuild,
  styles,
  javascript,
  compileSvg,
  watchFiles,
  browserSync,
)

// Export commands.
exports.scss = buildStyles // $ gulp sass - compiles the sass
exports.watch = watchFiles // $ gulp watch - watches the files
exports.lint = lintStyles // $ gulp lint - lints the sass
exports.svg = compileSvg // $ gulp svg - creates svg sprite
exports.build = build // $ gulp build - builds the files
exports.clean = cleanUp // $ gulp clean - clean the dist directory
exports.metal = metalsmithBuild // gulp metal - generates static site of components
exports.js = javascript // gulp js - compiles the js
exports.default = dev // $ gulp - default gulp task

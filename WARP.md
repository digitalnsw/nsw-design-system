# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository Overview

The NSW Design System is a frontend toolkit providing styles, patterns, standards and guidance for creating NSW Government digital products. This repository contains:

- **Components**: Reusable UI components with HTML (Handlebars), SCSS, and JavaScript
- **Documentation site**: Built with Metalsmith static site generator
- **Distribution files**: Built CSS/JS for consumption via npm or CDN

## Common Commands

### Development
```bash
# Start development server with file watching
npm run dev

# Lint styles
gulp lintStyles

# Generate TypeScript definitions
npm run types
```

### Building
```bash
# Build starter kit (development build)
npm run starterkit:build

# Production build
npm run prod:build

# Build and deploy to staging
npm run surge
```

### Component Development
```bash
# Add new component interactively
npm run add

# Example creates: src/components/{name}/{name}.scss, {name}.hbs, {name}.js, index.hbs, {name}.json
```

### Release Management
```bash
# Version bumping and releases
npm run bump:patch        # Bug fixes
npm run bump:minor        # New features
npm run bump:major        # Breaking changes

# Full release workflow (includes build + changelog)
npm run release:patch
npm run release:minor
npm run release:major

# Local release (includes publish to npm)
npm run release-local:patch
```

## Architecture Overview

### Source Structure
```
src/
├── components/           # UI components (accordion, button, etc.)
├── core/                # Base design elements (typography, colors, grid)
├── global/              # Shared utilities and base styles
│   ├── scss/           # Global SCSS (settings, helpers, base)
│   ├── scripts/        # Global JavaScript utilities
│   └── handlebars/     # Template helpers and layouts
├── docs/               # Documentation site content
├── assets/             # Images, icons, brand assets
├── main.scss          # Main stylesheet entry point
└── main.js           # Main JavaScript entry point
```

### Component Structure
Each component follows a consistent pattern:
```
components/{name}/
├── _{name}.scss       # Component styles
├── _{name}.hbs        # Component template
├── {name}.js          # Component JavaScript (if interactive)
├── index.hbs          # Documentation page
├── blank.hbs          # Minimal example
├── theme.hbs          # Themed example
├── _guidance.hbs      # Design guidance
└── json/              # Component data/variants
```

### Build System
- **Gulp** for task automation and build orchestration  
- **Metalsmith** for static site generation (documentation)
- **Sass** for CSS compilation with glob imports
- **Rollup** for JavaScript bundling
- **TypeScript** for type definitions generation

## Key Development Patterns

### SCSS Architecture
- Uses **Sass modules** (`@use` syntax) instead of `@import`
- Global settings in `src/global/scss/settings/`
- Component styles must use core functions and mixins
- Follows BEM-like naming with `.nsw-` prefix

### JavaScript Components
- **Vanilla JS** with ES6+ features (transpiled to ES5)
- Each component exports a class with `init()` method
- Components auto-initialize via `initSite()` function
- Uses progressive enhancement (components work without JS)

### Component Development
- Components must be responsive and content-agnostic
- Follow WCAG 2.2 AA accessibility standards
- Use semantic HTML with appropriate ARIA attributes
- JavaScript components must degrade gracefully

### Documentation
- Each component has guidance, examples, and API documentation
- Built as static site with live examples
- Uses Handlebars templates with data-driven examples

## Configuration Files

### Core Config
- **`config.json`**: Build paths and Metalsmith configuration
- **`gulpfile.js`**: Build tasks and asset pipeline
- **`package.json`**: Dependencies and npm scripts

### Code Quality
- **`.eslintrc`**: Airbnb base config with custom rules (no semicolons)
- **`.stylelintrc`**: Sass guidelines with property ordering
- **`tsconfig.json`**: TypeScript config for type definitions

### Browser Support
Targets modern browsers with graceful degradation. Uses autoprefixer and PostCSS for vendor prefixes.

## Working with Components

### Modifying Existing Components
1. Component files are in `src/components/{name}/`
2. Styles use the settings from `src/global/scss/settings/`
3. Interactive components require JavaScript class in `{name}.js`
4. Update corresponding documentation in `index.hbs`

### Creating New Components
1. Run `npm run add` for interactive setup
2. Follow existing component structure and patterns
3. Import new component in `src/main.scss` and `src/main.js`
4. Add component to `src/components/_all.scss` if needed

### Global Styles
- Base styles: `src/global/scss/base/`
- Settings (colors, spacing, typography): `src/global/scss/settings/`
- Helper classes: `src/global/scss/helpers/`

## Testing and Quality

### Manual Testing
- Development server runs at `http://localhost:3000`
- Test components across different viewport sizes
- Verify accessibility with screen readers
- Test JavaScript functionality with JS disabled

### Style Guidelines
- Use existing spacing scale from settings
- Reference color palette in settings
- Follow typography scale for font sizes
- Maintain consistent component API patterns

### Accessibility Requirements
- All components must meet WCAG 2.2 AA
- Use semantic HTML elements
- Provide appropriate ARIA labels and roles
- Ensure keyboard navigation works
- Test with assistive technologies

## Deployment and Distribution

### Build Outputs
- **`dist/css/main.css`**: Complete stylesheet
- **`dist/js/main.js`**: Complete JavaScript bundle
- **`dist/`**: Full documentation site
- **`HTMLstarterkit.zip`**: Packaged starter kit

### Publishing
- Components distributed via npm as `nsw-design-system`
- CSS/JS available on JSDelivr CDN
- Documentation hosted at `designsystem.nsw.gov.au`

### Version Management
- Follows semantic versioning (semver)
- MAJOR: breaking changes
- MINOR: new components/features  
- PATCH: bug fixes and minor updates

## Developer Utilities

### Helpful Scripts
- **`add-component.js`**: Interactive component scaffolding
- **`git-commit.sh`**: AI-powered conventional commit messages (requires OPENAI_API_KEY)
- **`create-branch.sh`**: Branch creation utilities
- **`pull-request.sh`**: PR management utilities

### File Watching
The `npm run dev` command watches for changes in:
- SCSS files: Recompiles CSS
- JavaScript files: Rebuilds bundles  
- Handlebars templates: Regenerates documentation
- JSON data files: Updates component examples

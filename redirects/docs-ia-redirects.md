# Documentation IA redirects

The Cloudflare bulk redirect file contains **104 permanent redirects**. Every redirect points directly to its final public URL; there are no redirect chains and no targets containing `/docs/content/`.

## Coverage

| Documentation area | Redirects | Previous path | Final path |
| --- | ---: | --- | --- |
| Utility classes | 15 | `/docs/content/utilities/...` | `/utility-classes/...` |
| Methods | 6 | `/docs/content/methods/...` | `/methods/...` |
| Contribute | 3 | `/docs/content/contribute/...` | `/contribute/...` |
| Release notes | 1 | `/docs/content/about/release-notes.html` | `/release-notes/index.html` |
| Legacy design Guides | 1 | `/docs/content/design/guides.html` | `/get-started/guides.html` |
| Get started routes and aliases | 30 | Various legacy and source-derived paths | Final `/get-started/...` paths |
| Historical Utility Classes page | 1 | `/docs/content/develop/helpers.html` | `/index.html#utility-classes` |
| Renamed Core page | 1 | `/core/layout/index.html` | `/core/page-layout/index.html` |
| Renamed component group page | 1 | `/components/forms-and-input/index.html` | `/components/forms-and-inputs/index.html` |
| Former component guidance pages | 45 | `/components/.../_guidance.html` | Matching component overview page |

The route-derived redirects cover every publishable Handlebars page affected by `build-script/documentation-routes.js`. Partials beginning with `_` are excluded from route-derived redirects. However, the former component `_guidance.html` pages were emitted as directly accessible pages, so each now redirects to its matching component overview.

The historical `/docs/content/develop/helpers.html` URL was also included because it appeared in the legacy sitemap and Git history. It now redirects to the Utility classes listing rather than an arbitrary individual utility page.

The former `/components/forms-and-input/index.html` group page redirects to `/components/forms-and-inputs/index.html` following the group label change from "Forms and input" to "Forms and inputs".

## Earlier Get started URLs and aliases

| Page | Previous URL | Final URL |
| --- | --- | --- |
| About the NSW Design System | `/docs/content/about/what-is-design-system.html` | `/get-started/about-the-nsw-design-system.html` |
| About the NSW Design System | `/docs/content/about/about-the-nsw-design-system.html` | `/get-started/about-the-nsw-design-system.html` |
| Supporting different roles | `/docs/content/about/supporting-different-roles.html` | `/get-started/supporting-different-roles.html` |
| Our ecosystem | `/docs/content/about/our-ecosystem.html` | `/get-started/our-ecosystem.html` |
| Get started | `/docs/content/setup/index.html` | `/index.html#get-started` |
| Get started | `/get-started/set-up/index.html` | `/index.html#get-started` |
| For designers | `/docs/content/design/getting-started.html` | `/get-started/for-designers.html` |
| For designers | `/get-started/set-up/for-designers.html` | `/get-started/for-designers.html` |
| For developers | `/docs/content/develop/getting-started.html` | `/get-started/for-developers.html` |
| For developers | `/get-started/set-up/for-developers.html` | `/get-started/for-developers.html` |
| Figma UI Kit | `/docs/content/design/figma-ui-kit.html` | `/get-started/figma-ui-kit.html` |
| Figma UI Kit | `/get-started/set-up/figma-ui-kit.html` | `/get-started/figma-ui-kit.html` |
| Templates | `/templates/index.html` | `/get-started/templates.html` |
| Theming | `/docs/content/design/theming.html` | `/get-started/theming.html` |
| Theming for developers | `/docs/content/develop/theming.html` | `/get-started/theming-for-developers.html` |
| Extending | `/docs/content/design/extending.html` | `/get-started/extending.html` |

## Validation

`scripts/validate-docs-ia.js` verifies that:

- every routed documentation page has a redirect from its old source-derived URL
- all known earlier Get started URLs and aliases have redirects
- the previous Core layout URL redirects to Page layout
- the previous Forms and input group URL redirects to Forms and inputs
- every former component guidance page redirects to its component overview
- every row uses the seven-column Cloudflare bulk redirect format
- every status is `301`
- source URLs are unique
- sources and targets differ
- targets are production URLs
- targets do not expose `/docs/content/`
- targets are not redirect sources, preventing redirect chains

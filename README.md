# NSW Design System

[![npm version](https://badge.fury.io/js/nsw-design-system.svg)](https://badge.fury.io/js/nsw-design-system)
[![](https://data.jsdelivr.com/v1/package/npm/nsw-design-system/badge)](https://www.jsdelivr.com/package/npm/nsw-design-system)
[![This project is using Percy.io for visual regression testing.](https://percy.io/static/images/percy-badge.svg)](https://percy.io/b183fe4d/nsw-design-system)

View online documentation for the [NSW Design System](https://designsystem.nsw.gov.au/).

# NSW Design System Documentation

Welcome to the documentation for the NSW Design System, a frontend toolkit of styles, patterns, standards and guidance for everyone creating distinctly NSW digital products and services. It helps us create unified, trusted, inclusive and audience centered digital experiences for our users that are clearly simple, current and purposeful.  
  
This document provides instructions on how to easily integrate and utilise the NSW Design System styles and components in your projects.

## Choosing Your Integration Method

How you use the NSW Design System depends on your team's capabilities.

We recommend the following methods:

1. [Download the latest release](https://github.com/digitalnsw/nsw-design-system/releases)

2. Clone the repo: `git clone https://github.com/digitalnsw/nsw-design-system.git`

3. **Using npm Package Manager:** This method provides a structured and customisable approach to integrating the design system into your project.

4. **Using JSDelivr CDN:** If you prefer a quicker setup, you can use the JSDelivr content delivery network to directly include the design system's CSS and JavaScript files in your project.

Read the [Getting started page](https://designsystem.nsw.gov.au/docs/content/develop/getting-started.html) for information on the framework contents, templates, examples, and more.

## Installing with NPM

Follow these steps to integrate the NSW Design System into your project using npm:

1. **Install Node.js and npm:** If you haven't already, install Node.js and npm by following the instructions in the Node.js installation guides.

2. **Create a package.json:** In your project's root directory, run the `npm init` command in your terminal. Follow the prompts to generate a `package.json` file, providing essential project information.

3. **Add nsw-design-system to your dependencies:** Run the following command to install the NSW Design System as a dependency in your project:

    ```
    npm install --save nsw-design-system
    ```

4. **Import Styles and JavaScript:** Learn how to import the design system's styles and JavaScript into your project's build by referring to the relevant sections below.

### Importing Styles

#### All Styles

To import all design system styles as a single package, add the following snippet at the start of your main SCSS file:

```
@import 'node_modules/nsw-design-system/src/main';
```

#### Core and Selected Components

The core library includes the design system's base theme, typography, mixins, and helper functions. Import the core library at the start of your main SASS file:

```
// Core libraries
@import 'node_modules/nsw-design-system/src/global/scss/settings/settings';
@import 'node_modules/nsw-design-system/src/global/scss/base/all';
@import 'node_modules/nsw-design-system/src/global/scss/helpers/all';
@import 'node_modules/nsw-design-system/src/global/scss/settings/palette';
@import 'node_modules/nsw-design-system/src/global/scss/settings/theme';
@import 'node_modules/nsw-design-system/src/core/all';
```

After importing the core library, you can start importing individual components as needed:

```
// Components
@import 'node_modules/nsw-design-system/src/components/accordion/accordion';
@import 'node_modules/nsw-design-system/src/components/card/card';
@import 'node_modules/nsw-design-system/src/components/notification/notification';
```

### Adding Fonts and Icons

Include the following lines of code in the `<head>` tag of your main HTML document, placing them before the NSW Design System styles import:

```
<link href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

Alternatively, you can import fonts and icons directly in your CSS:

```
@import url('https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,400;0,700;1,400&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
```

### Importing JavaScript

Certain NSW Design System components require JavaScript to enable advanced functionality. To ensure your page is ready for JavaScript execution, include the following script tags at the end of your HTML document:

```
<script src="path/to/main.js"></script>
<script>window.NSW.initSite()</script>
</body>
</html>
```

Depending on your project setup, you can copy the JavaScript file from `node_modules` or add a reference in your build workflow.

## Using JSDelivr CDN

For a faster setup, you can utilize the JSDelivr CDN to include the NSW Design System's CSS and JavaScript files directly in your project's HTML:

```
<html>
  <head>
    <!-- ... -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nsw-design-system@3/dist/css/main.css">
  </head>
  <body>
    <!-- ... -->
    <script src="https://cdn.jsdelivr.net/npm/nsw-design-system@3/dist/js/main.min.js"></script>
    <script>window.NSW.initSite()</script>
  </body>
</html>
```

## Contributing

Please read through our [contributing guidelines](https://www.digital.nsw.gov.au/delivery/digital-service-toolkit/design-system/contributing). Included are directions for opening issues, coding standards, and notes on development.

## Community

Get notified when there’s an update or new release on the NSW Design System's and chat with the project maintainers and community members.

* Join our [Digital NSW Community](https://community.digital.nsw.gov.au/).

* Watch the [NSW Design System Github](https://github.com/digitalnsw/nsw-design-system).

* Ask and explore [our GitHub Discussions](https://github.com/digitalnsw/nsw-design-system/discussions).

## Report an issue

View and raise issues and bugs through our [Issues tracker on Github](https://github.com/digitalnsw/nsw-design-system/issues) or [report a bug on the Digital NSW community](https://community.digital.nsw.gov.au/c/components/report-a-bug/27).

## Design System Figma UI Kit

Access the complete set of design assets required for designing, sharing, and prototyping using our [Figma UI Kit](https://designsystem.nsw.gov.au/docs/content/design/figma-ui-kit.html).

## Versioning

For transparency into our release cycle and in striving to maintain backward compatibility, The NSW Design System is maintained under [the Semantic Versioning guidelines](https://semver.org/). Sometimes we make mistakes, but we adhere to those rules whenever possible.

Our version numbers consist of MAJOR.MINOR.PATCH, where:

* **MAJOR** version is used for incompatible global changes.

* **MINOR** version is used for significant backward-compatible updates and the release of new components.

* **PATCH** version is used for minor backward-compatible updates, new component variations, and bug fixes.

See [the Releases section of our GitHub project](https://github.com/digitalnsw/nsw-design-system/releases) for changelogs for each release version. Release posts on our [what’s happening page](https://designsystem.nsw.gov.au/docs/content/about/whats-happening.html) contain summaries of the most noteworthy changes made in each release.

Feel free to reach out if you have any questions or need more help with integrating the NSW Design System into your projects!

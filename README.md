# NSW Design System

[![npm version](https://badge.fury.io/js/nsw-design-system.svg)](https://badge.fury.io/js/nsw-design-system)
[![](https://data.jsdelivr.com/v1/package/npm/nsw-design-system/badge)](https://www.jsdelivr.com/package/npm/nsw-design-system)
[![This project is using Percy.io for visual regression testing.](https://percy.io/static/images/percy-badge.svg)](https://percy.io/b183fe4d/nsw-design-system)

NSW Design system is a collection of reusable UI components used on the NSW government websites.

See live examples of NSW Digital Design system components and guidance on how to use them on you website at [NSW Design System](https://nswdesignsystem.surge.sh).

## Using the design system

How you use the NSW Design System depends on your team's capabilities. We recommend using `npm` but also provided in a CDN, and a downloadable starter kit which includes all the compiled assets.

 1. [Installing with NPM](#installing-with-npm)
 2. [Using JSDelivr CDN](#using-jsdelivr-cdn)
 3. [Download starter kit](#download-starter-kit)
 
### Installing with NPM
`npm` is a package manager for Node-based projects. We recommend `npm` packages because it makes it easy to update and install the design system from the command line.
1.  Install  `Node/npm`. 
    
    -   More information can be found via the nodejs [Installation guides](https://nodejs.org/en/download/)
    
2.  Generate a `package.json` file using the `npm init` command in the terminal. You will be prompted to enter several pieces of information, like the name of your application, version, description etc.
    
4.  Add  `nsw-design-system`  to your project’s  `package.json`:
    - `npm install --save nsw-design-system`

The NSW Design System is now installed as a dependancy of your project, check out how to [import styles](#importing-styles-into-your-project) and [javascript](#importing-javascript-into-your-project) in to your project build.


### Importing styles into your project
The NSW Design System styles need to be added to the main Sass file in your project.  
Use the below snippet to import the NSW Design System (ideally placed before any other imports or sass):
```
@import 'node_modules/nsw-design-system/src/main';
```

#### Adding the font and the icons
In your main html document add this line of code inside the `<head>` tag. Make sure that it's placed before the NSW Design System styles import.
```
  <link href="https://fonts.googleapis.com/css?family=Montserrat:400,600&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

### Importing javascript into your project
Some of the NSW Design System components require javascript to provide advanced functionality. To ensure the page is ready for javascript to run, include the follow scripts tags at the end of the html document.
```
    <script src="path/to/main.js"></script>
    <script>window.NSW.initSite()</script>
  </body>
</html>
```
Depending on your project set up, you might wish to copy the file into your project from `node_modules` or add the reference to your build workflow.


### Using JSDelivr CDN
The bundled css and js files are also hosted in [JSDelivr](https://www.jsdelivr.com).

You can add the files to your main html document
```
<html>
  <head>
    ...
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nsw-design-system@2/dist/css/main.css">
  </head>
  <body>
    ...
    <script src="https://cdn.jsdelivr.net/npm/nsw-design-system@2/dist/js/main.min.js"></script>
    <script>window.NSW.initSite()</script>
  </body>
</html>
```

### Download starter kit
You can download the compiled design system assets (HTML, CSS, JavaScript) in the [HTMLStarterkit zip file](https://github.com/digitalnsw/nsw-design-system/blob/master/HTMLstarterkit.zip) from the latest release.


## Design System Figma UI kit
Get access to the latest Design System UI patterns and styles via the [Design System Figma UI kit](https://www.digital.nsw.gov.au/design-system/getting-started/design-system-figma-ui-kit).


## Getting updates

To be notified when there’s a new release, you can either join the [NSW Design System community](https://community.digital.nsw.gov.au/) or [watch the NSW Design System Github](https://github.com/digitalnsw/nsw-design-system)

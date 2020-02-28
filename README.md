# NSW Design System

NSW Design system is a collection of reusable UI components used on the NSW goverment websites.

See live examples of NSW Digital Design system components and guidance on how to use them on you website at [NSW Design System](https://www.digital.nsw.gov.au/digital-design-system).

## Using the design system

How you use the NSW Design System depends on your team's capabilities. We recommend using `npm` but also provide a downloadable starter kit which includes all the compiled assets.

 1. [Installing with NPM](#installing-with-npm)
 2. [Download starter kit](#download-starterkit)

### Installing with NPM
`npm` is a package manager for Node-based projects. We recommend `npm` packages because it makes it easy to update and install the design system from the command line.
1.  Install  `Node/npm`. 
    
    -   More information can be found via the nodejs [Installation guides](https://nodejs.org/en/download/)
    
2.  Generate a `package.json` file using the `npm init` command in the terminal. You will be prompted to enter several pieces of information, like the name of your application, version, description etc.
    
4.  Add  `nsw-design-system`  to your project’s  `package.json`:
    - `npm install --save nsw-design-system`

The NSW Design System is now installed as a dependancy of your project, check out how to [import styles](#importing-styles-into-your-project) and [javascript](#importing-javascript-into-your-project) in to your project build.

### Download starter kit
You can download the compiled design system assets (HTML, CSS, JavaScript) in the [HTMLStarterkit zip file](https://github.com/digitalnsw/nsw-design-system/blob/master/HTMLstarterkit.zip) from the latest release.

### Importing styles into your project
The NSW Design System styles need to be added to the main Sass file in your project.  
Use the below snippet to import the NSW Design System (ideally placed before any other imports or sass):
```
@import 'node_modules/nsw-design-system/src/main';
```

### Importing javascript into your project
Some of the NSW Design System components require javascript to provide advanced functionality.  To ensure the page is ready for javascript to run, include the follow scripts tags at the end of the html document.
```
    <script src="node_modules/nsw-design-system/src/main.js"></script>
    <script>window.NSW.initSite()</script>
  </body>
</html>
```
You might wish to copy the file into your project or reference it from  `node_modules`, this will depend on your build setup.

## Getting updates

To be notified when there’s a new release, you can either join the [NSW Design System community](https://community.digital.nsw.gov.au/) or [watch the NSW Design System Github](https://github.com/digitalnsw/nsw-design-system)

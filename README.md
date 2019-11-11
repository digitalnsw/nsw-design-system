
# NSW Design System

NSW Digital Design system is a collection of reusable UI components used on the NSW goverment websites.

## Usage

### 1. Clone repo

```
git clone git@github.com:digitalnsw/nsw-design-system.git

```

### 2. Jump inside cloned repo

```
cd nsw-design-system

```

### 3. Install dependencies

Make sure nodejs with npm is installed on your machine.

```
npm install

```

### 4. Run default task

This will open a browser window with live reload.

```
npm run dev

```

### 5. Run Build and Deploy task

This will create a build of the website in the `dist` folder and deploy to surge.

```
npm run build

```

### 5. Add Component/Pattern folder and files to source

`add-component.js` is a simple script that will help you add a generate the folders and file needed to develop a component or pattern. The files generated include sass, handlebars, javascript and json.

```
npm run add

```

You will then be asked a few questions:

 - What are we creating? (component or pattern)
 - What is the name of the component/pattern?

This information is then used to generate the folders and files in the right location in the project source.

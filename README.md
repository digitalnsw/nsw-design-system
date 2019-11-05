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

### 5. Build
This will create a build of the website in the `dist` folder and deploy to surge.

```
npm run build
```

### 5. Add Component Folder
This will add a new component folder inside `src/components` and generate the base files required for components. This includes sass, handlebars, javascript and json.

```
npm run add [componet-name]
```

# Convert a JavaScript application to Typescript

JavaScript is good but, like me, if you come from statically typed languages then it becomes a bit annoying to deal with lack of types when the project grows big. Luckily there is Typescript but adding Typescript retrospectively may not be a very straight-forward job. Recently I successfully converted a sizable JavaScript project into Typescript, __one file at a time__. Converting one file at a time to Typescript is really powerful because then you can make the change incrementally without having to stop delivering the features that your product owner wants. I tried doing this different ways. Here, I will talk you through the one that worked. 

This a long-ish read. I have divided the content into three main sections

1. Adding typescript config and webpack
2. Adding Type declaration files
3. Convert the code into typescript

Let's drive straight in then.

# Adding  typescript config and webpack

Any typescript code has to be transpiled down to JavaScript before it can be run. That is where webpack comes in handy. If you have never used Webpack before, then I recommend reading [A detailed introduction to webpack](https://www.smashingmagazine.com/2017/02/a-detailed-introduction-to-webpack/) before proceeding. 

We start by installing webpack using the following command

```
npm install --save-dev webpack
```

Note that we are adding webpack as a development dependency. This is because it's only used to convert typescript code into javascript. Next we need a webpack configuration. Add a new file named `webpack.config.js` at the root of the project and the following content to it

```js
var path = require('path');
var webpack = require('webpack');


module.exports = {  
  entry: { 
    index: "./index.ts"
  },
  target: 'node',
  module: {
    loaders: [
      { test: /\.ts(x?)$/, loader: 'ts-loader' },      
      { test: /\.json$/, loader: 'json-loader' }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({'process.env.NODE_ENV': '"production"'})
    ],
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, 'lib'),
    filename: '[name].js'
  },
};
```

Let's quickly go over the contents of this file. We have imported `path` module to make it easy to do some path manipulation in the output section of the config. We have also imported webpack to define a plugin in the `plugins` section. Let's not worry about this just yet. 

The file is basically just exporting a JSON object which webpack uses as configuration. Webpack has a large number of configuration options but the ones we have configured here are minimal ones needed for a typescript project. Let's look into each of the configuration we have defined in this object

## entry
This tells webpack where to begin transpiling. Webpack will start with the files specified in `entry`, converts them into JS (see `module` section next) and then goes through every module that these modules import till it has reached the end of the tree. We do not have to have a single entry point. We can provide any number of entry points we want here. We have specified `index.ts` as our entry point. This file does not exist yet. We will eventually convert our entry module `index.js` into `index.ts`.

## target
Target tells webpack where you want to run the final Javascript code. This is important because the code that gets generated to be run on server side is different from the code that gets generated to be run in a browser. For this example we specify `node` which is for the code that gets run on the server side

## module
This is where the most of the magic happens. We have specified on the `loaders` part of this object. Webpack uses different loaders to transpile files. In our case, we have a `ts-loader` to transpile any Typescript files and a `json-loader` which I have left there in case we add a json file later on.  Loaders need to be installed separately and they come as their own NPM packages. For our config, we need to install `ts-loader` and `json-loader` usin the following command. 

```
npm install --save-dev ts-loader json-loader
```

## plugins
Let's ignore that for a moment

## resolve
This is where you tell webpack which file extensions to scan during its transpilation process. We have added `.ts` and `.js` both as we want to convert one js file to ts at a time. This means, we will have a mix of js and ts files in our project and we want webpack to consider both

## output
This is where we tell webpack how do we want the output of the transpilation to appear. We are saying that we want the output files to be named after the key name we used for the file in the `entry` section. We want the output files to be copied into a folder named `lib` under the current directory. And we want webpack to use `commonjs` module system. 

Again, if this is the first time you are using webpack, then do not worry too much about the content of this file. This is a minimal config that just works for any server side code. 

Next we need a Typescript config. Add a file named `tsconfig.json` to the project. Again, the minimal contents for this file are as below

```json
{
    "compilerOptions": {
        "target": "es5",
        "module": "commonjs",
        "noImplicitAny": true,
        "lib": [
        "es5","es2015", "es6", "dom"
        ]
    }
}
```

This is telling the Typescript compiler that we want the resulting JS to be ES5 compliant and we want to use `commonjs` as our module system. We have also added a `noImplicitAny` which is set to `true`. This forces you to declare any variable of type `any` instead of leaving the type declaration out and compiler marking the variable as `any`. This helps to catch cases where we forget to declare type for a variable. 

Next we need a way to invoke webpack. There are two ways you can do this. The webpack npm package that we installed earlier, you can install that globally and just run `webpack` from the console at the root directory of the project. Or you can add an NPM script in your `package.json`  that uses the locally installed webpack version like below

```json
"scripts": {
    "build": "node_modules/.bin/webpack --config webpack.config.js"
},
```
Note that I have padded a `--config` flag which is not really needed because webpack looks for a file named `webpack.config.js` by default. But if you prefer to name your webpack config file differently then make sure you pass the `--config` flag

# Add Type declaration files

We need to find the first module that we can safely convert to Typescript. This is usually the entry module of our project. In our example, that would be `index.js`. To use the full power of Typescript in our converted module, we need to have type declaration files for other modules that this module is dependent on. 
There are two concepts around type declaration files that we need to understand. I am assuming that you know what type declaration files are, if not, I would recommend reading the [official guidance on this topic](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)

1. We need to explicitly install type declaration files for any external module. In our example, we have an external module called `prompt-sync` for which we will need to install type declaration files
2. For our own modules that we have not converted into Typescript yet, we need to write type declaration files ourselves as a stop-gap arrangement till the time we convert that module into Typescript

## Installing type declaration files for external modules
Type declaration files for most NPM packages are already made available by the community. We can run the following command to install the Type declaration files for our `prompt-sync` package

```
npm install --save-dev @types/prompt-sync
```
If the type declaration file is available, it will get installed. If not, you will see an error. You will need to create the necessary type declaration files yourselves. 

## Creating type declaration files for own modules
Type declaration files for a module contain interface, function and type declarations for the bits that the module exports. They are declared in a file with extension`d.ts` and named after the module name or `index.d.ts`. For instance, the type declaration file for the `prompt-sync` module that we just installed is named `index.d.ts` and you can find it in `node_modules/@types/prompt-sync` folder. That is one of the known location that typescript compiler searches during module resolution. You can read more about the module resolution process that typescript compiler follows in the [Typescript Handbook](https://www.typescriptlang.org/docs/handbook/module-resolution.html). One of the strategies used by the compiler to resolve modules is to look for a type declaration file matching the module name at the same location as the imported module. For instance, if we import a module like below

```ts
import * as calc from './calculator'
```
then typescript compiler will look for a `calculator.ts` or `calculator.d.ts` file in the current directory. We can use this mechanism to put our existing `calculator.js` file behind a type declaration by creating a file `calculator.d.ts` like below

```ts
declare module calculator {
    export function add(a :number, b :number): number
    export function subtract(a :number, b :number): number
    export function multiply(a :number, b :number): number
    export function divide(a :number, b :number): number
}
export = calculator;
```
Notice that this is exposing the same methods as our calculator module but has annotated arguments and return values with a `number` type. This file needs to be placed next to `calculator.js`. 

## Creating Type declaration files for external modules
We do not have any external module in this example that does not have Type declaration files available. But if that were the case with you, you can combine the knowledge from the above two points. First you build your own type declaration file and name it `index.d.ts`. This can include only the methods/interfaces from the external module that you are using in your code. This type declaration file file needs to be kept under the folder `node_modules/@types/{module_name}/`

I have never personally tried this so cannot vouch for reliability but this is what community defined Type declaration files are doing under the hood. 

# Convert the entry module into TypeScript
Finally we are ready to convert our first module into TypeScript. There is not much really in this step. Rename `index.js` to `index.ts` and start rewriting the module in typescript. If you use the `import` syntax for bringing in the dependent modules then TypeScript compiler will look at the type declaration files of the target module and enforce type checking in addition to usual Javascript compiler checks. Here is how my converted `index.ts` file looks like


```ts
import * as p from "prompt-sync"
import * as calc from "./calculator"
let prompt = p();

function readInput() {
  console.log("Welcome to the calculator. Choose one of the following options");
  console.log("1. add");
  console.log("2. subtract");
  console.log("3. multiply");
  console.log("4. divide");
  console.log("5. exit");

  var option = prompt(">> ");

  if (option !== "5") {
    console.log("Enter the first number");
    let a = parseInt(prompt(">> "));

    console.log("Enter the second number");
    let b = parseInt(prompt(">> "));

    let c;
    switch(option){
      case "1": {
        c = calc.add(a, b);
        console.log(`a + b = ${c}`);
      }
      break;

      case "2": {
        c = calc.subtract(a, b);
        console.log(`a - b = ${c}`);
      }
      break;

      case "3": {
        c = calc.multiply(a, b);
        console.log(`a * b = ${c}`);
      }
      break;

      case "4": {
        c = calc.divide(a, b);
        console.log(`a / b = ${c}`);
      }
      break;
    }    

    readInput();
  }
}

readInput();

console.log("Thank you for using calculator. Good Bye");
```

Yeyy. We converted our first module from javascript to typescript. If you run `npn run build` at this point, you will notice the webpack successfully gives us a packaged bundle in `lib/index.js` that is ready to use. 

The final code for this section is in the branch `convert-entry-module`. After you have cloned the repo, just checkout this branch and run `npm run build` to see the code in action. 

# Keep going
Converting the first javascript file is a big win. You have basic plumbing in place now to take on the bigger task. You may want to expand your webpack configuration to include other types of files you may have in your project, add production build steps like minification, uglification etc. At the same time, you also need to keep converting more and more files from javascript to typescript. The next logical step is to get rid of our own type declaration files by converting the javascript modules into typescript. Let's change the `calculator` module to get rid of `calculator.d.ts`. There are a number of ways, you can rewrite calculator module using typescript. The simplest is to just export the four methods in the module like below. 

```ts

``` 

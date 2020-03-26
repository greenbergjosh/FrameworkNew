const images = require("@rollup/plugin-image")
import pkg from "./package.json"
import progress from "rollup-plugin-progress"
import typescript from "rollup-plugin-typescript2"
import { terser } from "rollup-plugin-terser"
import analyze from "rollup-plugin-analyzer"
import postcss from 'rollup-plugin-postcss-modules'
import autoprefixer from 'autoprefixer'

export default {
  input: "src/index.ts",
  output: {
    file: pkg.main,
    format: "umd",
    name: "main",
    sourcemap: true,
    globals: {
      antd: "antd",
      "lodash/fp": "fp",
      react: "React",
      classnames: "classNames",
      "react-dnd": "reactDnd",
      "react-dnd-html5-backend": "HTML5Backend",
      "react-dnd-touch-backend": "TouchBackend",
      "json-logic-js": "jsonLogic",
      "fp-ts/lib/Option": "Option",
      "@reach/component-component": "Component",
      "io-ts": "iots",
      "monaco-editor": "monacoEditor",
      "react-monaco-editor": "MonacoEditor",
      moment: "moment",
      "js-file-download": "fileDownload",
      "uuid/v4": "uuid",
      "ckeditor4-react": "CKEditor",
      "fp-ts/lib/Either": "Either",
      "@syncfusion/ej2-react-grids": "ej2ReactGrids",
      "@syncfusion/ej2-react-inputs": "ej2ReactInputs",
    },
  },
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    "lodash/fp",
    "fp-ts/lib/Option",
    "fp-ts/lib/Either",
    "uuid/v4",
  ],
  plugins: [
    postcss({
      plugins: [autoprefixer()],
      writeDefinitions: false, // Creates *.scss.d.ts files next to every processed .scss file
      extract: true, // Extract the CSS to a separate file?
      modules: true, // Enable CSS modules for the bundle?
      use: ["sass"], // Enable Sass support
      sourceMap: true,
    }),
    typescript({
      typescript: require("typescript"),
    }),
    terser(), // minification
    images(),
    progress(),
    analyze({ summaryOnly: true, limit: 5 }),
  ],
}
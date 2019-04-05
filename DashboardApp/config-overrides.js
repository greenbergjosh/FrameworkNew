const path = require("path")
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin")
const { override, fixBabelImports } = require("customize-cra")

const overrides = [
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: "css",
  }),
]

/**
 * @param {import('webpack').Configuration} config
 * @param {"development" | "production"} env
 */
module.exports = function customizeCRA(config, env) {
  config.plugins = config.plugins || []
  config.module.rules = config.module.rules || []

  // // This may be necessary for react-monaco-editor according to docs:
  // // https://github.com/react-monaco-editor/react-monaco-editor/tree/2df830b0fe953527905950c79b02f935221f7186#using-with-webpack
  // // I dug into the react-script webpack config to find where to override
  // const rule = config.module.rules.find((r) => Array.isArray(r.oneOf))
  // rule.oneOf.splice(-1, 0, {
  //   test: /\.css$/,
  //   include: path.resolve(__dirname, "./node_modules/monaco-editor"),
  //   use: ["style-loader", "css-loader"],
  // })

  config.plugins.push(
    new MonacoWebpackPlugin({
      features: [
        "!accessibilityHelp",
        "bracketMatching",
        "caretOperations",
        "clipboard",
        "codeAction",
        "!codelens",
        "colorDetector",
        "comment",
        "contextmenu",
        "coreCommands",
        "cursorUndo",
        "dnd",
        "find",
        "folding",
        "fontZoom",
        "format",
        "goToDefinitionCommands",
        "goToDefinitionMouse",
        "gotoError",
        "gotoLine",
        "hover",
        "inPlaceReplace",
        "inspectTokens",
        "!iPadShowKeyboard",
        "linesOperations",
        "links",
        "multicursor",
        "parameterHints",
        "quickCommand",
        "quickOutline",
        "referenceSearch",
        "rename",
        "smartSelect",
        "snippets",
        "suggest",
        "toggleHighContrast",
        "toggleTabFocusMode",
        "transpose",
        "wordHighlighter",
        "wordOperations",
        "wordPartOperations",
      ],
      languages: ["csharp", "json", "javascript", "typescript", "sql", "xml"],
    })
  )
  return override(...overrides)(config, env)
}

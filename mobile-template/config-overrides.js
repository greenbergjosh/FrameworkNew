const path = require("path")
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
  config.devtool = "source-map"
  config.plugins = config.plugins || []
  config.module.rules = (config.module.rules || []).concat({
    test: /\.(html)$/,
    use: {
      loader: "html-loader",
      options: {
        attrs: [":data-src"],
      },
    },
  })

  return override(...overrides)(config, env)
}

module.exports = function(api) {
  api.cache(true)
  return {
    presets: ["babel-preset-expo"],
    sourceMaps: true,
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@types": "./@types",
            "assets": "./assets",
            "components": "./components",
            "constants": "./constants",
            "data": "./data",
            "hooks": "./hooks",
            "routes": "./routes",
            "screens": "./screens",
            "styles": "./styles",
          },
        },
      ],
    ],
  }
}

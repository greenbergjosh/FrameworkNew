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
            "api": "./api",
            "assets": "./assets",
            "components": "./components",
            "constants": "./constants",
            "hooks": "./hooks",
            "providers": "./providers",
            "screens": "./screens",
          },
        },
      ],
    ],
  }
}

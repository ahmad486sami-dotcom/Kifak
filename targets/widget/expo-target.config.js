/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  name: "KifakWidget",
  icon: "../../assets/icon.png",
  deploymentTarget: "17.0",
  entitlements: {
    "com.apple.security.application-groups": config.ios.entitlements["com.apple.security.application-groups"],
  },
  colors: {
    $accent: "#FF6B6B",
    $widgetBackground: "#0E0B12",
  },
});

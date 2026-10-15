const path = require("path")

module.exports = {
  mode: 'production',
  entry : "./src/scripts.js",
  output : {
    path: path.resolve(__dirname, "dist"),
    filename: "ntfy-networking.min.js"
  }
}
const path = require("path")

module.exports = {
  mode: 'development',
  entry : "./src/scripts.js",
  output : {
    path: path.resolve(__dirname, "dev"),
    filename: "ntfy-networking.js"
  }
}
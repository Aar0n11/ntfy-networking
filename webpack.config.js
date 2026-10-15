const path = require("path")

module.exports = {
  entry : "./src/scripts.js",
  output : {
    path: path.resolve(__dirname, "dist"),
    filename: "ntfy-networking.min.js"
  }
}
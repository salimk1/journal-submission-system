const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require('path');
module.exports = {
    resolve: {
      alias: {
        "../../theme.config$": path.join(__dirname, "/src/semantic-ui/theme.config"),
        "../src/semantic-ui/site": path.join(__dirname, "/src/semantic-ui/site"),
        "../semantic-ui/site": path.join(__dirname, "/src/semantic-ui/site"),
      }
    },
    module: {
      rules: [
        {
          use: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: ["css-loader", "less-loader"]
          }),
          test: /\.less$/
        }
      ]
    }
  };
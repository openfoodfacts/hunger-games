const path = require("path");
const glob = require("glob");

module.exports = {
  mode: "production",
  devtool: "inline-source-map",
  entry: {
    "bundle.js": glob
      .sync("build/static/?(js|css)/*.?(js|css)")
      .map((f) => path.resolve(__dirname, f)),
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.min.js",
  },
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx|jsx)$/,
        exclude: /node_modules\/(?!@mui)/,
        loader: "babel-loader",
        options: {
          cacheDirectory: true,
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".jsx", ".ts", ".js"],
  },
};

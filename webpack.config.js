const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    index: "./src/index.js",
  },
  devtool: "inline-source-map",
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: path.resolve(__dirname, "./static") }],
    }),
  ],
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|glb)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(glsl|vert|frag)$/,
        loader: "threejs-glsl-loader",
        // Default values (can be omitted)
        options: {
          chunksPath: "../ShaderChunk", // if chunk fails to load with provided path (relative), the loader will retry with this one before giving up
          chunksExt: "glsl", // Chunks extension, used when #import statement omits extension
        },
      },
    ],
  },
};

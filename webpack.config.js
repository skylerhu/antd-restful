const path = require("path"); // eslint-disable-line
const CopyPlugin = require("copy-webpack-plugin"); // eslint-disable-line
const TerserPlugin = require("terser-webpack-plugin"); // eslint-disable-line

const PATHS = {
  src: path.join(__dirname, "src"),
  build: path.join(__dirname, "dist"),
  srcStatic: path.join(__dirname, "src", "static"),
  buildStatic: path.join(__dirname, "dist", "static"),
};

const config = {
  mode: "production",
  devtool: "source-map",
  entry: path.join(PATHS.src, "index.js"),
  output: {
    path: PATHS.build,
    clean: true,
    filename: "index.js",
    library: {
      name: "antd-restful",
      type: "umd", // 采用通用模块定义
      export: "default", // 兼容 ES6 的模块系统、CommonJS 和 AMD 模块规范
    },
    globalObject: "this",
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      src: PATHS.src,
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/, //排除node_modules文件夹
        enforce: "pre", //提前加载使用
        use: {
          //使用eslint-loader解析
          loader: "eslint-loader",
        },
      },
      {
        // 使用 babel-loader 来编译处理 js 和 jsx 文件
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          // 会自动读取 .labelrc 配置
          loader: "babel-loader",
        },
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true, // eslint-disable-line camelcase
          keep_fnames: true, // eslint-disable-line camelcase
        },
      }),
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: PATHS.srcStatic, to: PATHS.buildStatic }],
    }),
  ],
  externals: {
    // 定义外部依赖，避免把react和react-dom打包进去
    react: "react",
    "react-dom": "react-dom",
    antd: "antd",
    "@ant-design/icons": "@ant-design/icons",
  },
};

module.exports = config;

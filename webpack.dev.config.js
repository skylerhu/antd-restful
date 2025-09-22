const path = require("path"); // eslint-disable-line

const PATHS = {
  src: path.join(__dirname, "src"),
  demo: path.join(__dirname, "demo"),
};

const devConfig = {
  mode: "development", // 开发模式
  devtool: "inline-source-map",
  entry: path.join(PATHS.demo, "index.js"),
  output: {
    path: PATHS.demo,
    filename: "bundle.js",
  },
  devServer: {
    static: {
      directory: path.join(PATHS.demo, "public"),
    },
    host: "127.0.0.1",
    port: 3002,
    proxy: [
      {
        context: ["/api"],
        target: "http://127.0.0.1:3001",
        pathRewrite: { "^/api": "/api" },
        changeOrigin: true,
      },
    ],
    open: false, // 自动打开浏览器
    client: {
      overlay: {
        warnings: false,
        errors: false, // 关闭浏览器中的错误覆盖层
        runtimeErrors: false, // 关闭运行时错误覆盖层
      },
    },
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      src: PATHS.src,
      demo: PATHS.demo,
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        enforce: "pre", // 优先处理
        use: {
          loader: "eslint-loader",
        },
        include: [PATHS.demo, PATHS.src],
      },
      {
        // 使用 babel-loader 来编译处理 js 和 jsx 文件
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          // 会自动读取 .labelrc 配置
          loader: "babel-loader",
        },
        include: [PATHS.demo, PATHS.src],
      },
    ],
  },
  plugins: [],
};

module.exports = devConfig;

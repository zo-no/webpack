/*
@Date		:2023/11/30 22:34:51
@Author		:zono
@Description:
1. 学习插件：
html-webpack-plugin：
      用于生成html文件
      会自动引入打包后的js文件
      对html文件进行压缩

clean-webpack-plugin：用于清除dist目录

webpack-dev-server：用于开启一个服务器，实时监听文件的变化，自动打包并刷新浏览器->热更新
过程：打包
      1. webpack-dev-server会在内存中打包，不会产生dist目录
      2. webpack-dev-server会自动引入打包后的js文件
      3. webpack-dev-server会自动刷新浏览器
      可以启动一个服务器，作为数据跨域请求的代理服务器，也就是可以实现proxy跨域代理

2. 多入口多出口配置

3.CleanWebpackPlugin使用

4. dev-server的配置:解决跨域问题
*/

const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const path = require("path");

module.exports = {
  mode: "production",
  // 配置多入口，打包多个文件
  entry: {
    index: "./src/index.js",
    login: "./src/login.js",
  },
  output: {
    filename: "[name].[hash:8].js", //name匹配entry的key值
    path: path.resolve(__dirname, "./dist"),
  },
  /*使用插件*/
  plugins: [
    new HtmlWebpackPlugin({
      // 指定页面模板
      template: "./public/index.html", // 模板文件
      // 打包后的文件名
      filename: "index.html",
      // 压缩配置
      minify: {
        removeAttributeQuotes: true, // 删除属性的双引号
        collapseWhitespace: true, // 折叠空行
      },
      hash: true, // 为了避免缓存，可以在引入的js里面加入hash值
      chunkhash: true, // 为了避免缓存，可以在引入的js里面加入chunkhash值
      chunks: ["index"], // 引入指定的js文件，如果不设置就会引入所有产出的js
    }),
    new HtmlWebpackPlugin({
      template: "./public/login.html",
      filename: "login.html",
      minify: {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
      },
      chunkhash: true,
      chunks: ["login"],
    }),
    new CleanWebpackPlugin(),
  ],
  /*使用DEV-SERVER*/
  devServer: {
    host: "127.0.0.1", // 主机名
    static: {
      directory: path.join(__dirname, "./dist"),
    },
    port: 3000, // 端口号
    open: true, // 自动打开浏览器
    hot: true, // 开启热更新
    compress: true, // 启动gzip压缩
    proxy: {
      /* 配置跨域代理，作为数据请求的代理服务器，来避免跨域问题
       开放环境使用webpack-dev-server来作为代理服务器
       生产环境使用nginx来作为代理服务器
       以前的前后端不分离的项目，不需要配置跨域代理，现在Node的SSR项目也不需要配置跨域代理*/
      "/v1": {
        /*"/xxx"前缀：配置代理的前缀,主要用来区分，如果只有一个服务器，一般不需要配置
        或者直接配置为："/api"，表示所有请求都代理到target上*/
        target: "http://localhost:8000", // target:配置代理的目标地址
        // pathRewrite: { "^/v1": "" }, // pathRewrite:重写路径，去掉路径中开头的/api，不然会变成：http://localhost:8000/api/api/xxx
        changeOrigin: true, // 支持跨域
        ws: true, // 支持websocket
      },
    },
  },
};

//踩坑：webpack4中一些配置被移除了，比如webpack-dev-server的contentBase、inline、compress

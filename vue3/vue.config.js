const path = require("path");
const resolve = (dir) => path.join(__dirname, dir);
const PurgecssPlugin = require("purgecss-webpack-plugin");
const glob = require("glob-all");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;
module.exports = {
  publicPath: "./",
  outputDir: "dist",
  assetsDir: "static",
  indexPath: "index.html",
  filenameHashing: true,
  pages: {
    index: {
      entry: "src/index/main.js",
      template: "public/index.html",
      filename: "index.html",
      title: "Index Page",
      chunk: ["chunk-vendors", "chunk-common", "index"],
    },
  },
  lintOnSave: process.env.NODE_ENV !== "production",
  runtimeCompiler: false,
  transpileDependencies: [],
  productionSourceMap: false,
  crossorigin: undefined,
  integrity: false,
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === "production") {
      //生产环境配置
    } else {
      // 开发环境配置
    }
    const plugins = [];
    //去掉不用的css 多余的css
    plugins.push(
      new PurgecssPlugin({
        paths: glob.sync([path.join(__dirname, "./**/*.vue")]),
        extractors: [
          {
            extractor: class Extractor {
              static extract(content) {
                const validSection = content.replace(
                  /<style([\s\S]*?)<\/style>+/gim,
                  ""
                );
                return validSection.match(/[A-Za-z0-9-_:/]+/g) || [];
              }
            },
            extensions: ["html", "vue"],
          },
        ],
        whitelist: ["html", "body"],
        whitelistPatterns: [/el-.*/],
        whitelistPatternsChildren: [/^token/, /^pre/, /^code/],
      })
    );
    //启用代码压缩
    plugins.push(
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            warnings: false,
            drop_console: true,
            drop_debugger: false,
            pure_funcs: ["console.log"], //移除console
          },
        },
        sourceMap: false,
        parallel: true,
      })
    ),
      //代码压缩打包
      plugins.push(
        new CompressionWebpackPlugin({
          filename: "[path].gz[query]",
          algorithm: "gzip",
          test: productionGzipExtensions,
          threshold: 10240,
          minRatio: 0.8,
        })
      );
    config.plugins = [...config.plugins, ...plugins];
  },
  chainWebpack: (config) => {
    // 修复HMR
    config.resolve.symlinks(true);
    // 修复Lazy loading routes  按需加载的问题，如果没有配置按需加载不需要写，会报错
    // config.plugin("html").tap(args => {
    //   args[0].chunksSortMode = "none";
    //   return args;
    // });
    //添加别名
    config.resolve.alias
      .set("@", resolve("src"))
      .set("@assets", resolve("src/assets"))
      .set("@components", resolve("src/components"))
      .set("@layout", resolve("src/layout"))
      .set("@base", resolve("src/base"))
      .set("@static", resolve("src/static"));
    // 压缩图片
    config.module
      .rule("images")
      .use("image-webpack-loader")
      .loader("image-webpack-loader")
      .options({
        mozjpeg: { progressive: true, quality: 65 },
        optipng: { enabled: false },
        pngquant: { quality: "65-90", speed: 4 },
        gifsicle: { interlaced: false },
        webp: { quality: 75 },
      });
  },
  //打包的css路径及命名
  css: {
    modules: false,
    requireModuleExtension: false,
    extract: {
      filename: "style/[name].[hash:8].css",
      chunkFilename: "style/[name].[hash:8].css",
    },
    sourceMap: false,
    loaderOptions: {
      css: {},
      less: {},
      postcss: {
        plugins: [
          require("postcss-px-to-viewport")({
            viewportWidth: 750,
            viewportHeight: 1334,
            unitPrecision: 3,
            viewportUnit: "vw",
            selectorBlackList: [".ignore", ".hairlines"],
            minPixelValue: 1,
            mediaQuery: false,
          }),
        ],
      },
    },
  },
  //设置代理
  devServer: {
    port: 8080,
    host: "0.0.0.0",
    https: false,
    open: true,
    openPage: "about",
    hot: true,
    disableHostCheck: true,
    proxy: {
      "/api": {
        target: "https://cdn.awenliang.cn",
        ws: true,
        changeOrigin: true,
      },
      "/foo": {
        target: "https://cdn.awenliang.cn",
        ws: true,
        changeOrigin: true,
      },
    },
  },
  parallel: require("os").cpus().length > 1,
  pwa: {},
  pluginOptions: {},
};

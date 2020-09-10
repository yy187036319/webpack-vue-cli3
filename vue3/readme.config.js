const path = require("path"); // 路径
const glob = require("glob-all"); // 全局文件路径
const resolve = (dir) => path.join(__dirname, dir);
//用于生产环境去除未使用的css
const PurgecssPlugin = require("purgecss-webpack-plugin");
//压缩代码并去掉console
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
//代码打包zip
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;
module.exports = {
  publicPath: "./", // 部署应用包时的基本URL
  outputDir: "dist", // build时生成构建文件的目录
  assetsDir: "static", // 放置生成的静态资源（从生成的资源覆写filename或chunkFilename时，assetsDir会被忽略）
  indexPath: "index.html", // 指定生成的index.html的输出路径
  filenameHashing: true, // 关闭静态资源名hash值  不推荐false
  pages: {
    //在 multi-page(多页) 模式下构建应用
    index: {
      // page 的入口
      entry: "src/index/main.js",
      // 模板来源
      template: "public/index.html",
      // 在 dist/index..html 的输出
      filename: "index.html",
      // 当使用 title选项时，
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: "Index Page",
      // 在这个页面中包含的块，默认情况下会包含
      // 提取出来的通用的 chunk 和 vendor chunk。
      chunk: ["chunk-vendors", "chunk-common", "index"],
    },
    // 当使用只有入口的字符串格式时，
    // 模板会被推导为 `public/subpage.html`。
    // 并且如果找不到的话，就回退到 `public/index.html`
    // 输出文件名会被推导为 `subpage.html`。
    subpage: "src/subpage/main.js",
  },
  // 是否在开发环境下通过 eslint-loader 在每次保存时lint代码    生产环境禁用
  lintOnSave: process.env.NODE_ENV !== "production",
  runtimeCompiler: false, // 是否使用包含运行时编译器的 Vue 构建版本
  transpileDependencies: [], // 没什么用 默认值
  productionSourceMap: false, // 设置为false 关闭生产环境 source map
  crossorigin: undefined, // 没啥用 默认值
  integrity: false, // 没啥用  默认值
  //webpack 配置
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === "production") {
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
    } else {
      // 开发环境配置
    }
    config.plugins = [...config.plugins, ...plugins];
  },
  //webpack 链式配置   默认已经配置好了  node_moudles/@vue
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
      .set("@src", resolve("src"))
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
    requireModuleExtension: false, // false 时去掉文件名 foo.module.css 中间的 .module
    //vue 文件中修改css 不生效 注释掉  extract:true
    extract: {
      //生产环境下是 true 开发环境是 false 是否将组件中的css提取至一个独立的css文件中
      filename: "style/[name].[hash:8].css",
      chunkFilename: "style/[name].[hash:8].css",
    },
    sourceMap: false, // 是否为 css 开启 source Map 默认false
    loaderOptions: {
      // 向 CSS 相关的 loader 传递选项
      css: {},
      less: {
        // 向全局less样式传入共享的全局变量
        // data: `@import "~assets/less/variables.less";$src: "${process.env.VUE_APP_SRC}";`
      },
      // postcss 设置
      postcss: {
        plugins: [
          require("postcss-px-to-viewport")({
            viewportWidth: 750, // 视窗的宽度，对应的是我们设计稿的宽度，一般是750
            viewportHeight: 1334, // 视窗的高度，根据750设备的宽度来指定，一般指定1334，也可以不配置
            unitPrecision: 3, // 指定`px`转换为视窗单位值的小数位数（很多时候无法整除）
            viewportUnit: "vw", // 指定需要转换成的视窗单位，建议使用vw
            selectorBlackList: [".ignore", ".hairlines"], // 指定不转换为视窗单位的类，可以自定义，可以无限添加,建议定义一至两个通用的类名
            minPixelValue: 1, // 小于或等于`1px`不转换为视窗单位，你也可以设置为你想要的值
            mediaQuery: false, // 允许在媒体查询中转换`px`
          }),
        ],
      },
    },
  },
  //设置代理
  devServer: {
    // 支持所有 webpack-dev-server 的选项
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
  parallel: require("os").cpus().length > 1, // 在系统的CPU有多余一个内核时自动启用，仅作用于生产构建
  pwa: {}, // 向 PWA 插件传递选项
  pluginOptions: {}, // 不进行任何schema验证的对象，用它传递任何第三方插件选项 应该没啥用
};

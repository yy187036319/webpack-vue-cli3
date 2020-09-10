# vue3

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

module.exports = {
  publicPath: "./", // 部署应用包时的基本URL
  outputDir: "dist", // build时生成构建文件的目录
  assetsDir: "assets", // 放置生成的静态资源（从生成的资源覆写filename或chunkFilename时，assetsDir会被忽略）
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
  // 是否在开发环境下通过 eslint-loader 在每次保存时lint代码     生产环境禁用
  lintOnSave: process.env.NODE_ENV !== "production",
  runtimeCompiler: true, // 是否使用包含运行时编译器的 Vue 构建版本
  transpileDependencies: [], // 没什么用 默认值
  productionSourceMap: false, // 设置为false 关闭生产环境 source map
  crossorigin: undefined, // 没啥用 默认值
  integrity: false, // 没啥用  默认值
  configureWebpack: (config) => {
    // webpack配置
    if (process.env.NODE_ENV === "production") {
      //生产环境配置
    } else {
      // 开发环境配置
    }
  },
  chainWebpack: (config) => {
    // 对内部的 webpack配置进行更细粒度的修改
  },
  css: {
    // css配置
    requireModuleExtension: false, // false 时去掉文件名 foo.module.css 中间的 .module
    // extract: 生产环境下是 true 开发环境是 false 是否将组件中的css提取至一个独立的css文件中
    sourceMap: false, // 是否为 css 开启 source Map 默认false
    loaderOptions: { // 向 CSS 相关的 loader 传递选项
     
    },
  },
  devServer: {
    // 支持所有 webpack-dev-server 的选项
    proxy: {
      "/api": {
        target: "url", // 代理地址
        ws: true,
        changeOrigin: true,
      },
    },
  },
  parallel: require("os").cpus().length > 1, // 在系统的CPU有多余一个内核时自动启用，仅作用于生产构建
  pwa: {}, // 向 PWA 插件传递选项
  pluginOptions: {}, // 不进行任何schema验证的对象，用它传递任何第三方插件选项 应该没啥用
};


var gulp = require('gulp'),
  clean = require('gulp-clean-css'),
  htmlmin = require('gulp-htmlmin');

gulp.task('cssmin', function() {
  gulp.src('static/css/*.css')
    .pipe(clean())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('minhtml', function() {
  var options = {
    removeComments: true, //清除HTML注释
    collapseWhitespace: true, //压缩HTML
    collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
    removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
    removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
    removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
    minifyJS: true, //压缩页面JS
    minifyCSS: true //压缩页面CSS
  };
  gulp.src('*.html')
    .pipe(htmlmin(options))
    .pipe(gulp.dest('dist/html'));
});

gulp.task('cssauto', function() {
  gulp.watch('static/css/*.css', ['cssmin'])
})

gulp.task('default', ['cssmin', 'cssauto']);

var modules = {
  loaders: [{
    //这是处理es6文件
    test: /\.js$/,
    loader: 'babel-loader',
    exclude: /node_modules/,
    query: {
      presets: ['es2015'],
      plugins: ['transform-runtime']
    }
  }, {
    //这是处理scss文件
    test: /\.scss$/,
    loader: 'style!css!sass'
  }, {
    test: /\.vue$/,
    loader: "vue"
  }, {
    // 这是处理css文件
    test: /\.css$/,
    loaders: ["style", "css"]
  }, {
    test: /\.(png|jpg|gif)$/,
    loader: 'url',
    query: {
      // inline files smaller then 10kb as base64 dataURL
      limit: 10000,
      // fallback to file-loader with this naming scheme
      name: '[name].[ext]?[hash]'
    }
  }]
}

gulp.task('test', function() {
  return gulp.src('test.js')
    .pipe(webpack({
      watch: true,
      output: {
        filename: 'bundle-test.js'
      },
      module: modules,
      resolve: {
        extensions: ['', '.js', '.jsx'],
        alias: {
          'vue$': 'vue/dist/vue.js'
        }
      },
      plugins: [new HtmlWebpackPlugin({
          title: "导航",
          filename: "sharecar.html",
          hash: true,
          template: "!!ejs!html/default.ejs",
          inject: true
        }),
        // new wp.DefinePlugin({
        //  'process.env': {
        //    NODE_ENV: '"production"'
        //  }
        // }),
        // new wp.optimize.UglifyJsPlugin({
        //  compress: {
        //    warnings: false
        //  }
        // })
      ]
    }))
    // .pipe(uglify())//生产的时候再启用压缩
    // .pipe(rev())
    .pipe(gulp.dest('html/dist/'))
    // .pipe(rev.manifest())
    // .pipe(gulp.dest('html/dist/'))
    .pipe(notify("<%= file.relative %> 成功生成!"));
});

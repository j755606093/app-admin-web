## APP管理后台

##声明

由于本人技术能力有限，在项目开始时，在网上找了一个后台管理模板，然后根据需求做相应的改动。因为模板中打开每个管理模块时都是嵌套在iframe标签中的，所以也就很难利用模块化开发的思想将每个管理模块中的公共部分写成组件，也就造成了将vue当做jQuery来用的尴尬。另外，项目的目录也存在着不合理的地方。所以，维护起来可能会比较麻烦，还请见谅！

##项目地址

本地: /Users/yemou/app-admin-web

git: https://github.com/j755606093/app-admin-web

##启动服务

在项目的根目录下找到同级的**serverApp.js**文件，打开终端，输入`node serverApp.js`
启动之后再打开一个终端，进入到项目文件夹app-admin-web，并输入`gulp`

##项目目录

- app-admin-web
  - dist                 存放压缩后的css文件
  - editor               引用的富文本编辑器
  - lib                  一些静态资源文件
  - node_modules         项目依赖
  - static
    - css                每个管理模块的css文件
    - h-ui               后台模板文件
    - h-ui.admin         后台模板文件
    - js                 每个管理模块的js文件
  - account.html         管理员管理
  - comment.html         评论管理
  - community.html       社区管理
  - doc.html             首页文章管理
  - essay.html           微信文章管理
  - feedback.html        举报管理
  - company.html         运输公司管理
  - group.html           角色管理
  - index.html           首页
  - hotvideo.html        热门视频
  - member.html          用户管理
  - login.html           登录页
  - module.html          模块管理
  - moment.html          动态管理
  - moment-comment       生活圈评论管理
  - nav.html             导航管理
  - news.html            新闻管理
  - notify.html          推送管理
  - pictrue.html         轮播图管理
  - post.html            帖子管理
  - qcloud.html          直播管理
  - service.html         服务管理
  - topic.html           话题管理
  - video-classify.html  视频分类  
  - video-comment        视频评论管理
  - wechat.html          公众号管理

##注意事项

- 如果要新增一个父级管理模块，比如首页，那么首先需要在**权限**中打开模块管理添加一个父级模块，之后在`index.html`中**aside**标签下增加如下代码：

``` html
<dl id="menu-default" v-show="childHomeModule.length !== 0">
  <dt><i class="Hui-iconfont">&#xe625;</i> 首页<i class="Hui-iconfont menu_dropdown-arrow">&#xe6d5;</i></dt>
  <dd>
    <ul>
      <li v-for="item in childHomeModule"><a _href="{{item.Value | addHash}}" data-title="{{item.Name}}" href="javascript:;"> {{item.Name}}</a></li>
    </ul>
  </dd>
</dl>
```

然后再到`index.js`中定义**childHomeModule**，并在**getAdminModule(username)**方法下增加如下代码：

``` javascript 
if (name == "首页") {
  _this.childHomeModule = modules;
}
```

最后，代码修改完提交到线上之后，还得在**权限**中打开模块管理添加一个同样的父级模块

- 如果要新增一个子级管理模块，比如新闻管理，那么也需要在**权限**中打开模块管理并在所属模块下添加子级模块。代码提交之后，也同样在线上进行相同的操作。

- 如果修改了样式文件，记得要打开终端运行`gulp`命令


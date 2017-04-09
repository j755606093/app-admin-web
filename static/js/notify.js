Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: '#app',
  data: {
    layer: null, //弹出框,
    items: {},
    currCount: 15, //当前数据量
    displayCount: 15, //当前页要显示的数据量 
    TotalCount: 0,
    currPage: 1, //当前页码
    isHide: false, //“加载中”
    isSearch: false, //判断是否在搜索
    NotifyType: "",
    SeearchType: "",
    SearchKey: "",
    Notify: { Title: "", Content: "", Target: "", StatusBarMsg: "" },
    News: { Title: "", NewsId: [], Target: "", StatusBarMsg: "" },
    notifyUsrIdValid: false, //验证推送系统通知中的接收者ID
    notifyTitleValid: false, //验证推送系统通知中的标题
    notifyContentValid: false, //验证推送系统通知中的内容
    notifyStatusBarMsgValid: false, //验证推送系统通知中的状态栏消息
    newsUsrIdValid: false, //验证推送今日头条中的接收者ID
    newsTitleValid: false, //验证推送今日头条中的标题
    newsStatusBarMsgValid: false, //验证推送今日头条中的状态栏消息
    newsIdValid: false, //验证推送今日头条中的新闻Id
    notifyValid: true, //验证推送今日头条
    newsValid: true, //验证推送系统通知
    newsLayer: null, //选择新闻列表框
    newsItem: [],
    currNewsCount: 10, //当前新闻的数据量
    currNewsPage: 1, //当前新闻页
    searchKeyWord: "", //搜索新闻关键字
    searchKeyList: "", //搜索新闻类型
    isSearchNews: false, //是否在搜索新闻
    newsCount: 0, //新闻的数量
    isShow: false, //搜索出的新闻数量不足10条时，给table加margin-bottom
    NewsType: [], //新闻类型
    noTypeTop: true,
    isType: false,
    isTop: false,
    isIndent: false, //是否缩进
    Intro: "", //文章内容    
    firstLoad: true,
    selectedNemsItem: [], //被选中的新闻列表
    token: "Bearer " + window.localStorage.token,
    usrId: window.localStorage.usrId, //用户Id 
    ip: "", //用于服务器
    // ip: "http://192.168.31.82", //用于测试
  },
  created: function() {
    if (!this.usrId) {
      parent.location.href = "login.html";
    } else {
      this.getList(1, 15, "", "", "");
    }
  },
  methods: {
    getList(index, size, notifytype, type, key) {
      var _this = this;
      var data = {
        "Index": index,
        "Size": size,
        "NotifyType": -1
      };
      if (notifytype !== "") {
        data.NotifyType = notifytype;
      }
      if (type === "Nick") {
        data.Nick = key;
      }
      if (type === "Mobile") {
        data.Mobile = key;
      }
      if (type === "UsrId") {
        data.UsrId = key;
      }
      data = JSON.stringify(data);
      this.$http.post(this.ip + "/api/Notify/ListNotify", data, {
        headers: {
          "Authorization": this.token,
          "Content-Type": "application/json"
        }
      }).then(function(res) {
        // console.log(response)
        if (res.body.Code == 200) {
          _this.items = res.body.Data.Content;
          _this.displayCount = _this.items.length;
          _this.TotalCount = res.body.Data.TotalCount;
          _this.isHide = true; //加载完毕
        } else {
          if (res.body.Code == 204) {
            _this.items = [];
            _this.displayCount = 0;
            _this.TotalCount = 0;
            document.getElementById("page").innerHTML = "";
          } else {
            layer.msg(res.body.Message, { icon: 2, time: 2500 });
          }
          _this.isHide = true;
        }
      }).catch(function(error) {
        _this.isHide = true;
        console.log(error);
        layer.msg("服务器错误，请稍后再试", { icon: 2, time: 2500 });
      });
      document.getElementById("isget").style.visibility = "visible";
    },
    //设置分页
    setPage() {
      var _this = this;
      var total = parseInt(this.TotalCount);
      var currcount = parseInt(this.currCount);
      if (total > currcount) {
        layui.use(['laypage'], function() {
          layui.laypage({
            cont: 'page', //分页容器的id
            pages: Math.ceil(total / currcount), //总页数
            skin: '#148cf1', //自定义选中色值
            skip: true, //开启跳页
            jump: function(obj) {
              if (!_this.firstLoad) {
                _this.isHide = false;
                _this.currPage = obj.curr;
                _this.getList(obj.curr, _this.currCount, _this.NotifyType, _this.SeearchType, _this.SearchKey);
              }
              _this.firstLoad = false;
            },
          })
        });
      } else {
        document.getElementById("page").innerHTML = "";
      }
    },
    search() {
      this.isSearch = true;
      var notifytype = document.getElementsByName("notifytype");
      for (var type of notifytype) {
        if (type.checked) {
          this.NotifyType = type.value;
        }
      }
      this.firstLoad = true;
      this.getList(1, this.currCount, this.NotifyType, this.SeearchType, this.SearchKey);
    },
    //获取当前页面要显示的数据量
    getData(event) {
      this.currCount = event.target.value;
      this.currPage = 1; //防止获取不到数据
      this.firstLoad = true;
      this.getList(1, this.currCount, this.NotifyType, this.SeearchType, this.SearchKey);
    },
    //获取新闻总数
    getNewsCount(index, key, value) {
      var totalConut = 0;
      var _this = this;
      var data = { "Index": index, "Size": 10 };
      if (key == "Title") {
        data.Title = value;
      }
      if (key == "Author") {
        data.Author = value;
      }
      if (key == "IsTop") {
        data.IsTop = value;
      }
      if (key == "RealType") {
        data.RealType = value;
      }
      return new Promise((resolve, reject) => {
        this.$http.post(this.ip + "/api/HNews/List", data, {
          headers: {
            "Authorization": this.token
          }
        }).then((res) => {
          if (res.body.Code === 200) {
            totalConut = res.body.Data.TotalCount;
            resolve(totalConut);
          } else if (res.body.Code === 204) {
            //数据获取失败时清空原有数据
            this.newsItem = [];
            this.isHide = true;
            document.getElementById("newsPage").innerHTML = "";
          } else {
            layer.msg(res.body.Message, { icon: 2, time: 3000 });
            this.isHide = true;
          }
        })
      }).then(count => {
        if (count > 10) {
          layui.laypage({
            cont: 'newsPage', //分页容器的id
            pages: Math.ceil(count / 10), //总页数
            skin: '#148cf1', //自定义选中色值
            skip: true, //开启跳页
            jump: function(obj) {
              // _this.isHide = false;
              //跳到下一页时清空上一页的数据
              _this.newsItem = [];
              //记录当前页码
              _this.currNewsPage = obj.curr;
              //获取当前页或指定页的数据
              // 当不是搜索数据 && Vue_App.searchItem.searchList != "ViewType" BUG
              if ($.trim(_this.searchKeyWord) == "" || _this.searchKeyWord == null) {
                _this.getNewsList(obj.curr, _this.searchKeyList, _this.searchKeyWord);
              } else {
                if (_this.isSearchNews) {
                  obj.curr = 1; //在进行搜索时，防止在当前页码不是1而导致获取不到数据
                }
                _this.getNewsList(obj.curr, _this.searchKeyList, _this.searchKeyWord);
                _this.isSearchNews = false; //页码设置完1后，将其重新设为false，防止其影响翻页
              }
            },
          });
        }
        //不足10条数据
        else {
          // 当不是搜索数据
          if (_this.searchKeyWord == "" || _this.searchKeyWord == null) {
            _this.getNewsList(1, _this.searchKeyList, _this.searchKeyWord);
          } else {
            _this.getNewsList(1, _this.searchKeyList, _this.searchKeyWord);
            //不构成分页时，把之前的分页去掉
            document.getElementById("newsPage").innerHTML = "";
          }
        }
      })
    },
    getNewsList(index, key, value) {
      var _this = this;
      var data = { "Index": index, "Size": 10 };
      if (key == "Title") {
        data.Title = value;
      }
      if (key == "Author") {
        data.Author = value;
      }
      if (key == "IsTop") {
        data.IsTop = value;
      }
      if (key == "RealType") {
        data.RealType = value;
      }
      this.$http.post(this.ip + "/api/HNews/List", data, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.body.Code == 200) {
          _this.newsItem = res.body.Data.Content;
          // this.isHide = true; //加载完毕
          //为选中的新闻加上加上记号
          setTimeout(function() {
            var newsList = document.getElementsByName("news");
            for (var id of _this.News.NewsId) {
              for (var news of newsList) {
                if (news.value == id) {
                  news.checked = true;
                }
              }
            }
          }, 500);
        } else {
          if (res.body.Code == 204) {
            this.newsItem = [];
            document.getElementById("newsPage").innerHTML = "";
          } else {
            layer.msg(res.body.Message, { icon: 2, time: 1500 });
          }
          //数据获取失败时清空原有数据
          this.newsItem = [];
          // this.isHide = true;
        }
      }, function(error) {
        console.log(error);
        // Vue_App.isHide = true;
        layer.msg("服务器错误，请稍后再试", { icon: 2, time: 1500 });
      });
    },
    // 查看推送内容/摘要
    lookIntro(type, intro) {
      var msg = "";
      if (type == "abstract") {
        msg = "推送摘要";
      } else {
        msg = "推送内容";
      }
      layer.open({
        type: 1,
        title: msg,
        content: $("#lookIntro"),
        area: "400px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭
      });
      if (intro.length > 30) {
        this.isIndent = true;
      } else {
        this.isIndent = false;
      }
      this.Intro = intro;
    },
    //推送系统通知
    pushNotify(id) {
      // this.Notify.UsrId = id;
      this.layer = layer.open({
        type: 1,
        title: "推送系统通知",
        content: $("#addnotify"),
        area: "500px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭     
      });
      this.clearNotify();
    },
    checkNotifyTitle() {
      if (this.Notify.Title === "") {
        this.notifyValid = false;
        this.notifyTitleValid = true;
      } else {
        this.notifyTitleValid = false;
      }
    },
    checkNotifyContent() {
      if (this.Notify.Content === "") {
        this.notifyValid = false;
        this.notifyContentValid = true;
      } else {
        this.notifyContentValid = false;
      }
    },
    checkNotifyStatusBarMsg() {
      if (this.Notify.StatusBarMsg === "") {
        this.notifyValid = false;
        this.notifyStatusBarMsgValid = true;
      } else {
        this.notifyStatusBarMsgValid = false;
      }
    },
    clearNotify() {
      this.Notify.Title = "";
      this.Notify.Content = "";
      this.Notify.StatusBarMsg = "";
    },
    //推送系统通知
    addNotify() {
      var _this = this;
      this.notifyValid = true;
      this.checkNotifyTitle();
      this.checkNotifyContent();
      this.checkNotifyStatusBarMsg();
      if (this.notifyValid) {
        var data = JSON.stringify(this.Notify);
        this.$http.post(this.ip + "/api/Notify/PushSys", data, {
          headers: {
            "Authorization": this.token,
            "Content-Type": "application/json"
          }
        }).then(function(res) {
          if (res.body.Code === 200) {
            _this.firstLoad = true;
            _this.getList(1, _this.currCount, _this.NotifyType, _this.SeearchType, _this.SearchKey);
            layer.msg("新增成功", { icon: 1, time: 2000 });
            _this.clearNotify();
            _this.layer_close(_this.layer);
          } else {
            layer.msg(res.body.Message, { icon: 2, time: 3000 });
          }
        }).catch(function(err) {
          layer.msg("服务器错误，请稍后再试", { icon: 2, time: 3000 });
        })
      }
    },
    //推送今日头条
    pushNews() {
      if (this.News.NewsId.length === 0) {
        this.getNewsCount(this.currNewsPage, "", "");
      }
      this.layer = layer.open({
        type: 1,
        title: "推送今日头条",
        content: $("#addnews"),
        area: "500px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭     
      });
      this.clearData();
    },
    checkNewsTitle() {
      if (this.News.Title === "") {
        this.newsValid = false;
        this.newsTitleValid = true;
      } else {
        this.newsTitleValid = false;
      }
    },
    checkNewsStatusBarMsg() {
      if (this.News.StatusBarMsg === "") {
        this.newsValid = false;
        this.newsStatusBarMsgValid = true;
      } else {
        this.newsStatusBarMsgValid = false;
      }
    },
    checkNewsNewsId() {
      if (this.News.NewsId.length === 0) {
        this.newsValid = false;
        this.newsIdValid = true;
      } else {
        this.newsIdValid = false;
      }
    },
    //打开选择新闻列表的窗口
    openNews() {
      var _this = this;
      if (this.News.NewsId.length === 0) {
        this.getNewsType();
      }
      this.newsLayer = layer.open({
        type: 1,
        title: "选择新闻",
        content: $("#selectnews"),
        area: "1000px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭
      });
    },
    //获取新闻类型
    getNewsType() {
      this.$http.get(this.ip + "/api/HNews/ListNewsType", {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.body.Code === 200) {
          this.NewsType = res.body.Data;
        } else {
          this.NewsType = [];
        }
      }).catch(function(err) {
        console.log(err)
      })
    },
    //搜索类型改变时
    changeList() {
      var list = this.searchKeyList;
      if (list === "RealType") {
        this.isType = true;
        this.isTop = false;
        this.noTypeTop = false;
        this.searchKeyWord = this.NewsType[0].Value;
      } else if (list === "IsTop") {
        this.isType = false;
        this.isTop = true;
        this.noTypeTop = false;
        this.searchKeyWord = 1;
      } else {
        this.isType = false;
        this.isTop = false;
        this.noTypeTop = true;
        this.searchKeyWord = "";
      }
    },
    //搜索新闻
    searchNews() {
      var _this = this;
      this.isSearchNews = true;
      this.getNewsCount(1, this.searchKeyList, this.searchKeyWord);
    },
    //查看已选择的新闻
    lookCount() {
      layer.open({
        type: 1,
        title: "已选择的新闻",
        content: $("#lookNews"),
        area: "400px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭     
      });
    },
    //确定选择好的新闻
    confirmSelect() {
      var _this = this;
      var confirm = layer.confirm('确定要选择这些新闻吗？', {
        btn: ['确定', '取消'] //按钮
      }, function() {
        layer.close(_this.newsLayer);
        layer.close(confirm);
      }, function() {
        layer.close(confirm);
      });
    },
    //取消
    closeNews() {
      var _this = this;
      var confirm = layer.confirm('确定要关闭吗？', {
        btn: ['确定', '取消'] //按钮
      }, function() {
        layer.close(_this.newsLayer);
        layer.close(confirm);
      }, function() {
        layer.close(confirm);
      });
    },
    //全选
    // allNews() {
    //   var news = document.getElementsByName("news");
    //   for (var i = 0; i < news.length; i++) {
    //     if (news[i].checked) {
    //       var id = news[i].value;
    //       var title = news[i].dataset.title;
    //       this.selectNews(id, title);
    //     }
    //   }
    // },
    //点击选择新闻
    selectNews(id, title) {
      //将News.NewsId转为字符串
      if (typeof this.News.NewsId === "string") {
        if (this.News.NewsId === "") {
          this.News.NewsId = [];
        } else {
          //只有一个Id
          if (this.News.NewsId.indexOf(",") === -1) {
            var id = this.News.NewsId;
            this.News.NewsId = [];
            this.News.NewsId.push(id);
          } else { //不止一个id
            this.News.NewsId = this.News.NewsId.split(",");
          }
        }
      }
      id = id.toString();
      if (this.News.NewsId.indexOf(id) === -1) {
        this.News.NewsId.push(id);
        this.selectedNemsItem.push(title);
        //当前被选中的新闻的数量
        this.newsCount++;
      } else {
        for (var i = 0; i < this.News.NewsId.length; i++) {
          if (this.News.NewsId[i] === id) {
            this.News.NewsId.splice(i, 1);
            this.selectedNemsItem.splice(i, 1);
            //当前被选中的新闻的数量
            this.newsCount--;
          }
        }
      }
    },
    //删除选中的新闻
    delNews(index) {
      var id = this.News.NewsId[index];
      this.News.NewsId.splice(index, 1);
      this.selectedNemsItem.splice(index, 1);
      this.newsCount--;
      var newsList = document.getElementsByName("news");
      for (var news of newsList) {
        if (news.value == id) {
          news.checked = false;
        }
      }
    },
    //增加今日头条
    addNews() {
      this.newsValid = true;
      this.checkNewsTitle();
      this.checkNewsStatusBarMsg();
      this.checkNewsNewsId();
      var _this = this;
      if (this.newsValid) {
        var data = JSON.stringify(this.News);
        this.$http.post(this.ip + "/api/Notify/PushNews", data, {
          headers: {
            "Authorization": this.token,
            "Content-Type": "application/json"
          }
        }).then(function(res) {
          if (res.body.Code === 200) {
            _this.firstLoad = true;
            _this.getList(1, _this.currCount, _this.NotifyType, _this.SeearchType, _this.SearchKey);
            layer.msg("新增成功", { icon: 1, time: 2000 });
            _this.layer_close(_this.layer);
            _this.clearData();
          } else {
            layer.msg(res.body.Message, { icon: 2, time: 3000 });
          }
        }).catch(function(err) {
          layer.msg("服务器错误，请稍后再试", { icon: 2, time: 3000 });
        })
      }
    },
    clearData() {
      this.News.Title = "";
      this.News.StatusBarMsg = "";
      this.News.NewsId = [];
      // this.News.NewsType = [];
      this.selectedNemsItem = [];
      this.newsCount = 0;
    },
    layer_close() {
      layer.close(this.layer);
    },
  },
  watch: {
    TotalCount: function(val) {
      this.setPage();
    },
    currCount: function(val) {
      this.setPage();
    },
  },
  filters: {
    subContent: function(val) {
      if (!val) {
        return "";
      } else {
        var leng = val.length;
        if (leng > 20) {
          val = val.slice(0, 10) + "..." + val.slice(leng - 8, leng);
        }
        return val;
      }
    }
  }
});

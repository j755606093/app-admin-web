Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: '#app',
  data: {
    items: {},
    editItem: {}, //要编辑的items中的数据
    layer: null, //弹出框,
    addItem: { BoardId: "", UsrId: "" }, //增加图
    TotalCount: 0, //总数
    displayCount: 15, //当前页要显示的数据量   
    currCount: 15, //当前数据量
    currPage: 1, //当前页码
    addValid: true,
    editValid: true,
    CommItem: [],
    AppUsage: null,
    isHide: false, //“加载中”
    isIndent: false, //是否缩进
    Intro: "", //文章内容    
    token: "Bearer " + window.localStorage.token,
    usrId: window.localStorage.usrId, //用户Id   
    ip: "", //用于服务器
    // ip: "http://192.168.31.82", //用于测试
  },
  created: function() {
    if (this.usrId === "" || typeof this.usrId === "undefined") {
      parent.location
        .href = "login.html";
    } else {
      this.getList(1, 15);
      this.getComm();
    }
  },
  methods: {
    getList(index, size) {
      this.$http.post(this.ip + "/api/Post/List", { "Index": index, "Size": size }, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(response) {
        if (response.body.Code == 200) {
          this.items = response.body.Data.Content;
          this.displayCount = this.items.length;
          this.TotalCount = response.body.Data.TotalCount;
          this.isHide = true; //加载完毕
        } else {
          if (response.body.Code == 204) {
            this.items = [];
            this.displayCount = 0;
            document.getElementById("page").innerHTML = "";
          } else {
            layer.msg("服务器错误，请稍后再试", { icon: 2, time: 1500 });
          }
          this.isHide = true;
        }
      }, function(error) {
        this.isHide = true;
        console.log(error);
        layer.msg("服务器错误，请稍后再试", { icon: 2, time: 1500 });
      })
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
              _this.isHide = false;
              //跳到下一页时清空上一页的数据
              _this.items = [];
              //记录当前页码
              _this.currPage = obj.curr;
              //获取当前页或指定页的数据
              // console.log(obj.curr);
              _this.getList(obj.curr, _this.currCount);
            },
          })
        });
      } else {
        this.getList(1, this.currCount);
        document.getElementById("page").innerHTML = "";
      }
    },
    //获取当前页面要显示的数据量
    getData(event) {
      this.currCount = event.target.value;
      this.currPage = 1; //防止获取不到数据
      this.getList(1, this.currCount);
    },
    //获取社区Id
    getComm() {
      this.$http.get(this.ip + "/api/Board/ListEnum", {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.data.Code === 200) {
          this.CommItem = res.data.Data;
        } else {
          layer.msg('服务器错误，请稍后再试!', { icon: 2, time: 3000 });
        }
      }, function() {
        layer.msg('服务器错误，请稍后再试!', { icon: 2, time: 3000 });
        console.error()
      })
    },
    //复制Id
    clickCopy(id) {
      id = "#id" + id;
      var a = id + ">a";
      var clipboard = new Clipboard(id);
      clipboard.on('success', function(e) {
        // console.log(e.text);
        layer.tips("已复制", a, {
          tips: [1, '#429842'],
          time: 3000
        });
      });
      clipboard.on('error', function(e) {
        console.log(e);
      });
    },
    //复制Web专用
    copyUrl(id) {
      id = "#url" + id; //要复制的元素Id
      var a = id + ">a";
      var clipboard = new Clipboard(id);
      clipboard.on('success', function(e) {
        layer.tips("已复制", a, {
          tips: [1, '#429842'],
          time: 3000
        });
      });
      clipboard.on('error', function(e) {
        console.log(e);
      });
    },
    //复制App专用
    copyOurl(id) {
      id = "#ourl" + id; //要复制的元素Id
      var a = id + ">a";
      var clipboard = new Clipboard(id);
      clipboard.on('success', function(e) {
        layer.tips("已复制", a, {
          tips: [1, '#429842'],
          time: 3000
        });
      });
      clipboard.on('error', function(e) {
        console.log(e);
      });
    },
    edit(index, id) {
      this.editItem = this.items[index];
      // console.log(this.editItem)
      this.layer = layer.open({
        type: 1,
        title: "编辑帖子",
        content: $("#editpost"),
        area: "600px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: true, //开启遮罩关闭
      });
    },
    //查看帖子内容
    lookIntro(intro) {
      layer.open({
        type: 1,
        title: "帖子内容",
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
    layer_close() {
      layer.close(this.layer);
    },
    layer_submit() {
      var _this = this;
      this.editValid = true;
      this.checkEditItem('edit_title');
      this.checkEditItem('edit_topic');
      this.checkEditItem('edit_content');
      this.checkEditItem('edit_likecount');
      if (this.editValid) {
        this.isHide = false; //加载中
        var data = JSON.parse(JSON.stringify(this.editItem));
        this.$http.post(this.ip + "/api/Post/Update", data, {
          headers: {
            "Authorization": this.token
          }
        }).then((res) => {
          if (res.body.Code === 200) {
            this.getList(this.currPage, this.currCount);
            this.layer_close();
            layer.msg('修改成功!', { icon: 1, time: 2000 });
          } else {
            this.isHide = true;
            layer.msg('服务器错误，请稍后再试!', { icon: 2, time: 2000 });
          }
        })
      }
    },
    add() {
      this.addItem.BoardId = this.CommItem[0].Value;
      this.getComm();
      this.layer = layer.open({
        type: 1,
        title: "新增帖子",
        content: $("#addpost"),
        area: "600px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭
        end: function() {
          $("#add_title").removeClass("error");
          $("#add_likecount").removeClass("error");
          $("#add_content").removeClass("error");
          $("#add_topic").removeClass("error");
        }
      });
      // $("#add_title").focus();
    },
    //设为热门文章
    setHot(id) {
      var _this = this;
      this.layer = layer.confirm("确定要此帖子推送至首页吗？", {
        btn: ["确定", "取消"]
      }, function() {
        _this.isHide = false; //加载中
        var data = {
          "SourceType": 4,
          "SourceId": id,
          "Status": 1,
        };
        _this.$http.post(_this.ip + "/api/HDoc/Add", data, {
          headers: {
            "Authorization": _this.token
          }
        }).then((res) => {
          if (res.body.Code === 200) {
            _this.getList(_this.currPage, _this.currCount, _this.searchKeyList, _this.searchKeyWord);
            layer.msg("设置成功！", { icon: 1, time: 2000 });
            _this.layer_close();
          } else {
            _this.isHide = true;
            layer.msg('服务器错误，请稍后再试!', { icon: 2, time: 3000 });
          }
        }).catch(err => {
          console.log(err);
          _this.isHide = true;
          layer.msg('服务器错误，请稍后再试!', { icon: 2, time: 2500 });
        });
      }, function() {
        _this.layer_close();
      });
    },
    //已为热门
    isHot() {
      layer.msg("此帖子已推送", { icon: 0, time: 2500 });
    },
    checkAddItem(id) {
      var el = document.getElementById(id);
      if (el.value === "") {
        el.classList.add("error");
        this.addValid = false;
      } else {
        el.classList.remove("error");
      }
    },
    checkEditItem(id) {
      var el = document.getElementById(id);
      if (el.value === "") {
        el.classList.add("error");
        this.editValid = false;
      } else {
        el.classList.remove("error");
      }
    },
    //添加帖子
    layer_submit_add() {
      var _this = this;
      this.addValid = true;
      this.checkAddItem('add_title');
      this.checkAddItem('add_topic');
      this.checkAddItem('add_content');
      this.checkAddItem('add_likecount');
      if (this.addValid) {
        this.isHide = false; //加载中
        this.addItem.UsrId = this.usrId;
        var data = JSON.parse(JSON.stringify(this.addItem));
        this.$http.post(this.ip + "/api/Post/Add", data, {
          headers: {
            "Authorization": this.token
          }
        }).then((res) => {
          if (res.body.Code === 200) {
            this.getList(this.currPage, this.currCount);
            this.clearData();
            this.layer_close();
            layer.msg('新增成功!', { icon: 1, time: 2000 });
          } else {
            this.isHide = true;
            layer.msg('服务器错误，请稍后再试!', { icon: 2, time: 3000 });
          }
        });
      }
    },
    formatData(data) {
      return JSON.parse(JSON.stringify(data));
    },
    clearData() {
      $("#add_title").val("");
      $("#add_content").val("");
      $("#add_likecount").val("");
      $("#add_topic").val("");
    },
    //计算分钟数
    computeSeconds() {
      var seconds = 0;
      var logindate = parseInt(this.loginDate); //登陆日期
      if (logindate !== "") {
        var nowdate = Date.now(); //当前日期
        logindate = new Date(logindate);
        nowdate = new Date(nowdate);
        seconds = Math.floor((nowdate - logindate) / (60 * 1000));
      }
      return seconds;
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
    // 给过长的字符串中间加上省略号
    subStr: function(str) {
      if (str != null) {
        var length = str.length;
        if (length > 13) {
          str = str.slice(0, 8) + ". . ." + str.slice(length - 5, length);
        }
      }
      return str;
    },
    subUrl: function(url) {
      if (url != null) {
        var length = url.length;
        if (length > 8) {
          url = url.slice(0, 5) + ". . ." + url.slice(length - 2, length);
        }
      }
      return url;
    },
    subTitle: function(title) {
      if (title != null) {
        var length = title.length;
        if (length > 6) {
          title = title.slice(0, 3) + ". . ." + title.slice(length - 3, length);
        }
      }
      return title;
    },
    subContent: function(content) {
      if (content != null) {
        var length = content.length;
        if (length > 15) {
          content = content.slice(0, 5) + ". . ." + content.slice(length - 5, length);
        }
      }
      return content;
    }
  }
});
//添加提示
function addTips(id) {
  id = "#id" + id;
  var a = id + ">a";
  layer.tips("点击复制", a, {
    tips: [1, '#429842'],
    time: 1500
  });
}
//详情
function lookDetail(id, type, tip) {
  id = "#" + type + id;
  var el = id + ">a";
  layer.tips(tip, el, {
    tips: [1, '#00B271'],
    time: 3000
  });
}

function urlTips(id) {
  id = "#url" + id;
  var a = id + ">a";
  layer.tips("点击复制", a, {
    tips: [1, '#00B271'],
    time: 1500
  });
}

function ourlTips(id) {
  id = "#ourl" + id;
  var a = id + ">a";
  layer.tips("点击复制", a, {
    tips: [1, '#00B271'],
    time: 1500
  });
}

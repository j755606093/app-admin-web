Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: '#app',
  data: {
    items: {},
    editItem: {}, //要编辑的items中的数据
    layer: null, //弹出框,
    addItem: {}, //增加图
    TotalCount: 0, //总数
    currCount: 15, //当前数据量
    displayCount: 15, //当前页要显示的数据量
    currPage: 1, //当前页码
    isType: false,
    isTop: false,
    noTypeTop: true,
    NewsType: [],
    isHide: false, //隐藏“加载”图标
    searchItem: {}, //搜索条件
    isViewType: false, //是否为文章类型
    searchKeyWord: null, //搜索关键字
    searchKeyList: null, //搜索关键类型
    enableMsg: [],
    disableMsg: [],
    firstLoad: true,
    isSearch: false, //用于将页码回调到1，防止在当前页码不是1时进行搜索导致获取不到数据
    token: "Bearer " + window.localStorage.token,
    usrId: window.localStorage.usrId, //用户Id  
    ip: "", //用于服务器
    // ip: "http://192.168.31.82", //用于测试
  },
  created: function() {
    if (!this.usrId) {
      parent.location.href = "login.html";
    } else {
      this.getList(1, 15, "", "");
      this.getNewsType();
    }
  },
  methods: {
    getList(index, size, key, value) {
      var _this = this;
      var data = { "Index": index, "Size": size };
      if (key == "Title") {
        data.Title = value;
      }
      if (key == "Author") {
        data.Author = value;
      }
      // if (key == "IsTop") {
      //   data.IsTop = value;
      // }
      if (key == "RealType") {
        data.RealType = value;
      }
      this.$http.post(this.ip + "/api/HNews/List", data, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
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
            layer.msg(res.body.Message, { icon: 2, time: 1500 });
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
                _this.getList(obj.curr, _this.currCount, _this.searchKeyList, _this.searchKeyWord);
              }
              _this.firstLoad = false;
            },
          })
        });
      } else {
        document.getElementById("page").innerHTML = "";
      }
    },
    //获取当前页面要显示的数据量
    getData(event) {
      this.currCount = event.target.value;
      this.firstLoad = true;
      this.getList(1, this.currCount, this.searchKeyList, this.searchKeyWord);
    },
    //点击复制
    clickCopy(id) {
      id = "#id" + id; //要复制的元素Id
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
    //鼠标移上时，控制“状态”按钮文本的变化
    over(id, status) {
      id = "id" + id;
      if (status == 0) {
        document.getElementById(id).text = "启 用";
      } else {
        document.getElementById(id).text = "禁 用";
      }
    },
    //鼠标移走时，控制“状态”按钮文本的变化
    out(id, status) {
      id = "id" + id;
      if (status == 1) {
        document.getElementById(id).text = "已启用";
      } else {
        document.getElementById(id).text = "已禁用";
      }
    },
    search() {
      this.isHide = false;
      this.firstLoad = true;
      this.getList(1, this.currCount, this.searchKeyList, this.searchKeyWord);
    },
    //搜索类型改变时
    changeList() {
      var list = this.searchKeyList;
      if (list === "RealType") {
        this.isType = true;
        // this.isTop = false;
        this.noTypeTop = false;
        this.searchKeyWord = this.NewsType[0].Value;
      } else {
        this.isType = false;
        // this.isTop = false;
        this.noTypeTop = true;
        this.searchKeyWord = "";
      }
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
        }
      }, function() {
        console.error()
      })
    },
    edit(id, status) {
      var _this = this;
      var tipMsg = "";
      var successMsg = "";
      //需要禁用
      if (status == 1) {
        status = 0;
        tipMsg = "确定要禁用吗?";
        successMsg = "已禁用";
      }
      //需要启用
      else {
        status = 1;
        tipMsg = "确定要启用吗?";
        successMsg = "已启用";
      }
      this.layer = layer.confirm(tipMsg, {
        btn: ["确定", "取消"]
      }, function() {
        _this.isHide = false; //加载中
        var data = {
          "Id": id,
          "Status": status
        };
        _this.$http.post(_this.ip + "/api/HNews/Update", data, {
          headers: {
            "Authorization": _this.token
          }
        }).then(function(res) {
          if (res.body.Code === 200) {
            _this.setPage();
            layer.msg(successMsg, { icon: 1, time: 2000 });
            _this.layer_close();
          } else {
            layer.msg(res.body.Message, { icon: 2, time: 3000 });
          }
          _this.isHide = true;
        }).catch(function(err) {
          console.log(err);
          _this.isHide = true;
          layer.msg('服务器错误，请稍后再试!', { icon: 2, time: 2500 });
        });
      }, function() {
        _this.layer_close();
      });
    },
    layer_close() {
      layer.close(this.layer);
    },
    //设为热门文章
    setHot(id) {
      var _this = this;
      this.layer = layer.confirm("确定要将此新闻推至首页吗？", {
        btn: ["确定", "取消"]
      }, function() {
        _this.isHide = false; //加载中
        var data = {
          "SourceType": 2,
          "SourceId": id,
          "Status": 1,
        };
        _this.$http.post(_this.ip + "/api/HDoc/Add", data, {
          headers: {
            "Authorization": _this.token
          }
        }).then(function(res) {
          if (res.body.Code === 200) {
            _this.setPage();
            layer.msg("设置成功", { icon: 1, time: 2000 });
            _this.layer_close();
          } else {
            _this.isHide = true;
            layer.msg(res.body.Message, { icon: 2, time: 3000 });
          }
        }).catch(function(err) {
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
      layer.msg("此新闻已推送", { icon: 0, time: 2500 });
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
    subStr: function(val) {
      if (!val) {
        return "";
      } else {
        var leng = val.length;
        if (leng > 20) {
          val = val.slice(0, 6) + "..." + val.slice(leng - 3, leng);
        }
        return val;
      }
    },
    subUrl: function(val) {
      if (!val) {
        return "";
      } else {
        var leng = val.length;
        val = val.slice(0, 6) + "..." + val.slice(leng - 3, leng);
        return val;
      }
    },
    subTitle: function(val) {
      if (!val) {
        return "";
      } else {
        var leng = val.length;
        if (leng > 20) {
          val = val.slice(0, 10) + "..." + val.slice(leng - 8, leng);
        }
        return val;
      }
    },
    subAvatar: function(val, n) {
      if (!val) {
        return "";
      } else {
        var arr = val.split(",");
        return arr[n];
      }
    },
    dealAvatar: function(val, n) {
      if (!val) {
        return "";
      } else {
        if (val.indexOf(",") === -1) {
          return val;
        } else {
          return val.slice(0, val.length - 1);
        }
      }
    },
  },
});
//添加提示
function addTips(id) {
  id = "#id" + id;
  var a = id + ">a";
  layer.tips("点击复制", a, {
    tips: [1, '#00B271'],
    time: 1500
  });
}
//查看标题详情
function lookTitle(id, type, tip) {
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

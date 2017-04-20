Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: '#app',
  data: {
    items: {},
    editItem: {}, //要编辑的items中的数据
    layer: null, //弹出框,
    addItem: {}, //增加图
    isIndent: false, //是否缩进
    Intro: "", //文章内容       
    currCount: 15, //当前数据量
    displayCount: 15, //当前页要显示的数据量 
    TotalCount: 0,
    currPage: 1, //当前页码
    isHide: false, //“加载中”
    firstLoad: true,
    searchKey: "",
    searchType: "Nick",
    token: "Bearer " + window.localStorage.token,
    usrId: window.localStorage.usrId, //用户Id   
    ip: "",
  },
  created: function() {
    //判断是本地测试还是线上生产环环境
    var isTest = window.location.href.indexOf("192.168") > -1 ? true : false;
    if (isTest) {
      this.ip = "http://192.168.31.82"; //测试环境
    }
    if (!this.usrId) {
      parent.location.href = "login.html";
    } else {
      this.getList(1, 15, "", "");
    }
  },
  methods: {
    getList(index, size, type, key) {
      var _this = this;
      var data = { "Index": index, "Size": size };
      if (type === "Nick") {
        data.Nick = key;
      }
      if (type === "DocId") {
        if (key === "") {
          data.DocId = -1;
        } else {
          data.DocId = key;
        }
      }
      if (type === "AliasId") {
        data.AliasId = key;
      }
      if (type === "Title") {
        data.Title = key;
      }
      data = JSON.stringify(data);
      this.$http.post(this.ip + "/api/HNews/ListComment", data, {
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
      }, function(error) {
        _this.isHide = true;
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
              if (!_this.firstLoad) {
                _this.isHide = false;
                //记录当前页码
                _this.currPage = obj.curr;
                //获取当前页或指定页的数据
                // console.log(obj.curr);
                _this.getList(obj.curr, _this.currCount, _this.searchType, _this.searchKey);
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
      this.getList(1, this.currCount, this.searchType, this.searchKey);
    },
    search() {
      this.isHide = false;
      this.firstLoad = true;
      this.getList(1, this.currCount, this.searchType, this.searchKey);
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
    lookIntro(intro) {
      layer.open({
        type: 1,
        title: "评论内容",
        content: $("#lookIntro"),
        area: "400px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭
      });
      //内容超过30个字符时，添加缩进
      if (intro.length > 30) {
        this.isIndent = true;
      } else {
        this.isIndent = false;
      }
      this.Intro = intro;
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
        data = JSON.stringify(data);
        _this.$http.post(_this.ip + "/api/HNews/UpdateComment", data, {
          headers: {
            "Authorization": _this.token
          }
        }).then(function(res) {
          if (res.body.Code === 200) {
            _this.getList(1, _this.currCount, _this.searchType, _this.searchKey);
            layer.msg(successMsg, { icon: 1, time: 2500 });
            _this.layer_close();
          } else {
            layer.msg(res.body.Message, { icon: 2, time: 3000 });
          }
          _this.isHide = true;
        }).catch(function(err) {
          console.log(err);
          _this.isHide = true;
          layer.msg('服务器错误，请稍后再试', { icon: 2, time: 2500 });
        });
      }, function() {
        _this.layer_close();
      });
    },
    layer_close() {
      layer.close(this.layer);
    },
  },
  filters: {
    //内容过长时，中间加入省略
    subContent: function(val) {
      if (!val) {
        return "";
      } else {
        var leng = val.length;
        if (leng > 10) {
          val = val.slice(0, 6) + "..." + val.slice(leng - 3, leng);
        }
        return val;
      }
    }
  },
  watch: {
    TotalCount: function(val) {
      this.setPage();
    },
    currCount: function(val) {
      this.setPage();
    },
  },
});

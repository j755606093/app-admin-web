Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: '#app',
  data: {
    items: {},
    CommItem: [], //社区版块
    editItem: {}, //要编辑的items中的数据
    layer: null, //弹出框,
    addItem: {}, //增加图
    TotalCount: 0, //总数
    currCount: 15, //当前数据量
    displayCount: 15, //当前页要显示的数据量   
    currPage: 1, //当前页码
    isHide: false, //“加载中”
    searchKey: "", //搜索关键字
    searchType: "", //搜索关键类型
    isSearch: false,
    Intro: "", //简介
    isIndent: false, //是否缩进
    firstLoad: true,
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
    }
  },
  methods: {
    getList(index, size, key, value) {
      var data = { "Index": index, "Size": size };
      if (key == "ClassName") {
        data.ClassName = value;
      }
      if (key == "WeChatName") {
        data.WeChatName = value;
      }
      if (key == "Intro") {
        data.Intro = value;
      }
      // console.log(data);
      this.$http.post(this.ip + "/api/WeChat/List", data, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.body.Code == 200) {
          this.items = res.body.Data.Content;
          this.TotalCount = res.body.Data.TotalCount;
          this.displayCount = this.items.length;
          this.isHide = true; //加载完毕
        } else {
          if (res.body.Code == 204) {
            this.items = [];
            this.displayCount = 0;
            this.TotalCount = 0;
            document.getElementById("page").innerHTML = "";
          } else {
            layer.msg(res.body.Message, { icon: 2, time: 1500 });
          }
          this.isHide = true;
        }
      }, function(error) {
        console.log(error);
        this.isHide = true;
        layer.msg("服务器错误，请稍后再试", { icon: 2, time: 1500 });
      });
      document.getElementById("isget").style.visibility = "visible";
    },
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
      this.currPage = 1; //防止获取不到数据
      this.getList(1, this.currCount, this.searchType, this.searchKey);
    },
    //鼠标移上时，控制“状态”按钮文本的变化
    over(id, status) {
      id = "id" + id;
      if (status == 1) {
        document.getElementById(id).text = "启 用";
      } else {
        document.getElementById(id).text = "禁 用";
      }
    },
    //鼠标移走时，控制“状态”按钮文本的变化
    out(id, status) {
      id = "id" + id;
      if (status == 0) {
        document.getElementById(id).text = "已启用";
      } else {
        document.getElementById(id).text = "已禁用";
      }
    },
    search() {
      this.isHide = false;
      this.isSearch = true;
      this.firstLoad = true;
      this.getList(1, this.currCount, this.searchType, this.searchKey);
    },
    changeList() {
      //防止其影响是否为搜索数据的条件判断
      this.searchKey = "";
      document.getElementById("searchKey").focus();
    },
    edit(id, status) {
      var _this = this;
      var tipMsg = "";
      var successMsg = "";
      //需要禁用
      if (status == 0) {
        status = 1;
        tipMsg = "确定要禁用吗?";
        successMsg = "已禁用";
      }
      //需要启用
      else {
        status = 0;
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
        _this.$http.post(_this.ip + "/api/WeChat/Update", data, {
          headers: {
            "Authorization": _this.token
          }
        }).then((res) => {
          if (res.body.Code === 200) {
            _this.setPage();
            layer.msg(successMsg, { icon: 1, time: 2000 });
            _this.layer_close();
          } else {
            layer.msg(res.body.Message, { icon: 2, time: 3000 });
          }
          _this.isHide = true;
        }).catch(err => {
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
    lookIntro(intro) {
      layer.open({
        type: 1,
        title: "公众号简介",
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
        if (leng > 30) {
          val = val.slice(0, 15) + "..." + val.slice(leng - 13, leng);
        }
        return val;
      }
    }
  }
});
//添加提示
function addTips(id, val) {
  id = "#id" + id;
  var a = id + ">a";
  layer.tips(val, a, {
    tips: [1, '#429842'],
    time: 4000
  });
}

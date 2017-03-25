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
    PostItem: [], //帖子详情
    token: "Bearer " + window.localStorage.token,
    usrId: window.localStorage.usrId, //用户Id   
    ip: "", //用于服务器
    // ip: "http://192.168.31.82", //用于测试
  },
  created: function() {
    if (this.usrId === "" || typeof this.usrId === "undefined") {
      parent.location.href = "login.html";
    } else {
      this.getList(1, 15);
    }
  },
  methods: {
    getList(index, size) {
      this.$http.post(this.ip + "/api/Comment/List", { "Index": index, "Size": size }, {
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
            this.TotalCount = 0;
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
    //查看帖子详情
    postDetail(id) {
      var _this = this;
      return new Promise((resolve, reject) => {
        this.$http.get(this.ip + "/api/Post/GetDetail/" + id, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": this.token
          }
        }).then((res) => {
          if (res.data.Code === 200) {
            _this.PostItem = res.data.Data[0];
            resolve(_this.PostItem);
          } else {
            if (res.data.Code === 204) {
              layer.msg(res.data.Message, { icon: 2, time: 3000 });
            } else {
              layer.msg("服务器错误，请稍后再试", { icon: 2, time: 3000 });
            }
          }
        }).catch((err) => {
          layer.msg("服务器错误，请稍后再试", { icon: 2, time: 3000 });
        });
      }).then(item => {
        if (item.length !== 0) {
          layer.open({
            type: 1,
            title: "帖子详情",
            content: $("#PostDetail"),
            area: "400px",
            skin: 'layui-layer-demo', //样式类名
            anim: 2,
            shadeClose: true, //开启遮罩关闭
          });
        }
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
        _this.$http.post(_this.ip + "/api/Comment/Update", data, {
          headers: {
            "Authorization": _this.token
          }
        }).then((res) => {
          if (res.body.Code === 200) {
            _this.getList(1, _this.currCount);
            layer.msg(successMsg, { icon: 1, time: 2000 });
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
    layer_close() {
      layer.close(this.layer);
    },
  },
  filters: {
    subContent: function(content) {
      if (content != null) {
        var length = content.length;
        if (length > 20) {
          content = content.slice(0, 10) + ". . ." + content.slice(length - 8, length);
        }
      }
      return content;
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

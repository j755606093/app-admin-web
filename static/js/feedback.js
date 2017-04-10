Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: '#app',
  data: {
    items: {},
    TotalCount: 0, //总数
    displayCount: 15, //当前页要显示的数据量   
    currCount: 15, //当前数据量
    currPage: 1, //当前页码  
    layer: null, //弹出框,
    Status: 2,
    firstLoad: true,
    isHide: false,
    feedbackId: "",
    token: "Bearer " + window.localStorage.token,
    usrId: window.localStorage.usrId, //用户Id     
    ip: "", //用于服务器
    // ip: "http://192.168.31.82", //用于测试      
  },
  created: function() {
    if (!this.usrId) {
      parent.location.href = "login.html";
    } else {
      this.getList(1, 15, 2);
    }
  },
  methods: {
    getList(index, size, status) {
      var _this = this;
      var data = { "Index": index, "Size": size };
      if (status !== "") {
        data.Status = status;
      }
      data = JSON.stringify(data);
      this.$http.post(this.ip + "/api/Feedback/ReportList", data, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.body.Code == 200) {
          _this.items = res.body.Data.Content;
          _this.displayCount = _this.items.length;
          _this.TotalCount = res.body.Data.TotalCount;
        } else {
          if (res.body.Code == 204) {
            _this.items = [];
            _this.displayCount = 0;
            _this.TotalCount = 0;
            document.getElementById("page").innerHTML = "";
          } else {
            layer.msg(res.body.Message, { icon: 2, time: 2500 });
          }
        }
        _this.isHide = true;
      }).catch(function(error) {
        _this.isHide = true;
        console.log(error);
        layer.msg("服务器错误，请稍后再试", { icon: 2, time: 1500 });
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
                //记录当前页码
                _this.currPage = obj.curr;
                //获取当前页或指定页的数据
                // console.log(obj.curr);
                _this.getList(obj.curr, _this.currCount, _this.Status);
              }
              _this.firstLoad = false;
            },
          })
        });
      } else {
        document.getElementById("page").innerHTML = "";
      }
    },
    getFeedback(status) {
      this.Status = status;
      this.firstLoad = true;
      this.getList(1, this.currCount, this.Status);
    },
    //获取当前页面要显示的数据量
    getData(event) {
      this.currCount = event.target.value;
      this.currPage = 1; //防止获取不到数据
      this.firstLoad = true;
      this.getList(1, this.currCount, this.Status);
    },
    selectFeedback(id) {
      this.feedbackId = id;
      this.layer = layer.open({
        type: 1,
        title: false,
        content: $("#handlerFeedBack"),
        area: "320px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭        
      });
    },
    handlerFeedBack() {
      var _this = this;
      var msg = "举报无效";
      var status = -1;
      var pass = document.getElementById("pass");
      if (pass.checked) {
        status = 1;
        msg = "举报有效";
      }
      var confirm = layer.confirm("确定要选择" + msg, {
        btn: ['确定', '取消'] //按钮
      }, function() {
        var data = { Id: _this.feedbackId, Status: status };
        data = JSON.stringify(data);
        _this.$http.post(_this.ip + "/api/Feedback/Deal", data, {
          headers: {
            "Authorization": _this.token
          }
        }).then(function(res) {
          if (res.body.Code === 200) {
            _this.setPage();
            layer.msg("操作成功", { icon: 1, time: 2500 });
            layer.close(confirm);
            layer.close(_this.layer);
          }
          _this.isHide = true;
        })
      }, function() {
        layer.close(confirm);
      });

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
})

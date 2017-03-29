Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: '#app',
  data: {
    usrId: window.localStorage.usrId, //用户Id
    items: {},
    editItem: {}, //要编辑的items中的数据
    layer: null, //弹出框,
    addItem: { PId: "", IsParent: "" }, //增加模块
    addValid: true,
    editValid: true,
    parentItem: [], //当前用户所拥有的父级模块
    currCount: 15, //当前数据量
    displayCount: 15, //当前页要显示的数据量
    TotalCount: 0,
    currPage: 1, //当前页码
    isHide: false, //“加载中”
    firstLoad: false,
    token: "Bearer " + window.localStorage.token,
    ip: "", //用于服务器
    // ip: "http://192.168.31.82", //用于测试
  },
  created: function() {
    if (this.usrId === "" || typeof this.usrId === "undefined") {
      parent.location.href = "login.html";
    } else {
      this.getList(1, 15);
      this.getParentModule();
    }
  },
  methods: {
    getList(index, size) {
      var _this = this;
      this.$http.post(this.ip + "/api/Module/List", { "Index": index, "Size": size }, {
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
        console.log(error);
        _this.isHide = true;
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
                _this.getList(obj.curr, _this.currCount);
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
      this.getList(1, this.currCount);
    },
    //获取当前用户所拥有的父级模块
    getParentModule() {
      var data = {
        "UsrId": this.usrId,
        "NodeType": 1
      };
      this.$http.post(this.ip + "/api/Module/GetModuleEnum", data, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.data.Code === 200) {
          this.parentItem = res.data.Data;
        } else {
          layer.msg(res.body.Message, { icon: 0, time: 2500 });
          this.parentItem = [];
        }
      }).catch(function(error) {
        _this.isHide = true;
        console.log(error);
        layer.msg("服务器错误，请稍后再试", { icon: 0, time: 2500 });
      });
    },
    edit(index, id) {
      // console.log(index,id)
      // 编辑内容
      this.editItem = this.items[index];
      this.editItem.index = index; //记录位置
      this.oldData = Object.assign({}, this.items[index]); //修改之前的数据
      this.layer = layer.open({
        type: 1,
        title: "编辑模块",
        content: $("#editmodule"),
        area: "600px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: true, //开启遮罩关闭
      });
      this.getParentModule();
    },
    checkEditItem(id) {
      var el = document.getElementById(id);
      if (el.value.length < 1) {
        el.classList.add("error");
        this.editValid = false;
      } else {
        el.classList.remove("error");
      }
    },
    layer_close() {
      layer.close(this.layer);
    },
    layer_submit() {
      var _this = this;
      this.editValid = true;
      this.checkEditItem('edit_name');
      if (this.editItem.IsParent == 0) {
        this.checkEditItem('edit_value');
      }
      if (this.editValid) {
        this.isHide = false; //加载中
        //父级模块时
        if (this.editItem.IsParent == 1) {
          this.editItem.PId = 0;
          this.editItem.Value = "#";
        }
        var data = JSON.parse(JSON.stringify(this.editItem));
        this.$http.post(this.ip + "/api/Module/Update", data, {
          headers: {
            "Authorization": this.token
          }
        }).then(function(res) {
          if (res.body.Code === 200) {
            _this.firstLoad = true;
            _this.getList(1, _this.currCount);
            _this.layer_close();
            layer.msg('修改成功', { icon: 1, time: 2000 });
          } else {
            _this.isHide = true;
            layer.msg(res.body.Message, { icon: 2, time: 3000 });
          }
        }).catch(function(err) {
          _this.isHide = true;
          console.log(err)
          layer.msg("服务器错误，请稍后再试", { icon: 2, time: 3000 });
        })
      }
    },
    add() {
      this.addItem.PId = this.parentItem[0].Value;
      this.layer = layer.open({
        type: 1,
        title: "新增模块",
        content: $("#addmodule"),
        area: "600px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭
        end: function() {
          $("#add_name").removeClass("error");
          $("#add_value").removeClass("error");
        }
      });
      this.getParentModule();
    },
    checkAddItem(id) {
      var el = document.getElementById(id);
      if (el.value.length < 1) {
        el.classList.add("error");
        this.addValid = false;
      } else {
        el.classList.remove("error");
      }
    },
    layer_submit_add() {
      var _this = this;
      this.addValid = true;
      this.checkAddItem('add_name');
      if (this.addItem.IsParent == 0) {
        this.checkAddItem('add_value');
      }
      if (this.addValid) {
        this.isHide = false; //加载中
        if (this.addItem.IsParent == 1) {
          this.addItem.PId = 0;
          this.addItem.Value = "#";
        }
        var data = JSON.parse(JSON.stringify(this.addItem));
        this.$http.post(this.ip + "/api/Module/Add", data, {
          headers: {
            "Authorization": this.token
          }
        }).then(function(res) {
          if (res.body.Code === 200) {
            _this.getList(1, _this.currCount);
            _this.clearData();
            _this.layer_close();
            layer.msg('新增成功!', { icon: 1, time: 2000 });
          } else {
            _this.isHide = true;
            layer.msg(res.body.Message, { icon: 2, time: 3000 });
          }
        }).catch(function(err) {
          _this.isHide = true;
          console.log(err)
          layer.msg("服务器错误，请稍后再试", { icon: 2, time: 3000 });
        })
      }
    },
    clearData() {
      $("#add_name").val("");
      $("#add_remark").val("");
      $("#add_value").val("");
      $("#add_pid").val("");
      $("#add_icon").val("");
      this.addItem.Value = "";
      this.addItem.Sort = "";
    },
    formatData(data) {
      return JSON.parse(JSON.stringify(data));
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
});

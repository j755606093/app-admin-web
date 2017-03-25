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
    isHide: false, //隐藏“加载”图标
    addNameValid: false,
    editNameValid: false,
    addValid: true,
    editValid: true,
    token: "Bearer " + window.localStorage.token,
    usrId: window.localStorage.usrId,
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
      this.$http.post(this.ip + "/api/Community/List", { "Index": index, "Size": size }, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(response) {
        if (response.body.Code == 200) {
          this.items = response.body.Data.Content;
          this.displayCount = this.items.length;
          this.TotalCount = response.body.Data.TotalCount;
        } else if (response.body.Code == 204) {
          this.items = [];
          this.displayCount = 0;
          this.TotalCount = 0;
          document.getElementById("page").innerHTML = "";
        } else {
          layer.msg("服务器错误，请稍后再试", { icon: 2, time: 3000 });
        }
        this.isHide = true;
      }, function(error) {
        this.isHide = true;
        console.log(error);
        layer.msg("服务器错误，请稍后再试", { icon: 2, time: 3000 });
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
    edit(index, id) {
      // 编辑内容
      this.editItem = this.items[index];
      this.editItem.index = index; //记录位置
      this.layer = layer.open({
        type: 1,
        title: "编辑分类",
        content: $("#editnav"),
        area: "500px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: true, //开启遮罩关闭
      });
      $("#editfile").val("");
    },
    layer_close() {
      layer.close(this.layer);
    },
    add() {
      this.addNameValid = false;
      this.layer = layer.open({
        type: 1,
        title: "新增分类",
        content: $("#addnav"),
        area: "500px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: true, //开启遮罩关闭
      });
    },
    checkEditName() {
      var name = this.editItem.Name;
      if (name === "" || name.length > 20) {
        this.editNameValid = true;
        this.editValid = false;
      } else {
        this.editNameValid = false;
      }
    },
    checkAddName() {
      var name = document.getElementById("add_name");
      if (name.value === "" || name.value.length > 20) {
        this.addNameValid = true;
        this.addValid = false;
        name.focus();
      } else {
        this.addNameValid = false;
      }
    },
    layer_submit_add() {
      var addfile = document.getElementById("addfile");
      var isUpload = true;
      this.addValid = true;
      this.checkAddName();
      if (addfile.value == "") {
        layer.msg("请上传图片", { icon: 0, time: 3000 });
        isUpload = false;
      }
      if (isUpload && this.addValid) {
        this.isHide = false; //加载中
        $("#addform").ajaxSubmit({
          url: this.ip + "/api/Community/Add",
          type: "post",
          headers: {
            "Authorization": this.token
          },
          success: function(res) {
            if (res.Code === 200) {
              _this.getList(_this.currPage, _this.currCount);
              _this.layer_close();
              layer.msg("添加成功!", { icon: 1, time: 1500 });
              $("#add_name").val("");
              $("#add_url").val("");
              $("#add_sort").val("");
              $("#addfile").val("");
            } else {
              _this.isHide = true;
              layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 1500 });
            }
          },
          error: function(err) {
            _this.isHide = true;
            layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 2000 });
          }
        });
      }
    },
    formatData(data) {
      return JSON.parse(JSON.stringify(data));
    },
    layer_submit_edit() {
      var _this = this;
      this.editValid = true;
      this.checkEditName();
      if (this.editValid) {
        this.isHide = false; //加载中
        $("#editform").ajaxSubmit({
          url: this.ip + "/api/Community/Update",
          type: "post",
          headers: {
            "Authorization": this.token
          },
          success: function(res) {
            if (res.Code === 200) {
              _this.getList(_this.currPage, _this.currCount);
              _this.layer_close();
              layer.msg("修改成功!", { icon: 1, time: 1500 });
            } else {
              _this.isHide = true;
              layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 1500 });
            }
          },
          error: function(err) {
            // console.log(err)
            _this.isHide = true;
            layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 2000 });
          }
        });
      }
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
    subPUrl: function(url) {
      if (url != null) {
        var length = url.length;
        if (length > 60) {
          url = url.slice(0, 30) + ". . ." + url.slice(length - 30, length);
        }
      }
      return url;
    },
  }
});

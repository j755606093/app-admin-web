Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: '#app',
  data: {
    items: {},
    editItem: {}, //要编辑的items中的数据
    layer: null, //弹出框,
    addItem: {}, //增加图
    displayCount: 0,
    TotalCount: 0, //总数
    currCount: 15, //当前数据量
    currPage: 1, //当前页码
    addValid: true,
    editValid: true,
    overSize: false, //图片超过限制大小
    isHide: false, //隐藏“加载”图标
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
      this.$http.post(this.ip + "/api/HCarousel/List", { "Index": index, "Size": size }, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.body.Code == 200) {
          this.items = res.body.Data.Content;
          this.currCount = this.items.length;
          this.TotalCount = res.body.Data.TotalCount;
          this.displayCount = this.TotalCount;
          this.isHide = true; //加载完毕
        } else {
          if (res.body.Code == 204) {
            this.items = [];
            this.displayCount = 0;
            this.TotalCount = 0;
            document.getElementById("page").innerHTML = "";
          } else {
            layer.msg("服务器错误，请稍后再试", { icon: 2, time: 2500 });
          }
          this.isHide = true;
        }
      }, function(error) {
        this.isHide = true;
        console.log(error);
        layer.msg("服务器错误，请稍后再试", { icon: 2, time: 2500 });
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
        this.getList(1, 15);
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
      this.oldData = Object.assign({}, this.items[index]); //修改之前的数据
      this.layer = layer.open({
        type: 1,
        title: "编辑轮播图",
        content: $("#editimg"),
        area: "600px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: true, //开启遮罩关闭
      });
      $("#editfile").val("");
    },
    layer_close() {
      layer.close(this.layer);
    },
    //判断图片大小
    pictrue_size(id) {
      var el = document.getElementById(id);
      var filesize = el.files[0].size;
      filesize = filesize / 1000000
      var sizes = this.getFloat(filesize, 1);
      var valid = true;
      // console.log(sizes)
      if (sizes > 1) {
        // layer.msg("图片大小不能超过1M!", { icon: 2, time: 2500 });
        this.overSize = true;
        valid = false;
      } else {
        this.overSize = false;
      }
      return valid;
    },
    //保留n位小数
    getFloat(number, n) {
      n = n ? parseInt(n) : 0;
      if (n <= 0) return Math.round(number);
      number = Math.round(number * Math.pow(10, n)) / Math.pow(10, n);
      return number;
    },
    add() {
      var _this = this;
      $("#add_name").focus();
      this.layer = layer.open({
        type: 1,
        title: "增加轮播图",
        content: $("#addimg"),
        area: "600px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭
        end: function() {
          _this.clearData();
        }
      });
    },
    checkAddItem(id, n) {
      var el = document.getElementById(id);
      if (el.value.length < n) {
        el.classList.add("error");
        this.addValid = false;
      } else {
        el.classList.remove("error");
      }
    },
    checkEditItem(id, n) {
      var el = document.getElementById(id);
      if (el.value.length < n) {
        el.classList.add("error");
        this.editValid = false;
      } else {
        el.classList.remove("error");
      }
    },
    checkAddFile() {
      var file = document.getElementById("addfile");
      if (file.value === "") {
        layer.msg("请上传图片!", { icon: 0, time: 2500 });
        this.addValid = false;
      } else {
        this.addValid = this.pictrue_size("addfile");
      }
    },
    checkEditFile() {
      var file = document.getElementById("editfile");
      if (file.value != "") {
        this.editValid = this.pictrue_size("editfile");
      }
    },
    //添加轮播图
    layer_submit_add() {
      var _this = this;
      this.addValid = true;
      this.checkAddItem('add_name', 5);
      this.checkAddItem('add_url', 1);
      this.checkAddItem('add_sort', 1);
      this.checkAddFile();
      if (this.addValid) {
        this.isHide = false; //加载中
        $("#addform").ajaxSubmit({
          url: this.ip + "/api/HCarousel/Add",
          type: "post",
          headers: {
            "Authorization": this.token
          },
          success: function(res) {
            if (res.Code === 200) {
              _this.getList(_this.currPage, 10);
              _this.layer_close();
              layer.msg("添加成功", { icon: 1, time: 2500 });
              _this.clearData();
            } else {
              layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 2500 });
            }
          },
          error: function(err) {
            _this.isHide = true;
            layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 2500 });
          }
        });
      }
    },
    clearData() {
      $("#add_name").val("");
      $("#add_url").val("");
      $("#add_sort").val("");
      $("#addfile").val("");
      $("#add_name").removeClass("error");
      $("#add_url").removeClass("error");
      $("#add_sort").removeClass("error");
    },
    formatData(data) {
      return JSON.parse(JSON.stringify(data));
    },
    layer_submit_edit() {
      var _this = this;
      this.editValid = true;
      this.checkEditItem('edit_title', 5);
      this.checkEditItem('edit_url', 1);
      this.checkEditItem('edit_sort', 1);
      this.checkEditFile();
      if (this.editValid) {
        this.isHide = false; //加载中
        $("#editform").ajaxSubmit({
          url: this.ip + "/api/HCarousel/Update",
          type: "post",
          headers: {
            "Authorization": this.token
          },
          contentType: "application/json; charset=utf-8",
          success: function(res) {
            if (res.Code === 200) {
              _this.getList(_this.currPage, 10);
              _this.layer_close();
              layer.msg("修改成功", { icon: 1, time: 2500 });
            } else {
              layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 2500 });
            }
          },
          error: function(err) {
            _this.isHide = true;
            layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 2500 });
          }
        });
      }
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
        if (length > 50) {
          str = str.slice(0, 20) + ". . ." + str.slice(length - 20, length);
        }
      }
      return str;
    }
  }
});

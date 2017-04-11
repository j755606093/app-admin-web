Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: '#app',
  data: {
    items: {},
    editItem: {}, //要编辑的items中的数据
    layer: null, //弹出框,
    addItem: {}, //增加图
    currCount: 15, //当前数据量
    displayCount: 15, //当前页要显示的数据量 
    currPage: 1, //当前页码
    isHide: false, //“加载中”
    isIndent: false, //是否缩进
    Intro: "", //文章内容     
    addValid: true,
    TotalCount: 0,
    ViewType: 3,
    totalSize: 1, //文件大小限制
    overSize: false, //文件超过限制大小
    fileType: "图片", //文件类型
    uploadType: "", //上传的文件类型
    count: 200, //还能输入的内容字数
    UserId: "",
    showItem: false,
    token: "Bearer " + window.localStorage.token,
    usrId: window.localStorage.usrId, //用户Id 
    UsrItem: [],
    firstLoad: true,
    ip: "", //用于服务器
    // ip: "http://192.168.31.82", //用于测试
  },
  created: function() {
    if (!this.usrId) {
      parent.location.href = "login.html";
    } else {
      this.getList(1, 15);
    }
  },
  methods: {
    getList(index, size) {
      var data = {
        "Index": index,
        "Size": size
      };
      this.$http.post(this.ip + "/api/Moment/List", data, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.body.Code == 200) {
          this.items = res.body.Data.Content;
          this.displayCount = this.items.length;
          this.TotalCount = res.body.Data.TotalCount;
          this.isHide = true; //加载完毕
          // console.log(this.items)
        } else {
          if (res.body.Code == 204) {
            this.items = [];
            this.displayCount = 0;
            this.TotalCount = 0;
            document.getElementById("page").innerHTML = "";
          } else {
            layer.msg(res.body.Message, { icon: 2, time: 2500 });
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
      this.currPage = 1; //防止获取不到数据
      this.firstLoad = true;
      this.getList(1, this.currCount);
    },
    //获取用户Id
    getUsrid() {
      var _this = this;
      var data = {
        Index: 1,
        Size: 10,
        Nick: this.nick
      };
      data = JSON.stringify(data);
      this.$http.post(this.ip + "/api/Member/VirtualManEnum", data, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.data.Code === 200) {
          _this.UsrItem = res.data.Data.Content;
        } else if (res.data.Code === 204) {
          _this.UsrItem = [];
        } else {
          layer.msg(res.body.Message, { icon: 2, time: 3000 });
        }
      }).catch(function(err) {
        _this.UsrItem = [];
        layer.msg('服务器错误，请稍后再试!', { icon: 2, time: 3000 });
        console.log(err)
      });
      // console.log(this.UsrItem)
      this.showItem = true;
    },
    //选择昵称
    selectNick(name, val) {
      this.nick = name;
      this.UserId = val;
      this.showItem = false;
    },
    lookIntro(intro) {
      layer.open({
        type: 1,
        title: "动态内容",
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
        _this.$http.post(_this.ip + "/api/Moment/Modify", data, {
          headers: {
            "Authorization": _this.token
          }
        }).then(function(res) {
          if (res.body.Code === 200) {
            _this.setPage();
            layer.msg(successMsg, { icon: 1, time: 2000 });
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
    add() {
      // 增加图
      this.layer = layer.open({
        type: 1,
        title: "添加动态",
        content: $("#addmom"),
        area: "500px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭
      });
      document.getElementById("nick").focus();
      document.getElementById("addfile").value = "";
      document.getElementById("add_content").value = "";
      document.getElementById("add_content").classList.remove("error");
      this.overSize = false;
    },
    checkAddItem(id) {
      var el = document.getElementById(id);
      var length = el.value.length; //说说内容的字数长度
      this.count = 200 - length; //还能输入的字数
      if (this.count < 0) {
        this.count = 0;
      }
      if (length < 5 || length > 200) {
        el.classList.add("error");
        this.addValid = false;
      } else {
        el.classList.remove("error");
      }
    },
    //判断文件大小
    fileSize(id) {
      // var tipMsg = "";
      var filesize = id.files[0].size;
      filesize = filesize / 1000000
      var sizes = this.getFloat(filesize, 1);
      var valid = true;
      if (this.fileType == "图片") {
        this.totalSize = 1;
        // tipMsg = "图片大小不能超过10M";
      } else if (this.fileType == "视频") {
        // tipMsg = "视频大小不能超过10M";
        this.totalSize = 10;
      } else {
        // tipMsg = "文件大小不能超过10M";
        this.totalSize = 10;
      }
      if (sizes > this.totalSize) {
        // layer.msg(tipMsg, { icon: 2, time: 3000 });
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
    checkedAddFile() {
      var file = document.getElementById("addfile");
      if (file.value === "") {
        layer.msg("请上传文件!", { icon: 0, time: 3000 });
        this.addValid = false;
      } else {
        this.addValid = this.fileSize(file);
      }
    },
    layer_submit_add() {
      this.addValid = true;
      var _this = this;
      this.checkAddItem('add_content');
      //类型是文字时不需要上传文件
      if (this.ViewType != 1) {
        this.checkedAddFile();
      }
      if (this.addValid) {
        this.isHide = false; //加载中
        $("#addform").ajaxSubmit({
          url: this.ip + "/api/Moment/Add",
          type: "post",
          headers: {
            "Authorization": this.token
          },
          success: function(res) {
            if (res.Code === 200) {
              _this.firstLoad = true;
              _this.getList(1, _this.currCount);
              _this.nick = "";
              document.getElementById("addfile").value = "";
              document.getElementById("add_content").value = "";
              _this.layer_close();
              layer.msg("添加成功", { icon: 1, time: 2500 });
            } else {
              layer.msg(res.Message, { icon: 2, time: 2500 });
            }
            _this.isHide = true;
          },
          error: function(err) {
            console.log(err);
            _this.isHide = true;
            layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 2500 });
          },
        });
      }
    },
    layer_close() {
      layer.close(this.layer);
    },
  },
  filters: {
    subUrl: function(val) {
      if (!val) {
        return "";
      } else {
        var leng = val.length;
        if (leng > 10) {
          val = val.slice(0, 6) + "..." + val.slice(leng - 3, leng);
        }
        return val;
      }
    },
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
  },
  watch: {
    ViewType: function(val) {
      if (val == 3) {
        this.uploadType = "image/*";
        this.fileType = "图片";
        this.totalSize = 1;
      } else if (val == 5) {
        this.uploadType = "video/*";
        this.fileType = "视频";
        this.totalSize = 10;
      } else {
        this.uploadType = "";
        this.fileType = "文件";
        this.totalSize = 10;
      }
      this.overSize = false;
      document.getElementById("addfile").value = "";
    },
    TotalCount: function(val) {
      this.setPage();
    },
    currCount: function(val) {
      this.setPage();
    },
  }
});

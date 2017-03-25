Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: '#app',
  data: {
    items: {},
    CommItem: [], //社区版块
    editItem: {}, //要编辑的items中的数据
    layer: null, //弹出框,
    addItem: { CommId: "", Title: "", Status: "" }, //增加图
    TotalCount: 0, //总数
    currCount: 15, //当前数据量
    displayCount: 15, //当前页要显示的数据量
    currPage: 1, //当前页码
    isHide: false, //“加载中”
    addTitleValid: false,
    editTitleValid: false,
    addValid: true,
    editValid: true,
    isIndent: false, //是否缩进
    Intro: "", //文章内容    
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
      this.getComm();
    }
  },
  methods: {
    getList(index, size) {
      this.$http.post(this.ip + "/api/Board/List", { "Index": index, "Size": size }, {
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
        } else if (response.body.Code == 401) {
          layer.msg("会话已过期，请重新登录", { icon: 0, time: 3500 });
          setTimeout(() => {
            location.href = "login.html";
          }, 3500);
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
    //获取社区Id
    getComm() {
      this.$http.get(this.ip + "/api/Community/GetCommEnum", {
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
    lookIntro(intro) {
      layer.open({
        type: 1,
        title: "社区介绍",
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
    edit(index, id) {
      this.editItem = this.items[index];
      this.editItem.index = index; //记录位置
      this.oldData = Object.assign({}, this.items[index]); //修改之前的数据
      this.layer = layer.open({
        type: 1,
        title: "编辑社区",
        content: $("#editboard"),
        area: "500px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: true, //开启遮罩关闭
      });
      document.getElementById("editfile").value = "";
      this.getComm();
    },
    layer_close() {
      layer.close(this.layer);
    },
    checkEditTitle() {
      if (this.editItem.Title === "") {
        this.editValid = false;
        this.editTitleValid = true;
      } else {
        this.editTitleValid = false;
      }
    },
    layer_submit() {
      var _this = this;
      this.editValid = true;
      this.checkEditTitle();
      if (this.editValid) {
        this.isHide = false; //加载中
        var options = {
          url: this.ip + "/api/Board/Update",
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
            layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 1500 });
          }
        };
        $("#editform").ajaxSubmit(options);
      }
    },
    add() {
      document.getElementById("addCommId").value = this.CommItem[0].Value;
      this.addTitleValid = false;
      this.layer = layer.open({
        type: 1,
        title: "新增社区",
        content: $("#addboard"),
        area: "500px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: true, //开启遮罩关闭
      });
      this.getComm();
    },
    checkAddTitle() {
      var addTitle = document.getElementById("addTitle");
      if (addTitle.value === "") {
        this.addValid = false;
        this.addTitleValid = true;
        addTitle.focus();
      } else {
        this.addTitleValid = false;
      }
    },
    layer_submit_add() {
      var _this = this;
      this.addValid = true;
      this.checkAddTitle();
      var addfile = document.getElementById("addfile");
      var isUpload = true;
      if (addfile.value == "") {
        layer.msg("请上传图标", { icon: 0, time: 3000 });
        isUpload = false;
      }
      if (isUpload && this.addValid) {
        var options = {
          url: this.ip + "/api/Board/Add",
          type: "post",
          headers: {
            "Authorization": this.token
          },
          success: function(res) {
            if (res.Code === 200) {
              _this.getList(_this.currPage, _this.currCount);
              _this.layer_close();
              layer.msg("添加成功!", { icon: 1, time: 2000 });
              $("#addTitle").val("");
              $("#add_remark").val("");
              $("#addfile").val("");
            } else {
              _this.isHide = true;
              layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 2000 });
            }
          },
          error: function(err) {
            console.log(err)
            _this.isHide = true;
            layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 2000 });
          }
        };
        this.isHide = false; //加载中
        $("#addform").ajaxSubmit(options);
      }
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
  filters: {
    // 给过长的字符串中间加上省略号
    subRemark: function(str) {
      if (str != null) {
        var length = str.length;
        if (length > 13) {
          str = str.slice(0, 8) + ". . ." + str.slice(length - 5, length);
        }
      }
      return str;
    },
    subPUrl: function(url) {
      if (url != null) {
        var length = url.length;
        if (length > 40) {
          url = url.slice(0, 20) + ". . ." + url.slice(length - 20, length);
        }
      }
      return url;
    },
  }
});

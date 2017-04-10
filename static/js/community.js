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
    firstLoad: true,
    ip: "", //用于服务器
    // ip: "http://192.168.31.82", //用于测试
  },
  created: function() {
    if (!this.usrId) {
      parent.location.href = "login.html";
    } else {
      this.getList(1, 15);
      this.getComm();
    }
  },
  methods: {
    getList(index, size) {
      var _this = this;
      this.$http.post(this.ip + "/api/Board/List", { "Index": index, "Size": size }, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.body.Code == 200) {
          _this.items = res.body.Data.Content;
          _this.displayCount = _this.items.length;
          _this.TotalCount = res.body.Data.TotalCount;
        } else if (res.body.Code == 204) {
          _this.items = [];
          _this.displayCount = 0;
          _this.TotalCount = 0;
          document.getElementById("page").innerHTML = "";
        } else {
          layer.msg(res.body.Message, { icon: 2, time: 3000 });
        }
        _this.isHide = true;
      }).catch(function(error) {
        _this.isHide = true;
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
    //获取社区Id
    getComm() {
      var _this = this;
      this.$http.get(this.ip + "/api/Community/GetCommEnum", {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.data.Code === 200) {
          _this.CommItem = res.data.Data;
        } else {
          layer.msg(res.body.Message, { icon: 2, time: 3000 });
        }
      }).catch(function(error) {
        _this.isHide = true;
        console.log(error);
        layer.msg("服务器错误，请稍后再试", { icon: 2, time: 3000 });
      });
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
              _this.setPage();
              _this.layer_close();
              layer.msg("修改成功", { icon: 1, time: 1500 });
            } else {
              layer.msg(res.Message, { icon: 2, time: 1500 });
            }
            _this.isHide = true;
          },
          error: function(err) {
            _this.isHide = true;
            console.log(err)
            layer.msg("服务器错误，请稍后再试", { icon: 2, time: 1500 });
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
              _this.firstLoad = true;
              _this.getList(1, _this.currCount);
              _this.layer_close();
              layer.msg("添加成功", { icon: 1, time: 2000 });
              document.getElementById("addTitle").value = "";
              document.getElementById("add_remark").value = "";
              document.getElementById("addfile").value = "";
            } else {
              _this.isHide = true;
              layer.msg(res.Message, { icon: 2, time: 2000 });
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
    subRemark: function(val) {
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
    subPUrl: function(val) {
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
  }
});

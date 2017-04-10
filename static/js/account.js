Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: '#app',
  data: {
    items: {},
    editItem: {}, //要编辑的items中的数据
    layer: null, //弹出框,
    addItem: { GroupId: "", Nick: "", Mail: "", Mobile: "", ConfirmPwd: "", Pwd: "", Enabled_Refund_Verify: 0, Enabled_Refund: 0, Enabled_Order_Handle: 0, Password: "", Remark: "", Status: 1 }, //增加图
    GroupItem: [], //角色列表
    TotalCount: 0, //总数
    currCount: 15, //当前数据量
    displayCount: 15, //当前页要显示的数据量
    currPage: 1, //当前页码
    isHide: false, //“加载中”
    token: "Bearer " + window.localStorage.token,
    usrId: window.localStorage.usrId, //用户Id
    CompanyItem: [], //公司列表
    addValid: true,
    addGroupIdValid: false,
    addNickValid: false,
    addMailValid: false,
    addMobileValid: false,
    addPwdValid: false,
    addConfirmPwdValid: false,
    editValid: true,
    editGroupIdValid: false,
    editNickValid: false,
    editMailValid: false,
    editMobileValid: false,
    firstLoad: false,
    ip: "", //用于服务器
    // ip: "http://192.168.31.82", //用于测试
  },
  created: function() {
    if (!this.usrId) {
      parent.location.href = "login.html";
    } else {
      this.getList(1, 10);
      this.getAdminGroup();
    }
  },
  methods: {
    getList(index, size) {
      var _this = this;
      this.$http.post(this.ip + "/api/Account/List", { "AccountId": this.usrId, "Index": index, "Size": size }, {
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
          layer.msg(res.body.Message, { icon: 0, time: 3000 });
        }
        _this.isHide = true;
      }).catch(function(error) {
        _this.isHide = true;
        console.log(error);
        layer.msg("服务器错误，请稍后再试", { icon: 0, time: 2500 });
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
    //获取管理角色
    getAdminGroup() {
      this.$http.get(this.ip + "/api/Group/GetGroupEnum/" + this.usrId, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.body.Code === 200) {
          this.GroupItem = res.body.Data;
        } else {
          layer.msg(res.body.Message, { icon: 0, time: 3000 });
        }
      }).catch(function(err) {
        console.log(err)
        layer.msg('服务器错误，请稍后再试', { icon: 0, time: 3000 });
      })
    },
    //验证昵称
    checkNick(obj) {
      var nick = "";
      if (obj === "add") {
        nick = this.addItem.Nick;
        if (nick === "") {
          this.addValid = false;
          this.addNickValid = true;
        } else {
          this.addNickValid = false;
        }
      } else {
        nick = this.editItem.Nick;
        if (nick === "") {
          this.editValid = false;
          this.editNickValid = true;
        } else {
          this.editNickValid = false;
        }
      }
    },
    //验证邮箱(可以为空，不为空时必须符合邮箱格式)
    checkMail(obj) {
      var mail = "";
      var mailRule = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
      if (obj === "add") {
        mail = this.addItem.Mail;
        if (!mailRule.test(mail) && mail !== "") {
          this.addValid = false;
          this.addMailValid = true;
        } else {
          this.addMailValid = false;
        }
      } else {
        mail = this.editItem.Mail;
        if (!mailRule.test(mail) && mail !== null && mail !== "") {
          this.editValid = false;
          this.editMailValid = true;
        } else {
          this.editMailValid = false;
        }
      }
    },
    //验证手机
    checkMobile(obj) {
      var mobile = "";
      var mobileRule = /(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/;
      if (obj === "add") {
        mobile = this.addItem.Mobile;
        if (!mobileRule.test(mobile)) {
          this.addValid = false;
          this.addMobileValid = true;
        } else {
          this.addMobileValid = false;
        }
      } else {
        mobile = this.editItem.Mobile;
        if (!mobileRule.test(mobile)) {
          this.editValid = false;
          this.editMobileValid = true;
        } else {
          this.editMobileValid = false;
        }
      }
    },
    //验证密码
    checkPwd() {
      var pwd = "";
      pwd = this.addItem.Pwd;
      if (pwd.length < 6 || pwd.length > 12) {
        this.addValid = false;
        this.addPwdValid = true;
      } else {
        this.addPwdValid = false;
      }
    },
    checkConfirmPwd() {
      if (this.addItem.Pwd !== this.addItem.ConfirmPwd) {
        this.addValid = false;
        this.addConfirmPwdValid = true;
      } else {
        this.addConfirmPwdValid = false;
      }
    },
    edit(index) {
      // 编辑内容
      this.editItem = this.items[index];
      this.layer = layer.open({
        type: 1,
        title: "编辑管理员",
        content: $("#editaccount"),
        area: "600px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: true, //开启遮罩关闭
      });
      // this.getComm();
    },
    layer_close() {
      layer.close(this.layer);
    },
    layer_submit() {
      var _this = this;
      this.editValid = true;
      this.checkNick('edit');
      this.checkMail('edit');
      this.checkMobile('edit');
      if (this.editValid) {
        this.isHide = false; //加载中
        var data = JSON.parse(JSON.stringify(this.editItem));
        this.$http.post(this.ip + "/api/Account/Update", data, {
          headers: {
            "Authorization": this.token
          }
        }).then(function(res) {
          if (res.body.Code === 200) {
            _this.setPage();
            _this.layer_close();
            layer.msg('修改成功', { icon: 1, time: 2000 });
          } else if (res.body.Message !== "") {
            layer.msg(res.body.Message, { icon: 0, time: 3000 });
          } else {
            layer.msg('服务器错误，请稍后再试', { icon: 0, time: 3000 });
          }
          _this.isHide = true;
        }).catch(function(err) {
          _this.isHide = true;
          console.log(err)
          layer.msg('服务器错误，请稍后再试', { icon: 0, time: 3000 });
        })
      }
    },
    add() {
      var _this = this;
      if (this.GroupItem[1].Value === "") {
        this.addItem.GroupId = this.GroupItem[0].Value;
      } else {
        this.addItem.GroupId = this.GroupItem[1].Value;
      }
      this.getAdminGroup();
      this.layer = layer.open({
        type: 1,
        title: "新增管理员",
        content: $("#addaccount"),
        area: "600px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭
        end: function() {
          _this.addNickValid = false;
          _this.addMobileValid = false;
          _this.addPwdValid = false;
          _this.addMailValid = false;
          _this.addConfirmPwdValid = false;
        }
      });
    },
    layer_submit_add() {
      var _this = this;
      this.addValid = true;
      this.checkNick('add');
      this.checkMail('add');
      this.checkMobile('add');
      this.checkPwd();
      this.checkConfirmPwd();
      if (this.addValid) {
        this.isHide = false; //加载中
        var pwd = this.addItem.Pwd;
        this.addItem.Password = this.encodePwd(pwd);
        var data = JSON.parse(JSON.stringify(this.addItem));
        this.$http.post(this.ip + "/api/Account/Add", data, {
          headers: {
            "Authorization": this.token
          }
        }).then(function(res) {
          if (res.body.Code === 200) {
            _this.firstLoad = true;
            _this.getList(1, 10);
            _this.layer_close();
            layer.msg('新增成功', { icon: 1, time: 2000 });
            _this.clearAddItem();
          } else if (res.body.Message !== "") {
            layer.msg(res.body.Message, { icon: 0, time: 3000 });
          } else {
            layer.msg('服务器错误，请稍后再试', { icon: 0, time: 3000 });
          }
          _this.isHide = true;
        }).catch(function(err) {
          console.log(err)
          _this.isHide = true;
          layer.msg('服务器错误，请稍后再试', { icon: 0, time: 3000 });
        })
      }
    },
    //清空表单数据
    clearAddItem() {
      this.addItem.Nick = "";
      this.addItem.Mail = "";
      this.addItem.Mobile = "";
      this.addItem.Pwd = "";
      this.addItem.Password = "";
      this.addItem.Remark = "";
      this.addItem.Status = 1;
    },
    //对密码进行编码
    encodePwd(pwd) {
      setMaxDigits(130);
      var rsaKey = new rsaKeyPair(blogMain.publicKeyType, "", blogMain.publicKey);
      var encryoldpwd = encryptedString(rsaKey, encodeURIComponent(pwd));
      return encryoldpwd;
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
  }
});

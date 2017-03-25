var VM = new Vue({
  el: '#app',
  data: {
    username: "请登录", //获取用户名
    usrId: window.localStorage.usrId, //用户Id
    token: "Bearer " + window.localStorage.token,
    isRemember: window.localStorage.isRemember, //是否记住密码,1:是 0:否
    loginDate: window.localStorage.loginDate, //登录日期
    items: [], //存放管理模块
    updateItem: { UsrId: "", OldPwd: "", NewPwd: "", confirmPwd: "", OldPassword: "", NewPassword: "" },
    isValid: true, //验证修改密码表单
    homeModule: false, //首页管理模块
    childHomeModule: [], //首页管理模块的子项
    communityModule: false, //社区模块
    childCommunityModule: [], //社区管理模块的子项
    authorityModule: false, //权限模块
    childAuthorityModule: [], //权限管理模块的子项
    wechatModule: false, //微信模块
    childWechatModule: [], //微信管理模块的子项
    sideModule: false, //身边圈模块
    childSideModule: [], //身边圈管理模块的子项
    commentModule: false, //评论模块
    childCommentModule: [], //评论管理模块的子项
    childMemberModule: [], //用户管理模块的子项
    carpoolModule: false, //评论模块
    isHide: false, //“加载中”
    isShowOld: false, //是否显示验证失败的信息
    isShowNew: false, //是否显示验证失败的信息
    isShowConfirm: false, //是否显示验证失败的信息
    isLogin: false,
    inforOld: "", //原密码验证失败提示信息
    inforNew: "", //新密码验证失败提示信息
    inforConfirm: "", //确认新密码验证失败提示信息
    Duration: 60, //剩余操作时长
    Type: "",
    Cycle: 0, //剩余操作时长的变化周期
    Interval: "",
    seconds: 0,
    days: 0,
    orderInterval: null,
    newItem: [], //新的待处理订单
    firstTip: "", //第一次提示，防止出现多个提示窗口
    stayOrder: window.localStorage.stayHandleOrder,
    ip: "", //用于服务器
    // ip: "http://192.168.31.82", //用于测试
  },
  created: function() {
    if (this.usrId === "" || typeof this.usrId === "undefined") {
      this.isHide = true;
      layer.alert('会话已过期，请重新登录', {
        closeBtn: 0,
        icon: 0,
      }, function() {
        location.href = "login.html";
      });
    } else {
      this.computeTime();
      //获取当前用户拥有的管理模块
      this.username = window.localStorage.username;
      this.getAdminModule(this.username);
      this.isLogin = true;
      var i = parseInt(this.isRemember);
      if (i === 0) {
        //未选择“两周内免登录”
        this.Type = "分钟";
        this.Duration = 60 * 12 - this.seconds; //120分钟
        this.Cycle = 60 * 1000; //1分钟
      } else {
        this.Type = "天";
        this.Duration = 7 - this.days; //7天
        this.Cycle = 3600 * 1000 * 24; //1天
      }
      this.loginDiff();
      document.getElementById("isget").style.visibility = "visible";
    }
  },
  methods: {
    //获取管理模块
    getAdminModule(username) {
      var _this = this;
      axios.get(_this.ip + "/api/Module/GetModules/" + username, {
        headers: {
          "Authorization": _this.token
        }
      }).then(function(res) {
        if (res.data.Code == 200) {
          _this.items = res.data.Data;
          var leng = _this.items.length;
          for (var i = 0; i < leng; i++) {
            var name = _this.items[i].Name;
            var modules = _this.items[i].SubModules;
            if (name == "首页") {
              _this.childHomeModule = modules;
            }
            if (name == "社区") {
              _this.childCommunityModule = modules;
            }
            if (name == "微信") {
              _this.childWechatModule = modules;
            }
            if (name == "身边圈") {
              _this.childSideModule = modules;
            }
            if (name == "权限") {
              _this.childAuthorityModule = modules;
            }
            if (name == "评论") {
              _this.childCommentModule = modules;
            }
            if (name == "用户") {
              _this.childMemberModule = modules;
            }
          }
          _this.isHide = true;
        } else if (res.data.Code == 401) {
          layer.msg("会话已过期，请重新登录", { icon: 0, time: 3500 });
          _this.isHide = true;
          _this.isLogin = false;
          setTimeout(function() {
            location.href = "login.html";
          }, 3500);
        } else {
          _this.isHide = true;
          layer.msg("服务器错误，请稍后再试", { icon: 2, time: 2500 });
        }
      }).catch(function(error) {
        _this.isHide = true;
        layer.msg("服务器错误，请稍后再试", { icon: 2, time: 2500 });
        console.log(error);
      });
    },
    //修改密码
    updatePassword() {
      var _this = this;
      _this.layer = layer.open({
        type: 1,
        title: "修改密码",
        content: $("#updatePassword"),
        area: "400px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭
        end: function() {
          _this.clearData();
        }
      });
      document.getElementById("update_original").focus();
    },
    //验证旧密码
    checkOriginalPwd() {
      var original = this.updateItem.OldPassword.trim();
      if (original === "") {
        this.isValid = false;
        this.isShowOld = true;
        this.inforOld = "请输入旧密码";
        // document.getElementById("update_original").focus();
      } else {
        this.isShowOld = false;
      }
    },
    //验证新密码
    checkNewPwd() {
      var newpwd = this.updateItem.NewPassword.trim();
      if (newpwd === "") {
        this.isValid = false;
        this.isShowNew = true;
        this.inforNew = "请输入新密码";
        document.getElementById("update_new").focus();
      } else if (newpwd.length < 6 || newpwd.length > 16) {
        this.isValid = false;
        this.isShowNew = true;
        this.inforNew = "密码长度为6-16";
        document.getElementById("update_new").focus();
      } else {
        this.isShowNew = false;
      }
    },
    //验证确认新密码
    checkConfirmPwd() {
      var confirm = this.updateItem.confirmPwd.trim();
      var newpwd = this.updateItem.NewPassword.trim();
      if (confirm === "") {
        this.isValid = false;
        this.isShowConfirm = true;
        this.inforConfirm = "请输入确认新密码";
        document.getElementById("update_confirm").focus();
      } else if (confirm !== newpwd) {
        this.isValid = false;
        this.isShowConfirm = true;
        this.inforConfirm = "确认新密码与新密码不一致";
        document.getElementById("update_confirm").focus();
      } else {
        this.isShowConfirm = false;
      }
    },
    //保存密码并提交
    save() {
      var _this = this;
      this.isValid = true;
      this.checkOriginalPwd();
      this.checkNewPwd();
      this.checkConfirmPwd();
      if (this.isValid) {
        this.isHide = false;
        this.updateItem.UsrId = this.usrId;
        var oldpwd = this.updateItem.OldPassword;
        this.updateItem.OldPwd = this.encodePwd(oldpwd);
        var newpwd = this.updateItem.NewPassword;
        this.updateItem.NewPwd = this.encodePwd(newpwd);
        var data = JSON.parse(JSON.stringify(this.updateItem));
        axios.post(this.ip + "/api/Default/ResetPwd", data, {
          headers: {
            "Authorization": this.token
          }
        }).then(function(res) {
          if (res.data.Code === 200) {
            layer.close(this.layer);
            this.isHide = true;
            this.clearData();
            layer.msg('修改成功!', { icon: 1, time: 2000 });
          } else {
            if (res.data.Code === 400) {
              // layer.msg('原密码错误', { icon: 2, time: 2000 });
              this.isShowOld = true;
              this.inforOld = res.data.Message;
              this.updateItem.OldPassword = "";
              document.getElementById("update_original").focus();
            } else {
              layer.msg('服务器错误，请稍后再试!', { icon: 2, time: 3000 });
            }
            this.isHide = true;
          }
        }).catch(function(error) {
          _this.isHide = true;
          layer.msg("服务器错误，请稍后再试", { icon: 2, time: 2500 });
          console.log(error);
        });
      }
    },
    //对密码进行编码
    encodePwd(pwd) {
      setMaxDigits(130);
      var rsaKey = new rsaKeyPair(blogMain.publicKeyType, "", blogMain.publicKey);
      var encryoldpwd = encryptedString(rsaKey, encodeURIComponent(pwd));
      return encryoldpwd;
    },
    //计算时间差
    computeTime() {
      var logindate = parseInt(this.loginDate); //登陆日期
      if (logindate !== "" && logindate !== "undefined" && !isNaN(logindate)) {
        var nowdate = Date.now(); //当前日期
        logindate = new Date(logindate);
        nowdate = new Date(nowdate);
        this.seconds = Math.floor((nowdate - logindate) / (60 * 1000)); //分钟数
        this.days = Math.floor((nowdate - logindate) / (24 * 3600 * 1000)); //天数
      }
    },
    //登录剩余时长
    loginDiff() {
      var _this = this;
      _this.Interval = setInterval(function() {
        if (_this.Duration > 0) {
          _this.Duration--;
        }
      }, _this.Cycle);
    },
    clearData() {
      this.isShowOld = false;
      this.isShowNew = false;
      this.isShowConfirm = false;
      this.updateItem.OldPassword = "";
      this.updateItem.NewPassword = "";
      this.updateItem.confirmPwd = "";
    },
    close() {
      layer.close(this.layer);
    },
    formatData(data) {
      return JSON.parse(JSON.stringify(data));
    },
    //切换账户
    changeAccount() {
      window.localStorage.token = "";
      window.localStorage.username = "";
      window.localStorage.usrId = "";
      window.localStorage.isRemember = "";
      window.localStorage.loginDate = "";
      window.localStorage.stayHandleOrder = ""; //待处理订单
      window.localStorage.handleOrderTip = 0; //待处理订单提示,0:未开始处理订单,1:开始处理      
      location.href = "login.html";
      clearInterval(this.Interval);
    }
  },
  watch: {
    //剩余操作时长
    Duration: function(val) {
      if (val <= 0) {
        window.localStorage.token = "";
        window.localStorage.username = "";
        window.localStorage.usrId = "";
        window.localStorage.isRemember = "";
        window.localStorage.loginDate = "";
        window.localStorage.stayHandleOrder = ""; //待处理订单
        window.localStorage.handleOrderTip = 0; //待处理订单提示,0:未开始处理订单,1:开始处理        
        clearInterval(this.Interval);
        layer.alert('会话已过期，请重新登录', {
          closeBtn: 0,
          icon: 0,
        }, function() {
          location.href = "login.html";
        });
      }
    },
  },
  filters: {
    addHash: function(val) {
      return val + "?hash=" + Date.now();
    },
  },
});

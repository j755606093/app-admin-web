Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: '#admin',
  data: {
    username: "", //账号
    password: "", //密码
    checkcode: "", //验证码
    codeUrl: "", //获取验证码的链接
    encodepwd: "", //编码后的密码
    usernameValid: false, //验证账号
    passwordValid: false, //验证密码
    checkcodeValid: false, //验证验证码
    VerifyKey: "",
    loading: "加载中",
    valid: true, //验证通过
    isLoading: true,
    isHide: true,
    ip: "",
  },
  created: function() {
    //判断是本地测试还是线上生产环环境
    var isTest = window.location.href.indexOf("192.168") > -1 ? true : false;
    if (isTest) {
      this.ip = "http://192.168.31.82"; //测试环境
    }
    this.getCheckCode();
  },
  methods: {
    //获取验证码
    getCheckCode() {
      this.isLoading = true;
      var _this = this;
      this.$http.get(this.ip + "/api/Default/GetVarifyCode").then(function(res) {
        if (res.body.Code === 200) {
          this.codeUrl = res.body.Data.Content;
          this.VerifyKey = res.body.Data.VerifyKey;
          this.isLoading = false;
        } else {
          this.loading = "请刷新";
          this.isLoading = false;
          layer.msg('服务器错误，请稍后再试', { icon: 0, time: 3000 });
        }
      }).catch(function(err) {
        _this.loading = "加载失败";
        this.isLoading = false;
        layer.msg('服务器错误，请稍后再试', { icon: 0, time: 3000 });
      });
    },
    //验证账号
    checkUsername() {
      if (this.username === "") {
        this.usernameValid = true;
        this.valid = false;
      } else {
        this.usernameValid = false;
      }
    },
    //验证密码
    checkPassword() {
      if (this.password === "") {
        this.passwordValid = true;
        this.valid = false;
      } else {
        this.passwordValid = false;
      }
    },
    //验证验证码
    checkCodes() {
      if (this.checkcode === "") {
        this.valid = false;
        this.checkcodeValid = true;
        // document.querySelector("#checkcode").focus();
      } else {
        this.checkcodeValid = false;
      }
    },
    //对密码进行编码
    encodePwd() {
      setMaxDigits(130);
      var rsaKey = new rsaKeyPair(blogMain.publicKeyType, "", blogMain.publicKey);
      this.encodepwd = encryptedString(rsaKey, encodeURIComponent(this.password));
    },
    //登录
    login() {
      this.isHide = false;
      this.valid = true;
      this.checkUsername();
      this.checkPassword();
      this.checkCodes();
      if (this.valid) {
        this.encodePwd();
        var online = document.getElementById("online"); //两周内免登录
        var data = {
          "UsrName": this.username,
          "Password": this.encodepwd,
          "VerifyCode": this.checkcode,
          "VerifyKey": this.VerifyKey
        }
        this.$http.post(this.ip + "/api/Default/Login", data).then(function(res) {
          if (res.data.Code === 200) {
            //两周内免登录
            if (online.checked) {
              window.localStorage.isRemember = 1;
            } else {
              window.localStorage.isRemember = 0;
            }
            window.localStorage.token = res.data.Data.Access_Token;
            window.localStorage.usrId = res.data.Data.UserId;
            window.localStorage.username = res.data.Data.UserName;
            window.localStorage.loginDate = Date.now();
            window.localStorage.stayHandleOrder = ""; //待处理订单
            window.localStorage.handleOrderTip = 0; //待处理订单提示,0:未开始处理订单,1:开始处理
            location.href = "index.html" + "?hash=" + Date.now();
          } else if (res.data.Code === 400) {
            this.getCheckCode();
            this.checkcode = "";
            layer.msg(res.data.Message, { icon: 2, time: 3000 });
          } else {
            this.getCheckCode();
            this.checkcode = "";
            layer.msg('服务器错误，请稍后再试', { icon: 2, time: 3000 });
          }
        }).catch(function(err) {
          this.getCheckCode();
          this.checkcode = "";
          layer.msg('服务器错误，请稍后再试', { icon: 2, time: 3000 });
        });
      }
      this.isHide = true;
    },
    //取消
    reset() {
      this.username = "";
      this.password = "";
      this.checkcode = "";
      this.getCheckCode();
    },
  },
});

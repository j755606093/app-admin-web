Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: '#app',
  data: {
    items: {},
    editItem: {}, //要编辑的items中的数据
    layer: null, //弹出框,
    addItem: { GroupId: "", Nick: "", Mail: "", Mobile: "", Pwd: "", Password: "", IsMerChant: "", CompanyId: "", Remark: "", Status: 1 },
    GroupItem: [], //角色列表
    TotalCount: 0, //总数
    currCount: 10, //当前数据量
    displayCount: 10, //当前页要显示的数据量
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
    addMerChantValid: false,
    addCompanyIdValid: false,
    editValid: true,
    editGroupIdValid: false,
    editNickValid: false,
    editMailValid: false,
    editMobileValid: false,
    editMerChantValid: false,
    editCompanyIdValid: false,
    ip: "", //用于服务器
    // ip: "http://192.168.31.81", //用于测试
  },
  created: function() {
    if (this.usrId === "" || typeof this.usrId === "undefined") {
      parent.location.href = "login.html";
    } else {
      this.getList(1, 10);
      this.getAdminGroup();
      this.getCompany();
    }
  },
  methods: {
    getList(index, size) {
      this.$http.post(this.ip + "/api/Account/List", { "AccountId": this.usrId, "Index": index, "Size": size }, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(response) {
        if (response.body.Code == 200) {
          this.items = response.body.Data.Content;
          this.displayCount = response.body.Data.Content.length;
          this.TotalCount = response.body.Data.TotalCount;
        } else if (response.body.Code == 204) {
          this.items = [];
          this.displayCount = 0;
          this.TotalCount = 0;
          document.getElementById("page").innerHTML = "";
        } else {
          layer.msg("服务器错误，请稍后再试", { icon: 0, time: 3000 });
        }
        this.isHide = true;
      }, function(error) {
        this.isHide = true;
        console.log(error);
        layer.msg("服务器错误，请稍后再试", { icon: 0, time: 1500 });
      })
      document.getElementById("isget").style.visibility = "visible";
    },
    //获取当前页面要显示的数据量
    getData(event) {
      this.currCount = event.target.value;
      this.currPage = 1; //防止获取不到数据
      this.getList(1, this.currCount);
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
    //获取管理角色
    getAdminGroup() {
      this.$http.get(this.ip + "/api/Group/GetGroupEnum/" + this.usrId, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.body.Code === 200) {
          this.GroupItem = res.body.Data;
        }
      }, function() {
        console.error()
      })
    },
    //获取公司列表
    getCompany() {
      this.$http.get(this.ip + "/api/Transport/GetCompanyEnum", {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.data.Code === 200) {
          this.CompanyItem = res.data.Data;
        }
      }, function() {
        console.error()
      });
    },
    //验证昵称
    checkNick(obj) {
      var nick = "";
      if (obj === "add") {
        nick = this.addItem.Nick.trim();
        if (nick === "") {
          this.addValid = false;
          this.addNickValid = true;
        } else {
          this.addNickValid = false;
        }
      } else {
        nick = this.editItem.Nick.trim();
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
        mail = this.addItem.Mail.trim();
        if (!mailRule.test(mail) && mail !== "") {
          this.addValid = false;
          this.addMailValid = true;
        } else {
          this.addMailValid = false;
        }
      } else {
        mail = this.editItem.Mail;
        if (!mailRule.test(mail) && mail !== "" && mail !== null) {
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
        mobile = this.addItem.Mobile.trim();
        if (!mobileRule.test(mobile)) {
          this.addValid = false;
          this.addMobileValid = true;
        } else {
          this.addMobileValid = false;
        }
      } else {
        mobile = this.editItem.Mobile.trim();
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
      pwd = this.addItem.Pwd.trim();
      if (pwd.length < 6 || pwd.length > 12) {
        this.addValid = false;
        this.addPwdValid = true;
      } else {
        this.addPwdValid = false;
      }
    },
    //验证商家
    checkMerChant(obj) {
      var merchant = "";
      if (obj === "add") {
        merchant = this.addItem.IsMerChant;
        if (merchant === "") {
          this.addValid = false;
          this.addMerChantValid = true;
        } else {
          this.addMerChantValid = false;
        }
      } else {
        merchant = this.editItem.IsMerChant;
        if (merchant === "") {
          this.editValid = false;
          this.editMerChantValid = true;
        } else {
          this.editMerChantValid = false;
        }
      }
    },
    //验证运输公司
    checkCompanyId(obj) {
      var companyid = "";
      if (obj === "add") {
        companyid = this.addItem.CompanyId;
        if (companyid === "" && this.addItem.IsMerChant == 1) {
          this.addValid = false;
          this.addCompanyIdValid = true;
        } else {
          this.addCompanyIdValid = false;
        }
      } else {
        companyid = this.editItem.CompanyId;
        if (companyid === "" && this.editItem.IsMerChant == 1) {
          this.editValid = false;
          this.editCompanyIdValid = true;
        } else {
          this.editCompanyIdValid = false;
        }
      }
    },
    edit(index, id) {
      // 编辑内容
      this.editItem = this.items[index];
      this.editItem.index = index; //记录位置
      this.layer = layer.open({
        type: 1,
        title: "编辑用户",
        content: $("#editaccount"),
        area: "600px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: true, //开启遮罩关闭
      });
      // this.getComm();
    },
    //商家账号不可编辑
    noEdit() {
      layer.msg('抱歉，商家账号不可编辑', { icon: 0, time: 3000 });
    },
    layer_close() {
      layer.close(this.layer);
    },
    layer_submit() {
      this.editValid = true;
      this.checkNick('edit');
      this.checkMail('edit');
      this.checkMobile('edit');
      this.checkMerChant('edit');
      this.checkCompanyId('edit');
      if (this.editValid) {
        this.isHide = false; //加载中
        if (this.editItem.IsMerChant == 0) {
          this.editItem.CompanyId = 0;
        }
        var data = JSON.parse(JSON.stringify(this.editItem));
        this.$http.post(this.ip + "/api/Account/Update", data, {
          headers: {
            "Authorization": this.token
          }
        }).then((res) => {
          if (res.body.Code === 200) {
            this.getList(this.currPage, 10);
            this.layer_close();
            layer.msg('修改成功!', { icon: 1, time: 2000 });
          } else if (res.body.Code === 400) {
            this.isHide = true;
            layer.msg(res.body.Message, { icon: 0, time: 3000 });
          } else {
            this.isHide = true;
            layer.msg('服务器错误，请稍后再试!', { icon: 0, time: 3000 });
          }
        })
      }
    },
    //改变角色
    changeGroup() {
      //角色为商家，“运输公司”显示
      if (this.addItem.GroupId == 169527) {
        this.addItem.IsMerChant = 1;
      } else {
        this.addItem.IsMerChant = 0;
      }
    },
    add() {
      var _this = this;
      // if (this.GroupItem[1].Value === "") {
      //   this.addItem.GroupId = this.GroupItem[0].Value;
      // } else {
      //   this.addItem.GroupId = this.GroupItem[1].Value;
      // }
      this.addItem.GroupId = 169527; //默认商家
      this.addItem.IsMerChant = 1;
      this.addItem.CompanyId = this.CompanyItem[0].Value;
      this.layer = layer.open({
        type: 1,
        title: "新增用户",
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
        }
      });
      this.getAdminGroup();
      this.getCompany();
    },
    layer_submit_add() {
      this.addValid = true;
      this.checkNick('add');
      this.checkMail('add');
      this.checkMobile('add');
      this.checkPwd('add');
      this.checkMerChant('add');
      this.checkCompanyId('add');
      if (this.addValid) {
        this.isHide = false; //加载中
        var pwd = this.addItem.Pwd;
        this.addItem.Password = this.encodePwd(pwd);
        if (this.addItem.IsMerChant == 0) {
          this.addItem.CompanyId = 0;
        }
        var data = JSON.parse(JSON.stringify(this.addItem));
        this.$http.post(this.ip + "/api/Account/Add", data, {
          headers: {
            "Authorization": this.token
          }
        }).then((res) => {
          if (res.body.Code === 200) {
            this.getList(this.currPage, 10);
            this.layer_close();
            layer.msg('新增成功!', { icon: 1, time: 2000 });
            this.clearAddItem();
          } else if (res.body.Code === 400) {
            this.isHide = true;
            layer.msg(res.body.Message, { icon: 0, time: 3000 });
          } else {
            this.isHide = true;
            layer.msg('服务器错误，请稍后再试!', { icon: 0, time: 3000 });
          }
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
      this.addItem.IsMerChant = "";
      this.addItem.CompanyId = "";
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

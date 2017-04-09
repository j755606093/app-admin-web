Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: "#app",
  data: {
    items: {},
    layer: null,
    currCount: 10, //当前数据量
    displayCount: 10, //当前页要显示的数据量
    TotalCount: 0,
    currPage: 1, //当前页码
    isHide: false, //“加载中”  
    searchType: "",
    searchKey: "",
    addValid: false,
    firstLoad: true,
    addItem: { Nick: "", Sex: 1, Mail: "", Mobile: "", Address: "", Status: 1 },
    token: "Bearer " + window.localStorage.token,
    usrId: window.localStorage.usrId, //用户Id   
    ip: "", //用于服务器
    // ip: "http://192.168.31.82", //用于测试
  },
  created: function() {
    if (!this.usrId) {
      parent.location.href = "login.html";
    } else {
      this.getList(1, 10, "", "");
    }
  },
  methods: {
    getList(index, size, type, key) {
      var data = { "Index": index, "Size": size };
      if (type == "Nick") {
        data.Nick = key;
      }
      if (type == "Mobile") {
        data.Mobile = key;
      }
      if (type == "Mail") {
        data.Mail = key;
      }
      if (type == "UsrId") {
        data.UsrId = key;
      }
      data = JSON.stringify(data);
      this.$http.post(this.ip + "/api/Member/List", data, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.body.Code == 200) {
          this.items = res.body.Data.Content;
          this.displayCount = this.items.length;
          this.TotalCount = res.body.Data.TotalCount;
        } else if (res.body.Code == 204) {
          this.items = [];
          this.displayCount = 0;
          this.TotalCount = 0;
          document.getElementById("page").innerHTML = "";
        } else {
          layer.msg(res.body.Message, { icon: 2, time: 3000 });
        }
        this.isHide = true;
      }, function(error) {
        this.isHide = true;
        console.log(error);
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
                _this.currPage = obj.curr;
                _this.getList(obj.curr, _this.currCount, _this.searchType, _this.searchKey);
              }
              _this.firstLoad = false;
            },
          })
        });
      } else {
        this.getList(1, _this.currCount, _this.searchType, _this.searchKey);
        document.getElementById("page").innerHTML = "";
      }
    },
    //获取当前页面要显示的数据量
    getData(event) {
      this.currCount = event.target.value;
      this.firstLoad = true;
      this.getList(1, this.currCount, this.searchType, this.searchKey);
    },
    search() {
      this.isHide = false;
      this.firstLoad = true;
      this.getList(1, this.currCount, this.searchType, this.searchKey);
    },
    add() {
      var _this = this;
      this.layer = layer.open({
        type: 1,
        title: "新增用户",
        content: $("#addmember"),
        area: "600px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭
        end: function() {

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
    checkMail() {
      var mail = "";
      var mailRule = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
      mail = this.addItem.Mail;
      if (!mailRule.test(mail)) {
        this.addValid = false;
        document.getElementById("mail").classList.add("error");
      } else {
        document.getElementById("mail").classList.remove("error");
      }
    },
    //验证手机
    checkMobile() {
      var mobile = "";
      var mobileRule = /(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/;
      mobile = this.addItem.Mobile;
      if (!mobileRule.test(mobile)) {
        this.addValid = false;
        document.getElementById("mobile").classList.add("error");
      } else {
        document.getElementById("mobile").classList.remove("error");
      }
    },
    checkAddFile() {
      var file = document.getElementById("addfile");
      if (file.value === "") {
        layer.msg("请上传图片", { icon: 0, time: 2500 });
        this.addValid = false;
      } else {
        this.addValid = this.pictrue_size("addfile");
      }
    },
    layer_submit_add() {
      this.addValid = true;
      this.checkAddItem('nick', 1);
      this.checkAddItem('address', 1);
      this.checkMobile();
      this.checkMail();
      this.checkAddFile();
      if (this.addValid) {
        this.isHide = false; //加载中
        var _this = this;
        $("#addform").ajaxSubmit({
          url: this.ip + "/api/Member/Add",
          type: "post",
          headers: {
            "Authorization": this.token
          },
          success: function(res) {
            if (res.Code === 200) {
              _this.firstLoad = true;
              _this.getList(1, _this.currCount, _this.searchType, _this.searchKey);
              _this.layer_close();
              _this.clearData();
              layer.msg("添加成功", { icon: 1, time: 2500 });
            } else {
              layer.msg(res.body.Message, { icon: 2, time: 2500 });
            }
            _this.isHide = true;
          },
          error: function(err) {
            console.log(err)
            _this.isHide = true;
            layer.msg("服务器错误，请稍后再试", { icon: 2, time: 2500 });
          }
        });
      }
    },
    //鼠标移上时，控制“状态”按钮文本的变化
    over(id, status) {
      id = "id" + id;
      if (status == 0) {
        document.getElementById(id).text = "启用";
      } else {
        document.getElementById(id).text = "禁用";
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
    changeType() {
      this.searchKey = "";
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
        data = JSON.stringify(data);
        _this.$http.post(_this.ip + "/api/Member/Modify", data, {
          headers: {
            "Authorization": _this.token
          }
        }).then((res) => {
          if (res.body.Code === 200) {
            _this.firstLoad = true;
            _this.getList(1, _this.currCount, _this.searchType, _this.searchKey);
            layer.msg(successMsg, { icon: 1, time: 2000 });
            _this.layer_close();
          } else {
            _this.isHide = true;
            layer.msg(res.body.Message, { icon: 2, time: 3000 });
          }
        }).catch(err => {
          console.log(err);
          _this.isHide = true;
          layer.msg('服务器错误，请稍后再试!', { icon: 2, time: 2500 });
        });
      }, function() {
        _this.layer_close();
      });
    },
    clearData() {
      for (var key in this.addItem) {
        if (key === "Sex" || key === "Status") {
          this.addItem[key] = 1;
        } else {
          this.addItem[key] = "";
        }
      }
      document.getElementById("addfile").value = "";
    },
    layer_close() {
      layer.close(this.layer);
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
    //处理Avatar
    handleData: function(val) {
      if (!val) {
        return "";
      } else {
        var leng = val.length;
        val = val.slice(0, 8) + "..." + val.slice(leng - 3, leng);
        return val;
      }
    },
  }
})

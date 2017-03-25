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
    addItem: { Id: "", Nick: "", Sex: "", Mail: "", Mobile: "", Address: "", Status: "" },
    token: "Bearer " + window.localStorage.token,
    usrId: window.localStorage.usrId, //用户Id   
    ip: "", //用于服务器
    // ip: "http://192.168.31.82", //用于测试
  },
  created: function() {
    if (this.usrId === "" || typeof this.usrId === "undefined") {
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
        } else if (res.body.Code == 401) {
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
                //跳到下一页时清空上一页的数据
                _this.items = [];
                //记录当前页码
                if (_this.isSearch) {
                  obj.curr = 1; //在进行搜索时，防止在当前页码不是1而导致获取不到数据
                }
                _this.currPage = obj.curr;
                _this.getList(obj.curr, _this.currCount, _this.searchType, _this.searchKey);
                _this.isSearch = false;
              }
              _this.firstLoad = true;
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
      this.currPage = 1; //防止获取不到数据
      this.getList(1, this.currCount, this.searchType, this.searchKey);
    },
    search() {
      this.isHide = false;
      this.isSearch = true;
      this.getList(1, this.currCount, this.searchType, this.searchKey);
    },
    add() {
      var _this = this;
      this.layer = layer.open({
        type: 1,
        title: "新增会员",
        content: $("#addmember"),
        area: "600px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭
        end: function() {

        }
      });
    },
    checkAdd() {
      for (var key in this.addItem) {
        if (this.addItem[key] === "") {
          this.addValid = false;
        }
      }
    },
    layer_submit_add() {
      this.addValid = true;
      // this.checkAdd();
      if (this.addValid) {
        this.isHide = false; //加载中
        this.addItem.Id = this.usrId;
        var data = JSON.stringify(this.addItem);
        this.$http.post(this.ip + "/api/Member/Add", data, {
          headers: {
            "Authorization": this.token
          }
        }).then((res) => {
          if (res.body.Code === 200) {
            this.getList(this.currPage, 10, this.searchType, this.searchKey);
            this.layer_close();
            layer.msg('新增成功', { icon: 1, time: 2000 });
            this.clearData();
          } else if (res.body.Message !== "") {
            layer.msg(res.body.Message, { icon: 0, time: 3000 });
            this.isHide = true;
          } else {
            this.isHide = true;
            layer.msg('服务器错误，请稍后再试', { icon: 0, time: 3000 });
          }
        }).catch((err) => {
          console.log(err)
          layer.msg('服务器错误，请稍后再试', { icon: 0, time: 3000 });
        })
      } else {
        layer.msg("请完善表单内容");
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
            _this.getList(_this.currPage, _this.currCount, _this.searchType, _this.searchKey);
            layer.msg(successMsg, { icon: 1, time: 2000 });
            _this.layer_close();
          } else {
            _this.isHide = true;
            layer.msg('服务器错误，请稍后再试!', { icon: 2, time: 3000 });
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
    // handleData: function(val) {
    //   if (val !== "null" && val != "") {
    //     var leng = val.length;
    //     val = val.slice(0, 8) + "..." + val.slice(leng - 3, leng);
    //   }
    //   return val;
    // },
  }
})

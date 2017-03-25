Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: '#app',
  data: {
    items: {},
    editItem: {}, //要编辑的items中的数据
    layer: null, //弹出框,
    addItem: { Name: "", WicketMobile: "", Address: "" }, //增加公司
    TotalCount: 0, //总数
    displayCount: 15, //当前页要显示的数据量
    currCount: 15, //当前数据量
    currPage: 1, //当前页码
    AppUsage: null,
    isHide: false, //“加载中”
    searchKey: "", //搜索关键字
    isSearch: false,
    editWicketMobile1: "",
    editWicketMobile2: "",
    editWicketMobile3: "",
    addWicketMobile1: "",
    addWicketMobile2: "",
    addWicketMobile3: "",
    showEditWicketMobile2: false,
    showEditWicketMobile3: false,
    showAddWicketMobile2: false,
    showAddWicketMobile3: false,
    showEditBtn: true,
    showAddBtn: true,
    addValid: true,
    editValid: true,
    token: "Bearer " + window.localStorage.token,
    usrId: window.localStorage.usrId, //用户Id  
    ip: "", //用于服务器
    // ip: "http://192.168.31.81", //用于测试
  },
  created: function() {
    if (this.usrId === "" || typeof this.usrId === "undefined") {
      parent.location.href = "login.html";
    } else {
      this.getList(1, 15, "");
    }
  },
  methods: {
    getList(index, size, key) {
      var data = { "Index": index, "Size": size };
      if (key !== "") {
        data.CompanyName = key;
      }
      this.$http.post(this.ip + "/api/Transport/ListCompany", data, {
        headers: {
          "Authorization": this.token
        }
      }).then((response) => {
        if (response.data.Code === 200) {
          this.items = response.data.Data.Content;
          this.displayCount = this.items.length;
          this.TotalCount = response.body.Data.TotalCount;
          this.isHide = true; //加载完毕
        } else {
          if (response.body.Code == 204) {
            this.items = [];
            this.displayCount = 0;
            this.TotalCount = 0;
            document.getElementById("page").innerHTML = "";
          } else {
            layer.msg("服务器错误，请稍后再试", { icon: 2, time: 1500 });
          }
          this.isHide = true;
        }
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
              _this.isHide = false;
              //跳到下一页时清空上一页的数据
              _this.items = [];
              //记录当前页码
              if (_this.isSearch) {
                obj.curr = 1; //在进行搜索时，防止在当前页码不是1而导致获取不到数据
              }
              _this.currPage = obj.curr;
              //获取当前页或指定页的数据
              _this.getList(obj.curr, _this.currCount, _this.searchKey);
              _this.isSearch = false;
            },
          })
        });
      } else {
        this.getList(1, this.currCount, this.searchKey);
        document.getElementById("page").innerHTML = "";
      }
    },
    //获取当前页面要显示的数据量
    getData(event) {
      this.currCount = event.target.value;
      this.currPage = 1; //防止获取不到数据
      this.getList(1, this.currCount, this.searchKey);
    },
    search() {
      this.isSearch = true; //判断是否在进行搜索
      this.currPage = 1; //防止获取不到数据
      this.getList(1, this.currCount, this.searchKey);
    },
    edit(index) {
      this.editItem = this.items[index];
      this.editWicketMobile1 = "";
      this.editWicketMobile2 = "";
      this.editWicketMobile3 = "";
      this.showEditWicketMobile2 = false;
      this.showEditWicketMobile3 = false;
      var wicketmobile = this.editItem.WicketMobile;
      if (wicketmobile.indexOf(",") !== -1 || wicketmobile.indexOf("，") !== -1) {
        if (wicketmobile.indexOf(",") !== -1) {
          wicketmobile = wicketmobile.split(","); //将字符串转数组
        } else {
          wicketmobile = wicketmobile.split("，");
        }
        var length = wicketmobile.length;
        if (length === 1) { //防止只有一个电话时仍然带有逗号
          this.editWicketMobile1 = wicketmobile.toString(); //只有1个电话
        }
        if (length === 2) {
          this.editWicketMobile1 = wicketmobile[0].toString();
          if (wicketmobile[1].toString() !== "") {
            this.showEditWicketMobile2 = true; //有2个电话
            this.editWicketMobile2 = wicketmobile[1].toString();
          }
        }
        if (length === 3) {
          this.showEditWicketMobile2 = true; //有3个电话
          this.editWicketMobile1 = wicketmobile[0].toString();
          this.editWicketMobile2 = wicketmobile[1].toString();
          if (wicketmobile[2].toString() !== "") {
            this.showEditWicketMobile3 = true;
            this.editWicketMobile3 = wicketmobile[2].toString();
          }
        }
      } else {
        this.editWicketMobile1 = wicketmobile;
      }
      this.layer = layer.open({
        type: 1,
        title: "编辑运输公司",
        content: $("#editcompany"),
        area: "500px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: true, //开启遮罩关闭
      });
    },
    //添加票窗电话
    addWicketMobile(id) {
      if (id === "add") {
        var acm2 = this.showAddWicketMobile2;
        var acm3 = this.showAddWicketMobile3;
        if (acm2 && !acm3) {
          this.showAddWicketMobile3 = true;
        }
        this.showAddWicketMobile2 = true;
        if (this.showAddWicketMobile2 && this.showAddWicketMobile3) {
          this.showAddBtn = false;
        }
      } else {
        var ecm2 = this.showEditWicketMobile2;
        var ecm3 = this.showEditWicketMobile3;
        if (ecm2 && !ecm3) {
          this.showEditWicketMobile3 = true;
        }
        this.showEditWicketMobile2 = true;
        if (this.showEditWicketMobile2 && this.showEditWicketMobile3) {
          this.showEditBtn = false;
        }
      }
    },
    //移除票窗电话
    delWicketMobile(id) {
      var _this = this;
      var confirm_layer = layer.confirm('确定要删除吗？', {
        btn: ['确定', '取消'] //按钮
      }, function() {
        layer.close(confirm_layer);
        document.getElementById(id).value = "";
        if (id === "add_wicketmobile2") {
          _this.showAddWicketMobile2 = false;
        }
        if (id === "add_wicketmobile3") {
          _this.showAddWicketMobile3 = false;
        }
        if (id === "edit_wicketmobile2") {
          _this.showEditWicketMobile2 = false;
          _this.editWicketMobile2 = "";
        }
        if (id === "edit_wicketmobile3") {
          _this.showEditWicketMobile3 = false;
          _this.editWicketMobile3 = "";
        }
        _this.showAddBtn = true;
        _this.showEditBtn = true;
      }, function() {
        layer.close(confirm_layer);
      });
    },
    layer_close() {
      layer.close(this.layer);
    },
    checkAddItem(id) {
      var el = document.getElementById(id);
      if (el.value === "") {
        el.classList.add("error");
        this.addValid = false;
      } else {
        el.classList.remove("error");
      }
    },
    checkEditItem(id) {
      var el = document.getElementById(id);
      if (el.value === "") {
        el.classList.add("error");
        this.editValid = false;
      } else {
        el.classList.remove("error");
      }
    },
    layer_submit() {
      this.editValid = true;
      this.checkEditItem('edit_name');
      this.checkEditItem('edit_wicketmobile');
      this.checkEditItem('edit_address');
      if (this.editValid) {
        this.isHide = false;
        var submitMobile = [];
        var mobileList = document.getElementsByName("editWicketMobile");
        for (var item of mobileList) {
          if (item.value !== "") {
            submitMobile.push(item.value); //组合多个电话
          }
        }
        this.editItem.WicketMobile = submitMobile.toString();
        var data = JSON.parse(JSON.stringify(this.editItem));
        this.$http.post(this.ip + "/api/Transport/ModifyCompany", data, {
          headers: {
            "Authorization": this.token
          }
        }).then((res) => {
          if (res.data.Code === 200) {
            this.getList(1, this.currCount, this.searchKey);
            this.layer_close();
            layer.msg('修改成功!', { icon: 1, time: 2000 });
          } else {
            this.isHide = true;
            if (res.body.Code === 400) {
              layer.msg(res.body.Message, { icon: 2, time: 3000 });
              add_name.focus();
              add_name.value = "";
            } else {
              layer.msg('服务器错误，请稍后再试', { icon: 2, time: 3000 });
            }
          }
        }).catch((err) => {
          this.isHide = true;
          layer.msg('服务器错误，请稍后再试', { icon: 2, time: 3000 });
        });
      }
    },
    add() {
      this.layer = layer.open({
        type: 1,
        title: "新增运输公司",
        content: $("#addcompany"),
        area: "500px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: true, //开启遮罩关闭
      });
      $("#add_name").focus();
    },
    layer_submit_add() {
      //添加运输公司
      var add_name = document.getElementById("add_name");
      this.addValid = true;
      this.checkAddItem('add_name');
      this.checkAddItem('add_wicketmobile1');
      this.checkAddItem('add_address');
      if (this.addValid) {
        this.isHide = false;
        var submitMobile = [];
        var mobileList = document.getElementsByName("addWicketMobile");
        for (var item of mobileList) {
          if (item.value !== "") {
            submitMobile.push(item.value); //组合多个电话
          }
        }
        this.addItem.WicketMobile = submitMobile.toString();
        var data = JSON.parse(JSON.stringify(this.addItem));
        this.$http.post(this.ip + "/api/Transport/AddCompany", data, {
          headers: {
            "Authorization": this.token
          }
        }).then((res) => {
          if (res.data.Code === 200) {
            this.getList(1, this.currCount, this.searchKey);
            this.layer_close();
            this.clearData();
            layer.msg('新增成功!', { icon: 1, time: 2000 });
          } else {
            this.isHide = true;
            if (res.body.Code === 400) {
              layer.msg('该运输公司已存在', { icon: 2, time: 3000 });
              add_name.focus();
              add_name.value = "";
            } else {
              layer.msg('服务器错误，请稍后再试', { icon: 2, time: 3000 });
            }
          }
        }).catch((err) => {
          this.isHide = true;
          layer.msg('服务器错误，请稍后再试', { icon: 2, time: 3000 });
        });
      }
    },
    clearData() {
      $("#add_name").val("");
      $("#add_address").val("");
      this.showAddWicketMobile2 = false;
      this.showAddWicketMobile3 = false;
      var mobileList = document.getElementsByName("addWicketMobile");
      for (var item of mobileList) {
        item.value = "";
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
    //分隔号码
    separate: function(val) {
      //全部替换方法
      String.prototype.replaceAll = function(s1, s2) {
        return this.replace(new RegExp(s1, "gm"), s2);
      }
      if (typeof val != "undefined") {
        if (val.indexOf(",") !== -1) {
          val = val.replaceAll(',', '-');
        } else if (val.indexOf("，") !== -1) {
          val = val.replaceAll('，', '-');
        } else {
          val = val;
        }
      }
      return val;
    },
  }
});

Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: '#app',
  data: {
    items: {},
    editItem: {}, //要编辑的items中的数据
    layer: null, //弹出框,
    addItem: {}, //增加图
    addName: "", //增加名称
    addModules: [], //增加模块
    addRemark: "", //增加备注
    addStatus: 1, //增加状态
    editId: 0, //编辑Id
    editName: "", //编辑名称
    editModules: [], //编辑模块
    editRemark: "", //编辑备注
    editStatus: 1, //编辑状态
    currCount: 15, //当前数据量
    TotalCount: 0,
    displayCount: 15, //当前页要显示的数据量
    currPage: 1, //当前页码
    isHide: false, //“加载中”
    token: "Bearer " + window.localStorage.token,
    usrId: window.localStorage.usrId, //获取当前用户id
    username: window.localStorage.username, //获取用户名
    submitModule: [], //待提交管理模块
    parentItem: [], //父级管理项
    childItem: [], //子级管理项
    childModule: [], //子级管理模块
    selectParentModule: "", //下拉菜单中当前的父级管理模块
    addChildModule: "", //下拉菜单中当前的子级管理模块(添加)
    editChildModule: "", //下拉菜单中当前的子级管理模块(编辑)
    childHomeModule: [], //首页模块的子项
    childCommunityModule: [], //社区模块的子项
    childAuthorityModule: [], //权限模块的子项
    childWechatModule: [], //微信模块的子项
    childSideModule: [], //身边圈模块的子项
    childTransportModule: [], //票务管理模块的子项
    showEditModuleItem: false, //显示模块列表（编辑）
    showAddModuleItem: false, //显示模块列表（添加）
    moduleItems: [], //当前用户拥有的管理模块
    addNameValid: false, //验证名称
    editNameValid: false,
    addValid: true,
    editValid: true,
    moduleCount: 0, //模块没有被选中的数量，用来判断有无模块被选中  
    firstLoad: true,
    ip: "", //用于服务器
    // ip: "http://192.168.31.82", //用于测试
  },
  created: function() {
    if (this.usrId === "" || typeof this.usrId === "undefined") {
      parent.location.href = "login.html";
    } else {
      this.getList(1, 15);
      this.getChildModule();
      this.getModules();
    }
  },
  methods: {
    getList(index, size) {
      var _this = this;
      this.$http.post(this.ip + "/api/Group/List", { "Index": index, "Size": size }, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.body.Code == 200) {
          _this.items = res.body.Data.Content;
          _this.displayCount = _this.items.length;
          _this.TotalCount = res.body.Data.TotalCount;
          _this.isHide = true; //加载完毕
        } else {
          if (res.body.Code == 204) {
            _this.items = [];
            _this.displayCount = 0;
            _this.TotalCount = 0;
            document.getElementById("page").innerHTML = "";
          } else {
            layer.msg(res.body.Message, { icon: 2, time: 2500 });
          }
          _this.isHide = true;
        }
      }).catch(function(error) {
        _this.isHide = true;
        console.log(error);
        layer.msg("服务器错误，请稍后再试", { icon: 2, time: 2500 });
      })
      document.getElementById("isget").style.visibility = "visible";
    },
    //获取当前页面要显示的数据量
    getData(event) {
      this.currCount = event.target.value;
      this.firstLoad = true;
      this.getList(1, 15);
    },
    //获取当前用户所拥有的子级管理模块
    getChildModule() {
      var _this = this;
      this.$http.post(this.ip + "/api/Module/GetModuleEnum", { "UsrId": this.usrId, "NodeType": 0 }, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.body.Code == 200) {
          _this.childItem = res.body.Data;
        } else {
          layer.msg(res.body.Message, { icon: 0, time: 2500 });
          _this.childItem = [];
        }
      }).catch(function(error) {
        console.log(error);
        layer.msg("服务器错误，请稍后再试", { icon: 0, time: 2500 });
      });
    },
    //获取当前用户拥有的所有管理模块
    getModules() {
      var _this = this;
      this.$http.get(this.ip + "/api/Module/GetModules/" + this.username, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.data.Code == 200) {
          _this.moduleItems = res.data.Data;
        } else {
          _this.moduleItems = [];
          layer.msg(res.body.Message, { icon: 2, time: 2500 });
        }
      }).catch(function(error) {
        layer.msg("服务器错误，请稍后再试", { icon: 2, time: 2500 });
        console.log(error);
      });
    },
    //遍历选中的模块
    selectModule(modules) {
      for (var module of modules) {
        if (module.checked) {
          //将子管理模块Id存放在待提交模块中
          this.submitModule.push(module.value);
          for (var item of this.childItem) {
            //如果submitModule中不存在该子模块的父模块的话就添加
            if (module.value == item.Value && this.submitModule.indexOf(item.PId) === -1) {
              this.submitModule.push(item.PId);
            }
          }
        } else {
          this.moduleCount++; //有模块未被选中时，数量加一，若等于模块总数则没有模块被选中
        }
      }
      //数组转字符串
      return this.submitModule.toString();
    },
    //验证名称
    checkAddName() {
      if (this.addName === "") {
        this.addValid = false;
        this.addNameValid = true;
      } else {
        this.addNameValid = false;
      }
    },
    checkEditName() {
      if (this.editName === "") {
        this.editValid = false;
        this.editNameValid = true;
      } else {
        this.editNameValid = false;
      }
    },
    edit(index) {
      var _this = this;
      this.isHide = false;
      this.$http.get(this.ip + "/api/Module/GetModules/" + this.username, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.data.Code == 200) {
          _this.moduleItems = res.data.Data;
          _this.editItem = _this.items[index];
          _this.editId = _this.editItem.Id;
          _this.editName = _this.editItem.Name;
          _this.editModules = _this.editItem.ModuleNames.split(',');
          _this.editRemark = _this.editItem.Remark;
          _this.editStatus = _this.editItem.Status;
          var modules = document.getElementsByName("editModule");
          setTimeout(function() {
            for (var editmodule of _this.editModules) {
              for (var module of modules) {
                if (editmodule == module.dataset.module) {
                  module.checked = true;
                }
              }
            }
          }, 0);
          _this.layer = layer.open({
            type: 1,
            title: "编辑角色",
            content: $("#edit-group"),
            area: "600px",
            skin: 'layui-layer-demo', //样式类名
            anim: 2,
            shadeClose: true, //开启遮罩关闭
          });
        } else {
          layer.msg(res.body.Message, { icon: 2, time: 2500 });
        }
        _this.isHide = true;
      }).catch(function(error) {
        _this.isHide = true;
        layer.msg("服务器错误，请稍后再试", { icon: 2, time: 2500 });
        console.log(error);
      });
      this.getChildModule();
    },
    layer_close() {
      layer.close(this.layer);
    },
    layer_submit() {
      var _this = this;
      this.editValid = true;
      this.moduleCount = 0; //防止提交失败时
      this.submitModule = []; //防止提交失败时，模块叠加
      var modules = document.getElementsByName("editModule");
      var moduleids = this.selectModule(modules); //获取被选中的模块Id
      if (this.moduleCount === modules.length) {
        this.editValid = false;
        layer.msg('请选择管理模块', { icon: 2, time: 3000 });
      }
      if (this.editValid) {
        this.isHide = false; //加载中
        var data = {
          "Id": this.editId,
          "Name": this.editName,
          "ModuleIds": moduleids,
          "Remark": this.editRemark,
          "Status": this.editStatus
        }
        this.$http.post(this.ip + "/api/Group/Update", data, {
          headers: {
            "Authorization": this.token
          }
        }).then(function(res) {
          if (res.body.Code === 200) {
            _this.firstLoad = true;
            _this.getList(1, _this.currCount);
            _this.layer_close();
            layer.msg('修改成功', { icon: 1, time: 2000 });
          } else {
            _this.isHide = true;
            layer.msg(res.body.Message, { icon: 2, time: 3000 });
          }
        }).catch(function(error) {
          _this.isHide = true;
          layer.msg("服务器错误，请稍后再试", { icon: 2, time: 2500 });
          console.log(error);
        });
      }
    },
    add() {
      var _this = this;
      this.layer = layer.open({
        type: 1,
        title: "新增角色",
        content: $("#add-group"),
        area: "600px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭
        end: function() {
          _this.addNameValid = false;
        }
      });
      this.getChildModule();
      this.getModules();
    },
    layer_submit_add() {
      var _this = this;
      this.addValid = true;
      this.checkAddName();
      this.moduleCount = 0; //防止提交失败时
      this.submitModule = []; //防止提交失败时，模块叠加
      var modules = document.getElementsByName("addModule");
      var moduleids = this.selectModule(modules); //获取被选中的模块Id
      if (this.moduleCount === modules.length) {
        this.addValid = false;
        layer.msg('请选择管理模块', { icon: 2, time: 3000 });
      }
      if (this.addValid) {
        this.isHide = false; //加载中
        var data = {
          "Name": this.addName,
          "ModuleIds": moduleids,
          "Remark": this.addRemark,
          "Status": this.addStatus
        }
        this.$http.post(this.ip + "/api/Group/Add", data, {
          headers: {
            "Authorization": this.token
          }
        }).then(function(res) {
          if (res.body.Code === 200) {
            _this.firstLoad = true;
            _this.getList(1, _this.currCount);
            _this.layer_close();
            _this.clearData();
            layer.msg('新增成功', { icon: 1, time: 2000 });
          } else {
            _this.isHide = true;
            layer.msg(res.body.Message, { icon: 2, time: 3000 });
          }
        }).catch(function(error) {
          _this.isHide = true;
          layer.msg("服务器错误，请稍后再试", { icon: 2, time: 2500 });
          console.log(error);
        });
      }
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
    //清空数据
    clearData() {
      this.submitModule = [];
      this.addName = "";
      this.addRemark = "";
      var modules = document.getElementsByName("addModule");
      for (var module of modules) {
        if (module.checked) {
          module.checked = false;
        }
      }
    },
    formatData(data) {
      return JSON.parse(JSON.stringify(data));
    },
    //计算分钟数
    computeSeconds() {
      var seconds = 0;
      var logindate = parseInt(this.loginDate); //登陆日期
      if (logindate !== "") {
        var nowdate = Date.now(); //当前日期
        logindate = new Date(logindate);
        nowdate = new Date(nowdate);
        seconds = Math.floor((nowdate - logindate) / (60 * 1000));
      }
      return seconds;
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
    //截取模块名称作为ID
    cutAddId: function(value) {
      var arr = value.split(".");
      return "add" + arr[0].toString();
    },
    cutEditId: function(value) {
      var arr = value.split(".");
      return "edit" + arr[0].toString();
    }
  }
});

Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: '#app',
  data: {
    items: {},
    editItem: { "Name": "" }, //要编辑的items中的数据
    layer: null, //弹出框,
    addItem: { "Name": "" }, //增加
    TotalCount: 0, //总数
    currCount: 15, //当前数据量
    displayCount: 15, //当前页要显示的数据量
    currPage: 1, //当前页码
    AppUsage: null,
    isHide: false, //“加载中”
    addValid: true,
    addCityValid: false,
    editValid: true,
    editCityValid: false,
    firstLoad: true,
    token: "Bearer " + window.localStorage.token,
    usrId: window.localStorage.usrId, //用户Id   
    ip: "", //用于服务器
    // ip: "http://192.168.31.82", //用于测试
  },
  created: function() {
    if (!this.usrId) {
      parent.location.href = "login.html";
    } else {
      this.getList(1, 15);
    }
  },
  methods: {
    getList(index, size) {
      var data = { "Index": index, "Size": size };
      data = JSON.stringify(data);
      this.$http.post(this.ip + "/api/HotVideo/ListClassify", data, {
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
          layer.msg(res.body.Message, { icon: 0, time: 3000 });
        }
        this.isHide = true;
      }).catch(function(error) {
        this.isHide = true;
        console.log(error);
        layer.msg("服务器错误，请稍后再试", { icon: 0, time: 2500 });
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
      this.setPage();
    },
    edit(index, id) {
      // console.log(index,id)
      // 编辑内容
      this.editItem = this.items[index];
      this.layer = layer.open({
        type: 1,
        title: "编辑视频分类",
        content: $("#editcity"),
        area: "400px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭
      });
    },
    checkEditCity() {
      if (this.editItem.City === "") {
        this.editValid = false;
        this.editCityValid = true;
      } else {
        this.editCityValid = false;
      }
    },
    layer_close() {
      layer.close(this.layer);
    },
    layer_submit() {
      this.editValid = true;
      this.checkEditCity();
      // 获取修改过的数据然后提交
      if (this.editValid) {
        this.isHide = false; //加载中
        var data = JSON.stringify(this.editItem);
        this.$http.post(this.ip + "/api/HotVideo/ModifyClassify", data, {
          headers: {
            "Authorization": this.token
          }
        }).then(function(res) {
          if (res.body.Code === 200) {
            this.setPage();
            this.layer_close();
            layer.msg('修改成功', { icon: 1, time: 2000 });
          } else {
            layer.msg(res.body.Message, { icon: 0, time: 3000 });
          }
          this.isHide = true;
        }).catch(function(err) {
          this.isHide = true;
          console.log(error);
          layer.msg('服务器错误，请稍后再试', { icon: 2, time: 3000 });
        })
      }
    },
    add() {
      this.addCityValid = false;
      this.layer = layer.open({
        type: 1,
        title: "新增视频分类",
        content: $("#addcity"),
        area: "400px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭
      });
    },
    checkAddCity() {
      if (this.addItem.City === "") {
        this.addValid = false;
        this.addCityValid = true;
      } else {
        this.addCityValid = false;
      }
    },
    layer_submit_add() {
      //添加城市
      this.addValid = true;
      this.checkAddCity();
      if (this.addValid) {
        this.isHide = false; //加载中
        var data = JSON.stringify(this.addItem);
        this.$http.post(this.ip + "/api/HotVideo/AddClassify", data, {
          headers: {
            "Authorization": this.token
          }
        }).then(function(res) {
          if (res.body.Code === 200) {
            this.firstLoad = true;
            this.getList(1, this.currCount);
            this.setPage();
            this.layer_close();
            layer.msg('新增成功', { icon: 1, time: 2000 });
          } else {
            this.isHide = true;
            layer.msg(res.body.Message, { icon: 0, time: 3000 });
          }
          console.log(res)
        }).catch(function(error) {
          this.isHide = true;
          console.log(error);
          layer.msg("服务器错误，请稍后再试", { icon: 0, time: 2500 });
        });
      }
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
});

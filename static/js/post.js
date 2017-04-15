Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: '#app',
  data: {
    items: {},
    editItem: {}, //要编辑的items中的数据
    layer: null, //弹出框,
    addItem: { BoardId: "", UsrId: "", Content: "" }, //增加图
    TotalCount: 0, //总数
    displayCount: 15, //当前页要显示的数据量   
    currCount: 15, //当前数据量
    currPage: 1, //当前页码
    addValid: true,
    editValid: true,
    CommItem: [],
    AppUsage: null,
    isHide: false, //“加载中”
    isIndent: false, //是否缩进
    isEdit: true,
    Intro: "", //文章内容    
    firstLoad: true,
    showItem: false,
    searchType: "UsrName",
    searchKey: "",
    UsrItem: [],
    nick: "",
    token: "Bearer " + window.localStorage.token,
    usrId: window.localStorage.usrId, //用户Id   
    ip: "", //用于服务器
    // ip: "http://192.168.31.82", //用于测试
  },
  created: function() {
    if (!this.usrId) {
      parent.location.href = "login.html";
    } else {
      this.getList(1, 15, "", "");
      this.getComm();
      //富文本编辑器初始化
      window.editor = new wangEditor('editor');
      editor.config.uploadImgUrl = this.ip + '/api/Default/UploadImg';
      editor.config.uploadParams = {
        token: this.token,
      };
      editor.config.uploadHeaders = {
        'Accept': 'text/x-json'
      };
      editor.create();
    }
  },
  methods: {
    getList(index, size, type, key) {
      var _this = this;
      var data = { "Index": index, "Size": size };
      if (type == "Title") {
        data.Title = key;
      }
      if (type == "UsrName") {
        data.UsrName = key;
      }
      // if (type == "Topic") {
      //   data.Topic = key;
      // }
      if (type == "LikeCount") {
        data.LikeCount = key;
      }
      this.$http.post(this.ip + "/api/Post/List", data, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        // console.log(res.body)
        if (res.body.Code == 200) {
          _this.items = res.body.Data.Content;
          _this.displayCount = _this.items.length;
          _this.TotalCount = res.body.Data.TotalCount;
          _this.isHide = true; //加载完毕
          // console.log(this.items)
        } else {
          if (res.body.Code == 204) {
            _this.items = [];
            _this.displayCount = 0;
            document.getElementById("page").innerHTML = "";
          } else {
            layer.msg(res.body.Message, { icon: 2, time: 1500 });
          }
          _this.isHide = true;
        }
      }).catch(function(error) {
        _this.isHide = true;
        console.log(error);
        layer.msg("服务器错误，请稍后再试", { icon: 2, time: 1500 });
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
                _this.getList(obj.curr, _this.currCount, _this.searchType, _this.searchKey);
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
      this.getList(1, this.currCount, this.searchType, this.searchKey);
    },
    search() {
      this.firstLoad = true;
      this.getList(1, this.currCount, this.searchType, this.searchKey);
    },
    //获取社区Id
    getComm() {
      var _this = this;
      this.$http.get(this.ip + "/api/Board/ListEnum", {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.data.Code === 200) {
          _this.CommItem = res.data.Data;
        } else {
          layer.msg(res.body.Message, { icon: 2, time: 3000 });
        }
      }).catch((err) => {
        layer.msg('服务器错误，请稍后再试!', { icon: 2, time: 3000 });
        console.error()
      });
    },
    //获取用户Id
    getUsrid() {
      var _this = this;
      var data = {
        Index: 1,
        Size: 10,
        Nick: this.nick
      };
      data = JSON.stringify(data);
      this.$http.post(this.ip + "/api/Member/VirtualManEnum", data, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.data.Code === 200) {
          _this.UsrItem = res.data.Data.Content;
        } else if (res.data.Code === 204) {
          _this.UsrItem = [];
        } else {
          layer.msg(res.body.Message, { icon: 2, time: 3000 });
        }
      }).catch((err) => {
        _this.UsrItem = [];
        layer.msg('服务器错误，请稍后再试!', { icon: 2, time: 3000 });
        console.log(err)
      });
      // console.log(this.UsrItem)
      this.showItem = true;
    },
    //选择昵称
    selectNick(name, val) {
      this.nick = name;
      if (this.isEdit) {
        this.editItem.UsrId = val;
      } else {
        this.addItem.UsrId = val;
      }
      this.showItem = false;
    },
    //复制Id
    clickCopy(id) {
      id = "#id" + id;
      var a = id + ">a";
      var clipboard = new Clipboard(id);
      clipboard.on('success', function(e) {
        // console.log(e.text);
        layer.tips("已复制", a, {
          tips: [1, '#429842'],
          time: 3000
        });
      });
      clipboard.on('error', function(e) {
        console.log(e);
      });
    },
    //复制Web专用
    copyUrl(id) {
      id = "#url" + id; //要复制的元素Id
      var a = id + ">a";
      var clipboard = new Clipboard(id);
      clipboard.on('success', function(e) {
        layer.tips("已复制", a, {
          tips: [1, '#429842'],
          time: 3000
        });
      });
      clipboard.on('error', function(e) {
        console.log(e);
      });
    },
    //复制App专用
    copyOurl(id) {
      id = "#ourl" + id; //要复制的元素Id
      var a = id + ">a";
      var clipboard = new Clipboard(id);
      clipboard.on('success', function(e) {
        layer.tips("已复制", a, {
          tips: [1, '#429842'],
          time: 3000
        });
      });
      clipboard.on('error', function(e) {
        console.log(e);
      });
    },
    edit(index, id) {
      this.showItem = false;
      this.editItem = this.items[index];
      if (!this.editItem.Source) {
        var imgItem = this.editItem.Img;
        var img = "";
        //循环替换
        for (var i = 0; i < imgItem.length; i++) {
          img = "<img src=" + imgItem[i].Src + ">";
          this.editItem.Content = this.editItem.Content.replace(imgItem[i].PositionName, img);
        }
        editor.$txt.html(this.editItem.Content);
      } else {
        editor.$txt.html(this.editItem.Source);
      }
      this.nick = this.editItem.UsrName;
      this.isEdit = true;
      this.layer = layer.open({
        type: 1,
        title: "编辑帖子",
        content: $("#editpost"),
        area: "600px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: true, //开启遮罩关闭
        scrollbar: false,
        end: function() {
          editor.$txt.html('<p><br></p>');
        }
      });
    },
    //查看帖子内容
    lookIntro(intro) {
      layer.open({
        type: 1,
        title: "帖子内容",
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
    layer_close() {
      layer.close(this.layer);
    },
    layer_submit() {
      var _this = this;
      this.editValid = true;
      this.checkEditItem('edit_title');
      this.checkEditItem('edit_readcount');
      if (this.editItem.Content === "") {
        this.editValid = false;
        layer.msg("帖子内容不能为空")
      }
      if (this.nick === "") {
        this.addValid = false;
        layer.msg("发帖人不能为空")
      }
      this.checkEditItem('edit_likecount');
      if (this.editValid) {
        this.isHide = false; //加载中
        // this.editItem.Content = this.htmlEncode(this.editItem.Content);
        var data = JSON.parse(JSON.stringify(this.editItem));
        this.$http.post(this.ip + "/api/Post/Update", data, {
          headers: {
            "Authorization": this.token
          }
        }).then(function(res) {
          if (res.body.Code === 200) {
            _this.setPage();
            _this.layer_close();
            layer.msg('修改成功', { icon: 1, time: 2000 });
          } else {
            layer.msg(res.body.Message, { icon: 2, time: 2000 });
          }
          _this.isHide = true;
        }).catch(function(err) {
          console.log(err)
          _this.isHide = true;
          layer.msg('服务器错误，请稍后再试', { icon: 2, time: 3000 });
        })
      }
    },
    add() {
      this.isEdit = false;
      this.addItem.BoardId = this.CommItem[0].Value;
      this.nick = "";
      this.layer = layer.open({
        type: 1,
        title: "新增帖子",
        content: $("#addpost"),
        area: "600px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭
        scrollbar: false,
        end: function() {
          $("#add_title").removeClass("error");
          $("#add_likecount").removeClass("error");
          // $("#add_topic").removeClass("error");
        }
      });
      this.getComm();
      this.clearData();
    },
    //设为热门文章
    setHot(id) {
      var _this = this;
      this.layer = layer.confirm("确定要此帖子推送至首页吗？", {
        btn: ["确定", "取消"]
      }, function() {
        _this.isHide = false; //加载中
        var data = {
          "SourceType": 4,
          "SourceId": id,
          "Status": 1,
        };
        _this.$http.post(_this.ip + "/api/HDoc/Add", data, {
          headers: {
            "Authorization": _this.token
          }
        }).then(function(res) {
          if (res.body.Code === 200) {
            _this.firstLoad = true;
            _this.getList(1, _this.currCount, "", "");
            layer.msg("设置成功", { icon: 1, time: 2000 });
            _this.layer_close();
          } else {
            layer.msg(res.body.Message, { icon: 2, time: 3000 });
          }
          _this.isHide = true;
        }).catch(function(err) {
          console.log(err);
          _this.isHide = true;
          layer.msg('服务器错误，请稍后再试!', { icon: 2, time: 2500 });
        });
      }, function() {
        _this.layer_close();
      });
    },
    //已为热门
    isHot() {
      layer.msg("此帖子已推送", { icon: 0, time: 2500 });
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
    //打开富文本
    openRichText() {
      this.layer_text = layer.open({
        type: 1,
        title: "帖子内容",
        content: $("#open-rich-text"),
        // area: ["700px", "600px"],
        area: "700px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: true, //开启遮罩关闭
        maxmin: true,
        cancel: function() {
          // location.replace(location.href);
        },
        end: function() {
          // location.replace(location.href);
        }
      });
    },
    submit() {
      var html = editor.$txt.html();
      if (this.isEdit) {
        this.editItem.Content = html;
      } else {
        this.addItem.Content = html;
      }
      this.close();
    },
    close() {
      layer.close(this.layer_text);
    },
    //添加帖子
    layer_submit_add() {
      var _this = this;
      this.addValid = true;
      this.checkAddItem('add_title');
      // this.checkAddItem('add_topic');
      if (this.addItem.Content === "") {
        this.addValid = false;
        layer.msg("帖子内容不能为空")
      }
      if (this.nick === "") {
        this.addValid = false;
        layer.msg("发帖人不能为空")
      }
      this.checkAddItem('add_likecount');
      this.checkAddItem('add_readcount');
      if (this.addValid) {
        this.isHide = false; //加载中
        // this.addItem.Content = this.htmlEncode(this.addItem.Content);
        var data = JSON.parse(JSON.stringify(this.addItem));
        this.$http.post(this.ip + "/api/Post/Add", data, {
          headers: {
            "Authorization": this.token
          }
        }).then(function(res) {
          if (res.body.Code === 200) {
            _this.firstLoad = true;
            _this.getList(1, _this.currCount, "", "");
            _this.clearData();
            _this.layer_close();
            _this.nick = "";
            layer.msg('新增成功', { icon: 1, time: 2000 });
          } else {
            layer.msg(res.body.Message, { icon: 2, time: 2000 });
          }
          _this.isHide = true;
        }).catch(function(err) {
          _this.isHide = true;
          console.log(err)
          layer.msg('服务器错误，请稍后再试!', { icon: 2, time: 3000 });
        })
      }
    },
    formatData(data) {
      return JSON.parse(JSON.stringify(data));
    },
    clearData() {
      this.nick = "";
      document.getElementById("add_title").value = "";
      document.getElementById("add_content").value = "";
      document.getElementById("add_readcount").value = "";
      document.getElementById("add_likecount").value = "";
      // $("#add_topic").val("");
      editor.$txt.html('<p><br></p>');
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
    subStr: function(val) {
      if (!val) {
        return "";
      } else {
        var len = val.length;
        if (len > 8) {
          val = val.slice(0, 5) + "..." + val.slice(len - 2, len);
        }
        return val;
      }
    },
    subUrl: function(val) {
      if (!val) {
        return "";
      } else {
        var len = val.length;
        if (len > 8) {
          val = val.slice(0, 5) + "..." + val.slice(len - 2, len);
        }
        return val;
      }
    },
    subTitle: function(val) {
      if (!val) {
        return "";
      } else {
        var len = val.length;
        if (len > 6) {
          val = val.slice(0, 3) + "..." + val.slice(len - 3, len);
        }
        return val;
      }
    },
    subContent: function(val) {
      if (!val) {
        return "";
      } else {
        var len = val.length;
        if (len > 30) {
          val = val.slice(0, 15) + "..." + val.slice(len - 14, len);
        }
        return val;
      }
    }
  }
});
//添加提示
function addTips(id) {
  id = "#id" + id;
  var a = id + ">a";
  layer.tips("点击复制", a, {
    tips: [1, '#429842'],
    time: 1500
  });
}
//详情
function lookDetail(id, type, tip) {
  id = "#" + type + id;
  var el = id + ">a";
  layer.tips(tip, el, {
    tips: [1, '#00B271'],
    time: 3000
  });
}

function urlTips(id) {
  id = "#url" + id;
  var a = id + ">a";
  layer.tips("点击复制", a, {
    tips: [1, '#00B271'],
    time: 1500
  });
}

function ourlTips(id) {
  id = "#ourl" + id;
  var a = id + ">a";
  layer.tips("点击复制", a, {
    tips: [1, '#00B271'],
    time: 1500
  });
}

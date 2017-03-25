Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: '#app',
  data: {
    items: {},
    editItem: {}, //要编辑的items中的数据
    layer: null, //弹出框,
    addItem: {}, //增加图
    TotalCount: 0, //总数
    totalPages: 0, //总页数
    currCount: 15, //当前数据量
    displayCount: 15, //当前页要显示的数据量    
    showTableStyle: false, //用于恢复查看文章详情后table样式
    currPage: 1, //当前页码
    isHide: false, //隐藏“加载”图标
    addValid: true,
    editValid: true,
    isSearch: false,
    docUrl: null, //文章链接
    searchItem: {}, //搜索条件
    isViewType: false, //是否为文章类型
    searchKey: "", //搜索关键字
    searchType: "", //搜索关键类型
    isViewType: false, //是否为文章类型
    topicId: 0, //文章详情Id
    isIndent: false, //是否缩进
    Intro: "", //文章内容      
    token: "Bearer " + window.localStorage.token,
    usrId: window.localStorage.usrId, //用户Id   
    ip: "", //用于服务器
    // ip: "http://192.168.31.82", //用于测试
  },
  created: function() {
    if (this.usrId === "" || typeof this.usrId === "undefined") {
      parent.location.href = "login.html";
    } else {
      //富文本编辑器初始化
      window.editor = new wangEditor('editor');
      //移除全屏
      editor.config.menus = $.map(wangEditor.config.menus, function(item, key) {
        if (item === 'fullscreen') {
          return null;
        }
        return item;
      });
      editor.create();
      this.getList(1, 15, "", "");
      document.querySelector("#searchKey").focus();
    }
  },
  methods: {
    getList(index, size, key, value) {
      var data = { "Index": index, "Size": size };
      if (key == "Title") {
        data.Title = value;
      }
      if (key == "WeChatName") {
        data.WeChatName = value;
      }
      if (key == "ViewType") {
        data.ViewType = value;
      }
      this.$http.post(this.ip + "/api/WeChat/TopicList", data, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(response) {
        if (response.body.Code == 200) {
          this.items = response.body.Data.Content;
          this.TotalCount = response.body.Data.TotalCount;
          this.displayCount = this.items.length;
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
        console.log(error);
        this.isHide = true;
        layer.msg("服务器错误，请稍后再试", { icon: 2, time: 3000 });
      });
      document.getElementById("isget").style.visibility = "visible";
    },
    //获取数据总量
    getCount(index, size, key, value) {
      var totalConut = 0;
      var _this = this;
      var datas = { "Index": index, "Size": size };
      if (key == "Title") {
        datas.Title = value;
      }
      if (key == "WeChatName") {
        datas.WeChatName = value;
      }
      if (key == "ViewType") {
        datas.ViewType = value;
      }
      return new Promise((resolve, reject) => {
        $.ajax(this.ip + "/api/WeChat/TopicList", {
          type: "post",
          headers: {
            "Authorization": this.token
          },
          data: datas,
          success: function(res) {
            if (res.Code === 200) {
              totalConut = res.Data.TotalCount;
              _this.TotalCount = totalConut;
              resolve(totalConut);
            } else if (res.Code === 204) {
              _this.items = [];
              _this.displayCount = 0;
              _this.TotalCount = 0;
              document.getElementById("page").innerHTML = "";
            } else {
              layer.msg("服务器错误，请稍后再试", { icon: 2, time: 2000 });
            }
            _this.isHide = true;
          },
          error: function(err) {
            console.log(err)
            _this.isHide = true;
            layer.msg("服务器错误，请稍后再试", { icon: 2, time: 3000 });
          }
        });
      }).then(count => {
        try {
          // 有10条以上的数据，可以分页
          if (count > this.currCount) {
            layui.laypage({
              cont: 'page', //分页容器的id
              pages: Math.ceil(count / this.currCount), //总页数
              skin: '#148cf1', //自定义选中色值
              skip: true, //开启跳页
              jump: function(obj) {
                _this.isHide = false;
                //跳到下一页时清空上一页的数据
                _this.items = [];
                //记录当前页码
                _this.currPage = obj.curr;
                //获取当前页或指定页的数据
                if (_this.isSearch) {
                  obj.curr = 1; //在进行搜索时，防止在当前页码不是1而导致获取不到数据
                }
                _this.getList(obj.curr, _this.currCount, _this.searchType, _this.searchKey);
                _this.isSearch = false; //页码设置完1后，将其重新设为false，防止其影响翻页
              },
            });
          }
          //不足10条数据
          else {
            _this.getList(1, _this.currCount, _this.searchType, _this.searchKey);
            //不构成分页时，把之前的分页去掉
            document.getElementById("page").innerHTML = "";
          }
        } catch (err) {
          _this
            .items = [];
          _this.displayCount = 0;
          _this.TotalCount = 0;
          console.log(err);
          layer.msg("服务器错误，请稍后再试", { icon: 2, time: 3000 });
        }
      })
    },
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
              _this.getList(obj.curr, _this.currCount, _this.searchType, _this.searchKey);
            },
          })
        });
      } else {
        this.getList(1, this.currCount, this.searchType, this.searchKey);
        document.getElementById("page").innerHTML = "";
      }
    },
    //获取当前页面要显示的数据量
    getData(event) {
      this.currCount = event.target.value;
      this.currPage = 1; //防止获取不到数据
      this.getList(1, this.currCount, this.searchType, this.searchKey);
    },
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
    changeType() {
      if (this.searchType !== "ViewType") {
        this.searchKey = "";
      }
    },
    search() {
      this.isHide = false;
      this.isSearch = true;
      this.getList(1, 10, this.searchType, this.searchKey);
    },
    getDoc(id) {
      this.isHide = false;
      //记录文章详情Id，便于之后的修改
      // console.log(id);
      this.topicId = id;
      // console.log(this.topicId);
      this.$http.get(this.ip + "/api/WeChat/GetTopicDetail/" + id, {
        headers: {
          "Authorization": this.token
        }
      }).then(res => {
        if (res.body.Code === 200) {
          layer.open({
            type: 1,
            title: "编辑文章详情",
            content: $("#editTopic"),
            area: "1200px * 600px",
            skin: 'layui-layer-demo', //样式类名
            anim: 2,
            shadeClose: true, //开启遮罩关闭
            cancel: function() {
              location
                .replace(location.href);
            },
            end: function() {
              location.replace(location.href);
            }
          });
          Vue_App.isHide = true;
          //恢复表格样式
          Vue_App.showTableStyle = true;
          //将获取的html内容赋值给富文本编辑器
          editor.$txt.html(res.body.Data);
        } else {
          Vue_App.isHide = true;
          layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 1500 });
        }
      }).catch(err => {
        Vue_App.isHide = true;
        layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 1500 });
      });
    },
    edit(index, id) {
      // 编辑内容
      this.editItem = this.items[index];
      this.editItem.index = index; //记录位置
      this.layer = layer.open({
        type: 1,
        title: "文章编辑",
        content: $("#editdoc"),
        area: "600px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: true, //开启遮罩关闭
      });
      $("#editfile").val("");
    },
    layer_close() {
      layer.close(this.layer);
    },
    layerClose() {
      location.replace(location.href);
      layer.closeAll('page');
    },
    add() {
      // 增加图
      this.layer = layer.open({
        type: 1,
        title: "添加文章",
        content: $("#adddoc"),
        area: "600px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: true, //开启遮罩关闭
        end: function() {
          $("#add_name").removeClass("error");
          $("#add_url").removeClass("error");
        }
      });
      $("#add_name").focus();
    },
    checkAddItem(id) {
      var el = document.getElementById(id);
      if (el.value.length < 1) {
        el.classList.add("error");
        this.addValid = false;
      } else {
        el.classList.remove("error");
      }
    },
    checkedAddFile() {
      var file = document.getElementById("addfile");
      var isUpload = true;
      if (file.value === "") {
        layer.msg("请上传图片!", { icon: 0, time: 2000 });
        this.addValid = false;
      } else {
        this.addValid = pictrue_size(file);
      }
    },
    checkEditItem(id) {
      var el = document.getElementById(id);
      if (el.value.length < 1) {
        el.classList.add("error");
        this.editValid = false;
      } else {
        el.classList.remove("error");
      }
    },
    checkEditFile() {
      var file = document.getElementById("editfile");
      if (file.value != "") {
        this.editValid = this.pictrue_size(file);
      }
    },
    //判断图片大小
    pictrue_size(id) {
      var filesize = id.files[0].size;
      filesize = filesize / 1000000
      var sizes = this.getFloat(filesize, 1);
      var ok = true;
      if (sizes > 1) {
        layer.msg("图片大小不能超过1M!", { icon: 2, time: 3000 });
        ok = false;
      }
      return ok;
    },
    //保留n位小数
    getFloat(number, n) {
      n = n ? parseInt(n) : 0;
      if (n <= 0) return Math.round(number);
      number = Math.round(number * Math.pow(10, n)) / Math.pow(10, n);
      return number;
    },
    layer_submit_add() {
      var _this = this;
      this.addValid = true;
      this.checkAddItem("add_name");
      this.checkAddItem("add_url");
      this.checkedAddFile();
      if (this.addValid) {
        this.isHide = false; //加载中
        $("#addform").ajaxSubmit({
          url: this.ip + "/api/WeChat/AddTopicAd",
          type: "post",
          headers: {
            "Authorization": this.token
          },
          success: function(res) {
            if (res.Code === 200) {
              _this.getList(1, _this.currCount, _this.searchType, _this.searchKey);
              $("#add_name").val("");
              $("#add_url").val("");
              $("#addfile").val("");
              _this.layer_close();
              layer.msg("添加成功!", { icon: 1, time: 1500 });
            } else {
              _this.isHide = true;
              layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 3000 });
            }
          }
        });
      }
    },
    formatData(data) {
      return JSON.parse(JSON.stringify(data));
    },
    layer_submit_edit() {
      var _this = this;
      this.editValid = true;
      this.checkEditItem("edit_name");
      this.checkEditItem("edit_url");
      this.checkEditFile();
      if (this.editValid) {
        this.isHide = false; //加载中
        $("#editform").ajaxSubmit({
          url: this.ip + "/api/WeChat/UpdateTopic",
          type: "post",
          headers: {
            "Authorization": this.token
          },
          success: function(res) {
            if (res.Code === 200) {
              _this.getList(1, _this.currCount, _this.searchType, _this.searchKey);
              layer.closeAll('page');
              layer.msg("修改成功!", { icon: 1, time: 1500 });
            } else {
              _this.isHide = true;
              layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 1500 });
            }
          }
        });
      }
    },
    //查看文章内容
    lookIntro(intro) {
      layer.open({
        type: 1,
        title: "文章内容",
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
    //设为热门文章
    setHot(id) {
      var _this = this;
      this.layer = layer.confirm("确定要此文章推送至首页吗？", {
        btn: ["确定", "取消"]
      }, function() {
        _this.isHide = false; //加载中
        var data = {
          "SourceType": 1,
          "SourceId": id,
          "Status": 1,
        };
        _this.$http.post(_this.ip + "/api/HDoc/Add", data, {
          headers: {
            "Authorization": _this.token
          }
        }).then((res) => {
          if (res.body.Code === 200) {
            _this.getList(_this.currPage, _this.currCount, _this.searchKeyList, _this.searchKeyWord);
            layer.msg("设置成功！", { icon: 1, time: 2000 });
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
    //已为热门
    isHot() {
      layer.msg("此文章已推送", { icon: 0, time: 2500 });
    },
    updateTopicDetail() {
      this.isHide = false; //加载中
      //获取纯文本内容
      var newDetail = editor.$txt.html();
      // console.log(this.topicId);
      $.ajax(this.ip + "/api/WeChat/UpdateTopicContent", {
        type: "post",
        headers: {
          "Authorization": this.token
        },
        data: {
          "Id": this.topicId,
          "Content": newDetail
        },
        success: function(res) {
          if (res.Code === 200) {
            layer.msg("修改成功", { icon: 1, time: 2000 });
            setTimeout(function() {
              location.replace(location.href);
            }, 2000);
          } else {
            Vue_App.isHide = true;
            layer.msg("服务器错误，请稍后再试", { icon: 2, time: 2000 });
          }
        }
      })
    },
  },
  filters: {
    // 给过长的字符串中间加上省略号
    subPurl: function(str) {
      if (str != null) {
        var length = str.length;
        if (length > 15) {
          str = str.slice(0, 12) + ". . ." + str.slice(length - 3, length);
        }
      }
      return str;
    },
    subUrl: function(url) {
      if (url != null) {
        var length = url.length;
        if (length > 8) {
          url = url.slice(0, 5) + ". . ." + url.slice(length - 3, length);
        }
      }
      return url;
    },
    subTitle: function(title) {
      if (title != null) {
        var length = title.length;
        if (length > 6) {
          title = title.slice(0, 3) + ". . ." + title.slice(length - 3, length);
        }
      }
      return title;
    },
    subContent: function(content) {
      if (content != null) {
        var length = content.length;
        if (length > 15) {
          content = content.slice(0, 5) + ". . ." + content.slice(length - 5, length);
        }
      }
      return content;
    }
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
function lookTitle(id, type, tip) {
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

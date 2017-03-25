Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: '#app',
  data: {
    items: {},
    editItem: {}, //要编辑的items中的数据
    layer: null, //弹出框,
    addItem: {}, //增加图
    TotalCount: 0, //总数
    currCount: 15, //当前数据量
    displayCount: 15, //当前页要显示的数据量   
    currPage: 1, //当前页码
    isHide: false, //“加载中”
    SourceType: "", //来源类型
    SourceId: "", //来源ID
    isCustom: true, //判断来源类型是否为自定义
    addValid: true,
    editValid: true,
    isIndent: false, //是否缩进
    promptMsg: "", //提示信息
    Intro: "", //文章内容
    count: 200, //还能输入的内容字数
    token: "Bearer " + window.localStorage.token,
    usrId: window.localStorage.usrId, //用户Id   
    ip: "", //用于服务器
    ip: "http://192.168.31.82", //用于测试
  },
  created: function() {
    if (this.usrId === "" || typeof this.usrId === "undefined") {
      parent.location.href = "login.html";
    } else {
      //富文本编辑器初始化
      // window.editor = new wangEditor('editor');
      // //移除全屏
      // editor.config.menus = $.map(wangEditor.config.menus, function(item, key) {
      //   if (item === 'fullscreen') {
      //     return null;
      //   }
      //   return item;
      // });
      // editor.create();
      this.getList(1, 15);
    }
  },
  methods: {
    getList(index, size) {
      var data = { "Index": index, "Size": size };
      this.$http.post(this.ip + "/api/HDoc/List", data, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(response) {
        if (response.body.Code === 200) {
          this.items = response.body.Data.Content;
          this.displayCount = this.items.length;
          this.TotalCount = response.body.Data.TotalCount;
          this.isHide = true; //加载完毕
        } else {
          if (response.body.Code === 204) {
            this.items = [];
            this.displayCount = 0;
            this.TotalCount = 0;
            document.getElementById("page").innerHTML = "";
          } else {
            layer.msg("服务器错误，请稍后再试", { icon: 2, time: 3000 });
          }
          this.isHide = true;
        }
      }, function(error) {
        // console.log(error);
        this.isHide = true;
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
    //获取当前页面要显示的数据量
    getData(event) {
      this.currCount = event.target.value;
      this.currPage = 1; //防止获取不到数据
      this.getList(1, this.currCount);
    },
    edit(index, id) {
      $("#edit_title").focus();
      // 编辑内容
      this.editItem = this.items[index];
      //计算内容的字数
      var content = this.editItem.Content;
      if (content != null) {
        this.count = 200 - content.length;
      } else {
        this.count = 200;
      }
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
    add() {
      var _this = this;
      $("#add_name").focus();
      this.layer = layer.open({
        type: 1,
        title: "文章增加",
        content: $("#adddoc"),
        area: "600px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭
        end: function() {
          $("#add_name").removeClass("error");
          $("#add_author").removeClass("error");
          $("#add_url").removeClass("error");
          $("#add_originurl").removeClass("error");
          $("#add_content").removeClass("error");
          // $("#add_readcount").removeClass("error");
          // $("#add_cmtcount").removeClass("error");
          $("#add_sourcetype").removeClass("error");
          $("#add_sourceid").removeClass("error");
        }
      });
    },
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
    checkAddItem(id) {
      var el = document.getElementById(id);
      if (el.value.length < 1) {
        el.classList.add("error");
        this.addValid = false;
      } else {
        el.classList.remove("error");
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
    checkContent(id) {
      var _this = this;
      var el = document.getElementById(id);
      var length = el.value.length; //内容的字数长度
      this.count = 200 - length; //还能输入的字数
      if (this.count < 0) {
        this.count = 0;
      }
      if (length < 5 || length > 200) {
        el.classList.add("error");
        if (id == "add_content") {
          _this.addValid = false;
        } else {
          _this.editValid = false;
        }
      } else {
        el.classList.remove("error");
      }
    },
    checkAddFile() {
      var file = document.getElementById("addfile");
      if (file.value === "") {
        layer.msg("请上传文件!", { icon: 0, time: 2500 });
        this.addValid = false;
      } else {
        this.addValid = this.fileSize(file);
      }
    },
    checkEditFile() {
      var file = document.getElementById("editfile");
      if (file.value != "") {
        this.editValid = this.fileSize(file);
      }
    },
    //判断视频大小
    fileSize(id) {
      var filesize = id.files[0].size / 1000000;
      var sizes = this.getFloat(filesize, 1);
      var valid = true;
      if (sizes > 10) {
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
    layer_submit_add() {
      var _this = this;
      this.addValid = true;
      if (this.isCustom) {
        this.checkAddItem('add_name');
        // this.checkAddItem('add_url');
        // this.checkAddItem('add_originurl');
        this.checkAddItem('add_author');
        this.checkContent('add_content');
        // this.checkAddItem('add_readcount');
        // this.checkAddItem('add_cmtcount');
        this.checkAddFile();
      } else {
        this.checkAddItem('add_sourceid');
      }
      if (this.addValid) {
        this.isHide = false; //加载中
        $("#addform").ajaxSubmit({
          url: this.ip + "/api/HDoc/Add",
          type: "post",
          headers: {
            "Authorization": this.token
          },
          success: function(res) {
            if (res.Code === 200) {
              _this.getList(_this.currPage, _this.currCount);
              _this.layer_close();
              layer.msg("添加成功!", { icon: 1, time: 2000 });
              _this.clearData();
            } else {
              _this.isHide = true;
              layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 2000 });
            }
          },
          error: function(err) {
            _this.isHide = true;
            layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 2000 });
          }
        });
      }
    },
    formatData(data) {
      return JSON.parse(JSON.stringify(data));
    },
    clearData() {
      $("#add_name").val("");
      $("#add_url").val("");
      $("#add_originurl").val("");
      $("#add_author").val("");
      $("#add_content").val("");
      // $("#add_readcount").val("");
      // $("#add_cmtcount").val("");
      $("#add_sourcetype").val("");
      $("#add_sourceid").val("");
      $("#addfile").val("");
    },
    layer_submit_edit() {
      var _this = this;
      this.editValid = true;
      this.checkEditItem('edit_title');
      this.checkEditItem('edit_url');
      this.checkEditItem('edit_originurl');
      this.checkEditItem('edit_author');
      this.checkContent('edit_content');
      if (this.editValid) {
        this.isHide = false; //加载中
        $("#editform").ajaxSubmit({
          url: this.ip + "/api/HDoc/Update",
          type: "post",
          headers: {
            "Authorization": this.token
          },
          success: function(res) {
            if (res.Code === 200) {
              _this.getList(_this.currPage, _this.currCount);
              _this.layer_close();
              layer.msg("修改成功!", { icon: 1, time: 2000 });
            } else {
              _this.isHide = true;
              layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 2000 });
            }
          },
          error: function(err) {
            _this.isHide = true;
            layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 2000 });
          }
        });
      }
    },
  },
  watch: {
    SourceType: function(val) {
      //来源类型不是自定义
      if (val != 3) {
        if (val == 1) {
          this.promptMsg = "从微信文章管理中复制";
        } else if (val == 2) {
          this.promptMsg = "从新闻管理中复制";
        } else {
          this.promptMsg = "从社区帖子管理中复制";
        }
        this.isCustom = false;
      } else {
        this.isCustom = true;
      }
    },
  },
  filters: {
    // 给过长的字符串中间加上省略号
    subStr: function(str) {
      if (str && str !== "") {
        var length = str.length;
        if (length > 20) {
          str = str.slice(0, 8) + ". . ." + str.slice(length - 3, length);
        }
      }
      return str;
    },
    subUrl: function(url) {
      if (url && url !== "") {
        var length = url.length;
        if (length > 15) {
          url = url.slice(0, 8) + ". . ." + url.slice(length - 3, length);
        }
      }
      return url;
    },
    subTitle: function(title) {
      if (title && title !== "") {
        var length = title.length;
        if (length > 10) {
          title = title.slice(0, 5) + ". . ." + title.slice(length - 3, length);
        }
      }
      return title;
    },
    subContent: function(content) {
      if (content && content !== "") {
        var length = content.length;
        if (length > 20) {
          content = content.slice(0, 5) + ". . ." + content.slice(length - 3, length);
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
function addTips(id, type, tip) {
  id = "#" + type + id;
  var el = id + ">a";
  layer.tips(tip, el, {
    tips: [1, '#00B271'],
    time: 3000
  });
}

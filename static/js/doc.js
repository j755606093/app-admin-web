Vue.http.options.emulateJSON = true;
var Vue_App = new Vue({
  el: '#app',
  data: {
    items: {},
    editItem: {}, //要编辑的items中的数据
    layer: null, //弹出框,
    addItem: { "Content": "" }, //增加图
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
    firstLoad: true,
    isEdit: true,
    layer_text: "",
    ip: "", //用于服务器
    // ip: "http://192.168.31.82", //用于测试
  },
  created: function() {
    if (!this.usrId) {
      parent.location.href = "login.html";
    } else {
      this.getList(1, 15);
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
    getList(index, size) {
      var _this = this;
      var data = { "Index": index, "Size": size };
      this.$http.post(this.ip + "/api/HDoc/List", data, {
        headers: {
          "Authorization": this.token
        }
      }).then(function(res) {
        if (res.body.Code === 200) {
          _this.items = res.body.Data.Content;
          _this.displayCount = _this.items.length;
          _this.TotalCount = res.body.Data.TotalCount;
        } else {
          if (res.body.Code === 204) {
            _this.items = [];
            _this.displayCount = 0;
            _this.TotalCount = 0;
            document.getElementById("page").innerHTML = "";
          } else {
            layer.msg(res.body.Message, { icon: 2, time: 3000 });
          }
        }
        _this.isHide = true;
      }).catch(function(err) {
        _this.isHide = true;
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
    //获取当前页面要显示的数据量
    getData(event) {
      this.currCount = event.target.value;
      this.currPage = 1; //防止获取不到数据
      this.firstLoad = true;
      this.getList(1, this.currCount);
    },
    edit(index) {
      this.isEdit = true;
      this.editItem = this.items[index];
      //计算内容的字数
      // var content = this.editItem.Content;
      // if (content != null) {
      //   this.count = 200 - content.length;
      // } else {
      //   this.count = 200;
      // }
      if (!this.editItem.SrcContent) {
        var imgItem = this.editItem.Img;
        var videoItem = this.editItem.Video;
        var img = "";
        var video = "";
        //循环替换
        for (var i = 0; i < imgItem.length; i++) {
          img = "<img src=" + imgItem[i].Src + ">";
          this.editItem.Content = this.editItem.Content.replace(imgItem[i].PositionName, img);
        }
        if (videoItem !== null) {
          for (var i = 0; i < videoItem.length; i++) {
            video = "<video src=" + videoItem[i].Src + "></video>";
            this.editItem.Content = this.editItem.Content.replace(videoItem[i].PositionName, video);
          }
        }
        editor.$txt.html(this.editItem.Content);
      } else {
        editor.$txt.html(this.editItem.SrcContent);
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
      // document.getElementById("editfile").value = "";
      document.getElementById("edit_title").classList.remove("error");
      // document.getElementById("edit_author").classList.remove("error");
      document.getElementById("edit_content").classList.remove("error");
    },
    layer_close() {
      layer.close(this.layer);
    },
    add() {
      var _this = this;
      this.layer = layer.open({
        type: 1,
        title: "文章增加",
        content: $("#adddoc"),
        area: "600px",
        skin: 'layui-layer-demo', //样式类名
        anim: 2,
        shadeClose: false, //开启遮罩关闭
        end: function() {
          document.getElementById("add_name").classList.remove("error");
          document.getElementById("add_author").classList.remove("error");
          document.getElementById("add_content").classList.remove("error");
        }
      });
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
    close() {
      layer.close(this.layer_text);
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
      var length = el.value.length;
      if (length < 1) {
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
        layer.msg("请上传文件", { icon: 0, time: 2500 });
        this.addValid = false;
      } else {
        this.addValid = this.fileSize(file);
      }
    },
    // checkEditFile() {
    //   var file = document.getElementById("editfile");
    //   if (file.value != "") {
    //     this.editValid = this.fileSize(file);
    //   }
    // },
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
        this.checkAddItem('add_author');
        this.checkContent('add_content');
        this.checkAddFile();
      } else {
        // this.checkAddItem('add_sourceid');
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
              _this.firstLoad = true;
              _this.getList(1, _this.currCount);
              _this.layer_close();
              layer.msg("添加成功", { icon: 1, time: 2000 });
              _this.clearData();
            } else {
              layer.msg(res.Message, { icon: 2, time: 2000 });
            }
            _this.isHide = true;
          },
          error: function(err) {
            _this.isHide = true;
            layer.msg("服务器错误，请稍后再试", { icon: 2, time: 2000 });
          }
        });
      }
    },
    formatData(data) {
      return JSON.parse(JSON.stringify(data));
    },
    clearData() {
      document.getElementById("add_name").value = "";
      document.getElementById("add_author").value = "";
      document.getElementById("add_content").value = "";
      document.getElementById("addfile").value = "";
    },
    layer_submit_edit() {
      var _this = this;
      this.editValid = true;
      this.checkEditItem('edit_title');
      // this.checkEditItem('edit_author');
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
              _this.setPage();
              _this.layer_close();
              layer.msg("修改成功", { icon: 1, time: 2000 });
            } else {
              layer.msg(res.Message, { icon: 2, time: 2000 });
            }
            _this.isHide = true;
          },
          error: function(err) {
            console.log(err)
            layer.msg("服务器错误，请稍后再试!", { icon: 2, time: 2000 });
            _this.isHide = true;
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
    subStr: function(val) {
      if (!val) {
        return "";
      } else {
        var leng = val.length;
        if (leng > 20) {
          val = val.slice(0, 8) + "..." + val.slice(leng - 3, leng);
        }
        return val;
      }
    },
    subUrl: function(val) {
      if (!val) {
        return "";
      } else {
        var leng = val.length;
        if (leng > 15) {
          val = val.slice(0, 8) + "..." + val.slice(leng - 3, leng);
        }
        return val;
      }
    },
    subTitle: function(val) {
      if (!val) {
        return "";
      } else {
        var leng = val.length;
        if (leng > 10) {
          val = val.slice(0, 6) + "..." + val.slice(leng - 3, leng);
        }
        return val;
      }
    },
    subContent: function(val) {
      if (!val) {
        return "";
      } else {
        var leng = val.length;
        if (leng > 10) {
          val = val.slice(0, 6) + "..." + val.slice(leng - 3, leng);
        }
        return val;
      }
    },
    subAvatar: function(val, n) {
      if (!val) {
        return "";
      } else {
        var arr = val.split(",");
        return arr[n];
      }
    },
    dealAvatar: function(val, n) {
      if (!val) {
        return "";
      } else {
        if (val.indexOf(",") === -1) {
          return val;
        } else {
          return val.slice(0, val.length - 1);
        }
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
//添加提示
function addTips(id, type, tip) {
  id = "#" + type + id;
  var el = id + ">a";
  layer.tips(tip, el, {
    tips: [1, '#00B271'],
    time: 3000
  });
}

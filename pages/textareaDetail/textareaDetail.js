// pages/richtext/richtext.js
const app = getApp();

var posterConfig = {};
var openStatus = true; // 声明一个全局变量判断是否授权保存到相册
var textHeight = 2000; // 文本的UI高度
Page({
  /**
   * 页面的初始数据
   */
  data: {
    text: '',
    imgList: [],
    rentPlanId: '',
    from: '',
    posterConfig: posterConfig,
    allowJump: false,
    to: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options: ', options);
    let that = this;
    this.setData({
      rentPlanId: options.id,
      from: options.from || '',
      posterConfig: {
        "width": 750,
        "height": 1370,
        "scale": 1,
        "fillStyle": "#FFFFFF",
        "children": [
          {
            "type": "group",
            "width": 690,
            "height": textHeight+10,
            "x": 30,
            "y": 30,
            "children": [
              {
                "type": "text",
                "text": "",
                "maxWidth": 670,
                "lineHeight": 32,
                "font": "26px 微软雅黑",
                "color": "#333333",
                "height": "auto",
                "uiheight": textHeight,
                "x": 0,
                "y": 0,
              },
              {
                "type": "group",
                "width": 690,
                "height": 0,
                "x": 0,
                "y": textHeight + 10,
                "children": []
              },
            ]
          }, 
          {
            "type": "group",
            "width": 750,
            "height": 180,
            "x": 0,
            "y": 72,
            "fillStyle": "#f4f4f4",
            "children": [
              {
                "type": "image",
                "width": 100,
                "x": 30,
                "y": 40,
                "url": app.globalData.to.headUrl || "/images/default-person.png",
                "isCircular": true
              },
              {
                "type": "text",
                "maxWidth": 400,
                "maxLine": 1,
                "font": "32px 微软雅黑",
                "color": "#333333",
                "text": app.globalData.to.name || '姓名',
                "x": 150,
                "y": 55,
              },
              {
                "type": "text",
                "maxWidth": 400,
                "maxLine": 1,
                "font": "28px 微软雅黑",
                "color": "#999999",
                "text": app.globalData.to.phone || "400-88888888",
                "x": 150,
                "y": 105,
              },
              {
                "type": "group",
                "width": 150,
                "height": 180,
                "x": 570,
                "y": 0,
                "children": [
                  {
                    "type": "image",
                    "width": 130,
                    "height": 130,
                    "x": "center",
                    "y": 10,
                    "url": "/images/default-house.png",
                    "isCircular": true
                  },
                  {
                    "type": "text",
                    "font": "24px 微软雅黑",
                    "color": "#666666",
                    "text": "长按查看方案",
                    "lineHeight": 20,
                    "x": "center",
                    "y": 145,
                  }
                ]
              }
            ]
          },
        ]
      }
    })

    // 获取并设置底部二维码
    let timer11 = setInterval(() => {
      this.getQrcode(options.id)
      .then((qrcodeUrl) => { 
        if(qrcodeUrl){
          clearInterval(timer11);
          let posterConfig = that.data.posterConfig;
          posterConfig.children[1].children[3].children[0].url = qrcodeUrl;
          that.setData({
            posterConfig,
            allowJump: true
          })
        }
      })
      .catch((err) => {
        console.log("获取小程序二维码失败: ", err);
        that.setData({
          allowJump: false
        })
      });
    }, 300)
    // 获取内容信息
    app.wxRequest("GET", "/rentplan/getRentPlanDetail.json", {
      rentPlanId: options.id
    }, res => {
      console.log('内容获取成功: ', res);
      if(res.code === 200){
        let content = res.to.content;
        content = content.replace(/\n/g,"\\n");
        content = JSON.parse(content);
        
        let text = content.text;
        let imgList = content.imgList;
        let posterConfig = that.data.posterConfig;
        let imgY = 0;  // 图片y值
        if(text){ // 文本
          posterConfig.children[0].children[0].text = text;
        }
        if(imgList.length > 0){ // 图片
          let imageObj = posterConfig.children[0].children[1];  // 图片group
          for(var i=0;i<imgList.length;i++){
            let imgItem = imgList[i];
            let imgHeight = imgItem.height/imgItem.width*690;
            let imgItemConfig = {
              "type": "image",
              "width": 690,
              "height": imgHeight,
              "x": 0,
              "y": imgY + 10, 
              "url": imgItem.url
            }
            imageObj.children.push(imgItemConfig); 
            imgY += 10 + imgHeight;
          }
          imageObj.height = imgY + 10;    // 配置 图片 group的高度
        }
        posterConfig.children[0].height = imgY + 10 + textHeight;        // 配置 图文 group的高度
        posterConfig.children[1].y = imgY + 10 + textHeight + 30 + 30;   // 配置 底部 group的y值
        posterConfig.height = imgY + 10 + textHeight + 30 + 30 + 180;    // 配置 画布 的高度
        // console.log("posterConfig: ", posterConfig);
        that.setData({
          text,
          imgList,
          posterConfig,
          to: res.to
        })
      }else{
        wx.showToast({
          title: '获取方案失败',
          icon: 'fail',
          duration: 2000
        })
        setTimeout(() => {
          wx.navigateBack();
        }, 2000)
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.to.name || "项目宣传",
      path: "/pages/logout/logout?from=textareaDetail&id=" + this.data.rentPlanId,
    }
  },
  goback() {
    if (!this.data.from) {
      wx.navigateBack();
      return;
    }
    wx.showModal({
      // title: '删除图片', 
      content: '确认离开项目宣传预览页？',
      showCancel: true,
      cancelText: "取消",
      confirmText: "确定",
      success: res => {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.navigateBack({
            delta: this.data.from ? 2 : 1
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      },
      fail: function (res) { },//接口调用失败的回调函数
      complete: function (res) { },//接口调用结束的回调函数（调用成功、失败都会执行）
    });
  },
  /**
   * 分享朋友圈
   */
  _toCreatePoster: function() {
    console.log('this.data.posterConfig: ', this.data.posterConfig);
    app.globalData.posterConfig = this.data.posterConfig;
    app.globalData.defaultColor = 'transparent';
    if(this.data.allowJump){
      // 获取用户是否开启用户授权相册
      if (!openStatus) {
        wx.openSetting({
          success: (result) => {
            if (result) {
              console.log(result);
              if (result.authSetting["scope.writePhotosAlbum"] === true) {
                openStatus = true;
                wx.navigateTo({
                  url: '/pages/posters/posters',
                })
              }
            }
          },
          fail: () => {},
          complete: () => {}
        });
      } else {
        wx.getSetting({
          success(res) {
            // 如果没有则获取授权
            if (!res.authSetting['scope.writePhotosAlbum']) {
              wx.authorize({
                scope: 'scope.writePhotosAlbum',
                success() {
                  openStatus = true;
                  wx.navigateTo({
                    url: '/pages/posters/posters',
                  })
                },
                fail() {
                  // 如果用户拒绝过或没有授权，则再次打开授权窗口
                  openStatus = false
                  wx.showToast({
                    title: '请设置允许访问相册',
                    icon: 'none'
                  })
                }
              })
            } else {
              // 有则直接保存
              openStatus = true;
              wx.navigateTo({
                url: '/pages/posters/posters',
              })
            }
          },
          fail(err) {
            console.log(err)
          }
        })
      }
    }else{
      wx.showToast({
        title: '二维码获取失败',
        icon: 'fail',
        duration: 2000
      })
    }
  },
  // 获取分享小程序二维码
  getQrcode(id) {
    return new Promise((resolve, reject) => {
      app.wxRequest("GET", "/rentplan/getQRCodeById.json", { id: id || 27}, res => {
        if (res.code == 200) {
          resolve(res.url);
        }else{
          reject();
          this.setData({
            allowJump: false
          })
        }
      })
    })
  },
})
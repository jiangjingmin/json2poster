//index.js
//获取应用实例
const app = getApp()
var openStatus = true;
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    defaultColor: '#f4f4f4',
    mycardShow: false,
    imageUrl: '',
    noCreated: false,
    isFinish: false,
    showSkeleton: false,
    painting: {}
  },
  onLoad: function () {
    let painting = {
      "status": 0,
      "width": 650,
      "height": 880,
      "scale": 1,
      "fillStyle": "#f4f4f4",
      "loadingMsg": "名片加载中...",
      "autoSave": false,
      "children": [
        {
          "type": "image",
          "width": 500,
          "height": 500,
          "center": true,
          "fixHeight": true,
          "x": 75,
          "y": 40,
          "url": "/images/avatar.jpg"
        },
        {
          "type": "group",
          "width": 650,
          "height": 300,
          "x": 0,
          "y": 580,
          "fillStyle": "#fff",
          "children": [
            {
              "type": "text",
              "maxWidth": 400,
              "maxLine": 1,
              "font": "40px 微软雅黑",
              "color": "#333333",
              "text": '姓名',
              "x": 40,
              "y": 60,
            },
            {
              "type": "text",
              "maxWidth": 400,
              "maxLine": 1,
              "font": "26px 微软雅黑",
              "color": "#999999",
              "text": "电话：400-88888888",
              "x": 40,
              "y": 130,
            },
            {
              "type": "text",
              "maxWidth": 400,
              "maxLine": 1,
              "font": "28px 微软雅黑",
              "color": "#999999",
              "text": "微信：dgadgdsfsdvczxasdfd",
              "x": 40,
              "y": 170,
            },
            {
              "type": "text",
              "maxWidth": 400,
              "maxLine": 1,
              "font": "28px 微软雅黑",
              "color": "#999999",
              "text": "世界联合有限股份公司",
              "x": 40,
              "y": 210,
            }
          ]
        },
        {
          "type": "group",
          "width": 200,
          "height": 300,
          "x": 430,
          "y": 640,
          "fillStyle": "#fff",
          "children": [
            {
              "type": "image",
              "width": 150, 
              "height": 150,
              "x": 25,
              "y": 0,
              "url": "/images/avatar.jpg",
              "isCircular": true
            },
            {
              "type": "text",
              "maxWidth": 200,
              "maxLine": 1,
              "font": "22px 微软雅黑",
              "textAlign": "center",
              "color": "#999999",
              "text": "长按识别二维码",
              "x": 100,
              "y": 170,
            }
          ]
        }
      ]
    };
    this.setData({
      painting
    })
  },
  /* 生成海报 */
  bindCreatePoster: function(e){
    wx.navigateTo({
      url: "../posters/posters"
    })
  },
  /**
   * 2019-09-27
   * 新增分享名片图片
   */
  toShareCard() {
    this.setData({
      mycardShow: true,
      showSkeleton: true
    })
  },
  /**
   * 获取生成的海报临时图片地址
   */
  bindGetImage(e) {
    var res = e.detail;
    console.log("tempFilePath:", res.tempFilePath) 
    if(res.isOk){
      this.setData({
        imageUrl: res.tempFilePath || '/images/skeleton.png',
        showSkeleton: false
      })
      app.globalData.personCard = res.tempFilePath;
      if(this.data.mycardShow){
        wx.hideLoading();
      }
    }
  },

  /**
   * 获取生成海报的完成状态
   */
  bindIsFinish(e){
    var res = e.detail;
    this.setData({
      isFinish: res.isFinish
    })
  },

  // 保存到系统相册
  onSavePoster: function() {
    var that = this;
    // 获取用户是否开启用户授权相册
    if (!openStatus) {
      wx.openSetting({
        success: (result) => {
          if (result) {
            console.log(result);
            if (result.authSetting["scope.writePhotosAlbum"] === true) {
              openStatus = true;
              that.onSaveImageToPhotosAlbum(that.data.imageUrl);
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
                that.onSaveImageToPhotosAlbum(that.data.imageUrl);
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
            openStatus = true
            that.onSaveImageToPhotosAlbum(that.data.imageUrl);
          }
        },
        fail(err) {
          console.log(err)
        }
      })
    }
  },
  onSaveImageToPhotosAlbum: function(imageUrl){
    var that = this;
    if(imageUrl.target){
      imageUrl = imageUrl.target.dataset.imgurl || this.data.imageUrl;
    }
    wx.saveImageToPhotosAlbum({
      filePath: imageUrl,
      success() {
        wx.showToast({
          title: '图片保存成功',
          icon: 'success',
          duration: 3000
        })
      },
      fail(errMsg) {
        console.log('保存失败: ', errMsg);
      }
    })
  },
  onHandelCancel: function(){
    wx.hideLoading();
    this.setData({
      mycardShow: false
    })
  },
})

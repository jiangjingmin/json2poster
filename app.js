//app.js
App({
  onLaunch: function () {
    let that = this;
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    // 获取屏幕宽高
    wx.getSystemInfo({
      success: function (res) {
        let clientWidth = res.windowWidth;
        let ratio = 750 / clientWidth;
        that.globalData.ratio = ratio;
        that.globalData.systemInfo = res;
      },
      fail: function(err){
        console.log("获取不到systemInfo");
      }
    })
  },
  uploadImg: function(fn, number, sourceType) {
    wx.chooseImage({
      count: number || 1, // 默认9
      sizeType: ['compressed'], // 指定只能为压缩图，首先进行一次默认压缩
      sourceType: sourceType || ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (photo) {
        console.log("上传图片 =>", photo)
        wx.showLoading({
          title: '图片上传中...',
          // mask: true
        })
        //-----返回选定照片的本地文件路径列表，获取照片信息-----------
        photo.tempFilePaths.forEach((src, index) => {
          wx.getImageInfo({
            src: src,
            success: function (res) {
              console.log('获取图片成功', res)
              //---------利用canvas压缩图片--------------
              var ratio = 2;
              var canvasWidth = res.width //图片原始长宽
              var canvasHeight = res.height
              while (canvasWidth > 600 || canvasHeight > 600) {// 保证宽高在400以内
                canvasWidth = Math.trunc(res.width / ratio)
                canvasHeight = Math.trunc(res.height / ratio)
                ratio++;
              }
            
              fn(res.path, canvasWidth, canvasHeight, index);

            },  //留一定的时间绘制canvas
            fail: function (res) {
              console.log('fail => ', res)
            }
          })
        })
      }

    })
  },
  makeCavasToImg: function(path, width, height, fn, index) {
    //----------绘制图形并取出图片路径--------------
    var ctx = wx.createCanvasContext(!index ? 'aa' : ['aa', 'bb', 'cc', 'dd', 'ee', 'ff', 'gg', 'hh', 'ii'][index])
    ctx.drawImage(path, 0, 0, width, height)
    ctx.draw(false);
    console.log(!index ? 'aa' : ['aa', 'bb', 'cc', 'dd', 'ee', 'ff', 'gg', 'hh', 'ii'][index])
    setTimeout( () => {
      wx.canvasToTempFilePath({
        canvasId: !index ? 'aa' : ['aa', 'bb', 'cc', 'dd', 'ee', 'ff', 'gg', 'hh', 'ii'][index],
        destWidth: width,
        destHeight: height,
        success: result => {
          console.log('画图成功啦', result.tempFilePath)//最终图片路径
          wx.getFileSystemManager().readFile({
            filePath: result.tempFilePath, //选择图片返回的相对路径
            encoding: 'base64', //编码格式
            success: res => { //成功的回调
              // console.log('data:image/png;base64,' + res.data)
              console.log('生成base64成功')
              var base64 = 'data:image/jpg;base64,' + res.data
              fn(res.imageUrl, base64);
              /* this.wxRequest("POST", "/uploadImg/uploadBase64Img.json", {
                'base64': base64
              }, res => {
                console.log('上传图片成功')
                wx.hideLoading()
                if (res.code == 200) {
                  console.log(res)
                  fn(res.imageUrl, base64);
                } else {
                  wx.hideLoading()
                  wx.showToast({
                    title: '图片上传失败',
                    icon: 'none',
                    duration: 2000
                  })
                }
              }, () => {
                wx.hideLoading()
                wx.showToast({
                  title: '图片上传失败',
                  icon: 'none',
                  duration: 2000
                })
              }, 'form') */
            }
          })
        },
        fail: function (res) {
          console.log(res.errMsg)
        }
      })
    }, 500)
  },
  globalData: {
    ratio: 2,
    systemInfo: '',
    userInfo: null,
    defaultColor: 'transparent',
    isSaved: false
  }
})
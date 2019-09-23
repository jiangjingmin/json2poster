import * as json2canvas from "./utlis/json2canvas";

const app = getApp();
var openStatus = true; // 声明一个全局变量判断是否授权保存到相册

Component({
  properties: {
    painting: {
      type: Object,
      value: {},
    },
    showCanvas: {
      type: Boolean,
      value: true,
    }
  },
  observers: {
    'painting': function (value) {
      if (!this.data.isPainting) {
        if (JSON.stringify(value)) {
          if (value && value.width && value.height) {
            this.readyPigment()
          }
        }
      }
    }
  },
  data: {
    caxId: 'caxId-' + new Date().getTime(),
    canvasId: '',
    width: 100,
    height: 100,
    isPainting: false,
    imageUrl: '',
    isFinish: false,
    noCreated: false
  },
  ctx: null,
  lifetimes: {
    ready() {
      const caxComponent = this.getCaxComponent();
      this.setData({
        canvasId: caxComponent.data.id
      })
      this.data.noCreated && this.setData({
        noCreated: false
      })
      !this.data.hideLoading && wx.showLoading({
        title: this.data.painting.loadingMsg || '长图生成中...',
        duration: 900000
      });
    }
  },
  methods: {
    getCaxComponent() {
      return this.selectComponent('#' + this.data.caxId);
    },
    readyPigment() {
      var that = this;
      this.setData({
        isPainting: true
      })
      const inter = setInterval(() => {
        if (this.data.canvasId) {
          clearInterval(inter)
          this.setData({
            isPainting: true,
          })
          json2canvas.draw(this.data.painting, this.data.caxId, this, (imgError) => {
            if(imgError){
              wx.hideLoading()
              that.setData({
                noCreated: true
              })
              return
            }
            setTimeout(() => {
              that.saveImageToLocal();
            }, 2000)
          });
        }
      }, 300)
    },
    saveImageToLocal() {
      var that = this;
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        canvasId: this.data.canvasId,
        fileType: 'jpg',
        complete: res => {
          if (res.errMsg === 'canvasToTempFilePath:ok') {
            let imageUrl = res.tempFilePath;
            this.setData({
              isPainting: false,
              imageUrl: imageUrl,
              isFinish: true
            })
            this.triggerEvent('isFinish', { isFinish: true })
            !this.data.hideLoading && wx.hideLoading();
            this.triggerEvent('getImage', { tempFilePath: imageUrl, isOk: true })
            if(this.data.painting.autoSave){
              setTimeout(() => {
                this.onSavePoster(imageUrl);
              }, 300)
            }
          } else {
            // 图片生成失败
            !this.data.hideLoading && wx.hideLoading();
            that.setData({
              noCreated: true
            })
            this.triggerEvent('getImage', { isOk: false })
          }
        }
      }, this.getCaxComponent())
    },
    // 保存到系统相册
    onSavePoster: function(imageUrl) {
      var that = this;
      // 获取用户是否开启用户授权相册
      if (!openStatus) {
        wx.openSetting({
          success: (result) => {
            if (result) {
              console.log(result);
              if (result.authSetting["scope.writePhotosAlbum"] === true) {
                openStatus = true;
                that.onSaveImageToPhotosAlbum(imageUrl);
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
                  that.onSaveImageToPhotosAlbum(imageUrl);
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
              that.onSaveImageToPhotosAlbum(imageUrl);
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
      wx.navigateBack({
        delta: 1
      })
    },
    onCreate: function(){
      this.data.noCreated && this.setData({
        noCreated: false
      })
      !this.data.hideLoading && wx.showLoading({
        title: this.data.painting || '长图生成中...',
        duration: 900000
      });
      this.readyPigment()
    }
  }
})
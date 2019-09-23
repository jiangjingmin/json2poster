const app = getApp();
var openStatus = true; // 声明一个全局变量判断是否授权保存到相册
Component({
  properties: {
    config: {
      type: Object,
      value: {},
    },
    preload: { // 是否预下载图片资源
      type: Boolean,
      value: false,
    },
    hideLoading: { // 是否隐藏loading
      type: Boolean,
      value: false,
    }
  },
  data: {
    imageUrl: '',
    isFinish: false,
    noCreated: false,
    noSaved: false,
    defaultColor: 'transparent'
  },
  ready() {
    this.setData({
      defaultColor: app.globalData.defaultColor
    })
    if (this.data.preload) {
      const poster = this.selectComponent('#poster');
      this.downloadStatus = 'doing';
      poster.downloadResource(this.data.config).then(() => {
        this.downloadStatus = 'success';
        this.trigger('downloadSuccess');
      }).catch((e) => {
        this.downloadStatus = 'fail';
        this.trigger('downloadFail', e);
      });
    }
  },
  methods: {
    trigger(event, data) {
      if (this.listener && typeof this.listener[event] === 'function') {
        this.listener[event](data);
      }
    },
    once(event, fun) {
      console.log(typeof this.listener);
      if (typeof this.listener === 'undefined') {
        this.listener = {};
      }
      this.listener[event] = fun;
    },
    downloadResource(reset) {
      return new Promise((resolve, reject) => {
        if (reset) {
          this.downloadStatus = null;
        }
        const poster = this.selectComponent('#poster');
        if (this.downloadStatus && this.downloadStatus !== 'fail') {
          if (this.downloadStatus === 'success') {
            resolve();
          } else {
            this.once('downloadSuccess', () => resolve());
            this.once('downloadFail', (e) => reject(e));
          }
        } else {
          poster.downloadResource(this.data.config)
            .then(() => {
              this.downloadStatus = 'success';
              resolve();
            })
            .catch((e) => reject(e));
        }
      })
    },
    onCreate(reset) {
      this.data.noCreated && this.setData({
        noCreated: false
      })
      !this.data.hideLoading && wx.showLoading({
        title: '长图生成中...',
        duration: 900000
      });
      return this.downloadResource(typeof reset === 'boolean' && reset).then(() => {
        const poster = this.selectComponent('#poster');
        poster.create(this.data.config);
      })
      .catch((err) => {
        !this.data.hideLoading && wx.hideLoading();
        var that = this;
        that.setData({
          noCreated: true
        })
        this.triggerEvent('fail', err);
      })
    },
    onCreateSuccess(e) {
      const {
        detail
      } = e;
      this.setData({
        imageUrl: detail,
        isFinish: true
      })
      !this.data.hideLoading && wx.hideLoading();
      this.triggerEvent('success', detail);
      this.onSavePoster(detail);
    },
    onCreateFail(err) {
      console.error(err);
      this.triggerEvent('fail', err);
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
          that.setData({
            noSaved: false
          })
          wx.showToast({
            title: '图片保存成功',
            icon: 'success',
            duration: 3000
          })
        },
        fail() {
          that.setData({
            noSaved: true
          })
        }
      })
    },
    onHandelCancel: function(){
      wx.navigateBack({
        delta: 1
      })
    }
  }
})
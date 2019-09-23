// pages/textarea/textarea.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tempCanvasId: 'tempCanvasId',
    bottom: 0,
    text: '',
    imgList: [],
    currentHtml: {
      text: '',
      imgList: []
    },
    flag: false,
    minHeight: 0,
    height: 100,
    windowHeight: 0,
    isFocus: true,
    id: '',
    isSaved: false,
    title: '制作项目宣传',
    maxImgNum: 9
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("isSaved: ", this.data.isSaved);
    let that = this;
  },
  onReady: function(){
    let that = this;
    // 获取屏幕宽高
    wx.getSystemInfo({
      success: function (res) {
        let height = 0;
        height = res.windowHeight - 160/app.globalData.ratio
        that.setData({
          height: height,
          windowHeight: res.windowHeight
        })
      },
      fail: function(err){
        console.log("获取不到systemInfo");
      }
    })
  },
  
  /**
   * textarea--获取焦点
   */
  _bindTextAreaFocus: function (e) {
    console.log("height: ", e.detail.height)
    let height = this.data.height;
    height = this.data.windowHeight - e.detail.height - (160 + 122)/app.globalData.ratio
    this.setData({
      bottom: e.detail.height || 0,
      height: height
    })
  },
  /**
   * textarea--输入
   */
  _bindTextAreaInput: function (e) {
    let value = e.detail.value;
    let currentHtml = this.data.currentHtml;
    currentHtml.text = value;
    // console.log('value: ', value);
    this.setData({
      currentHtml,
      isSaved: false,
      flag: value.length > 0 || this.data.imgList.length > 0 ? true : false
    })
  },
  /**
   * textarea--失去焦点
   */
  _bindTextAreaBlur: function (e) {
    this.setData({
      bottom: 0
    })
  },
  /**
   * textarea--键盘高度变化
   */
  _bindKeyboardHeightChange: function(e){
    // console.log('_bindKeyboardHeightChange: ', e);
    this.setData({
      bottom: e.detail.height || 0
    })
  },
  chooseImage(e) {
    let sourceType = e.currentTarget.dataset.type;
    let imgList = this.data.imgList;
    let maxImgNum = this.data.maxImgNum;
    if(imgList && imgList.length >= maxImgNum){
      wx.showToast({
        title: '图片超出9张限制，请删除后再上传',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    app.uploadImg((path, width, height, index) => {
      /// console.log("path: ", path);
      this.index = 0;
      this.setData({
        ['width' + index]: width,
        ['height' + index]: height,
        isSaved: false
      })
      app.makeCavasToImg(path, width, height, (url, base64) => {
        this.index = this.index + 1;
        let currentHtml = this.data.currentHtml;
        imgList.push({
          width: width,
          height: height,
          url: url
        });
        currentHtml.imgList = imgList;
        // console.log('currentHtml: ', currentHtml);
        this.setData({
          imgList: imgList,
          currentHtml,
          flag: imgList.length > 0 ||  this.data.text.length > 0 ? true : false
        })
        wx.showToast({
          title: '第' + this.index + '张上传成功',
        })
      }, index)
    }, maxImgNum - imgList.length, [sourceType])
  },
  deleteImg(e) {
    let imgList = this.data.imgList;
    let currentHtml = this.data.currentHtml;
    imgList.splice(e.currentTarget.dataset.index, 1);
    currentHtml.imgList = imgList;
    this.setData({
      imgList: imgList,
      currentHtml,
      isSaved: false,
      flag: imgList.length > 0 ||  this.data.text.length > 0 ? true : false
    })
  },
  handleImagePreview(e) {
    const idx = e.target.dataset.idx
    const images = this.data.imgList
    let urls = [];
    images.forEach((item) => {
      urls.push(item.url);
    })
    wx.previewImage({
      current: images[idx],
      urls: urls,
    })
  },
  /**
   * 生成方案
   */
  _createPlan() {
    let that = this;
    if (!that.data.id && !this.data.flag) {
      return;
    }
    if(that.data.id && this.data.text === this.data.currentHtml.text && this.data.isSaved){
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/textareaDetail/textareaDetail?from=textarea&id=' + that.data.id,
        })
      }, 1000) 
      return;
    }else{
      console.log("currentHtml: ", JSON.stringify(that.data.currentHtml));
      if(!this.data.isSaved){
        // 保存数据
        wx.setStorageSync({
          key: "content",
          data: JSON.stringify(that.data.currentHtml),
          success: () => {
            wx.showToast({
              title: '生成方案成功',
              icon: 'success',
              duration: 1000
            })
            that.setData({
              isSaved: true
            })
            setTimeout(() => {
              wx.navigateTo({
                url: '/pages/textareaDetail/textareaDetail?from=textarea&id=' + res.recommendbookId,
              })
            }, 1000)
          }
        })
      }
      return;
    } 
  },
  _handleFocus(){
    this.setData({
      isFocus: true
    })
  },
  /**
   * 返回
   */
  goback: function() {
    let that = this;
    if (!that.data.id && !this.data.flag) {
      wx.navigateBack({delta: 1});
      return;
    }
    if(that.data.id && this.data.text === this.data.currentHtml.text && this.data.isSaved){
      wx.navigateBack({delta: 1});
      return;
    } 
    console.log("isSaved: ", this.data.isSaved);
    !this.data.isSaved && wx.showModal({
      // title: '提示',
      content: '是否保存项目宣传内容？',
      confirmText: '保存',
      cancelText: '否',
      success (res) {
        if (res.confirm) {
          // 传数据到后台
          wx.showToast({
            title: '生成方案成功',
            icon: 'success',
            duration: 2000
          }) 
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 2000)
        } else if (res.cancel) {
          console.log('用户点击取消')
          wx.navigateBack({
            delta: 1
          })
        }
      }
    }) 
  },
})
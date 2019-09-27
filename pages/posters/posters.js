// pages/poster/poster.js
import data from './data'

const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: '/images/bg.jpg',
    painting: data,
    defaultColor: '#F4F4F4'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options: ', options);
    this.setData({
      // painting: app.globalData.posterConfig,
      defaultColor: options.bgcolor || this.data.defaultColor
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    app.globalData.posterConfig = {};
  },

  /**
   * 获取生成的海报临时图片地址
   */
  bindGetImage(e) {
    var res = e.detail;
    if(res.isOk){
      // console.log("tempFilePath:", res.tempFilePath) //打印图片的本地路径
      this.setData({
        imgUrl: res.tempFilePath
      })
    }
  },

  /**
   * 获取生成海报的完成状态
   */
  bindIsFinish(e){
    var res = e.detail;
    // console.log("bindIsFinish: ", res);
    this.setData({
      isFinish: res.isFinish
    })
  },
  onHandelCancel: function(){
    wx.navigateBack({
      delta: 1
    })
  },
})
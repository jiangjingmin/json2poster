// pages/poster/poster.js
const app = getApp();
import Poster from '../../components/canvas/poster/poster';
Page({
    /**
     * 页面的初始数据
     */
    data: {
        posterConfig: null,
        defaultColor: ''
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function() {
      this.setData({
        posterConfig: app.globalData.posterConfig,
        defaultColor: app.globalData.defaultColor
      })
      this.onAsyncCreatePoster();
    },
    /**
     * 异步生成海报
     */
    onAsyncCreatePoster() {
      this.setData({
          posterConfig: app.globalData.posterConfig
      }, () => {
          Poster.create(true); // 入参：true为抹掉重新生成
      });
    },
    onUnload: function(){
      app.globalData.posterConfig = {}
    },
    goback: function() {
      wx.navigateBack({
        delta: 1
      });
    },
    onSavePoster: function(res){
      console.log('onSavePoster', res);
    }
})
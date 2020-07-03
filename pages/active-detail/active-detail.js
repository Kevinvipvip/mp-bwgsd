const app = getApp();

Page({
  data: {
    id: 0,
    active_detail: {},
    recommend_list: []
  },


  onLoad(options) {
    this.data.id = options.id;
    wx.showLoading({
      title: '加载中'
    });
    this.get_data(options.id, () => {
      this.guessYouLikeList(() => {
        wx.hideLoading();
      });
    });
  },


  // 获取组合套装
  get_data(id, complete) {
    let post = {
      activity_id: id
    };
    app.ajax('api/activityDetail', post, (res) => {
      wx.setNavigationBarTitle({
        title: res.title
      });
      for (let i = 0; i < res.list.length; i++) {
        app.img_format(res.list[i].pics);
      }
      this.setData({
        active_detail: res
      });
    }, (err) => {
      app.toast(err.message);
    }, () => {
      if (complete) {
        complete();
      }
    });
  },

  // 其他推荐
  guessYouLikeList(complete) {
    app.ajax('my/guessYouLikeList', {}, (res) => {
      for (let i = 0; i < res.length; i++) {
        app.img_format(res[i].pics);
      }
      this.setData({
        recommend_list: res
      });
    }, (err) => {
      app.toast(err.message);
    }, () => {
      if (complete) {
        complete();
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    // if (!this.data.loading) {
    //   this.data.loading = true;

    // this.data.page = 1;
    this.data.recommend_list = [];
    // this.setData({
    //   nomore: false,
    //   nodata: false
    // });

    wx.showNavigationBarLoading();
    this.guessYouLikeList(() => {
      // this.data.loading = false;
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    });
    // }
  },

  // 分享
  onShareAppMessage() {
    wx.showShareMenu();
    return {
      path: app.share_path()
    };
  },
});

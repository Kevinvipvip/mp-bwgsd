const app = getApp();

Page({
  data: {
    type: 0,
    page: 1,
    goods_list: [],
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad(options) {
    this.data.type = parseInt(options.type);
    if (this.data.type === 1) {
      wx.setNavigationBarTitle({ title: '新品限时' });
    } else {
      wx.setNavigationBarTitle({ title: '尖货推荐' });
    }
    this.goods_list();
  },
  bind_input(e) {
    app.bind_input(e, this);
  },
  // 商品列表
  goods_list(complete) {
    let post = {
      type: this.data.type,
      page: this.data.page
    };

    app.ajax('api/goodsList', post, res => {
      for (let i = 0; i < res.length; i++) {
        app.img_format(res[i].pics);
      }

      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            goods_list: [],
            nodata: true,
            nomore: false
          })
        } else {
          this.setData({
            nodata: false,
            nomore: true
          })
        }
      } else {
        this.setData({ goods_list: this.data.goods_list.concat(res) });
      }
      this.data.page++;
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;

      this.reset();

      wx.showNavigationBarLoading();
      this.goods_list(() => {
        this.data.loading = false;
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      });
    }
  },
  // 上拉加载
  onReachBottom() {
    if (!this.data.nomore && !this.data.nodata) {
      if (!this.data.loading) {
        this.data.loading = true;
        wx.showNavigationBarLoading();
        this.goods_list(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 重置数据
  reset() {
    this.data.page = 1;
    this.data.goods_list = [];
    this.setData({
      nomore: false,
      nodata: false
    });
  }
});
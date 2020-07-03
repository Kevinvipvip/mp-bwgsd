const app = getApp();

Page({
  data: {
    full_loading: true,

    search: '',

    slide_list: [],  // 轮播图
    cate_list: [],  // 商品分类
    xinpin_list: [],  // 新品推荐

    page: 1,
    jianhuo_list: [],  // 尖货推荐
    nomore: false,
    nodata: false,
    loading: false,

    video_list: []  // 视频列表
  },
  onLoad() {
    let promise1 = new Promise(resolve => {
      this.slideList(() => {
        resolve();
      });
    });

    let promise2 = new Promise(resolve => {
      this.cateList(() => {
        resolve();
      });
    });

    let promise3 = new Promise(resolve => {
      this.xinpinList(() => {
        resolve();
      });
    });

    let promise4 = new Promise(resolve => {
      this.jianhuoList(() => {
        resolve();
      });
    });

    let promise5 = new Promise(resolve => {
      this.videoList(() => {
        resolve();
      });
    });

    Promise.all([
      promise1, promise2, promise3, promise4, promise5
    ]).then(() => {
      this.setData({ full_loading: false });
    });
  },
  // 获取首页轮播图
  slideList(complete) {
    app.ajax('api/slideList', null, res => {
      app.img_format(res);
      this.setData({ slide_list: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 商品分类列表
  cateList(complete) {
    app.ajax('api/cateList', null, res => {
      app.img_format(res, 'icon');
      this.setData({ cate_list: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 去分类页
  to_cate(e) {
    app.cate.cate_id = e.currentTarget.dataset.cate_id;
    app.cate.change = true;
    wx.switchTab({ url: '/pages/cate/cate' });
  },
  // 跳页
  jump(e) {
    app.jump(e.currentTarget.dataset.url);
  },
  // 新品限时
  xinpinList(complete) {
    let post = {
      type: 1,
      perpage: 4
    };
    this.goodsList(post, res => {
      this.setData({ xinpin_list: res });
    }, () => {
      complete();
    });
  },
  // 尖货推荐
  jianhuoList(complete) {
    let post = {
      page: this.data.page,
      type: 2
    };

    this.goodsList(post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            jianhuo_list: [],
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
        this.setData({ jianhuo_list: this.data.jianhuo_list.concat(res) });
      }
      this.data.page++;
    }, () => {
      complete();
    });
  },
  // 商品列表
  goodsList(post, success, complete) {
    app.ajax('api/goodsList', post, res => {
      for (let i = 0; i < res.length; i++) {
        app.img_format(res[i].pics);
      }
      success(res);
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

      this.data.page = 1;
      this.data.jianhuo_list = [];
      this.setData({
        nomore: false,
        nodata: false
      });

      let promise1 = new Promise(resolve => {
        this.slideList(() => {
          resolve();
        });
      });

      let promise2 = new Promise(resolve => {
        this.cateList(() => {
          resolve();
        });
      });

      let promise3 = new Promise(resolve => {
        this.xinpinList(() => {
          resolve();
        });
      });

      let promise4 = new Promise(resolve => {
        this.jianhuoList(() => {
          resolve();
        });
      });

      let promise5 = new Promise(resolve => {
        this.videoList(() => {
          resolve();
        });
      });

      wx.showNavigationBarLoading();
      Promise.all([
        promise1, promise2, promise3, promise4, promise5
      ]).then(() => {
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
        this.jianhuoList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  bind_input(e) {
    app.bind_input(e, this);
  },
  // 去搜索页
  to_search() {
    wx.navigateTo({ url: '/pages/search/search' });
  },
  // 分享
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  },
  // 视频列表
  videoList(complete) {
    app.ajax('api/videoList', null, res => {
      app.qiniu_format(res, 'video_url');
      app.qiniu_format(res, 'poster');
      this.setData({ video_list: res })
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  }
});
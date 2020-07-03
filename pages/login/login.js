const app = getApp();

Page({
  data: {
  },
  onLoad: function (options) {
    let route = decodeURIComponent(options.route);
    app.login((res) => {
      app.user_data.token = res.token;
      app.user_data.uid = res.uid;

      switch (route) {
        case 'pages/index/index':
        case 'pages/cate/cate':
        case 'pages/shop-car/shop-car':
        case 'pages/my/my':
          wx.switchTab({ url: '/' + route });
          break;
        default:
          wx.redirectTo({ url: '/' + route });
          break;
      }
    });
  }
});
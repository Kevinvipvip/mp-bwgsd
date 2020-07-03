const app = getApp();

Page({
  data: {
    full_loading: true,
    id: 0,
    wuliu: ['已接收', '抵达深圳', '抵达广州'],
    kd_trace: {}
  },
  onLoad(options) {
    this.data.id = options.id;
    this.getKdTrace(() => {
      this.setData({full_loading: false});
    });
  },
  // 获取物流信息
  getKdTrace(complete) {
    app.ajax('my/getKdTrace', { order_id: this.data.id }, res => {
      if (res.Traces) {
        res.Traces.reverse();
      }

      this.setData({ kd_trace: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  }
});
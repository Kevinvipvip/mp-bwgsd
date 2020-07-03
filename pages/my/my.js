const app = getApp();

Page({
  data: {
    user: {
      id: 0,
      user_auth: 0,
      nickname: '',
      username: '',
      sex: 0,
      avatar: '',
      share_auth: 0
    },
    loading: false,

    goods_list: []
  },
  onLoad() {
    this.guessYouLikeList();
    this.create_poster();
  },
  onShow() {
    this.mydetail();
  },
  // 获取个人信息
  mydetail(complete) {
    app.set_common(() => {
      this.setData({
        user: {
          id: app.user_data.uid,
          user_auth: app.user_data.user_auth,
          nickname: app.user_data.nickname || '',
          username: app.user_data.username || '',
          sex: app.user_data.sex,
          avatar: app.user_data.avatar,
          tel: app.user_data.tel || '',
          share_auth: app.user_data.share_auth
        }
      });

      if (complete) {
        complete();
      }
    });
  },
  auth(e) {
    if (e.detail.userInfo) {
      wx.showLoading({
        title: '授权中',
        mask: true
      });

      app.userAuth(res => {
        wx.hideLoading();

        if (res) {
          this.mydetail();
        } else {
          app.toast('授权失败，请重新授权');
        }
      });
    }
  },
  // 猜你喜欢
  guessYouLikeList() {
    app.ajax('my/guessYouLikeList', null, res => {
      for (let i = 0; i < res.length; i++) {
        app.img_format(res[i].pics);
      }
      this.setData({ goods_list: res });
    });
  },
  // 生成海报
  create_poster() {
    let promise1 = new Promise((resolve) => {
      wx.getImageInfo({
        src: app.my_config.base_url + '/static/share01.jpg',
        success: res => {
          resolve(res.path);
        }
      })
    });

    let promise2 = new Promise((resolve) => {
      app.ajax('api/getQrcode', null, res => {
        res = app.img_format(res);
        wx.getImageInfo({
          src: res,
          success: res => {
            resolve(res.path);
          }
        })
      });
    });

    Promise.all([
      promise1, promise2
    ]).then(p_res => {
      let qrcode_bg = p_res[0];
      let qrcode = p_res[1];

      // 创建canvas
      var canvas = wx.createCanvasContext('poster-canvas');

      // 绘制白色背景
      canvas.setFillStyle('#ffffff');
      canvas.rect(0, 0, 500, 800);
      canvas.fill();
      canvas.draw();

      // 绘制背景
      canvas.drawImage(qrcode_bg, 0, 0, 500, 800);
      canvas.draw(true);

      // 绘制小程序码
      canvas.drawImage(qrcode, 277, 563, 200, 200);
      canvas.draw(true);

      setTimeout(() => {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: 500,
          height: 800,
          destWidth: 500,
          destHeight: 800,
          canvasId: 'poster-canvas',
          success: res => {
            this.setData({ poster: res.tempFilePath });
          },
          fail: err => {
            console.log(err, '生成失败');
            // app.toast(JSON.stringify(err));
            // 生成失败
          }
        })
      }, 500);
    });
  },
  // 打开海报
  show_poster() {
    this.setData({ poster_show: true });
  },
  // 关闭海报
  hide_poster() {
    this.setData({ poster_show: false });
  },
  // 保存海报
  save_poster() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.writePhotosAlbum']) {
          wx.saveImageToPhotosAlbum({
            filePath: this.data.poster,
            success: () => {
              app.modal('图片成功保存到相册了，快去分享朋友圈吧', () => {
                this.setData({ poster_show: false });
              });
            },
            fail: err => {
              if (err.errMsg.indexOf('cancel') !== -1) {
                app.toast('保存已取消');
              } else {
                app.toast('保存失败');
              }
            }
          })
        } else {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              this.save_poster();
            },
            fail: () => {
              this.setData({
                show_set_btn: true
              });
            }
          });
        }
      }
    });
  },
  // 关闭授权菜单按钮
  hide_set_btn() {
    this.setData({ show_set_btn: false });
  }
});
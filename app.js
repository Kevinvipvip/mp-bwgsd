const utils = require('utils/util.js');

App({
  onLaunch() {
    wx.getSystemInfo({
      success: res => {
        this.my_config.statusBarHeight = res.statusBarHeight;
        if (res.model.indexOf('iPhone') !== -1) {
          this.my_config.topBarHeight = 44;
        } else {
          this.my_config.topBarHeight = 48;
        }
      }
    });

    let phone = wx.getSystemInfoSync();
    this.is_ios = phone.platform === 'ios';
  },
  is_ios: '',
  my_config: {
    base_url: 'https://shop.bwg.art',
    base_qiniu: 'https://qiniu.bwg.art',
    api: 'https://shop.bwg.art/api/',
    default_img: '/images/default-header.png',
    reg: {
      tel: /^1\d{10}$/,
      phone: /\d{3,4}-\d{7,8}/,
      email: /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/,
      natural: /^([1-9]\d*|0)$/,
      positive: /^[1-9]\d*$/,
      price: /^([1-9]\d*|0)(\.\d{1,2})?$/
    },
    statusBarHeight: 0,
    topBarHeight: 0,
  },
  cate: {
    cate_id: 0,
    change: false
  },
  user_data: {
    token: '',
    uid: 0,
    nickname: '',
    realname: '',
    sex: 0,  // 0.未知 1.男 2.女
    user_auth: 0,  // 0.用户未授权 1.用户已授权
    avatar: '',
    tel: '',
    share_auth: 0  // 是否有查看分享的权限
  },
  mp_update() {
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      console.log(res.hasUpdate, '是否有更新'); // 是否有更新
    });
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否马上重启小程序？',
        success: function (res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    });
    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
    })
  },
  toast(title, duration, icon = 'none') {
    let dura = duration || 2000;
    wx.showToast({
      title: String(title),
      icon: icon,
      duration: dura
    });
  },
  modal(content, callback) {
    wx.showModal({
      title: '提示',
      content: content,
      showCancel: false,
      success() {
        if (callback) {
          callback();
        }
      }
    });
  },
  confirm(content, callback) {
    wx.showModal({
      title: '提示',
      content: content,
      success: res => {
        if (res.confirm) {
          callback();
        }
      }
    });
  },
  ajax(path, data, succ, err, complete) {
    data = data || {};
    if (!data.token) {
      data.token = this.user_data.token;
    }

    wx.request({
      url: this.my_config.api + path,
      method: 'POST',
      dataType: 'json',
      data: data,
      success: res => {
        if (res.data.code !== 1) {
          if (err) {
            err(res.data);
          } else {
            switch (res.data.code) {
              case -3: // token失效
              case -6: // token未传
                let current_pages = getCurrentPages();
                let current_page = current_pages[current_pages.length - 1];
                wx.redirectTo({
                  url: '/pages/login/login?route=' + encodeURIComponent(current_page.route + utils.obj2query(current_page.options))
                });
                break;
              default:
                if (res.data.message) {
                  this.toast(res.data.message);
                } else {
                  this.toast('网络异常');
                }
                break;
            }
          }
         } else {
          if (succ) {
            succ(res.data.data);
          }
        }
      },
      fail() {
        // this.toast('网络异常');
      },
      complete() {
        if (complete) {
          complete();
        }
      }
    });
  },
  // 获取打开的页面
  get_page(page_name) {
    let pages = getCurrentPages();
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].route === page_name) {
        return pages[i];
      }
    }
    return false;
  },
  // input绑定page中的数据
  bind_input(e, page) {
    page.setData({
      [e.currentTarget.dataset['name']]: e.detail.value || ''
    })
  },
  // 创建指定数量元素的数组（flex填充用）
  null_arr(number, line_number) {
    let num = (line_number - number % line_number) % line_number;

    let arr = [];
    arr[num - 1] = null;
    return arr;
  },
  // 创建用来循环元素的空数组
  empty_arr(length) {
    let arr = [];
    for (let i = 0; i < length; i++) {
      arr[i] = null;
    }
    return arr;
  },
  // 小程序登录获取token
  login(callback, inviter_id) {
    this.get_code(code => {
      let post = {
        code: code,
        inviter_id
      };

      this.ajax('login/login', post, (res) => {
        callback(res);
      });
    });
  },
  get_code(callback) {
    wx.login({
      success(login) {
        callback(login.code);
      }
    });
  },
  // 授权获取用户信息
  userAuth(callback) {
    wx.getUserInfo({
      success: user => {
        let post = {
          iv: user.iv,
          encryptedData: user.encryptedData
        };
        this.ajax('login/userAuth', post, () => {
          callback(true);
        }, () => {
          callback(false);
        });
      }
    });
  },
  // 设置一些公共信息
  set_common(complete) {
    this.ajax('my/mydetail', null, res => {
      this.img_format(res, 'avatar');

      this.user_data.uid = res.id;
      this.user_data.nickname = res.nickname || '';
      this.user_data.realname = res.realname || '';
      this.user_data.sex = res.sex;
      this.user_data.user_auth = res.user_auth;
      this.user_data.avatar = res.avatar;
      this.user_data.tel = res.tel || '';
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  redirect_or_switch_or_index(route) {
    if (!route) {
      wx.switchTab({
        url: '/pages/index/index'
      });
    } else {
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
    }
  },
  // 处理图像路径
  img_format(obj, img_field = 'pic') {
    if (obj instanceof Array) {
      if (typeof obj[0] === 'string') {
        for (let i = 0; i < obj.length; i++) {
          obj[i] = this.empty_or(obj[i]);
        }
      } else {
        for (let i = 0; i < obj.length; i++) {
          obj[i][img_field] = this.empty_or(obj[i][img_field]);
        }
      }
    } else if (typeof obj === 'object') {
      obj[img_field] = this.empty_or(obj[img_field]);
    } else {
      return this.empty_or(obj);
    }
  },
  empty_or(img) {
    if (img) {
      if (img.indexOf('https') === 0) {
        return img;
      } else {
        return this.my_config.base_url + '/' + img;
      }
    } else {
      return this.my_config.default_img;
    }
  },
  // 初期七牛路径
  qiniu_format(obj, qiniu_field = 'pic') {
    if (obj instanceof Array) {
      if (typeof obj[0] === 'string') {
        for (let i = 0; i < obj.length; i++) {
          obj[i] = this.qiniu_empty_or(obj[i]);
        }
      } else {
        for (let i = 0; i < obj.length; i++) {
          obj[i][qiniu_field] = this.qiniu_empty_or(obj[i][qiniu_field]);
        }
      }
    } else if (typeof obj === 'object') {
      obj[qiniu_field] = this.qiniu_empty_or(obj[qiniu_field]);
    } else {
      return this.qiniu_empty_or(obj);
    }
  },
  qiniu_empty_or(qiniu) {
    if (qiniu) {
      if (qiniu.indexOf('https') === 0) {
        return qiniu;
      } else {
        return this.my_config.base_qiniu + '/' + qiniu;
      }
    }
  },
  // 从图片路径中去除服务器路径
  img_format_reverse(img) {
    return img.replace(this.my_config.base_url + '/', '');
  },
  // 时间格式化
  time_format(obj, field, fmt) {
    if (obj instanceof Array) {
      for (let i = 0; i < obj.length; i++) {
        if (fmt) {
          obj[i][field] = utils.date_format(obj[i][field], fmt);
        } else {
          obj[i][field] = utils.date_format(obj[i][field]);
        }
      }
    } else {
      if (fmt) {
        obj[field] = utils.date_format(obj[field], fmt);
      } else {
        obj[field] = utils.date_format(obj[field]);
      }
    }
  },
  // 公共跳页方法
  jump(page) {
    if (page) {
      switch (page) {
        case 'index':
        case 'cate':
        case 'shop-car':
        case 'my':
          wx.switchTab({
            url: `/pages/${page}/${page}`
          });
          break;
        default:
          page = page.split('?');
          if (page[1]) {
            wx.navigateTo({
              url: `/pages/${page[0]}/${page[0]}?${page[1]}`
            });
          } else {
            wx.navigateTo({
              url: `/pages/${page[0]}/${page[0]}`
            });
          }
          break;
      }
    }
  },
  // 富文本处理方法
  rich_handle(rich) {
    return rich.replace(/\/ueditor\/php\/upload\//g, this.my_config.base_url + '/ueditor/php/upload/');
  },  // 选择图片并返回
  choose_img(count, callback, maxsize = 524288, ext = ['jpg', 'jpeg', 'png', 'gif']) {
    wx.chooseImage({
      count: count,
      sourceType: ['album', 'camera'],
      success: res => {
        let over_text;
        if (maxsize < 1024) {
          over_text = maxsize + 'B';
        } else if (maxsize < 1048576) {
          over_text = Math.floor(maxsize / 1024) + 'KB';
        } else {
          over_text = Math.floor(maxsize / 1048576) + 'M';
        }

        for (let i = 0; i < res.tempFiles.length; i++) {
          if (res.tempFiles[i].size > maxsize) {
            this.modal('选择的图片不能大于' + over_text);
            return callback(false);
          }

          res.tempFiles[i].ext = res.tempFiles[i].path.substr(res.tempFiles[i].path.lastIndexOf('.') + 1);

          if (ext.indexOf(res.tempFiles[i].ext) === -1) {
            this.modal('请上传合法的文件格式');
            return callback(false);
          }
        }

        callback(res.tempFiles);
      }
    })
  },
  // 返回处理过的分享路径
  share_path(other_options = null) {
    let current_pages = getCurrentPages();
    let current_page = current_pages[current_pages.length - 1];
    let options = this.deepClone(current_page.options);
    if (other_options) {
      Object.assign(options, other_options);
    }

    return '/pages/auth/auth?route=' + encodeURIComponent(current_page.route + utils.obj2query(options));
  },
  // 深克隆
  deepClone(target) {
    let result;
    if (typeof target === 'object') {
      if (Array.isArray(target)) {
        result = [];
        for (let i in target) {
          result.push(deepClone(target[i]))
        }
      } else if (target === null) {
        result = null;
      } else if (target.constructor === RegExp) {
        result = target;
      } else {
        result = {};
        for (let i in target) {
          result[i] = this.deepClone(target[i]);
        }
      }
    } else {
      result = target;
    }
    return result;
  }
});
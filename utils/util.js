const date_format = (date, fmt = 'yyyy.MM.dd') => {
  if (date) {
    // 如果是数字类型
    if (date % 1 === 0) {
      date = new Date(date * 1000);
    }

    var o = {
      "M+": date.getMonth() + 1,                 //月份
      "d+": date.getDate(),                    //日
      "h+": date.getHours(),                   //小时
      "m+": date.getMinutes(),                 //分
      "s+": date.getSeconds(),                 //秒
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度
      "S": date.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt))
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  } else {
    return '';
  }
};

// 对象转query字符串
const obj2query = (obj) => {
  let query = '';
  for (let key in obj) {
    query += key + '=' + obj[key] + '&';
  }
  if (!query) {
    return '';
  } else {
    return '?' + query.substr(0, query.length - 1);
  }
};

module.exports = {
  date_format,
  obj2query
};
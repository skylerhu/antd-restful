// 格式化大数字，用汉字表示，如 10000 表示 1万
export function formatBigNumber(value, digits = 2) {
  let label = value + "";
  let arr = ["千", "万", "十万", "百万", "千万", "亿", "十亿", "百亿", "千亿", "万亿"];
  let e = 0;
  if (value > 100) {
    value = value / 100;
    e += 2;
    for (let i = 0; i < arr.length; i++) {
      if (value >= 10) {
        value = parseFloat((value / 10).toFixed(digits));
        e += 1;
        label = value + arr[i];
      } else {
        break;
      }
    }
    while (value >= 10) {
      value = parseFloat((value / 10).toFixed(digits));
      e += 1;
      label = value + "*10^" + e;
    }
  }
  return label;
}

// 格式化整数，每三位加一个逗号
export function formatInt(value) {
  value = value + "";
  let rgx = /(\d+)(\d{3})/;
  while (rgx.test(value)) {
    value = value.replace(rgx, "$1,$2");
  }
  return value;
}

// 格式化小数，四舍五入，保留两位小数
export function fixedFloat(value, digits = 2) {
  if (value === undefined) {
    return "undefined";
  }
  if (value === null || value === "") {
    return "";
  }
  if (isNaN(value)) {
    return "NaN";
  }
  let v;
  const newV2 = value.toFixed(digits); // 四舍五入,return是字符串
  const newV = parseFloat(newV2); // 去掉后面的0
  if (newV === parseFloat(newV2)) {
    // newV2小数点后都是0
    v = newV.toString();
  } else {
    v = newV2;
  }
  return v;
}

// 格式化小数，每三位加一个逗号
export function formatFloat(value) {
  if (value === undefined || value === null) {
    return "undefined";
  }
  if (value === 0) {
    return value;
  }
  value = fixedFloat(value) + "";
  let x = value.split(".");
  let x1 = x[0];
  let x2 = x.length > 1 ? "." + x[1] : "";
  let rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, "$1,$2");
  }
  return x1 + x2;
}

// 格式化流量，如 1024 表示 1KB
export function formatByte(value) {
  // 流量 1024
  let unit = "";
  let arr = ["K", "M", "G", "T"];
  for (let i = 0; i < arr.length; i++) {
    if (value >= 1024) {
      value = value / 1024;
      unit = arr[i];
    } else {
      break;
    }
  }
  return `${fixedFloat(value)} ${unit}B`;
}

// 格式化带宽，如 1000 表示 1Kbps
export function formatBit(value) {
  // 带宽 1000
  let unit = "";
  let arr = ["K", "M", "G", "T"];
  for (let i = 0; i < arr.length; i++) {
    if (value >= 1000) {
      value = value / 1000;
      unit = arr[i];
    } else {
      break;
    }
  }
  return `${fixedFloat(value)} ${unit}bps`;
}

// 格式化百分比，如 0.5 表示 50%
export function formatPercentage(value, isAbs = false) {
  if (value === undefined) {
    return "undefined";
  }
  if (value === null || value === "") {
    return "";
  }
  // isAbs 值返回正数
  if (isAbs && value < 0) {
    value = -value;
  }
  value = parseFloat((value * 100).toFixed(2));
  return `${value}%`;
}

// 格式化秒数，如 60 表示 1分钟
export function formatSecondsToStr(seconds) {
  if (seconds === null || seconds === undefined) {
    return "-";
  }
  let s = seconds % 60;
  let minutes = parseInt(seconds / 60) % 60;
  let hours = parseInt(seconds / 3600) % 24;
  let days = parseInt(parseInt(seconds / 3600) / 24);
  let ret = s + "秒";
  if (days || hours || minutes) {
    ret = minutes + "分钟" + ret;
  }
  if (days || hours) {
    ret = hours + "小时" + ret;
  }
  if (days) {
    ret = days + "天" + ret;
  }
  return ret;
}

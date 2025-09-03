/**
 * 根据antd版本自动选择时间库并创建日期对象
 * antd4使用moment，antd5+使用dayjs
 */
import { version as antdVersion } from "antd";
import { isString } from "src/common/typeTools";

let moment = null;
let dayjs = null;

// 检测antd版本
export function detectAntdVersion() {
  const majorVersion = parseInt(antdVersion.split(".")[0]);
  return majorVersion;
}

// 懒加载moment
function getMoment() {
  if (moment === null) {
    try {
      moment = require("moment");
    } catch (e) {
      // moment is not installed, please install it for antd4 compatibility
      return null;
    }
  }
  return moment;
}

// 懒加载dayjs
function getDayjs() {
  if (dayjs === null) {
    try {
      dayjs = require("dayjs");
    } catch (e) {
      // dayjs is not installed, please install it for antd5 compatibility
      return null;
    }
  }
  return dayjs;
}

/**
 * 创建日期对象
 * @param {string} dateInput - 日期字符串输入
 * @param {string} format - 日期格式（仅在使用moment时有效）
 * @returns {object|null} 返回对应的日期对象或null
 */
export function createDate(dateInput, format = null) {
  if (!isString(dateInput)) {
    return null;
  }

  const version = detectAntdVersion();

  if (version >= 5) {
    // antd5+ 使用dayjs
    const dayjsInstance = getDayjs();
    if (!dayjsInstance) {
      // dayjs is required for antd5+
      return null;
    }

    try {
      return dayjsInstance(dateInput);
    } catch (e) {
      // Failed to parse date with dayjs
      return null;
    }
  } else {
    // antd4 使用moment
    const momentInstance = getMoment();
    if (!momentInstance) {
      // moment is required for antd4
      return null;
    }

    try {
      if (format) {
        return momentInstance(dateInput, format);
      } else {
        return momentInstance(dateInput);
      }
    } catch (e) {
      // Failed to parse date with moment
      return null;
    }
  }
}

/**
 * 检查是否为有效日期
 * @param {string} dateInput - 日期字符串输入
 * @param {string} format - 日期格式（仅在使用moment时有效）
 * @returns {boolean} 是否为有效日期
 */
export function isValidDate(dateInput, format = null) {
  const date = createDate(dateInput, format);
  if (!date) return false;

  const version = detectAntdVersion();

  if (version >= 5) {
    return date.isValid();
  } else {
    return date.isValid();
  }
}

/**
 * 格式化日期
 * @param {string} dateInput - 日期字符串输入
 * @param {string} format - 输出格式
 * @param {string} inputFormat - 输入格式（仅在使用moment时有效）
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(dateInput, format = "YYYY-MM-DD", inputFormat = null) {
  const date = createDate(dateInput, inputFormat);
  if (!date) return "";

  try {
    return date.format(format);
  } catch (e) {
    // Failed to format date
    return "";
  }
}

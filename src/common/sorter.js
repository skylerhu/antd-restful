import { isArray, isBasicType, isEmpty, isNumber, isString, isBlank } from "./typeTools";
import { FilterType } from "./constants";
/**
 * 定义排序顺序的函数。返回值应该是一个数字，其符号表示两个元素的相对顺序;
 *   - 如果 a 小于 b，返回值为负数
 *   - 如果 a 大于 b，返回值为正数，
 *   - 如果两个元素相等，返回值为 0
 *   - NaN 被视为 0
 *
 * compareFn(a, b) 返回值	排序顺序
 *   - > 0	a 在 b 后，如 [b, a]
 *   - < 0	a 在 b 前，如 [a, b]
 *   - === 0	保持 a 和 b 原来的顺序
 */

// 基本类型排序
export const commonSorter = (a, b) => {
  // 相等
  if (a === b) {
    return 0;
  }
  // undefined 放最后
  if (a === undefined) {
    return -1;
  }
  if (b === undefined) {
    return 1;
  }
  if (a === null) {
    // 空值都放最前面
    return -1;
  }
  if (b === null) {
    return 1;
  }
  // 空字符串放在null后面
  if (a === "") {
    return -1;
  }
  if (b === "") {
    return 1;
  }
  if (isBasicType(a) && isBasicType(b)) {
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    }
    return 0;
  }
  // 其他类型不支持排序
  return 0;
};

export const commonFilter = (input, value, { filterType = FilterType.SEARCH } = {}) => {
  if (isEmpty(input)) {
    return true;
  }
  if (isEmpty(value)) {
    // 如果值为空，则不显示
    return false;
  }
  if (!isBasicType(value)) {
    // 非基本类型不支持筛选
    return false;
  }
  if (filterType === FilterType.RANGE) {
    if (!isNumber(value) || isEmpty(input)) {
      // 非数字值或空值不支持筛选
      return false;
    }
    if (isString(input)) {
      input = input.split(",").map(v => isBlank(v) ? undefined : Number(v));
    }
    if (!isArray(input)) {
      input = [input];
    }
    if (input.length === 2) {
      if (input[0] === undefined && input[1] === undefined) {
        return true;
      } else if (input[0] === undefined) {
        return value <= input[1];
      } else if (input[1] === undefined) {
        return value >= input[0];
      } else {
        return value >= input[0] && value <= input[1];
      }
    } else if (input.length === 1) {
      if (input[0] === undefined) {
        return true;
      } else {
        return value >= input[0];
      }
    } else {
      return false;
    }
  }
  if (isArray(input)) {
    // 数组类型进行递归判断
    return input.some((v) => commonFilter(v, value, { filterType }));
  }
  if (filterType === FilterType.SEARCH && isString(value) && isString(input)) {
    return value.indexOf(input) !== -1;
  }
  return value == input;
};

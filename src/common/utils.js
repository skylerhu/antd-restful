export const isNull = (value) => value === undefined || value === null;

export const isBlank = (value) => isNull(value) || value === "";

export const isBooleanTrue = (value) => ["true", "True", "1", 1, true].includes(value);

export const isBooleanFalse = (value) => ["false", "False", "0", 0, false].includes(value);

export const isAbsBoolean = (value) => typeof value === "boolean";

export const isBoolean = (value) => isBooleanTrue(value) || isBooleanFalse(value);

export const isString = (value) => typeof value === "string";

// 是绝对数字
export const isAbsNumber = (value) => typeof value === "number" && isFinite(value);

// 可能是数字、字符串类型的数值
export const isNumber = (value) => isAbsNumber(value) || (isString(value) && !Number.isNaN(Number(value)));

// 或者：value instanceof Array
export const isArray = (value) => Array.isArray(value);

// 注意 typeof不准确，null / [] 都是 object
export const isDict = (value) => Object.prototype.toString.call(value) === "[object Object]";

// 将数值强制转化成字符串
export const toBeString = (value) => {
  if (isBlank(value)) {
    return "";
  }
  if (isString(value)) {
    return value;
  }
  if (isNumber(value)) {
    return value.toString();
  }
  if (isArray(value)) {
    return value.map((v) => toBeString(v)).join(",");
  }
  if (isDict(value)) {
    return JSON.stringify(value);
  }
  return value;
};

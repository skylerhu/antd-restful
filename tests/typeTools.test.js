import * as types from "src/common/typeTools";

describe("types", () => {
  it("isNull should return true for null/undefined", () => {
    expect(types.isNull(null)).toBe(true);
    expect(types.isNull(undefined)).toBe(true);
    expect(types.isNull(0)).toBe(false);
    expect(types.isNull("")).toBe(false);
  });

  it("isBlank should return true for null/undefined/empty string", () => {
    expect(types.isBlank(null)).toBe(true);
    expect(types.isBlank(undefined)).toBe(true);
    expect(types.isBlank("")).toBe(true);
    expect(types.isBlank(" ")).toBe(false);
    expect(types.isBlank(0)).toBe(false);
  });

  it("isEmpty should return true for blank/empty array/empty object", () => {
    expect(types.isEmpty(null)).toBe(true);
    expect(types.isEmpty([])).toBe(true);
    expect(types.isEmpty({})).toBe(true);
    expect(types.isEmpty([1])).toBe(false);
    expect(types.isEmpty({ a: 1 })).toBe(false);
  });

  it("isBooleanTrue should return true for truthy boolean values", () => {
    expect(types.isBooleanTrue(true)).toBe(true);
    expect(types.isBooleanTrue("true")).toBe(true);
    expect(types.isBooleanTrue("1")).toBe(true);
    expect(types.isBooleanTrue(1)).toBe(true);
    expect(types.isBooleanTrue(false)).toBe(false);
  });

  it("isBooleanFalse should return true for falsy boolean values", () => {
    expect(types.isBooleanFalse(false)).toBe(true);
    expect(types.isBooleanFalse("false")).toBe(true);
    expect(types.isBooleanFalse("0")).toBe(true);
    expect(types.isBooleanFalse(0)).toBe(true);
    expect(types.isBooleanFalse(true)).toBe(false);
  });

  it("isAbsBoolean should return true only for boolean type", () => {
    expect(types.isAbsBoolean(true)).toBe(true);
    expect(types.isAbsBoolean(false)).toBe(true);
    expect(types.isAbsBoolean("true")).toBe(false);
    expect(types.isAbsBoolean(1)).toBe(false);
  });

  it("isBoolean should return true for any boolean-like value", () => {
    expect(types.isBoolean(true)).toBe(true);
    expect(types.isBoolean("true")).toBe(true);
    expect(types.isBoolean("0")).toBe(true);
    expect(types.isBoolean("string")).toBe(false);
  });

  it("isString should return true for string type", () => {
    expect(types.isString("test")).toBe(true);
    expect(types.isString(123)).toBe(false);
    expect(types.isString(null)).toBe(false);
  });

  it("isFunction should return true for function type", () => {
    expect(types.isFunction(() => {})).toBe(true);
    expect(types.isFunction("function")).toBe(false);
  });

  it("isAbsNumber should return true for finite numbers", () => {
    expect(types.isAbsNumber(123)).toBe(true);
    expect(types.isAbsNumber(Infinity)).toBe(false);
    expect(types.isAbsNumber("123")).toBe(false);
  });

  it("isNumber should return true for number or numeric string", () => {
    expect(types.isNumber(123)).toBe(true);
    expect(types.isNumber("123")).toBe(true);
    expect(types.isNumber("abc")).toBe(false);
  });

  it("isArray should return true for arrays", () => {
    expect(types.isArray([])).toBe(true);
    expect(types.isArray({})).toBe(false);
  });

  it("isDict should return true for plain objects", () => {
    expect(types.isDict({})).toBe(true);
    expect(types.isDict(null)).toBe(false);
    expect(types.isDict([])).toBe(false);
  });
});

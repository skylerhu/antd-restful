import * as sorter from "src/common/sorter";
import { tableSorterToApiSorter, apiSorterToTableSorterDict } from "src/common/parser";
import { SorterEnum, FilterType } from "src/common/constants";

describe("sorter module", () => {
  describe("commonSorter", () => {
    // 测试基本类型排序
    describe("基本类型排序", () => {
      test("数字排序", () => {
        expect(sorter.commonSorter(1, 2)).toBe(-1);
        expect(sorter.commonSorter(2, 1)).toBe(1);
        expect(sorter.commonSorter(1, 1)).toBe(0);
        expect(sorter.commonSorter(0, 1)).toBe(-1);
        expect(sorter.commonSorter(-1, 0)).toBe(-1);
        expect(sorter.commonSorter(-2, -1)).toBe(-1);
      });

      test("字符串排序", () => {
        expect(sorter.commonSorter("a", "b")).toBe(-1);
        expect(sorter.commonSorter("b", "a")).toBe(1);
        expect(sorter.commonSorter("a", "a")).toBe(0);
        expect(sorter.commonSorter("apple", "banana")).toBe(-1);
        expect(sorter.commonSorter("banana", "apple")).toBe(1);
      });

      test("布尔值排序", () => {
        expect(sorter.commonSorter(true, false)).toBe(1);
        expect(sorter.commonSorter(false, true)).toBe(-1);
        expect(sorter.commonSorter(true, true)).toBe(0);
        expect(sorter.commonSorter(false, false)).toBe(0);
      });

      test("混合类型排序", () => {
        expect(sorter.commonSorter(1, "2")).toBe(-1);
        expect(sorter.commonSorter("2", 1)).toBe(1);
        expect(sorter.commonSorter(true, 1)).toBe(0); // true会被转换成1
        expect(sorter.commonSorter(false, 0)).toBe(0); // false会被转换成0
      });
    });

    // 测试空值处理
    describe("空值处理", () => {
      test("null值排序", () => {
        expect(sorter.commonSorter(null, 1)).toBe(-1);
        expect(sorter.commonSorter(1, null)).toBe(1);
        expect(sorter.commonSorter(null, null)).toBe(0);
        expect(sorter.commonSorter(null, "")).toBe(-1);
      });

      test("undefined值排序", () => {
        expect(sorter.commonSorter(undefined, 1)).toBe(-1);
        expect(sorter.commonSorter(1, undefined)).toBe(1);
        expect(sorter.commonSorter(undefined, undefined)).toBe(0);
        expect(sorter.commonSorter(undefined, null)).toBe(-1);
      });

      test("空字符串排序", () => {
        expect(sorter.commonSorter("", 1)).toBe(-1);
        expect(sorter.commonSorter(1, "")).toBe(1);
        expect(sorter.commonSorter("", "")).toBe(0);
        expect(sorter.commonSorter("", "a")).toBe(-1);
      });

      test("空值排序顺序", () => {
        // 测试空值的排序顺序：null < "" < 其他值 < undefined
        const values = [undefined, "a", null, "", 1];
        const sorted = values.sort(sorter.commonSorter);
        expect(sorted).toEqual([null, "", "a", 1, undefined]);
      });

      test("空值与undefined的排序", () => {
        expect(sorter.commonSorter(null, undefined)).toBe(1);
        expect(sorter.commonSorter("", undefined)).toBe(1);
        expect(sorter.commonSorter(0, undefined)).toBe(1);
        expect(sorter.commonSorter("a", undefined)).toBe(1);
      });
    });

    // 测试边界值和特殊值
    describe("边界值和特殊值", () => {
      test("NaN值处理", () => {
        expect(sorter.commonSorter(NaN, 1)).toBe(0); // NaN被视为0
        expect(sorter.commonSorter(1, NaN)).toBe(0);
        expect(sorter.commonSorter(NaN, NaN)).toBe(0);
      });

      test("Infinity值处理", () => {
        expect(sorter.commonSorter(Infinity, 1)).toBe(0); // 非基本类型比较
        expect(sorter.commonSorter(-Infinity, 1)).toBe(0);
        expect(sorter.commonSorter(Infinity, -Infinity)).toBe(0);
      });

      test("零值处理", () => {
        expect(sorter.commonSorter(0, 1)).toBe(-1);
        expect(sorter.commonSorter(1, 0)).toBe(1);
        expect(sorter.commonSorter(0, 0)).toBe(0);
        expect(sorter.commonSorter(0, -1)).toBe(1);
      });

      test("负数处理", () => {
        expect(sorter.commonSorter(-1, 1)).toBe(-1);
        expect(sorter.commonSorter(1, -1)).toBe(1);
        expect(sorter.commonSorter(-2, -1)).toBe(-1);
        expect(sorter.commonSorter(-1, -2)).toBe(1);
      });

      test("字符串数字比较", () => {
        expect(sorter.commonSorter("1", "2")).toBe(-1);
        expect(sorter.commonSorter("10", "2")).toBe(-1); // 字符串比较
        expect(sorter.commonSorter("2", "10")).toBe(1);
      });

      test("布尔值与数字比较", () => {
        expect(sorter.commonSorter(true, 1)).toBe(0); // 基本类型比较
        expect(sorter.commonSorter(false, 0)).toBe(0);
        expect(sorter.commonSorter(true, 2)).toBe(-1);
        expect(sorter.commonSorter(false, -1)).toBe(1);
      });
    });

    // 测试混合类型比较
    describe("混合类型比较", () => {
      test("数字与字符串比较", () => {
        expect(sorter.commonSorter(1, "2")).toBe(-1);
        expect(sorter.commonSorter("2", 1)).toBe(1);
        expect(sorter.commonSorter(1, "1")).toBe(0);
      });

      test("布尔值与字符串比较", () => {
        expect(sorter.commonSorter(true, "true")).toBe(0); // 基本类型比较
        expect(sorter.commonSorter("true", true)).toBe(0);
        expect(sorter.commonSorter(false, "false")).toBe(0);
      });

      test("不同类型的基本类型比较", () => {
        expect(sorter.commonSorter(1, true)).toBe(0); // 基本类型比较
        expect(sorter.commonSorter(true, 1)).toBe(0);
        expect(sorter.commonSorter("a", 1)).toBe(0);
        expect(sorter.commonSorter(1, "a")).toBe(0);
      });
    });

    // 测试非基本类型
    describe("非基本类型", () => {
      test("对象排序", () => {
        const obj1 = { a: 1 };
        const obj2 = { b: 2 };
        expect(sorter.commonSorter(obj1, obj2)).toBe(0);
        expect(sorter.commonSorter(obj1, obj1)).toBe(0);
      });

      test("数组排序", () => {
        const arr1 = [1, 2, 3];
        const arr2 = [4, 5, 6];
        expect(sorter.commonSorter(arr1, arr2)).toBe(0);
        expect(sorter.commonSorter(arr1, arr1)).toBe(0);
      });

      test("函数排序", () => {
        const func1 = () => {};
        const func2 = () => {};
        expect(sorter.commonSorter(func1, func2)).toBe(0);
        expect(sorter.commonSorter(func1, func1)).toBe(0);
      });

      test("基本类型与非基本类型混合", () => {
        const obj = { a: 1 };
        expect(sorter.commonSorter(1, obj)).toBe(0);
        expect(sorter.commonSorter(obj, 1)).toBe(0);
      });
    });

    // 测试实际数组排序
    describe("实际数组排序", () => {
      test("数字数组排序", () => {
        const arr = [3, 1, 4, 1, 5, 9, 2, 6];
        const sorted = arr.sort(sorter.commonSorter);
        expect(sorted).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
      });

      test("字符串数组排序", () => {
        const arr = ["banana", "apple", "cherry", "date"];
        const sorted = arr.sort(sorter.commonSorter);
        expect(sorted).toEqual(["apple", "banana", "cherry", "date"]);
      });

      test("包含空值的数组排序", () => {
        const arr = [3, null, 1, "", undefined, 2];
        const sorted = arr.sort(sorter.commonSorter);
        // 空值应该在前面; undefined会默认放到最后
        expect(sorted.slice(0, 3)).toEqual([null, "", 1]);
        expect(sorted.slice(3)).toEqual([2, 3, undefined]);
      });
    });
  });

  describe("commonFilter", () => {
    // 测试基本过滤功能
    describe("基本过滤", () => {
      test("空输入应该返回true", () => {
        expect(sorter.commonFilter("", "test")).toBe(true);
        expect(sorter.commonFilter(null, "test")).toBe(true);
        expect(sorter.commonFilter(undefined, "test")).toBe(true);
      });

      test("空值应该返回false", () => {
        expect(sorter.commonFilter("test", "")).toBe(false);
        expect(sorter.commonFilter("test", null)).toBe(false);
        expect(sorter.commonFilter("test", undefined)).toBe(false);
      });

      test("精确匹配", () => {
        expect(sorter.commonFilter("test", "test")).toBe(true);
        expect(sorter.commonFilter("test", "TEST")).toBe(false);
        expect(sorter.commonFilter(123, 123)).toBe(true);
        expect(sorter.commonFilter(123, "123")).toBe(true); // 使用 == 比较
      });

      test("filterType选项", () => {
        expect(sorter.commonFilter("te", "test", { filterType: FilterType.EQUAL })).toBe(false);
        expect(sorter.commonFilter("test", "test", { filterType: FilterType.EQUAL })).toBe(true);
      });

      test("SEARCH类型测试", () => {
        // 默认就是 SEARCH 类型
        expect(sorter.commonFilter("te", "test")).toBe(true);
        expect(sorter.commonFilter("test", "test")).toBe(true);
        expect(sorter.commonFilter("abc", "test")).toBe(false);

        // 明确指定 SEARCH 类型
        expect(sorter.commonFilter("te", "test", { filterType: FilterType.SEARCH })).toBe(true);
        expect(sorter.commonFilter("est", "test", { filterType: FilterType.SEARCH })).toBe(true);
        expect(sorter.commonFilter("TEST", "test", { filterType: FilterType.SEARCH })).toBe(false); // 区分大小写
      });

      test("RANGE类型测试", () => {
        // 数字范围测试
        expect(sorter.commonFilter("10,20", 15, { filterType: FilterType.RANGE })).toBe(true);
        expect(sorter.commonFilter("10,20", 5, { filterType: FilterType.RANGE })).toBe(false);
        expect(sorter.commonFilter("10,20", 25, { filterType: FilterType.RANGE })).toBe(false);
        expect(sorter.commonFilter("10,20", 10, { filterType: FilterType.RANGE })).toBe(true); // 包含边界
        expect(sorter.commonFilter("10,20", 20, { filterType: FilterType.RANGE })).toBe(true); // 包含边界

        // 单个数字测试（最小值）
        expect(sorter.commonFilter("10", 15, { filterType: FilterType.RANGE })).toBe(true);
        expect(sorter.commonFilter("10", 5, { filterType: FilterType.RANGE })).toBe(false);
        expect(sorter.commonFilter("10", 10, { filterType: FilterType.RANGE })).toBe(true);

        // 数组格式测试
        expect(sorter.commonFilter([10, 20], 15, { filterType: FilterType.RANGE })).toBe(true);
        expect(sorter.commonFilter([10], 15, { filterType: FilterType.RANGE })).toBe(true);

        // 非数字值应该返回 false
        expect(sorter.commonFilter("10,20", "test", { filterType: FilterType.RANGE })).toBe(false);
        expect(sorter.commonFilter("10,20", true, { filterType: FilterType.RANGE })).toBe(false);

        // 空输入应该返回 true
        expect(sorter.commonFilter("", 15, { filterType: FilterType.RANGE })).toBe(true);
        expect(sorter.commonFilter(null, 15, { filterType: FilterType.RANGE })).toBe(true);
      });
    });

    // 测试字符串包含过滤
    describe("字符串包含过滤", () => {
      test("字符串包含", () => {
        expect(sorter.commonFilter("te", "test")).toBe(true);
        expect(sorter.commonFilter("est", "test")).toBe(true);
        expect(sorter.commonFilter("abc", "test")).toBe(false);
        expect(sorter.commonFilter("TEST", "test")).toBe(false); // 区分大小写
      });

      test("完整字符串匹配", () => {
        expect(sorter.commonFilter("test", "test")).toBe(true);
        expect(sorter.commonFilter("", "test")).toBe(true); // 空字符串包含在任何字符串中
      });
    });

    // 测试数组过滤
    describe("数组过滤", () => {
      test("数组包含匹配项", () => {
        expect(sorter.commonFilter(["a", "b", "c"], "test")).toBe(false);
        expect(sorter.commonFilter(["te", "b", "c"], "test")).toBe(true);
        expect(sorter.commonFilter(["a", "test", "c"], "test")).toBe(true);
      });

      test("空数组", () => {
        expect(sorter.commonFilter([], "test")).toBe(true);
      });

      test("嵌套数组", () => {
        expect(sorter.commonFilter([["te"], "b"], "test")).toBe(true);
        expect(sorter.commonFilter([["abc"], "b"], "test")).toBe(false);
      });
    });

    // 测试非基本类型值
    describe("非基本类型值", () => {
      test("对象值应该返回false", () => {
        expect(sorter.commonFilter("test", { a: 1 })).toBe(false);
        expect(sorter.commonFilter(["test"], { a: 1 })).toBe(false);
      });

      test("数组值应该返回false", () => {
        expect(sorter.commonFilter("test", [1, 2, 3])).toBe(false);
        expect(sorter.commonFilter(["test"], [1, 2, 3])).toBe(false);
      });

      test("函数值应该返回false", () => {
        const func = () => {};
        expect(sorter.commonFilter("test", func)).toBe(false);
        expect(sorter.commonFilter(["test"], func)).toBe(false);
      });
    });
  });

  // 测试排序转换函数
  describe("排序转换函数", () => {
    describe("tableSorterToApiSorter", () => {
      test("升序转换", () => {
        const sorter = { field: "name", order: SorterEnum.ASCEND };
        expect(tableSorterToApiSorter(sorter)).toBe("name");
      });

      test("降序转换", () => {
        const sorter = { field: "name", order: SorterEnum.DESCEND };
        expect(tableSorterToApiSorter(sorter)).toBe("-name");
      });

      test("空值处理", () => {
        expect(tableSorterToApiSorter(null)).toBeUndefined();
        expect(tableSorterToApiSorter(undefined)).toBeUndefined();
        expect(tableSorterToApiSorter({})).toBeUndefined();
      });

      test("数组排序器", () => {
        const sorters = [
          { field: "name", order: SorterEnum.ASCEND },
          { field: "age", order: SorterEnum.DESCEND }
        ];
        expect(tableSorterToApiSorter(sorters)).toEqual(["name", "-age"]);
      });

      test("无效排序器", () => {
        const sorter = { field: "name", order: "invalid" };
        expect(tableSorterToApiSorter(sorter)).toBeUndefined();
      });
    });

    describe("apiSorterToTableSorterDict", () => {
      test("升序转换", () => {
        expect(apiSorterToTableSorterDict("name")).toEqual({ name: SorterEnum.ASCEND });
        expect(apiSorterToTableSorterDict("+name")).toEqual({ name: SorterEnum.ASCEND });
      });

      test("降序转换", () => {
        expect(apiSorterToTableSorterDict("-name")).toEqual({ name: SorterEnum.DESCEND });
      });

      test("空值处理", () => {
        expect(apiSorterToTableSorterDict(null)).toEqual({});
        expect(apiSorterToTableSorterDict(undefined)).toEqual({});
        expect(apiSorterToTableSorterDict("")).toEqual({});
      });

      test("数组排序器", () => {
        const sorters = ["name", "-age", "+score"];
        expect(apiSorterToTableSorterDict(sorters)).toEqual({
          name: SorterEnum.ASCEND,
          age: SorterEnum.DESCEND,
          score: SorterEnum.ASCEND
        });
        const sorters2 = ["name,-age,+score"];
        expect(apiSorterToTableSorterDict(sorters2)).toEqual({
          name: SorterEnum.ASCEND,
          age: SorterEnum.DESCEND,
          score: SorterEnum.ASCEND
        });
      });

      test("复杂字段名", () => {
        expect(apiSorterToTableSorterDict("-userName")).toEqual({ userName: SorterEnum.DESCEND });
        expect(apiSorterToTableSorterDict("createdAt")).toEqual({ createdAt: SorterEnum.ASCEND });
      });
    });
  });
});
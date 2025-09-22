import * as parser from "src/common/parser";
import { FieldType } from "src/common/constants";

describe("Parser", () => {
  describe("commonFormat", () => {
    test("should format template with values", () => {
      expect(parser.commonFormat("Hello {0}, welcome to {1}!", "John", "React")).toBe("Hello John, welcome to React!");
      expect(parser.commonFormat("User {name} has {count} items", { name: "Alice", count: 5 })).toBe(
        "User Alice has 5 items"
      );
    });

    test("should handle empty template", () => {
      expect(parser.commonFormat("", "value")).toBe("value");
      expect(parser.commonFormat(null, "value")).toBe("value");
      expect(parser.commonFormat(undefined, "value")).toBe("value");
    });

    test("should handle multiple values", () => {
      expect(parser.commonFormat("", "value1", "value2")).toBe('["value1","value2"]');
    });
  });

  describe("findDataByPath", () => {
    const testData = {
      user: {
        name: "John",
        details: {
          age: 30,
          address: {
            city: "New York",
            zipCode: "10001",
          },
        },
      },
      items: [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
      ],
    };

    test("should find data by path", () => {
      expect(parser.findDataByPath(testData, "user.name")).toBe("John");
      expect(parser.findDataByPath(testData, "user.details.age")).toBe(30);
      expect(parser.findDataByPath(testData, "user.details.address.city")).toBe("New York");
      expect(parser.findDataByPath(testData, "items.0.name")).toBe("Item 1");
    });

    test("should return default value when path not found", () => {
      expect(parser.findDataByPath(testData, "non.existent.path", "default")).toBe("default");
      expect(parser.findDataByPath(testData, "non.existent.path")).toBeUndefined();
    });

    test("should return data when path is empty", () => {
      expect(parser.findDataByPath(testData, "")).toBe(testData);
      expect(parser.findDataByPath(testData, null)).toBe(testData);
      expect(parser.findDataByPath(testData, undefined)).toBe(testData);
    });
  });

  describe("toBeString", () => {
    test("should convert basic types to string", () => {
      expect(parser.toBeString("hello")).toBe("hello");
      expect(parser.toBeString(123)).toBe("123");
      expect(parser.toBeString(true)).toBe("true");
      expect(parser.toBeString(false)).toBe("false");
    });

    test("should handle empty values", () => {
      expect(parser.toBeString(null)).toBe("");
      expect(parser.toBeString(undefined)).toBe("");
      expect(parser.toBeString("")).toBe("");
    });

    test("should handle arrays with depth", () => {
      expect(parser.toBeString(["a", "b", "c"], ",", 1)).toBe("a,b,c");
      expect(parser.toBeString(["a", "b", "c"], "|", 1)).toBe("a|b|c");
      expect(parser.toBeString([1, 2, 3], ",", 1)).toBe("1,2,3");
      expect(
        parser.toBeString(
          [
            ["a", "b"],
            ["c", "d"],
          ],
          ",",
          2
        )
      ).toBe("a,b,c,d");
    });

    test("should stringify objects without depth", () => {
      expect(parser.toBeString({ name: "John", age: 30 })).toBe('{"name":"John","age":30}');
      expect(parser.toBeString([1, 2, 3])).toBe("[1,2,3]");
    });
  });

  describe("findTreeOptionsByValues", () => {
    const treeOptions = [
      {
        value: "1",
        label: "Option 1",
        children: [
          { value: "1-1", label: "Option 1-1" },
          { value: "1-2", label: "Option 1-2" },
        ],
      },
      {
        value: "2",
        label: "Option 2",
        children: [
          { value: "2-1", label: "Option 2-1" },
          { value: "2-2", label: "Option 2-2" },
        ],
      },
    ];

    test("should find tree options by values", () => {
      const result = parser.findTreeOptionsByValues(treeOptions, ["1", "2-1"]);
      expect(result).toHaveLength(2);
      expect(result[0].value).toBe("1");
      expect(result[1].value).toBe("2");
      expect(result[1].children).toHaveLength(1);
      expect(result[1].children[0].value).toBe("2-1");
    });

    test("should return empty array for empty inputs", () => {
      expect(parser.findTreeOptionsByValues([], ["1"])).toEqual([]);
      expect(parser.findTreeOptionsByValues(treeOptions, [])).toEqual([]);
    });

    test("should handle custom key names", () => {
      const customOptions = [
        {
          id: "1",
          name: "Option 1",
          sub: [{ id: "1-1", name: "Sub Option 1-1" }],
        },
      ];
      const result = parser.findTreeOptionsByValues(customOptions, ["1-1"], "id", "sub");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });
  });

  describe("treeValuesToLabels", () => {
    const treeOptions = [
      {
        value: "1",
        label: "Option 1",
        children: [
          { value: "1-1", label: "Option 1-1" },
          { value: "1-2", label: "Option 1-2" },
        ],
      },
      {
        value: "2",
        label: "Option 2",
        children: [{ value: "2-1", label: "Option 2-1" }],
      },
    ];

    test("should convert tree values to labels", () => {
      expect(parser.treeValuesToLabels(["1", "1-1"], treeOptions)).toEqual(["Option 1", "Option 1-1"]);
      expect(parser.treeValuesToLabels(["2", "2-1"], treeOptions)).toEqual(["Option 2", "Option 2-1"]);
    });

    test("should handle single value", () => {
      expect(parser.treeValuesToLabels("1", treeOptions)).toEqual(["Option 1"]);
    });

    test("should return original values when not found", () => {
      expect(parser.treeValuesToLabels(["3", "3-1"], treeOptions)).toEqual(["3", "3-1"]);
    });

    test("should handle empty inputs", () => {
      expect(parser.treeValuesToLabels([], treeOptions)).toEqual([]);
      expect(parser.treeValuesToLabels(["1"], [])).toEqual(["1"]);
    });
  });

  describe("findLabelFromTreeData", () => {
    const treeData = [
      {
        value: "1",
        label: "Option 1",
        children: [
          { value: "1-1", label: "Option 1-1" },
          { value: "1-2", label: "Option 1-2" },
        ],
      },
      {
        value: "2",
        label: "Option 2",
      },
    ];

    test("should find label from tree data", () => {
      expect(parser.findLabelFromTreeData("1", treeData)).toBe("Option 1");
      expect(parser.findLabelFromTreeData("2", treeData)).toBe("Option 2");
      expect(parser.findLabelFromTreeData("1-1", treeData)).toBe("Option 1-1");
    });

    test("should return empty string when not found", () => {
      expect(parser.findLabelFromTreeData("3", treeData)).toBe("");
    });

    test("should return original value when tree data is empty", () => {
      expect(parser.findLabelFromTreeData("1", [])).toBe("1");
    });
  });

  describe("transformValue", () => {
    const options = [
      { value: "1", label: "Option 1" },
      { value: "2", label: "Option 2" },
    ];

    test("should transform simple values", () => {
      const result = parser.transformValue("test", {});
      expect(result).toEqual({
        value: "test",
        label: "test",
        data: "test",
      });
    });

    test("should transform object values", () => {
      const obj = { id: "1", name: "John" };
      const result = parser.transformValue(obj, {
        fieldValue: "id",
        labelTemplate: "Name: {name}",
      });
      expect(result).toEqual({
        value: "1",
        label: "Name: John",
        data: obj,
      });
    });

    test("should transform array values", () => {
      const result = parser.transformValue(["a", "b"], {});
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ value: "a", label: "a", data: "a" });
      expect(result[1]).toEqual({ value: "b", label: "b", data: "b" });
    });

    test("should handle options lookup", () => {
      const result = parser.transformValue("1", {
        options,
        fieldValue: "value",
        labelTemplate: "Label: {label}",
      });
      expect(result).toEqual({
        value: "1",
        label: "Label: Option 1",
        data: "1",
      });
    });
  });

  describe("queryString", () => {
    test("should parse query string", () => {
      expect(parser.queryString.parse("?name=John&age=30")).toEqual({ name: "John", age: 30 });
      expect(parser.queryString.parse("?active=true")).toEqual({ active: true });
      expect(parser.queryString.parse("?tags=a,b,c")).toEqual({ tags: ["a", "b", "c"] });
      expect(parser.queryString.parse("?active=true", { parseBooleans: false })).toEqual({ active: "true" });
      expect(parser.queryString.parse("?name=John&age=30", { parseNumbers: false })).toEqual({
        name: "John",
        age: "30",
      });
    });

    test("should stringify object", () => {
      expect(parser.queryString.stringify({ name: "John", age: 30 })).toBe("age=30&name=John");
      expect(parser.queryString.stringify({ active: true })).toBe("active=true");
      expect(parser.queryString.stringify({ tags: ["a", "b", "c"] })).toBe("tags=a,b,c");
    });

    test("should parse URL", () => {
      const result = parser.queryString.parseUrl("https://example.com?name=John&age=30");
      expect(result.url).toBe("https://example.com");
      expect(result.query).toEqual({ name: "John", age: 30 });
    });

    test("should stringify URL", () => {
      const result = parser.queryString.stringifyUrl({
        url: "https://example.com",
        query: { name: "John", age: 30 },
      });
      expect(result).toBe("https://example.com?age=30&name=John");
    });

    test("should skip null and empty values", () => {
      expect(parser.queryString.stringify({ name: "John", age: null, empty: "" })).toBe("age&empty=&name=John");
    });
  });

  describe("clearEmptyValue", () => {
    test("should clear empty values", () => {
      const data = {
        name: "John",
        age: null,
        email: "",
        active: false,
        items: [],
        address: undefined,
      };
      const result = parser.clearEmptyValue(data);
      expect(result).toEqual({ name: "John", active: false });
    });

    test("should handle empty object", () => {
      expect(parser.clearEmptyValue({})).toEqual({});
    });
  });

  describe("tableSorterToApiSorter", () => {
    test("should convert table sorter to API sorter", () => {
      expect(parser.tableSorterToApiSorter({ field: "name", order: "ascend" })).toBe("name");
      expect(parser.tableSorterToApiSorter({ field: "age", order: "descend" })).toBe("-age");
    });

    test("should handle array of sorters", () => {
      const sorters = [
        { field: "name", order: "ascend" },
        { field: "age", order: "descend" },
      ];
      expect(parser.tableSorterToApiSorter(sorters)).toEqual(["name", "-age"]);
    });

    test("should handle empty sorter", () => {
      expect(parser.tableSorterToApiSorter({})).toBeUndefined();
      expect(parser.tableSorterToApiSorter(null)).toBeUndefined();
    });

    test("should handle invalid order", () => {
      expect(parser.tableSorterToApiSorter({ field: "name", order: "invalid" })).toBeUndefined();
    });
  });

  describe("apiSorterToTableSorterDict", () => {
    test("should convert API sorter to table sorter dict", () => {
      expect(parser.apiSorterToTableSorterDict("-name")).toEqual({ name: "descend" });
      expect(parser.apiSorterToTableSorterDict("age")).toEqual({ age: "ascend" });
      expect(parser.apiSorterToTableSorterDict("+email")).toEqual({ email: "ascend" });
    });

    test("should handle comma-separated sorters", () => {
      expect(parser.apiSorterToTableSorterDict("-name,age")).toEqual({
        name: "descend",
        age: "ascend",
      });
    });

    test("should handle array of sorters", () => {
      expect(parser.apiSorterToTableSorterDict(["-name", "age"])).toEqual({
        name: "descend",
        age: "ascend",
      });
    });

    test("should handle empty sorter", () => {
      expect(parser.apiSorterToTableSorterDict("")).toEqual({});
      expect(parser.apiSorterToTableSorterDict(null)).toEqual({});
    });
  });

  describe("getShowTitle", () => {
    const testRows = [
      { id: 1, name: "John", status: "active" },
      { id: 2, name: "Jane", status: "inactive" },
      { id: 3, name: "Bob", status: "active" },
      { id: 4, name: "Alice", status: "active" },
    ];

    test("should format title with count only", () => {
      expect(parser.getShowTitle(testRows, "选中 {count} 条数据")).toBe("选中 4 条数据");
      expect(parser.getShowTitle([], "选中 {count} 条数据")).toBe("选中 0 条数据");
      expect(parser.getShowTitle(null, "选中 {count} 条数据")).toBe("选中 0 条数据");
    });

    test("should format title with aggregation", () => {
      expect(parser.getShowTitle(testRows, "选中 {count} 条数据 ({stat})", "status")).toBe(
        "选中 4 条数据 (active: 3, inactive: 1)"
      );
      expect(parser.getShowTitle(testRows, "选中 {count} 条数据 ({stat})", "name")).toBe(
        "选中 4 条数据 (John: 1, Jane: 1, Bob: 1, Alice: 1)"
      );
    });

    test("should handle empty aggregation path", () => {
      expect(parser.getShowTitle(testRows, "选中 {count} 条数据", "")).toBe("选中 4 条数据");
      expect(parser.getShowTitle(testRows, "选中 {count} 条数据", null)).toBe("选中 4 条数据");
      expect(parser.getShowTitle(testRows, "选中 {count} 条数据", undefined)).toBe("选中 4 条数据");
    });

    test("should handle empty rows with aggregation", () => {
      expect(parser.getShowTitle([], "选中 {count} 条数据 ({stat})", "status")).toBe("选中 0 条数据 ()");
    });

    test("should handle rows with missing aggregation field", () => {
      const rowsWithMissingField = [
        { id: 1, name: "John" },
        { id: 2, name: "Jane", status: "active" },
        { id: 3, name: "Bob" },
      ];
      expect(parser.getShowTitle(rowsWithMissingField, "选中 {count} 条数据 ({stat})", "status")).toBe(
        "选中 3 条数据 (-: 2, active: 1)"
      );
    });

    test("should handle rows with empty aggregation values", () => {
      const rowsWithEmptyValues = [
        { id: 1, name: "John", status: "" },
        { id: 2, name: "Jane", status: null },
        { id: 3, name: "Bob", status: undefined },
        { id: 4, name: "Alice", status: "active" },
      ];
      expect(parser.getShowTitle(rowsWithEmptyValues, "选中 {count} 条数据 ({stat})", "status")).toBe(
        "选中 4 条数据 (-: 3, active: 1)"
      );
    });

    test("should sort aggregation results by count descending", () => {
      const rowsWithMixedStatus = [
        { id: 1, status: "active" },
        { id: 2, status: "inactive" },
        { id: 3, status: "active" },
        { id: 4, status: "pending" },
        { id: 5, status: "active" },
        { id: 6, status: "inactive" },
      ];
      expect(parser.getShowTitle(rowsWithMixedStatus, "选中 {count} 条数据 ({stat})", "status")).toBe(
        "选中 6 条数据 (active: 3, inactive: 2, pending: 1)"
      );
    });

    test("should not show stat when template does not include {stat}", () => {
      expect(parser.getShowTitle(testRows, "选中 {count} 条数据", "status")).toBe("选中 4 条数据");
    });

    test("should handle empty stat when no aggregation data", () => {
      const rowsWithNoStatus = [
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
        { id: 3, name: "Bob" },
      ];
      expect(parser.getShowTitle(rowsWithNoStatus, "选中 {count} 条数据 ({stat})", "status")).toBe(
        "选中 3 条数据 (-: 3)"
      );
    });
  });

  describe("parseQueryTypes", () => {
    test("should convert string types", () => {
      const query = { name: "John", age: 30, active: true };
      const types = { name: "string", age: "string", active: "string" };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({ name: "John", age: "30", active: "true" });
    });

    test("should convert number types", () => {
      const query = { name: "John", age: "30", count: "5" };
      const types = { name: "number", age: "number", count: "number" };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({ name: "John", age: 30, count: 5 });
    });

    test("should convert boolean types", () => {
      const query = { name: "John", active: "true", disabled: "false" };
      const types = { name: "boolean", active: "boolean", disabled: "boolean" };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({ name: true, active: true, disabled: true });
    });

    test("should handle array values", () => {
      const query = { tags: ["a", "b", "c"], ids: [1, 2, 3] };
      const types = { tags: "string", ids: "number" };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({ tags: ["a", "b", "c"], ids: [1, 2, 3] });
    });

    test("should handle mixed types", () => {
      const query = { name: "John", age: "30", active: "true", tags: ["a", "b"] };
      const types = { name: "string", age: "number", active: "boolean", tags: "string" };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({ name: "John", age: 30, active: true, tags: ["a", "b"] });
    });

    test("should return original query when types is empty", () => {
      const query = { name: "John", age: 30 };
      const result = parser.parseQueryTypes(query, {});
      expect(result).toEqual(query);
    });

    test("should return original query when query is empty", () => {
      const result = parser.parseQueryTypes({}, { name: "string" });
      expect(result).toEqual({});
    });

    test("should return original query when both are empty", () => {
      const result = parser.parseQueryTypes({}, {});
      expect(result).toEqual({});
    });

    test("should return original query when types is null/undefined", () => {
      const query = { name: "John", age: 30 };
      expect(parser.parseQueryTypes(query, null)).toEqual(query);
      expect(parser.parseQueryTypes(query, undefined)).toEqual(query);
    });

    test("should return original query when query is null/undefined", () => {
      const types = { name: "string" };
      expect(parser.parseQueryTypes(null, types)).toBeNull();
      expect(parser.parseQueryTypes(undefined, types)).toBeUndefined();
    });

    test("should convert non-basic types to string", () => {
      const query = {
        name: "John",
        user: { id: 1, name: "John" },
        items: [{ id: 1 }, { id: 2 }],
      };
      const types = { name: "string", user: "string", items: "string" };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({
        name: "John",
        user: '{"id":1,"name":"John"}',
        items: ['{"id":1}', '{"id":2}'],
      });
    });

    test("should handle empty string values", () => {
      const query = { name: "", age: "", active: "" };
      const types = { name: "string", age: "number", active: "boolean" };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({ name: "", age: "", active: "" });
    });

    test("should handle null/undefined values", () => {
      const query = { name: null, age: undefined, active: null };
      const types = { name: "string", age: "number", active: "boolean" };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({ name: null, age: undefined, active: null });
    });

    test("should handle array with mixed types", () => {
      const query = {
        names: ["John", 123, true, null],
        ages: ["25", "30", "invalid", ""],
        flags: [true, false, "true", "false", 1, 0],
      };
      const types = { names: "string", ages: "number", flags: "boolean" };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({
        names: ["John", "123", "true", ""],
        ages: [25, 30, "invalid", ""],
        flags: [true, false, true, true, true, false],
      });
    });

    test("should handle nested arrays", () => {
      const query = {
        matrix: [
          ["1", "2"],
          ["3", "4"],
        ],
        numbers: [1, 2, 3],
      };
      const types = { matrix: "string", numbers: "number" };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({
        matrix: ['["1","2"]', '["3","4"]'], // 嵌套数组会被转换为字符串
        numbers: [1, 2, 3],
      });
    });

    test("should handle special number values", () => {
      const query = {
        positive: "123",
        negative: "-456",
        decimal: "3.14",
        zero: "0",
        scientific: "1e5",
        infinity: "Infinity",
        negativeInfinity: "-Infinity",
        nan: "NaN",
      };
      const types = {
        positive: "number",
        negative: "number",
        decimal: "number",
        zero: "number",
        scientific: "number",
        infinity: "number",
        negativeInfinity: "number",
        nan: "number",
      };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({
        positive: 123,
        negative: -456,
        decimal: 3.14,
        zero: 0,
        scientific: 100000,
        infinity: Infinity,
        negativeInfinity: -Infinity,
        nan: "NaN",
      });
    });

    test("should handle special boolean values", () => {
      const query = {
        truthy: "true",
        falsy: "false",
        one: "1",
        zero: "0",
        empty: "",
        string: "hello",
        nullVal: "null",
        undefinedVal: "undefined",
      };
      const types = {
        truthy: "boolean",
        falsy: "boolean",
        one: "boolean",
        zero: "boolean",
        empty: "boolean",
        string: "boolean",
        nullVal: "boolean",
        undefinedVal: "boolean",
      };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({
        truthy: true,
        falsy: true, // "false" 字符串转换为布尔值为 true
        one: true,
        zero: true, // "0" 字符串转换为布尔值为 true
        empty: "", // 空字符串不会被转换，因为 isEmpty("") 返回 true
        string: true,
        nullVal: true,
        undefinedVal: true,
      });
    });

    test("should handle special string values", () => {
      const query = {
        number: 123,
        boolean: true,
        nullVal: null,
        undefinedVal: undefined,
        object: { key: "value" },
        array: [1, 2, 3],
        empty: "",
        zero: 0,
        falseVal: false,
      };
      const types = {
        number: "string",
        boolean: "string",
        nullVal: "string",
        undefinedVal: "string",
        object: "string",
        array: "string",
        empty: "string",
        zero: "string",
        falseVal: "string",
      };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({
        number: "123",
        boolean: "true",
        nullVal: null, // null 不会被转换，因为 isEmpty(null) 返回 true
        undefinedVal: undefined, // undefined 不会被转换，因为 isEmpty(undefined) 返回 true
        object: '{"key":"value"}',
        array: ["1", "2", "3"], // 数组会被转换为字符串数组
        empty: "", // 空字符串不会被转换，因为 isEmpty("") 返回 true
        zero: "0",
        falseVal: "false",
      });
    });

    test("should handle partial type definitions", () => {
      const query = {
        name: "John",
        age: "30",
        active: "true",
        city: "New York",
      };
      const types = {
        name: "string",
        age: "number",
        // active 和 city 没有类型定义
      };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({
        name: "John",
        age: 30,
        active: "true", // 保持原值
        city: "New York", // 保持原值
      });
    });

    test("should handle undefined type definitions", () => {
      const query = {
        name: "John",
        age: "30",
      };
      const types = {
        name: "string",
        age: undefined, // undefined 类型
      };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({
        name: "John",
        age: "30", // 保持原值
      });
    });

    test("should handle empty string type definitions", () => {
      const query = {
        name: "John",
        age: "30",
      };
      const types = {
        name: "string",
        age: "", // 空字符串类型
      };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({
        name: "John",
        age: "30", // 保持原值
      });
    });

    test("should handle non-string type definitions", () => {
      const query = {
        name: "John",
        age: "30",
      };
      const types = {
        name: "string",
        age: 123, // 非字符串类型定义
      };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({
        name: "John",
        age: "30", // 保持原值
      });
    });

    test("should convert objects and arrays to string", () => {
      const query = {
        user: { name: "John", age: 30 },
        tags: ["tag1", "tag2"],
        active: true,
      };
      const types = {
        user: "string",
        tags: "string",
        active: "string",
      };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({
        user: '{"name":"John","age":30}', // 对象会被转换为字符串
        tags: ["tag1", "tag2"], // 数组会被转换为字符串数组
        active: "true",
      });
    });

    test("should handle very large numbers", () => {
      const query = {
        large: "999999999999999",
        small: "0.000000000000000001",
      };
      const types = { large: "number", small: "number" };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({
        large: 999999999999999,
        small: 0.000000000000000001,
      });
    });

    test("should handle unicode strings", () => {
      const query = {
        chinese: "你好世界",
        emoji: "🚀🌟",
        special: "特殊字符!@#$%^&*()",
      };
      const types = { chinese: "string", emoji: "string", special: "string" };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({
        chinese: "你好世界",
        emoji: "🚀🌟",
        special: "特殊字符!@#$%^&*()",
      });
    });
  });

  describe("genFields", () => {
    const testFields = [
      { key: "name", title: "Name", dataIndex: "name" },
      { key: "age", title: "Age", dataIndex: "age" },
      { key: "email", title: "Email", dataIndex: "email", hidden: true },
      { dataIndex: "address", title: "Address" },
      { key: "phone", title: "Phone", dataIndex: "phone", hidden: true },
    ];

    test("should filter fields by keys", () => {
      const keys = ["name", "email"];
      const result = parser.genFields(testFields, keys);
      expect(result).toHaveLength(2);
      expect(result[0].key).toBe("name");
      expect(result[1].key).toBe("email");
    });

    test("should handle fields without key (using dataIndex)", () => {
      const keys = ["address"];
      const result = parser.genFields(testFields, keys);
      expect(result).toHaveLength(1);
      expect(result[0].dataIndex).toBe("address");
    });

    test("should handle array keys in fields", () => {
      const fieldsWithArrayKey = [
        { key: ["user", "name"], title: "User Name" },
        { key: ["user", "age"], title: "User Age" },
        { key: "email", title: "Email" },
      ];
      const keys = ["user__name", "email"];
      const result = parser.genFields(fieldsWithArrayKey, keys);
      expect(result).toHaveLength(2);
      expect(result[0].key).toEqual(["user", "name"]);
      expect(result[1].key).toBe("email");
    });

    test("should return all fields when keys is empty", () => {
      const result = parser.genFields(testFields, []);
      expect(result).toEqual(testFields);
    });

    test("should return all fields when keys is null/undefined", () => {
      expect(parser.genFields(testFields, null)).toEqual(testFields);
      expect(parser.genFields(testFields, undefined)).toEqual(testFields);
    });

    test("should return empty array when no matching fields", () => {
      const keys = ["nonExistent"];
      const result = parser.genFields(testFields, keys);
      expect(result).toEqual([]);
    });

    test("should handle empty fields array", () => {
      const result = parser.genFields([], ["name"]);
      expect(result).toEqual([]);
    });

    test("should handle fields with both key and dataIndex", () => {
      const fieldsWithBoth = [
        { key: "customKey", dataIndex: "name", title: "Name" },
        { key: "age", title: "Age" },
      ];
      const keys = ["customKey", "age"];
      const result = parser.genFields(fieldsWithBoth, keys);
      expect(result).toHaveLength(2);
      expect(result[0].key).toBe("customKey");
      expect(result[1].key).toBe("age");
    });

    test("should not modify original fields array", () => {
      const originalFields = [...testFields];
      const keys = ["name", "email"];
      parser.genFields(testFields, keys);
      expect(testFields).toEqual(originalFields);
    });

    test("should handle duplicate keys", () => {
      const fieldsWithDuplicates = [
        { key: "name", title: "Name 1" },
        { key: "name", title: "Name 2" },
        { key: "age", title: "Age" },
      ];
      const keys = ["name"];
      const result = parser.genFields(fieldsWithDuplicates, keys);
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Name 1");
      expect(result[1].title).toBe("Name 2");
    });
  });

  describe("genColumnKey 测试", () => {
    it("should return key when column has key", () => {
      const column = { key: "customKey", dataIndex: "name" };
      const result = parser.genColumnKey(column);
      expect(result).toBe("customKey");
    });

    it("should return dataIndex when column has no key", () => {
      const column = { dataIndex: "name" };
      const result = parser.genColumnKey(column);
      expect(result).toBe("name");
    });

    it("should join array key with double underscore", () => {
      const column = { key: ["user", "name"], dataIndex: "name" };
      const result = parser.genColumnKey(column);
      expect(result).toBe("user__name");
    });

    it("should join array dataIndex with double underscore", () => {
      const column = { dataIndex: ["user", "info", "name"] };
      const result = parser.genColumnKey(column);
      expect(result).toBe("user__info__name");
    });

    it("should handle empty array", () => {
      const column = { key: [], dataIndex: "name" };
      const result = parser.genColumnKey(column);
      expect(result).toBe("");
    });

    it("should handle undefined values", () => {
      const column = {};
      const result = parser.genColumnKey(column);
      expect(result).toBeUndefined();
    });

    it("should prioritize key over dataIndex", () => {
      const column = { key: "priorityKey", dataIndex: "fallbackName" };
      const result = parser.genColumnKey(column);
      expect(result).toBe("priorityKey");
    });
  });

  describe("initRangeValues", () => {
    test("should return undefined for empty inputs", () => {
      expect(parser.initRangeValues(null)).toBeUndefined();
      expect(parser.initRangeValues(undefined)).toBeUndefined();
      expect(parser.initRangeValues("")).toBeUndefined();
      expect(parser.initRangeValues([])).toBeUndefined();
    });

    test("should handle string inputs with comma separator", () => {
      expect(parser.initRangeValues("1,2")).toEqual(["1", "2"]);
      expect(parser.initRangeValues("a,b,c")).toEqual(["a", "b"]);
      expect(parser.initRangeValues("single")).toEqual(["single", null]);
      expect(parser.initRangeValues("1,2,3,4,5")).toEqual(["1", "2"]);
    });

    test("should handle non-array inputs", () => {
      expect(parser.initRangeValues(123)).toEqual([123, null]);
      expect(parser.initRangeValues(true)).toEqual([true, null]);
      expect(parser.initRangeValues(false)).toEqual([false, null]);
      expect(parser.initRangeValues({ key: "value" })).toEqual([{ key: "value" }, null]);
    });

    test("should handle array inputs", () => {
      expect(parser.initRangeValues([1, 2])).toEqual([1, 2]);
      expect(parser.initRangeValues([1, 2, 3, 4])).toEqual([1, 2]);
      expect(parser.initRangeValues(["a", "b", "c"])).toEqual(["a", "b"]);
      expect(parser.initRangeValues([1])).toEqual([1, null]);
    });

    test("should convert to numbers when number parameter is true", () => {
      expect(parser.initRangeValues("1,2", { number: true })).toEqual([1, 2]); // Number("1") || "1" = 1
      expect(parser.initRangeValues("1.5,2.7", { number: true })).toEqual([1.5, 2.7]); // Number("1.5") || "1.5" = 1.5
      expect(parser.initRangeValues("invalid,123", { number: true })).toEqual(["invalid", 123]);
      expect(parser.initRangeValues([1, 2], { number: true })).toEqual([1, 2]);
      expect(parser.initRangeValues(["1", "2"], { number: true })).toEqual([1, 2]); // Number("1") || "1" = 1
      expect(parser.initRangeValues(123, { number: true })).toEqual([123, null]);
      expect(parser.initRangeValues("0", { number: true })).toEqual([0, null]);
      expect(parser.initRangeValues(false, { number: true })).toEqual([0, null]);
      expect(parser.initRangeValues(",", { number: true })).toEqual([null, null]);
    });

    test("should not convert to numbers when number parameter is false", () => {
      expect(parser.initRangeValues("1,2", { number: false })).toEqual(["1", "2"]);
      expect(parser.initRangeValues("1.5,2.7", { number: false })).toEqual(["1.5", "2.7"]);
      expect(parser.initRangeValues([1, 2], { number: false })).toEqual([1, 2]);
      expect(parser.initRangeValues(["1", "2"], { number: false })).toEqual(["1", "2"]);
      expect(parser.initRangeValues(123, { number: false })).toEqual([123, null]);
    });

    test("should handle edge cases with number conversion", () => {
      expect(parser.initRangeValues("0,0", { number: true })).toEqual([0, 0]);
      expect(parser.initRangeValues("-1,-2", { number: true })).toEqual([-1, -2]); // Number("-1") || "-1" = -1
      expect(parser.initRangeValues("", { number: true })).toBeUndefined();
      expect(parser.initRangeValues("abc,def", { number: true })).toEqual(["abc", "def"]);
      expect(parser.initRangeValues("1.23e5,2.34e-3", { number: true })).toEqual([123000, 0.00234]); // Number("1.23e5") || "1.23e5" = 123000
    });

    test("should handle special string cases", () => {
      expect(parser.initRangeValues("a,b,c,d,e")).toEqual(["a", "b"]);
      expect(parser.initRangeValues("single,word")).toEqual(["single", "word"]);
      expect(parser.initRangeValues("")).toBeUndefined();
      expect(parser.initRangeValues("   ")).toEqual(["   ", null]);
      expect(parser.initRangeValues("a,")).toEqual(["a", null]); // 空字符串被转换为 null
      expect(parser.initRangeValues(",b")).toEqual([null, "b"]); // 空字符串被转换为 null
    });

    test("should handle mixed type arrays", () => {
      expect(parser.initRangeValues([1, "2", true, null])).toEqual([1, "2"]);
      expect(parser.initRangeValues([{ a: 1 }, { b: 2 }, { c: 3 }])).toEqual([{ a: 1 }, { b: 2 }]);
    });

    test("should handle number conversion with mixed types", () => {
      expect(parser.initRangeValues([1, "2", "abc", 4], { number: true })).toEqual([1, 2]); // 只取前两个元素，Number("2") || "2" = 2
      expect(parser.initRangeValues(["1.5", "2.5", "invalid"], { number: true })).toEqual([1.5, 2.5]); // 只取前两个元素，Number("1.5") || "1.5" = 1.5
    });
  });

  describe("guessQueryTypes", () => {
    test("should return empty object for empty fields", () => {
      expect(parser.guessQueryTypes(null)).toEqual({});
      expect(parser.guessQueryTypes(undefined)).toEqual({});
      expect(parser.guessQueryTypes([])).toEqual({});
    });

    test("should handle INPUT field type", () => {
      const fields = [
        { key: "name", type: "input" },
        { key: "description", type: "input" }
      ];
      expect(parser.guessQueryTypes(fields)).toEqual({
        name: "string",
        description: "string"
      });
    });

    test("should handle SELECT field with multiple mode", () => {
      const fields = [
        { key: "tags", type: "select", antdFieldProps: { mode: "multiple" } },
        { key: "categories", type: "select", filterDropdownConfig: { dropdownProps: { mode: "multiple" } } }
      ];
      expect(parser.guessQueryTypes(fields)).toEqual({
        tags: "number[]",
        categories: "number[]"
      });
    });

    test("should handle CHECKBOX field type", () => {
      const fields = [
        { key: "options", type: "checkbox" }
      ];
      expect(parser.guessQueryTypes(fields)).toEqual({
        options: "number[]"
      });
    });

    test("should handle range field types", () => {
      const fields = [
        { key: "ageRange", type: "number-range" },
        { key: "dateRange", type: "date-range-picker" }
      ];
      expect(parser.guessQueryTypes(fields)).toEqual({
        ageRange: "number[]",
        dateRange: "number[]"
      });
    });

    test("should handle fields with filters property", () => {
      const fields = [
        { key: "status", filters: true },
        { key: "priority", filters: [{ text: "High", value: "high" }] }
      ];
      expect(parser.guessQueryTypes(fields)).toEqual({
        status: "number[]",
        priority: "number[]"
      });
    });

    test("should handle mixed field types", () => {
      const fields = [
        { key: "name", type: "input" },
        { key: "tags", type: "select", antdFieldProps: { mode: "multiple" } },
        { key: "ageRange", type: "number-range" },
        { key: "status", filters: true }
      ];
      expect(parser.guessQueryTypes(fields)).toEqual({
        name: "string",
        tags: "number[]",
        ageRange: "number[]",
        status: "number[]"
      });
    });

    test("should handle fields without type or filters", () => {
      const fields = [
        { key: "name" },
        { key: "description", type: "unknown" }
      ];
      expect(parser.guessQueryTypes(fields)).toEqual({});
    });

    test("should handle fields with filterDropdownConfig", () => {
      const fields = [
        { key: "category", filterDropdownConfig: { type: "input" } },
        { key: "tags", filterDropdownConfig: { type: "select", dropdownProps: { mode: "multiple" } } }
      ];
      expect(parser.guessQueryTypes(fields)).toEqual({
        category: "string",
        tags: "number[]"
      });
    });

    test("should handle fields with both type and filterDropdownConfig", () => {
      const fields = [
        { key: "name", type: "input", filterDropdownConfig: { type: "select" } }
      ];
      // type takes precedence over filterDropdownConfig
      expect(parser.guessQueryTypes(fields)).toEqual({
        name: "string"
      });
    });

    test("should handle fields with dataIndex instead of key", () => {
      const fields = [
        { dataIndex: "name", type: "input" },
        { dataIndex: "tags", type: "select", antdFieldProps: { mode: "multiple" } }
      ];
      expect(parser.guessQueryTypes(fields)).toEqual({
        name: "string",
        tags: "number[]"
      });
    });

    test("should handle fields with array key", () => {
      const fields = [
        { key: ["user", "name"], type: "input" },
        { key: ["user", "tags"], type: "select", antdFieldProps: { mode: "multiple" } }
      ];
      expect(parser.guessQueryTypes(fields)).toEqual({
        "user__name": "string",
        "user__tags": "number[]"
      });
    });

    test("should handle fields with array dataIndex", () => {
      const fields = [
        { dataIndex: ["user", "name"], type: "input" },
        { dataIndex: ["user", "tags"], type: "select", antdFieldProps: { mode: "multiple" } }
      ];
      expect(parser.guessQueryTypes(fields)).toEqual({
        "user__name": "string",
        "user__tags": "number[]"
      });
    });

    test("should handle SELECT field without multiple mode", () => {
      const fields = [
        { key: "status", type: "select" },
        { key: "category", type: "select", antdFieldProps: { mode: "single" } }
      ];
      expect(parser.guessQueryTypes(fields)).toEqual({});
    });

    test("should handle fields with empty filters array", () => {
      const fields = [
        { key: "status", filters: [] }
      ];
      // 空数组 [] 在 JavaScript 中是 truthy，所以会被处理为 number[]
      expect(parser.guessQueryTypes(fields)).toEqual({
        status: "number[]"
      });
    });

    test("should handle fields with null filters", () => {
      const fields = [
        { key: "status", filters: null }
      ];
      expect(parser.guessQueryTypes(fields)).toEqual({});
    });

    test("should handle complex mixed scenarios", () => {
      const fields = [
        { key: "name", type: "input" },
        { key: "email", filterDropdownConfig: { type: "input" } },
        { key: "tags", type: "select", antdFieldProps: { mode: "multiple" } },
        { key: "categories", filterDropdownConfig: { type: "select", dropdownProps: { mode: "multiple" } } },
        { key: "ageRange", type: "number-range" },
        { key: "dateRange", type: "date-range-picker" },
        { key: "status", filters: true },
        { key: "priority", filters: [{ text: "High", value: "high" }] },
        { key: "options", type: "checkbox" },
        { key: "unknown", type: "unknown" },
        { key: "noType" }
      ];
      expect(parser.guessQueryTypes(fields)).toEqual({
        name: "string",
        email: "string",
        tags: "number[]",
        categories: "number[]",
        ageRange: "number[]",
        dateRange: "number[]",
        status: "number[]",
        priority: "number[]",
        options: "number[]"
      });
    });
  });

  describe("handleFormValues", () => {

    test("should return original values when fields is empty", () => {
      const values = { name: "John", age: 30 };
      expect(parser.handleFormValues(values, [])).toEqual(values);
      expect(parser.handleFormValues(values, null)).toEqual(values);
      expect(parser.handleFormValues(values, undefined)).toEqual(values);
    });

    test("should return original values when fields is not an array", () => {
      const values = { name: "John", age: 30 };
      // 当 fields 是空对象时，fields?.length 为 undefined，条件为真，返回原始值
      expect(parser.handleFormValues(values, {})).toEqual(values);
      // 当 fields 是空字符串时，fields?.length 为 0，条件为真，返回原始值
      expect(parser.handleFormValues(values, "")).toEqual(values);
    });

    test("should set undefined values to null for all fields", () => {
      const values = { name: "John", age: 30 };
      const fields = [{ key: "name" }, { key: "age" }, { key: "email" }, { key: "phone" }];
      const result = parser.handleFormValues(values, fields);
      expect(result).toEqual({
        name: "John",
        age: 30,
        email: null,
        phone: null,
      });
    });

    test("should set blank values to empty string for CHECKBOX and RADIO fields", () => {
      const values = {
        checkbox1: null,
        checkbox2: "",
        radio1: undefined,
        radio2: "value",
        input1: null,
        input2: "",
      };
      const fields = [
        { key: "checkbox1", type: FieldType.CHECKBOX },
        { key: "checkbox2", type: FieldType.CHECKBOX },
        { key: "radio1", type: FieldType.RADIO },
        { key: "radio2", type: FieldType.RADIO },
        { key: "input1", type: FieldType.INPUT },
        { key: "input2", type: FieldType.INPUT },
      ];
      const result = parser.handleFormValues(values, fields);
      expect(result).toEqual({
        checkbox1: "",
        checkbox2: "",
        radio1: "",
        radio2: "value",
        input1: null,
        input2: "",
      });
    });

    test("should handle fields without type property", () => {
      const values = { name: "John", email: undefined };
      const fields = [{ key: "name" }, { key: "email" }];
      const result = parser.handleFormValues(values, fields);
      expect(result).toEqual({
        name: "John",
        email: null,
      });
    });

    test("should handle fields with non-CHECKBOX/RADIO types", () => {
      const values = {
        input: null,
        select: "",
        number: undefined,
        date: null,
      };
      const fields = [
        { key: "input", type: FieldType.INPUT },
        { key: "select", type: FieldType.SELECT },
        { key: "number", type: FieldType.NUMBER },
        { key: "date", type: FieldType.DATE_PICKER },
      ];
      const result = parser.handleFormValues(values, fields);
      expect(result).toEqual({
        input: null,
        select: "",
        number: null,
        date: null,
      });
    });

    test("should not modify original values object", () => {
      const values = { name: "John", email: undefined };
      const fields = [{ key: "name" }, { key: "email" }];
      const originalValues = { ...values };
      parser.handleFormValues(values, fields);
      expect(values).toEqual(originalValues);
    });

    test("should handle empty values object", () => {
      const values = {};
      const fields = [{ key: "name" }, { key: "email", type: FieldType.CHECKBOX }];
      const result = parser.handleFormValues(values, fields);
      expect(result).toEqual({
        name: null,
        email: "",
      });
    });

    test("should handle null values object", () => {
      const values = null;
      const fields = [{ key: "name" }];
      const result = parser.handleFormValues(values, fields);
      expect(result).toEqual({
        name: null,
      });
    });

    test("should handle undefined values object", () => {
      const values = undefined;
      const fields = [{ key: "name" }];
      const result = parser.handleFormValues(values, fields);
      expect(result).toEqual({
        name: null,
      });
    });

    test("should handle mixed field types with various values", () => {
      const values = {
        text: "hello",
        checkboxEmpty: null,
        checkboxBlank: "",
        radioEmpty: undefined,
        radioValue: "option1",
        select: "option2",
        number: 42,
        missingField: "should_be_ignored",
      };
      const fields = [
        { key: "text", type: FieldType.INPUT },
        { key: "checkboxEmpty", type: FieldType.CHECKBOX },
        { key: "checkboxBlank", type: FieldType.CHECKBOX },
        { key: "radioEmpty", type: FieldType.RADIO },
        { key: "radioValue", type: FieldType.RADIO },
        { key: "select", type: FieldType.SELECT },
        { key: "number", type: FieldType.NUMBER },
        { key: "undefinedField" },
      ];
      const result = parser.handleFormValues(values, fields);
      expect(result).toEqual({
        text: "hello",
        checkboxEmpty: "",
        checkboxBlank: "",
        radioEmpty: "",
        radioValue: "option1",
        select: "option2",
        number: 42,
        missingField: "should_be_ignored",
        undefinedField: null,
      });
    });

    test("should handle fields with array keys", () => {
      const values = { "user.name": "John", "user.age": 30 };
      const fields = [{ key: "user.name" }, { key: "user.age" }, { key: "user.email" }];
      const result = parser.handleFormValues(values, fields);
      expect(result).toEqual({
        "user.name": "John",
        "user.age": 30,
        "user.email": null,
      });
    });

    test("should handle fields with special characters in keys", () => {
      const values = { "field-with-dash": "value1", fieldWithUnderscore: "value2" };
      const fields = [{ key: "field-with-dash" }, { key: "fieldWithUnderscore" }, { key: "field.with.dot" }];
      const result = parser.handleFormValues(values, fields);
      expect(result).toEqual({
        "field-with-dash": "value1",
        fieldWithUnderscore: "value2",
        "field.with.dot": null,
      });
    });

    test("should handle boolean values for CHECKBOX and RADIO fields", () => {
      const values = {
        checkboxTrue: true,
        checkboxFalse: false,
        radioTrue: true,
        radioFalse: false,
      };
      const fields = [
        { key: "checkboxTrue", type: FieldType.CHECKBOX },
        { key: "checkboxFalse", type: FieldType.CHECKBOX },
        { key: "radioTrue", type: FieldType.RADIO },
        { key: "radioFalse", type: FieldType.RADIO },
      ];
      const result = parser.handleFormValues(values, fields);
      expect(result).toEqual({
        checkboxTrue: true,
        checkboxFalse: false,
        radioTrue: true,
        radioFalse: false,
      });
    });

    test("should handle zero and empty string for CHECKBOX and RADIO fields", () => {
      const values = {
        checkboxZero: 0,
        checkboxEmptyString: "",
        radioZero: 0,
        radioEmptyString: "",
      };
      const fields = [
        { key: "checkboxZero", type: FieldType.CHECKBOX },
        { key: "checkboxEmptyString", type: FieldType.CHECKBOX },
        { key: "radioZero", type: FieldType.RADIO },
        { key: "radioEmptyString", type: FieldType.RADIO },
      ];
      const result = parser.handleFormValues(values, fields);
      // 注意：isBlank(0) 返回 false，所以数字 0 不会被转换为空字符串
      expect(result).toEqual({
        checkboxZero: 0,
        checkboxEmptyString: "",
        radioZero: 0,
        radioEmptyString: "",
      });
    });
  });
});

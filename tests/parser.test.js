import * as parser from "src/common/parser";

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

  describe("valuesToLablels", () => {
    const options = [
      { value: "1", label: "Option 1" },
      { value: "2", label: "Option 2" },
      { value: "3", label: "Option 3" },
    ];

    test("should convert values to labels", () => {
      expect(parser.valuesToLablels(["1", "2"], options)).toEqual(["Option 1", "Option 2"]);
      expect(parser.valuesToLablels("1", options)).toEqual(["Option 1"]);
    });

    test("should handle values not in options", () => {
      expect(parser.valuesToLablels(["1", "4"], options)).toEqual(["Option 1", "4"]);
    });

    test("should handle empty inputs", () => {
      expect(parser.valuesToLablels([], options)).toEqual([]);
      expect(parser.valuesToLablels(["1"], [])).toEqual(["1"]);
    });

    test("should handle custom key names", () => {
      const customOptions = [
        { id: "1", name: "Option 1" },
        { id: "2", name: "Option 2" },
      ];
      expect(parser.valuesToLablels(["1", "2"], customOptions, "id", "name")).toEqual(["Option 1", "Option 2"]);
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
      expect(parser.queryString.parse("?name=John&age=30", { parseNumbers: false })).toEqual({ name: "John", age: "30" });
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
      expect(parser.queryString.stringify({ name: "John", age: null, empty: "" })).toBe("name=John");
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

  describe("transformFilters", () => {
    test("should transform filters with multipleMap", () => {
      const filters = {
        name: "John",
        tags: "a,b,c",
        status: ["active", "inactive"],
      };
      const result = parser.transformFilters(filters, {
        multipleMap: { tags: true, status: false },
      });
      expect(result).toEqual({
        name: "John",
        tags: ["a", "b", "c"],
        status: "active,inactive",
      });
    });

    test("should skip empty values when skipEmpty is true", () => {
      const filters = {
        name: "John",
        age: null,
        email: "",
        tags: [],
      };
      const result = parser.transformFilters(filters, { skipEmpty: true });
      expect(result).toEqual({ name: "John" });
    });

    test("should handle array to string conversion", () => {
      const filters = { status: ["active"] };
      const result = parser.transformFilters(filters, {
        multipleMap: { status: false },
      });
      expect(result).toEqual({ status: "active" });
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
      expect(parser.getShowTitle(testRows, "选中 {count} 条数据 ({stat})", "status")).toBe("选中 4 条数据 (active: 3, inactive: 1)");
      expect(parser.getShowTitle(testRows, "选中 {count} 条数据 ({stat})", "name")).toBe("选中 4 条数据 (John: 1, Jane: 1, Bob: 1, Alice: 1)");
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
      expect(parser.getShowTitle(rowsWithMissingField, "选中 {count} 条数据 ({stat})", "status")).toBe("选中 3 条数据 (-: 2, active: 1)");
    });

    test("should handle rows with empty aggregation values", () => {
      const rowsWithEmptyValues = [
        { id: 1, name: "John", status: "" },
        { id: 2, name: "Jane", status: null },
        { id: 3, name: "Bob", status: undefined },
        { id: 4, name: "Alice", status: "active" },
      ];
      expect(parser.getShowTitle(rowsWithEmptyValues, "选中 {count} 条数据 ({stat})", "status")).toBe("选中 4 条数据 (-: 3, active: 1)");
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
      expect(parser.getShowTitle(rowsWithMixedStatus, "选中 {count} 条数据 ({stat})", "status")).toBe("选中 6 条数据 (active: 3, inactive: 2, pending: 1)");
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
      expect(parser.getShowTitle(rowsWithNoStatus, "选中 {count} 条数据 ({stat})", "status")).toBe("选中 3 条数据 (-: 3)");
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
      expect(result).toEqual({ name: NaN, age: 30, count: 5 });
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

    test("should skip non-basic types", () => {
      const query = {
        name: "John",
        user: { id: 1, name: "John" },
        items: [{ id: 1 }, { id: 2 }]
      };
      const types = { name: "string", user: "string", items: "string" };
      const result = parser.parseQueryTypes(query, types);
      expect(result).toEqual({
        name: "John",
        user: { id: 1, name: "John" },
        items: [{ id: 1 }, { id: 2 }]
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

    test("should remove hidden property from filtered fields", () => {
      const keys = ["email", "phone"];
      const result = parser.genFields(testFields, keys);
      expect(result).toHaveLength(2);
      expect(result[0].hidden).toBe(false);
      expect(result[1].hidden).toBe(false);
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
        { key: "custom_key", dataIndex: "name", title: "Name" },
        { key: "age", title: "Age" },
      ];
      const keys = ["custom_key", "age"];
      const result = parser.genFields(fieldsWithBoth, keys);
      expect(result).toHaveLength(2);
      expect(result[0].key).toBe("custom_key");
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
      const column = { key: "custom_key", dataIndex: "name" };
      const result = parser.genColumnKey(column);
      expect(result).toBe("custom_key");
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
      const column = { key: "priority_key", dataIndex: "fallback_name" };
      const result = parser.genColumnKey(column);
      expect(result).toBe("priority_key");
    });
  });

});

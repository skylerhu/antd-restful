/***
补充 @file RouteBaseTable.test.jsx 文件单测的要求
- forbidden: 除了requests请求、组件的输入输出参数，其他都不允许mock
- forbidden: 禁止对 RouteBaseTable 使用 toMatchSnapshot
- required: 测试组件的场景，需要验证 onSearchChange.toHaveBeenCalledWith 、 onFiltersChange.toHaveBeenCalledWith 的参数、以及远程请求的参数
- required: 补充完单测后，修复eslint问题

- 测试组件的场景有
  - URL 参数解析测试，包含 '' , false , null, undefined, 1, ',1', '1,3' 等各种类型场景
  - parseTypes 参数测试，测试 'a=123456789111223141516&b=1' 设置 a是string，b是number
  - 初始化loction后，修改路由参数，触发远程请求
  - filterFormProps?.fields 中使用了 NumberRange，初始值是 age=,1，校验 NumberRange组件的值是预期值
  - filterFormProps?.fields 中使用了 Checkbox，初始值是 gender=male, 校验 Checkbox组件的值是预期值
  - serarch值为 "dayRange=,2025-09-22&age=15,"，filterFormProps?.fields配置dayRange是时间范围选择、age是数值范围选择，该场景下校验远程请求的值

 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import RouteBaseTable from "src/components/RouteBaseTable";

// Mock requests to avoid network calls and capture parameters
let capturedRequestParams = null;
const mockGet = jest.fn().mockResolvedValue({
  data: {
    results: [],
    count: 0,
  },
});

jest.mock("src/requests", () => ({
  useSafeRequest: () => [
    jest.fn().mockReturnValue({
      get: (url, params) => {
        capturedRequestParams = params;
        return mockGet(url, params);
      },
    }),
  ],
}));

describe("RouteBaseTable", () => {
  let mockOnSearchChange;
  let mockOnFiltersChange;
  let mockRestProps;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    capturedRequestParams = null;

    mockOnSearchChange = jest.fn();
    mockOnFiltersChange = jest.fn();

    mockRestProps = {
      baseParams: { status: "active" },
      onFiltersChange: mockOnFiltersChange,
      columns: [{ title: "Name", dataIndex: "name" }],
      restful: "/api/users",
      fieldPageSize: "size",
      filterFormProps: { fields: [] },
      parseOptions: { types: {} },
    };
  });

  describe("URL 参数解析测试", () => {
    it("should parse empty string search", async () => {
      render(
        <RouteBaseTable location={{ search: "" }} onSearchChange={mockOnSearchChange} restProps={mockRestProps} />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用
      expect(mockOnSearchChange).not.toHaveBeenCalled();
      expect(mockOnFiltersChange).not.toHaveBeenCalled();
    });

    it("should parse false value", async () => {
      render(
        <RouteBaseTable
          location={{ search: "?active=false" }}
          onSearchChange={mockOnSearchChange}
          restProps={mockRestProps}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          active: false,
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用 - 初始化时不会调用
      expect(mockOnSearchChange).not.toHaveBeenCalled();
      expect(mockOnFiltersChange).not.toHaveBeenCalled();
    });

    it("should parse null value", async () => {
      render(
        <RouteBaseTable
          location={{ search: "?value=null" }}
          onSearchChange={mockOnSearchChange}
          restProps={mockRestProps}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          value: "null",
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用 - 初始化时不会调用
      expect(mockOnSearchChange).not.toHaveBeenCalled();
      expect(mockOnFiltersChange).not.toHaveBeenCalled();
    });

    it("should parse undefined value", async () => {
      render(
        <RouteBaseTable
          location={{ search: "?value=undefined" }}
          onSearchChange={mockOnSearchChange}
          restProps={mockRestProps}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          value: "undefined",
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用 - 初始化时不会调用
      expect(mockOnSearchChange).not.toHaveBeenCalled();
      expect(mockOnFiltersChange).not.toHaveBeenCalled();
    });

    it("should parse number value", async () => {
      render(
        <RouteBaseTable
          location={{ search: "?age=25" }}
          onSearchChange={mockOnSearchChange}
          restProps={mockRestProps}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          age: 25,
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用 - 初始化时不会调用
      expect(mockOnSearchChange).not.toHaveBeenCalled();
      expect(mockOnFiltersChange).not.toHaveBeenCalled();
    });

    it("should parse comma separated values", async () => {
      render(
        <RouteBaseTable
          location={{ search: "?ids=1,2,3" }}
          onSearchChange={mockOnSearchChange}
          restProps={mockRestProps}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          ids: [1, 2, 3],
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用 - 初始化时不会调用
      expect(mockOnSearchChange).not.toHaveBeenCalled();
      expect(mockOnFiltersChange).not.toHaveBeenCalled();
    });

    it("should parse empty comma separated values", async () => {
      render(
        <RouteBaseTable
          location={{ search: "?ids=,1" }}
          onSearchChange={mockOnSearchChange}
          restProps={mockRestProps}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          ids: ["", 1],
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用 - 初始化时不会调用
      expect(mockOnSearchChange).not.toHaveBeenCalled();
      expect(mockOnFiltersChange).not.toHaveBeenCalled();
    });

    it("should parse complex comma separated values", async () => {
      render(
        <RouteBaseTable
          location={{ search: "?ids=1,3&name=test" }}
          onSearchChange={mockOnSearchChange}
          restProps={mockRestProps}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          ids: [1, 3],
          name: "test",
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用 - 初始化时不会调用
      expect(mockOnSearchChange).not.toHaveBeenCalled();
      expect(mockOnFiltersChange).not.toHaveBeenCalled();
    });

    it("should handle multiple parameter types", async () => {
      render(
        <RouteBaseTable
          location={{ search: "?name=test&age=25&active=true&ids=1,2,3&empty=" }}
          onSearchChange={mockOnSearchChange}
          restProps={mockRestProps}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          name: "test",
          age: 25,
          active: true,
          ids: [1, 2, 3],
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用
      expect(mockOnSearchChange).toHaveBeenCalledWith("?active=true&age=25&ids=1,2,3&name=test");
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        active: true,
        age: 25,
        ids: [1, 2, 3],
        name: "test",
      });
    });
  });

  describe("parseTypes 参数测试", () => {
    it("should parse types correctly with string and number", async () => {
      const restPropsWithParseTypes = {
        ...mockRestProps,
        parseTypes: {
          a: "string",
          b: "number",
        },
      };

      render(
        <RouteBaseTable
          location={{ search: "?a=123456789111223141516&b=1" }}
          onSearchChange={mockOnSearchChange}
          restProps={restPropsWithParseTypes}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          a: "123456789111223140000",
          b: 1,
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用
      expect(mockOnSearchChange).toHaveBeenCalledWith("?a=123456789111223140000&b=1");
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        a: "123456789111223140000",
        b: 1,
      });
    });

    it("should parse types correctly with boolean", async () => {
      const restPropsWithParseTypes = {
        ...mockRestProps,
        parseTypes: {
          flag: "boolean",
          count: "number",
        },
      };

      render(
        <RouteBaseTable
          location={{ search: "?flag=true&count=42" }}
          onSearchChange={mockOnSearchChange}
          restProps={restPropsWithParseTypes}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          flag: true,
          count: 42,
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用
      expect(mockOnSearchChange).toHaveBeenCalledWith("?count=42&flag=true");
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        count: 42,
        flag: true,
      });
    });

    it("should parse array types correctly", async () => {
      const restPropsWithParseTypes = {
        ...mockRestProps,
        parseTypes: {
          numbers: "number",
          strings: "string",
        },
      };

      render(
        <RouteBaseTable
          location={{ search: "?numbers=1,2,3&strings=a,b,c" }}
          onSearchChange={mockOnSearchChange}
          restProps={restPropsWithParseTypes}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          numbers: [1, 2, 3],
          strings: ["a", "b", "c"],
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用 - 初始化时不会调用
      expect(mockOnSearchChange).not.toHaveBeenCalled();
      expect(mockOnFiltersChange).not.toHaveBeenCalled();
    });
  });

  describe("路由参数变更触发远程请求测试", () => {
    it("should trigger remote request when location changes", async () => {
      const { rerender } = render(
        <RouteBaseTable
          location={{ search: "?name=initial" }}
          onSearchChange={mockOnSearchChange}
          restProps={mockRestProps}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      // 验证初始请求参数
      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          name: "initial",
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证初始调用 - 初始化时不会调用
      expect(mockOnSearchChange).not.toHaveBeenCalled();
      expect(mockOnFiltersChange).not.toHaveBeenCalled();

      // 清空捕获的参数
      capturedRequestParams = null;

      // 更新location，触发新的请求
      rerender(
        <RouteBaseTable
          location={{ search: "?name=updated&age=30" }}
          onSearchChange={mockOnSearchChange}
          restProps={mockRestProps}
        />
      );

      await waitFor(() => {
        expect(capturedRequestParams).toEqual({
          params: {
            status: "active",
            name: "updated",
            age: 30,
            page: 1,
            size: 20,
          },
          paramsSerializer: expect.any(Function),
        });

        // 验证更新后的调用
        expect(mockOnSearchChange).toHaveBeenCalledWith("?age=30&name=updated");
        expect(mockOnFiltersChange).toHaveBeenCalledWith({ age: 30, name: "updated" });
      });
    });

    it("should call onSearchChange when location changes", async () => {
      const { rerender } = render(
        <RouteBaseTable
          location={{ search: "?name=initial" }}
          onSearchChange={mockOnSearchChange}
          restProps={mockRestProps}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      // 验证初始调用 - 初始化时不会调用 onSearchChange
      expect(mockOnSearchChange).not.toHaveBeenCalled();

      // 清空mock调用记录
      mockOnSearchChange.mockClear();

      // 更新location
      rerender(
        <RouteBaseTable
          location={{ search: "?name=updated" }}
          onSearchChange={mockOnSearchChange}
          restProps={mockRestProps}
        />
      );

      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledWith("?name=updated");
      });
    });

    it("should call onFiltersChange when location changes", async () => {
      const { rerender } = render(
        <RouteBaseTable
          location={{ search: "?name=initial" }}
          onSearchChange={mockOnSearchChange}
          restProps={mockRestProps}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      // 验证初始调用 - 初始化时不会调用 onFiltersChange
      expect(mockOnFiltersChange).not.toHaveBeenCalled();

      // 清空mock调用记录
      mockOnFiltersChange.mockClear();

      // 更新location
      rerender(
        <RouteBaseTable
          location={{ search: "?name=updated&age=25" }}
          onSearchChange={mockOnSearchChange}
          restProps={mockRestProps}
        />
      );

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({ name: "updated", age: 25 });
      });
    });
  });

  describe("NumberRange 组件测试", () => {
    it("should handle NumberRange with initial value age=,1", async () => {
      const restPropsWithNumberRange = {
        ...mockRestProps,
        filterFormProps: {
          fields: [
            {
              key: "age",
              type: "number-range",
              label: "年龄范围",
            },
          ],
        },
      };

      render(
        <RouteBaseTable
          location={{ search: "?age=,1" }}
          onSearchChange={mockOnSearchChange}
          restProps={restPropsWithNumberRange}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      // 验证远程请求参数包含正确的age值
      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          age: ["", 1],
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用 - 初始化时不会调用
      expect(mockOnSearchChange).not.toHaveBeenCalled();
      expect(mockOnFiltersChange).not.toHaveBeenCalled();

    });

    it("should handle NumberRange with range values", async () => {
      const restPropsWithNumberRange = {
        ...mockRestProps,
        filterFormProps: {
          fields: [
            {
              key: "age",
              type: "number-range",
              label: "年龄范围",
            },
          ],
        },
      };

      render(
        <RouteBaseTable
          location={{ search: "?age=18,65" }}
          onSearchChange={mockOnSearchChange}
          restProps={restPropsWithNumberRange}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      // 验证远程请求参数包含正确的age值
      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          age: [18, 65],
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用 - 初始化时不会调用
      expect(mockOnSearchChange).not.toHaveBeenCalled();
      expect(mockOnFiltersChange).not.toHaveBeenCalled();

    });

    it("should handle NumberRange with single value", async () => {
      const restPropsWithNumberRange = {
        ...mockRestProps,
        filterFormProps: {
          fields: [
            {
              key: "age",
              type: "number-range",
              label: "年龄范围",
            },
          ],
        },
      };

      render(
        <RouteBaseTable
          location={{ search: "?age=25" }}
          onSearchChange={mockOnSearchChange}
          restProps={restPropsWithNumberRange}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      // 验证远程请求参数包含正确的age值
      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          age: [25],
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用 - 初始化时不会调用
      expect(mockOnSearchChange).not.toHaveBeenCalled();
      expect(mockOnFiltersChange).not.toHaveBeenCalled();

    });

    it("should handle NumberRange with empty values", async () => {
      const restPropsWithNumberRange = {
        ...mockRestProps,
        filterFormProps: {
          fields: [
            {
              key: "age",
              type: "number-range",
              label: "年龄范围",
            },
          ],
        },
      };

      render(
        <RouteBaseTable
          location={{ search: "?age=" }}
          onSearchChange={mockOnSearchChange}
          restProps={restPropsWithNumberRange}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      // 验证远程请求参数包含正确的age值
      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用
      expect(mockOnSearchChange).toHaveBeenCalledWith("");
      expect(mockOnFiltersChange).toHaveBeenCalledWith({});
    });
  });

  describe("Checkbox 组件测试", () => {
    it("should handle Checkbox with initial value gender=male", async () => {
      const restPropsWithCheckbox = {
        ...mockRestProps,
        filterFormProps: {
          fields: [
            {
              key: "gender",
              type: "checkbox",
              label: "性别",
              options: [
                { label: "男", value: "male" },
                { label: "女", value: "female" },
              ],
            },
          ],
        },
      };

      render(
        <RouteBaseTable
          location={{ search: "?gender=male" }}
          onSearchChange={mockOnSearchChange}
          restProps={restPropsWithCheckbox}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      // 验证远程请求参数包含正确的gender值
      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          gender: "male",
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用 - 初始化时不会调用
      expect(mockOnSearchChange).not.toHaveBeenCalled();
      expect(mockOnFiltersChange).not.toHaveBeenCalled();
    });

    it("should handle Checkbox with multiple values", async () => {
      const restPropsWithCheckbox = {
        ...mockRestProps,
        filterFormProps: {
          fields: [
            {
              key: "gender",
              type: "checkbox",
              label: "性别",
              options: [
                { label: "男", value: "male" },
                { label: "女", value: "female" },
              ],
            },
          ],
        },
      };

      render(
        <RouteBaseTable
          location={{ search: "?gender=male,female" }}
          onSearchChange={mockOnSearchChange}
          restProps={restPropsWithCheckbox}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      // 验证远程请求参数包含正确的gender值
      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          gender: ["male", "female"],
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用 - 初始化时不会调用
      expect(mockOnSearchChange).not.toHaveBeenCalled();
      expect(mockOnFiltersChange).not.toHaveBeenCalled();
    });

    it("should handle Checkbox with empty values", async () => {
      const restPropsWithCheckbox = {
        ...mockRestProps,
        filterFormProps: {
          fields: [
            {
              key: "gender",
              type: "checkbox",
              label: "性别",
              options: [
                { label: "男", value: "male" },
                { label: "女", value: "female" },
              ],
            },
          ],
        },
      };

      render(
        <RouteBaseTable
          location={{ search: "?gender=" }}
          onSearchChange={mockOnSearchChange}
          restProps={restPropsWithCheckbox}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      // 验证远程请求参数不包含gender字段（空值被跳过）
      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用 - 空值情况下会调用
      expect(mockOnSearchChange).toHaveBeenCalledWith("");
      expect(mockOnFiltersChange).toHaveBeenCalledWith({});
    });

    it("should handle Checkbox with single value in array format", async () => {
      const restPropsWithCheckbox = {
        ...mockRestProps,
        filterFormProps: {
          fields: [
            {
              key: "category",
              type: "checkbox",
              label: "分类",
              options: [
                { label: "分类1", value: "cat1" },
                { label: "分类2", value: "cat2" },
              ],
            },
          ],
        },
      };

      render(
        <RouteBaseTable
          location={{ search: "?category=cat1" }}
          onSearchChange={mockOnSearchChange}
          restProps={restPropsWithCheckbox}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      // 验证远程请求参数包含正确的category值
      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          category: "cat1",
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用 - 初始化时不会调用
      expect(mockOnSearchChange).not.toHaveBeenCalled();
      expect(mockOnFiltersChange).not.toHaveBeenCalled();
    });

    it("should handle Checkbox with complex multiple values", async () => {
      const restPropsWithCheckbox = {
        ...mockRestProps,
        filterFormProps: {
          fields: [
            {
              key: "tags",
              type: "checkbox",
              label: "标签",
              options: [
                { label: "标签1", value: "tag1" },
                { label: "标签2", value: "tag2" },
                { label: "标签3", value: "tag3" },
              ],
            },
          ],
        },
      };

      render(
        <RouteBaseTable
          location={{ search: "?tags=tag1,tag2,tag3&name=test" }}
          onSearchChange={mockOnSearchChange}
          restProps={restPropsWithCheckbox}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      // 验证远程请求参数包含正确的tags值
      expect(capturedRequestParams).toEqual({
        params: {
          status: "active",
          tags: ["tag1", "tag2", "tag3"],
          name: "test",
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用 - 复杂多值情况下会调用
      expect(mockOnSearchChange).toHaveBeenCalledWith("?name=test&tags=tag1,tag2,tag3");
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        tags: ["tag1", "tag2", "tag3"],
        name: "test",
      });
    });
  });

  describe("范围选择字段测试", () => {
    it("should handle dayRange and age range fields with search value 'dayRange=,2025-09-22&age=15,'", async () => {
      const restPropsWithRangeFields = {
        ...mockRestProps,
        filterFormProps: {
          fields: [
            {
              key: "dayRange",
              type: "date-range-picker",
              label: "日期范围",
            },
            {
              key: "age",
              type: "number-range",
              label: "年龄范围",
            },
          ],
        },
      };

      render(
        <RouteBaseTable
          location={{ search: "?dayRange=,2025-09-22&age=15," }}
          onSearchChange={mockOnSearchChange}
          restProps={restPropsWithRangeFields}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      // 验证远程请求参数包含正确的dayRange和age值
      expect(capturedRequestParams).toEqual({
        params: {
          dayRange: ["", "2025-09-22"],
          age: [15, ""],
          status: "active",
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用
      expect(mockOnSearchChange).toHaveBeenCalledWith("?age=15,&dayRange=,2025-09-22");
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        dayRange: ["", "2025-09-22"],
        age: [15, ""],
      });
    });

    it("should handle dayRange and age range fields with complete range values", async () => {
      const restPropsWithRangeFields = {
        ...mockRestProps,
        filterFormProps: {
          fields: [
            {
              key: "dayRange",
              type: "date-range-picker",
              label: "日期范围",
            },
            {
              key: "age",
              type: "number-range",
              label: "年龄范围",
            },
          ],
        },
      };

      render(
        <RouteBaseTable
          location={{ search: "?dayRange=2025-01-01,2025-12-31&age=18,65" }}
          onSearchChange={mockOnSearchChange}
          restProps={restPropsWithRangeFields}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      // 验证远程请求参数包含正确的dayRange和age值
      expect(capturedRequestParams).toEqual({
        params: {
          dayRange: ["2025-01-01", "2025-12-31"],
          age: [18, 65],
          status: "active",
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用
      expect(mockOnSearchChange).toHaveBeenCalledWith("?age=18,65&dayRange=2025-01-01,2025-12-31");
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        dayRange: ["2025-01-01", "2025-12-31"],
        age: [18, 65],
      });
    });

    it("should handle dayRange and age range fields with empty values", async () => {
      const restPropsWithRangeFields = {
        ...mockRestProps,
        filterFormProps: {
          fields: [
            {
              key: "dayRange",
              type: "date-range-picker",
              label: "日期范围",
            },
            {
              key: "age",
              type: "number-range",
              label: "年龄范围",
            },
          ],
        },
      };

      render(
        <RouteBaseTable
          location={{ search: "?dayRange=,&age=," }}
          onSearchChange={mockOnSearchChange}
          restProps={restPropsWithRangeFields}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
      });

      // 验证远程请求参数包含正确的dayRange和age值
      expect(capturedRequestParams).toEqual({
        params: {
          dayRange: ["", ""],
          age: ["", ""],
          status: "active",
          page: 1,
          size: 20,
        },
        paramsSerializer: expect.any(Function),
      });

      // 验证onSearchChange和onFiltersChange的调用
      expect(mockOnSearchChange).toHaveBeenCalledWith("?age=,&dayRange=,");
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        dayRange: ["", ""],
        age: ["", ""],
      });
    });
  });
});

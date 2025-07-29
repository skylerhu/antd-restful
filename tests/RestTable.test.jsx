import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEFAULT_PAGE_SIZE, FieldType } from "src/common/constants";
import RestTable, { getColumnSearchProps, genColumnKey, renderRowLabel } from "src/components/RestTable";

// Mock useSafeRequest hook
const mockMakeRequest = jest.fn();
jest.mock("src/requests", () => ({
  useSafeRequest: () => [mockMakeRequest],
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock hooks
jest.mock("src/hooks", () => ({
  ...jest.requireActual("src/hooks"),
  useInterval: () => [jest.fn()],
  useLocalStorage: jest.fn((key, defaultValue) => {
    const [value, setValue] = jest.requireActual("react").useState(defaultValue);
    return [value, setValue];
  }),
}));

describe("RestTable", () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    mockMakeRequest.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    // 抑制控制台错误
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("基本渲染测试", () => {
    it("should render basic table without restful", () => {
      const columns = [
        { title: "姓名", dataIndex: "name", key: "name" },
        { title: "年龄", dataIndex: "age", key: "age" },
      ];
      const dataSource = [
        { id: 1, name: "张三", age: 25 },
        { id: 2, name: "李四", age: 30 },
      ];

      render(<RestTable columns={columns} dataSource={dataSource} />);

      expect(screen.getByText("张三")).toBeInTheDocument();
      expect(screen.getByText("李四")).toBeInTheDocument();
      expect(screen.getByText("25")).toBeInTheDocument();
      expect(screen.getByText("30")).toBeInTheDocument();
    });

    it("should render with custom style and className", () => {
      const style = { backgroundColor: "red" };
      const className = "custom-table";
      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];
      const dataSource = [{ id: 1, name: "张三" }];

      const { container } = render(
        <RestTable style={style} className={className} columns={columns} dataSource={dataSource} />
      );

      const table = container.querySelector(".ant-table-wrapper");
      expect(table).toHaveStyle("background-color: red");
      expect(table).toHaveClass("custom-table");
    });

    it("should render with custom rowKey", () => {
      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];
      const dataSource = [{ customId: 1, name: "张三" }];

      render(<RestTable rowKey="customId" columns={columns} dataSource={dataSource} />);

      expect(screen.getByText("张三")).toBeInTheDocument();
    });
  });

  describe("远程数据请求测试", () => {
    it("should make API request when restful is provided", async () => {
      const mockResponse = {
        data: {
          results: [
            { id: 1, name: "张三", age: 25 },
            { id: 2, name: "李四", age: 30 },
          ],
          count: 2,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const columns = [
        { title: "姓名", dataIndex: "name", key: "name" },
        { title: "年龄", dataIndex: "age", key: "age" },
      ];

      render(<RestTable restful="/api/users" columns={columns} />);

      await waitFor(() => {
        expect(mockMakeRequest).toHaveBeenCalledWith({ delay: 200, key: "resttable" });
      });

      const mockGet = mockMakeRequest().get;
      expect(mockGet).toHaveBeenCalledWith("/api/users", {
        params: {
          page: 1,
          page_size: DEFAULT_PAGE_SIZE, // eslint-disable-line camelcase
        },
      });
    });

    it("should not make request when isActive is false", () => {
      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];

      render(<RestTable restful="/api/users" columns={columns} isActive={false} />);

      expect(mockMakeRequest).not.toHaveBeenCalled();
    });

    it("should handle API response correctly", async () => {
      const mockResponse = {
        data: {
          results: [
            { id: 1, name: "张三", age: 25 },
            { id: 2, name: "李四", age: 30 },
          ],
          count: 2,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const columns = [
        { title: "姓名", dataIndex: "name", key: "name" },
        { title: "年龄", dataIndex: "age", key: "age" },
      ];

      render(<RestTable restful="/api/users" columns={columns} />);

      await waitFor(() => {
        expect(screen.getByText("张三")).toBeInTheDocument();
        expect(screen.getByText("李四")).toBeInTheDocument();
        expect(screen.getByText("25")).toBeInTheDocument();
        expect(screen.getByText("30")).toBeInTheDocument();
      });
    });

    it("should handle custom parseRowsPath and parseTotalPath", async () => {
      const mockResponse = {
        data: {
          data: {
            items: [
              { id: 1, name: "张三", age: 25 },
              { id: 2, name: "李四", age: 30 },
            ],
            total: 2,
          },
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const columns = [
        { title: "姓名", dataIndex: "name", key: "name" },
        { title: "年龄", dataIndex: "age", key: "age" },
      ];

      render(
        <RestTable restful="/api/users" columns={columns} parseRowsPath="data.items" parseTotalPath="data.total" />
      );

      await waitFor(() => {
        expect(screen.getByText("张三")).toBeInTheDocument();
        expect(screen.getByText("李四")).toBeInTheDocument();
      });
    });

    it("should use custom reqConfig", async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: "张三" }],
          count: 1,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];
      const reqConfig = { timeout: 5000, headers: { "Custom-Header": "value" } };

      render(<RestTable restful="/api/users" columns={columns} reqConfig={reqConfig} />);

      await waitFor(() => {
        const mockGet = mockMakeRequest().get;
        expect(mockGet).toHaveBeenCalledWith("/api/users", {
          params: expect.any(Object),
          timeout: 5000,
          headers: { "Custom-Header": "value" },
        });
      });
    });
  });

  describe("分页测试", () => {
    it("should handle pagination correctly", async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: "张三" }],
          count: 100,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];

      render(<RestTable restful="/api/users" columns={columns} />);

      await waitFor(() => {
        expect(screen.getByText("总计：100 条")).toBeInTheDocument();
      });
    });

    it("should use custom pagination field names", async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: "张三" }],
          count: 10,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];

      render(<RestTable restful="/api/users" columns={columns} fieldPage="current" fieldPageSize="size" />);

      await waitFor(() => {
        const mockGet = mockMakeRequest().get;
        expect(mockGet).toHaveBeenCalledWith("/api/users", {
          params: {
            current: 1,
            size: DEFAULT_PAGE_SIZE,
          },
        });
      });
    });

    it("should handle custom defaultPageSize", async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: "张三" }],
          count: 10,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];

      render(<RestTable restful="/api/users" columns={columns} defaultPageSize={50} />);

      await waitFor(() => {
        const mockGet = mockMakeRequest().get;
        expect(mockGet).toHaveBeenCalledWith("/api/users", {
          params: {
            page: 1,
            page_size: 50, // eslint-disable-line camelcase
          },
        });
      });
    });
  });

  describe("筛选表单测试", () => {
    it("should render filter form when filterFormProps is provided", () => {
      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];
      const filterFormProps = {
        fields: [
          { key: "name", label: "姓名", type: "input" },
          { key: "age", label: "年龄", type: "number" },
        ],
      };

      const { container } = render(<RestTable restful="/api/users" columns={columns} filterFormProps={filterFormProps} />);

      expect(container.querySelector(".ant-form")).toBeInTheDocument();
    });

    it("should trigger API request when form is submitted", async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: "张三" }],
          count: 1,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];
      const filterFormProps = {
        fields: [{ key: "name", label: "姓名", type: "input" }],
      };

      const { container } = render(
        <RestTable restful="/api/users" columns={columns} filterFormProps={filterFormProps} />
      );
      const submitButton = container.querySelector('button[type="submit"]');
      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(() => {
        const mockGet = mockMakeRequest().get;
        expect(mockGet).toHaveBeenCalledWith("/api/users", {
          params: expect.objectContaining({
            page: 1,
            page_size: DEFAULT_PAGE_SIZE, // eslint-disable-line camelcase
          }),
        });
      });
    });

    it("should show warning when baseParams conflicts with filterFormProps", () => {
      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];
      const filterFormProps = {
        fields: [{ key: "name", label: "姓名", type: "input" }],
      };
      const baseParams = { name: "test" };

      render(
        <RestTable restful="/api/users" columns={columns} filterFormProps={filterFormProps} baseParams={baseParams} />
      );

      // eslint-disable-next-line no-console
      expect(console.warn).toHaveBeenCalledWith(
        "baseParams 与 filterFormProps.fields 两个配置的key重复了：[name]，配置冲突会导致筛选结果不符合预期"
      );
    });
  });

  describe("列配置测试", () => {
    it("should render column with labelTemplate", () => {
      const columns = [
        {
          title: "姓名",
          dataIndex: "info",
          labelTemplate: "用户：{name}",
        },
      ];
      const dataSource = [{ id: 1, info: { name: "张三" } }];

      render(<RestTable columns={columns} dataSource={dataSource} />);

      expect(screen.getByText("用户：张三")).toBeInTheDocument();
    });

    it("should render column with copyProps", () => {
      const columns = [
        {
          title: "邮箱",
          dataIndex: "email",
          copyProps: { showIcon: true },
        },
      ];
      const dataSource = [{ id: 1, email: "test@example.com" }];

      const { container } = render(<RestTable columns={columns} dataSource={dataSource} />);

      expect(container.querySelector(".anticon-copy")).toBeInTheDocument();
    });

    it("should render column with fieldName for local sorting", () => {
      const columns = [
        {
          title: "姓名",
          dataIndex: "name",
          sorter: true,
          fieldName: "user.name",
        },
      ];
      const dataSource = [
        { id: 1, user: { name: "张三" } },
        { id: 2, user: { name: "李四" } },
      ];

      render(<RestTable columns={columns} dataSource={dataSource} />);

      expect(screen.getByText("张三")).toBeInTheDocument();
      expect(screen.getByText("李四")).toBeInTheDocument();
    });

    it("should handle hidden columns", () => {
      const columns = [
        { title: "姓名", dataIndex: "name", key: "name" },
        { title: "年龄", dataIndex: "age", key: "age", hidden: true },
      ];
      const dataSource = [{ id: 1, name: "张三", age: 25 }];

      render(<RestTable columns={columns} dataSource={dataSource} />);

      expect(screen.getByText("张三")).toBeInTheDocument();
      expect(screen.queryByText("25")).not.toBeInTheDocument();
    });

    it("should handle filterMultiple configuration", () => {
      const columns = [
        {
          title: "状态",
          dataIndex: "status",
          filters: [
            { text: "活跃", value: "active" },
            { text: "非活跃", value: "inactive" },
          ],
          filterMultiple: false,
        },
      ];
      const dataSource = [{ id: 1, status: "active" }];

      render(<RestTable columns={columns} dataSource={dataSource} />);

      // 验证筛选器被正确配置
      expect(screen.getByText("状态")).toBeInTheDocument();
    });
  });

  describe("自定义筛选下拉框测试", () => {
    it("should render input type filterDropdown", () => {
      const columns = [
        {
          title: "姓名",
          dataIndex: "name",
          filterDropdownConfig: {
            type: "input",
            dropdownProps: {
              placeholder: "输入姓名搜索",
            },
          },
        },
      ];
      const dataSource = [{ id: 1, name: "张三" }];

      render(<RestTable columns={columns} dataSource={dataSource} />);

      expect(screen.getByText("姓名")).toBeInTheDocument();
    });

    it("should render select type filterDropdown", () => {
      const columns = [
        {
          title: "分类",
          dataIndex: "category",
          filterDropdownConfig: {
            type: "select",
            dropdownProps: {
              restful: "/api/categories/",
              fieldNames: { label: "name", value: "id" },
            },
          },
        },
      ];
      const dataSource = [{ id: 1, category: "技术" }];

      render(<RestTable columns={columns} dataSource={dataSource} />);

      expect(screen.getByText("分类")).toBeInTheDocument();
    });
  });

  describe("工具栏功能测试", () => {
    it("should render advanced search toggle button", () => {
      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];
      const filterFormProps = {
        fields: [{ key: "name", label: "姓名", type: "input" }],
      };

      const { container } = render(
        <RestTable restful="/api/users" columns={columns} filterFormProps={filterFormProps} tools={{ advancedSearch: true }} />
      );

      expect(container.querySelector('[aria-label="reload"]')).toBeInTheDocument();
    });

    it("should render refresh button", () => {
      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];

      const { container } = render(
        <RestTable restful="/api/users" columns={columns} tools={{ refreshInterval: 0 }} />
      );

      expect(container.querySelector('[aria-label="reload"]')).toBeInTheDocument();
    });

    it("should render download dropdown", () => {
      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];

      const { container } = render(
        <RestTable restful="/api/users" columns={columns} tools={{ downloadKey: true }} />
      );

      expect(container.querySelector('[aria-label="download"]')).toBeInTheDocument();
    });

    it("should render settings button", () => {
      const columns = [
        { title: "姓名", dataIndex: "name", key: "name" },
        { title: "年龄", dataIndex: "age", key: "age" },
      ];

      const { container } = render(
        <RestTable restful="/api/users" columns={columns} tools={{ settings: true }} />
      );

      expect(container.querySelector('[aria-label="setting"]')).toBeInTheDocument();
    });

    it("should hide tools when tools is false", () => {
      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];

      const { container } = render(<RestTable restful="/api/users" columns={columns} tools={false} />);

      expect(container.querySelector(".ant-space")).toBeInTheDocument();
      // 验证工具栏按钮不存在
      expect(container.querySelector('[aria-label="reload"]')).not.toBeInTheDocument();
    });
  });

  describe("删除行功能测试", () => {
    it("should call deleteRow method", async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: "张三" }],
          count: 1,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
        delete: jest.fn().mockResolvedValue({}),
      });

      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];
      const tableRef = React.createRef();

      render(<RestTable ref={tableRef} restful="/api/users" columns={columns} />);

      await waitFor(() => {
        expect(screen.getByText("张三")).toBeInTheDocument();
      });

      const row = { id: 1, name: "张三" };
      await act(async () => {
        tableRef.current.deleteRow(row);
      });

      const mockDelete = mockMakeRequest().delete;
      expect(mockDelete).toHaveBeenCalledWith("/api/users/1");
    });

    it("should use custom urlDetailTemplate for delete", async () => {
      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: { results: [], count: 0 } }),
        delete: jest.fn().mockResolvedValue({}),
      });

      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];
      const tableRef = React.createRef();

      render(
        <RestTable
          ref={tableRef}
          restful="/api/users"
          columns={columns}
          urlDetailTemplate="/api/users/{id}/detail/"
        />
      );

      const row = { id: 1, name: "张三" };
      await act(async () => {
        tableRef.current.deleteRow(row);
      });

      const mockDelete = mockMakeRequest().delete;
      expect(mockDelete).toHaveBeenCalledWith("/api/users/1/detail/");
    });

    it("should handle delete error", async () => {
      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: { results: [], count: 0 } }),
        delete: jest.fn().mockRejectedValue(new Error("Delete failed")),
      });

      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];
      const tableRef = React.createRef();

      render(<RestTable ref={tableRef} restful="/api/users" columns={columns} />);

      const row = { id: 1, name: "张三" };
      await act(async () => {
        tableRef.current.deleteRow(row);
      });

      // 验证删除失败时不会刷新数据
      const mockGet = mockMakeRequest().get;
      expect(mockGet).toHaveBeenCalledTimes(1); // 只调用一次初始化
    });
  });

  describe("回调函数测试", () => {
    it("should call onDataSourceChange when data changes", async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: "张三" }],
          count: 1,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const onDataSourceChange = jest.fn();
      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];

      render(<RestTable restful="/api/users" columns={columns} onDataSourceChange={onDataSourceChange} />);

      await waitFor(() => {
        expect(onDataSourceChange).toHaveBeenCalledWith({
          dataSource: [{ id: 1, name: "张三" }],
          total: 1,
        });
      });
    });

    it("should call onFiltersChange when filters change", async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: "张三" }],
          count: 1,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const onFiltersChange = jest.fn();
      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];

      render(<RestTable restful="/api/users" columns={columns} onFiltersChange={onFiltersChange} />);

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenCalledWith({});
      });
    });
  });

  describe("参数合并测试", () => {
    it("should merge baseParams, routeParams, and forceParams correctly", async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: "张三" }],
          count: 1,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];
      const baseParams = { status: "active" };
      const routeParams = { page: 2 };
      const forceParams = { category: "tech" };

      render(
        <RestTable
          restful="/api/users"
          columns={columns}
          baseParams={baseParams}
          routeParams={routeParams}
          forceParams={forceParams}
        />
      );

      await waitFor(() => {
        const mockGet = mockMakeRequest().get;
        expect(mockGet).toHaveBeenCalledWith("/api/users", {
          params: expect.objectContaining({
            status: "active",
            page: 2,
            category: "tech",
          }),
        });
      });
    });

    it("should prioritize forceParams over other params", async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: "张三" }],
          count: 1,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];
      const baseParams = { status: "active" };
      const routeParams = { status: "inactive" };
      const forceParams = { status: "pending" };

      render(
        <RestTable
          restful="/api/users"
          columns={columns}
          baseParams={baseParams}
          routeParams={routeParams}
          forceParams={forceParams}
        />
      );

      await waitFor(() => {
        const mockGet = mockMakeRequest().get;
        expect(mockGet).toHaveBeenCalledWith("/api/users", {
          params: expect.objectContaining({
            status: "pending", // forceParams 应该覆盖其他参数
          }),
        });
      });
    });
  });

  describe("本地排序和筛选测试", () => {
    it("should handle local sorting when restful is disabled", () => {
      const columns = [
        {
          title: "姓名",
          dataIndex: "name",
          sorter: true,
          fieldName: "name",
        },
      ];
      const dataSource = [
        { id: 1, name: "张三" },
        { id: 2, name: "李四" },
        { id: 3, name: "王五" },
      ];

      render(<RestTable columns={columns} dataSource={dataSource} />);

      expect(screen.getByText("张三")).toBeInTheDocument();
      expect(screen.getByText("李四")).toBeInTheDocument();
      expect(screen.getByText("王五")).toBeInTheDocument();
    });

    it("should handle local filtering when restful is disabled", () => {
      const columns = [
        {
          title: "状态",
          dataIndex: "status",
          filters: [
            { text: "活跃", value: "active" },
            { text: "非活跃", value: "inactive" },
          ],
          fieldName: "status",
        },
      ];
      const dataSource = [
        { id: 1, status: "active" },
        { id: 2, status: "inactive" },
      ];

      render(<RestTable columns={columns} dataSource={dataSource} />);

      expect(screen.getByText("状态")).toBeInTheDocument();
    });
  });

  describe("列显示设置测试", () => {
    it("should handle column visibility settings", () => {
      const columns = [
        { title: "姓名", dataIndex: "name", key: "name" },
        { title: "年龄", dataIndex: "age", key: "age" },
        { title: "邮箱", dataIndex: "email", key: "email" },
      ];
      const dataSource = [
        { id: 1, name: "张三", age: 25, email: "zhang@example.com" },
      ];

      render(
        <RestTable
          columns={columns}
          dataSource={dataSource}
          tools={{ settings: true }}
        />
      );

      expect(screen.getByText("张三")).toBeInTheDocument();
      expect(screen.getByText("25")).toBeInTheDocument();
      expect(screen.getByText("zhang@example.com")).toBeInTheDocument();
    });

    it("should use custom settings key", () => {
      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];
      const dataSource = [{ id: 1, name: "张三" }];

      render(
        <RestTable
          columns={columns}
          dataSource={dataSource}
          tools={{ settings: "custom-table-settings" }}
        />
      );

      expect(screen.getByText("张三")).toBeInTheDocument();
    });
  });

  describe("自动刷新测试", () => {
    it("should enable auto refresh when refreshInterval > 0", () => {
      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];

      const { container } = render(
        <RestTable
          restful="/api/users"
          columns={columns}
          tools={{ refreshInterval: 5000 }}
        />
      );

      expect(container.querySelector('[aria-label="reload"]')).toBeInTheDocument();
    });

    it("should hide refresh button when refreshInterval < 0", () => {
      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];

      const { container } = render(
        <RestTable
          restful="/api/users"
          columns={columns}
          tools={{ refreshInterval: -1 }}
        />
      );

      expect(container.querySelector('[aria-label="reload"]')).not.toBeInTheDocument();
    });
  });

  describe("ref 方法测试", () => {
    it("should expose refreshList method", async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: "张三" }],
          count: 1,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];
      const tableRef = React.createRef();

      render(<RestTable ref={tableRef} restful="/api/users" columns={columns} />);

      await waitFor(() => {
        expect(tableRef.current).toBeDefined();
        expect(typeof tableRef.current.refreshList).toBe("function");
        expect(typeof tableRef.current.deleteRow).toBe("function");
      });
    });

    it("should call refreshList method", async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: "张三" }],
          count: 1,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];
      const tableRef = React.createRef();

      render(<RestTable ref={tableRef} restful="/api/users" columns={columns} />);

      await waitFor(() => {
        expect(screen.getByText("张三")).toBeInTheDocument();
      });

      // 清除之前的调用记录
      mockMakeRequest().get.mockClear();

      await act(async () => {
        tableRef.current.refreshList();
      });

      expect(mockMakeRequest().get).toHaveBeenCalled();
    });
  });

  describe("快照测试", () => {
    it("should match snapshot with basic props", () => {
      const columns = [
        { title: "姓名", dataIndex: "name", key: "name" },
        { title: "年龄", dataIndex: "age", key: "age" },
      ];
      const dataSource = [
        { id: 1, name: "张三", age: 25 },
        { id: 2, name: "李四", age: 30 },
      ];

      const { container } = render(<RestTable restful="/api/users" columns={columns} dataSource={dataSource} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with filter form", () => {
      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];
      const filterFormProps = {
        fields: [{ key: "name", label: "姓名", type: "input" }],
      };

      const { container } = render(<RestTable restful="/api/users" columns={columns} filterFormProps={filterFormProps} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with custom pagination", () => {
      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];
      const antdTableProps = {
        pagination: {
          pageSize: 20,
          showSizeChanger: false,
        },
      };

      const { container } = render(<RestTable restful="/api/users" columns={columns} antdTableProps={antdTableProps} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with tools disabled", () => {
      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];

      const { container } = render(<RestTable restful="/api/users" columns={columns} tools={false} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with all tools enabled", () => {
      const columns = [{ title: "姓名", dataIndex: "name", key: "name" }];

      const { container } = render(
        <RestTable
          restful="/api/users"
          columns={columns}
          tools={{
            advancedSearch: true,
            refreshInterval: 5000,
            downloadKey: true,
            settings: true,
          }}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with showHeaderTags", () => {
      const columns = [
        {
          title: "姓名",
          dataIndex: "name",
          filterDropdownConfig: {
            type: "input",
            dropdownProps: {
              placeholder: "输入姓名搜索",
            },
          },
        },
        {
          title: "分类",
          dataIndex: "category",
          filterDropdownConfig: {
            type: "select",
            dropdownProps: {
              restful: "/api/categories/",
              fieldNames: { label: "name", value: "id" },
            },
          },
        },
        {
          title: "价格",
          dataIndex: "price",
          filterDropdownConfig: {
            type: "number_range",
            dropdownProps: {
              placeholder: "输入价格范围",
            },
          },
        },
      ];
      const dataSource = [
        { id: 1, name: "张三", category: "技术", price: 100 },
        { id: 2, name: "李四", category: "管理", price: 200 },
      ];

      const { container } = render(<RestTable columns={columns} dataSource={dataSource} showHeaderTags={true} baseParams={{ name: "u" }} />);
      expect(container.firstChild).toMatchSnapshot();
    });

  });

  describe("getColumnSearchProps 测试", () => {
    it("should return valid filter props for input type", () => {
      const column = {
        filterDropdownConfig: {
          type: FieldType.INPUT,
          dropdownProps: {
            placeholder: "输入搜索",
          },
        },
      };

      const result = getColumnSearchProps("name", column, null);

      expect(result).toBeDefined();
      expect(result.filterDropdown).toBeDefined();
      expect(result.filterIcon).toBeDefined();
      expect(result.filterDropdownProps).toBeDefined();
      expect(typeof result.filterDropdown).toBe("function");
      expect(typeof result.filterIcon).toBe("function");
    });

    it("should return valid filter props for number type", () => {
      const column = {
        filterDropdownConfig: {
          type: FieldType.NUMBER,
          dropdownProps: {
            placeholder: "输入数字",
          },
        },
      };

      const result = getColumnSearchProps("age", column, null);

      expect(result).toBeDefined();
      expect(result.filterDropdown).toBeDefined();
      expect(result.filterIcon).toBeDefined();
      expect(result.filterDropdownProps).toBeDefined();
    });

    it("should return valid filter props for select type", () => {
      const column = {
        filterDropdownConfig: {
          type: FieldType.SELECT,
          dropdownProps: {
            restful: "/api/categories/",
            fieldNames: { label: "name", value: "id" },
          },
        },
      };

      const result = getColumnSearchProps("category", column, null);

      expect(result).toBeDefined();
      expect(result.filterDropdown).toBeDefined();
      expect(result.filterIcon).toBeDefined();
      expect(result.filterDropdownProps).toBeDefined();
    });

    it("should return valid filter props for number_range type", () => {
      const column = {
        filterDropdownConfig: {
          type: FieldType.NUMBER_RANGE,
          dropdownProps: {
            placeholder: "输入范围",
          },
        },
      };

      const result = getColumnSearchProps("price", column, null);

      expect(result).toBeDefined();
      expect(result.filterDropdown).toBeDefined();
      expect(result.filterIcon).toBeDefined();
      expect(result.filterDropdownProps).toBeDefined();
    });

    it("should return valid filter props for date_range_picker type", () => {
      const column = {
        filterDropdownConfig: {
          type: FieldType.DATE_RANGE_PICKER,
          dropdownProps: {
            placeholder: "选择日期范围",
          },
        },
      };

      const result = getColumnSearchProps("created_at", column, null);

      expect(result).toBeDefined();
      expect(result.filterDropdown).toBeDefined();
      expect(result.filterIcon).toBeDefined();
      expect(result.filterDropdownProps).toBeDefined();
    });

    it("should return undefined filterDropdown for unsupported type", () => {
      const column = {
        filterDropdownConfig: {
          type: "unsupported_type",
        },
      };

      const result = getColumnSearchProps("field", column, null);

      expect(result).toBeDefined();
      // 对于不支持的类型，filterDropdown 应该返回 undefined
      const mockSetSelectedKeys = jest.fn();
      const mockSelectedKeys = [];
      const mockConfirm = jest.fn();
      const mockClearFilters = jest.fn();

      const filterDropdown = result.filterDropdown({
        setSelectedKeys: mockSetSelectedKeys,
        selectedKeys: mockSelectedKeys,
        confirm: mockConfirm,
        clearFilters: mockClearFilters,
      });

      expect(filterDropdown).toBeUndefined();
    });

    it("should handle custom style and antdSpaceProps", () => {
      const column = {
        filterDropdownConfig: {
          type: FieldType.INPUT,
          style: { padding: "16px" },
          antdSpaceProps: {
            direction: "horizontal",
            size: "large",
          },
        },
      };

      const result = getColumnSearchProps("name", column, null);

      expect(result).toBeDefined();
      expect(result.filterDropdown).toBeDefined();
    });

    it("should handle array to string conversion in handleValue", () => {
      const column = {
        filterDropdownConfig: {
          type: FieldType.NUMBER_RANGE,
        },
      };

      const result = getColumnSearchProps("field", column, null);

      // 测试 filterDropdown 函数是否能正确处理数组值
      const mockSetSelectedKeys = jest.fn();
      const mockSelectedKeys = ["10,20"];
      const mockConfirm = jest.fn();
      const mockClearFilters = jest.fn();

      const filterDropdown = result.filterDropdown({
        setSelectedKeys: mockSetSelectedKeys,
        selectedKeys: mockSelectedKeys,
        confirm: mockConfirm,
        clearFilters: mockClearFilters,
      });

      expect(filterDropdown).toBeDefined();
      // 验证返回的是一个有效的 React 元素
      expect(filterDropdown).toBeTruthy();
    });
  });

  describe("genColumnKey 测试", () => {
    it("should return key when column has key", () => {
      const column = { key: "custom_key", dataIndex: "name" };
      const result = genColumnKey(column);
      expect(result).toBe("custom_key");
    });

    it("should return dataIndex when column has no key", () => {
      const column = { dataIndex: "name" };
      const result = genColumnKey(column);
      expect(result).toBe("name");
    });

    it("should join array key with double underscore", () => {
      const column = { key: ["user", "name"], dataIndex: "name" };
      const result = genColumnKey(column);
      expect(result).toBe("user__name");
    });

    it("should join array dataIndex with double underscore", () => {
      const column = { dataIndex: ["user", "info", "name"] };
      const result = genColumnKey(column);
      expect(result).toBe("user__info__name");
    });

    it("should handle empty array", () => {
      const column = { key: [], dataIndex: "name" };
      const result = genColumnKey(column);
      expect(result).toBe("");
    });

    it("should handle undefined values", () => {
      const column = {};
      const result = genColumnKey(column);
      expect(result).toBeUndefined();
    });

    it("should prioritize key over dataIndex", () => {
      const column = { key: "priority_key", dataIndex: "fallback_name" };
      const result = genColumnKey(column);
      expect(result).toBe("priority_key");
    });
  });

  describe("renderRowLabel 测试", () => {
    it("should render simple value without template", () => {
      const record = { id: 1, name: "张三" };
      const column = { dataIndex: "name" };
      const result = renderRowLabel(record, column);
      expect(result).toBe("张三");
    });

    it("should render value with labelTemplate", () => {
      const record = { id: 1, user: { name: "张三", age: 25 } };
      const column = {
        dataIndex: "user",
        labelTemplate: "用户：{name}，年龄：{age}"
      };
      const result = renderRowLabel(record, column);
      expect(result).toBe("用户：张三，年龄：25");
    });

    it("should use fieldName when provided", () => {
      const record = { id: 1, user: { name: "张三" } };
      const column = {
        dataIndex: "name",
        fieldName: "user",
        labelTemplate: "用户：{name}"
      };
      const result = renderRowLabel(record, column);
      expect(result).toBe("用户：张三");
    });

    it("should handle empty values", () => {
      const record = { id: 1, name: null };
      const column = { dataIndex: "name" };
      const result = renderRowLabel(record, column);
      expect(result).toBeNull();
    });

    it("should render array values with comma separator", () => {
      const record = { id: 1, tags: ["技术", "前端", "React"] };
      const column = { dataIndex: "tags" };
      const result = renderRowLabel(record, column);
      expect(result).toBe("技术,前端,React");
    });

    it("should render array values with labelTemplate", () => {
      const record = { id: 1, users: [{ name: "张三" }, { name: "李四" }] };
      const column = {
        dataIndex: "users",
        labelTemplate: "用户：{name}"
      };
      const result = renderRowLabel(record, column);
      expect(result).toBe("用户：张三,用户：李四");
    });

    it("should render with showTag", () => {
      const record = { id: 1, tags: ["技术", "前端"] };
      const column = { dataIndex: "tags", showTag: true };
      const result = renderRowLabel(record, column);

      // 验证返回的是 React 元素数组
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it("should handle copyProps", () => {
      const record = { id: 1, email: "test@example.com" };
      const column = {
        dataIndex: "email",
        copyProps: { showIcon: true }
      };
      const result = renderRowLabel(record, column);

      // 验证返回的是 React 元素
      expect(result).toBeDefined();
      expect(typeof result.type).toBe("function");
    });

    it("should handle fieldValue for copy", () => {
      const record = { id: 1, user: { name: "张三", id: 123 } };
      const column = {
        dataIndex: "user",
        fieldValue: "id",
        copyProps: { showIcon: true }
      };
      const result = renderRowLabel(record, column);

      // 验证返回的是 React 元素
      expect(result).toBeDefined();
      expect(typeof result.type).toBe("function");
    });

    it("should handle complex nested data", () => {
      const record = {
        id: 1,
        profile: {
          personal: {
            name: "张三",
            contact: { email: "zhang@example.com" }
          }
        }
      };
      const column = {
        dataIndex: "profile",
        fieldName: "profile.personal",
        labelTemplate: "姓名：{name}，邮箱：{contact.email}"
      };
      const result = renderRowLabel(record, column);
      expect(result).toBe("姓名：张三，邮箱：zhang@example.com");
    });

    it("should handle mixed array and object data", () => {
      const record = {
        id: 1,
        items: [
          { name: "项目1", status: "active" },
          { name: "项目2", status: "inactive" }
        ]
      };
      const column = {
        dataIndex: "items",
        labelTemplate: "{name}({status})"
      };
      const result = renderRowLabel(record, column);
      expect(result).toBe("项目1(active),项目2(inactive)");
    });

    it("should handle empty array", () => {
      const record = { id: 1, tags: [] };
      const column = { dataIndex: "tags" };
      const result = renderRowLabel(record, column);
      expect(result).toEqual([]);
    });

    it("should handle undefined column properties", () => {
      const record = { id: 1, name: "张三" };
      const column = {};
      const result = renderRowLabel(record, column);
      expect(result).toBeUndefined();
    });
  });
});

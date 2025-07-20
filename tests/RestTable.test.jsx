import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEFAULT_PAGE_SIZE } from "src/common/constants";
import RestTable from "src/components/RestTable";

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
  });
});

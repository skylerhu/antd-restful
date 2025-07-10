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

describe("RestTable", () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    mockMakeRequest.mockClear();
    // 抑制控制台错误
    jest.spyOn(console, "error").mockImplementation(() => {});
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
  });
});

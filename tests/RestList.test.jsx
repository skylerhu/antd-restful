import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEFAULT_PAGE_SIZE } from "src/common/constants";
import RestList from "src/components/RestList";

const mockMakeRequest = jest.fn();
jest.mock("src/requests", () => ({
  useSafeRequest: () => [mockMakeRequest],
}));

jest.mock("src/hooks", () => ({
  ...jest.requireActual("src/hooks"),
}));

describe("RestList", () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    mockMakeRequest.mockClear();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("基本渲染测试", () => {
    it("should render basic list with static dataSource", () => {
      const dataSource = [
        { id: 1, name: "张三" },
        { id: 2, name: "李四" },
      ];

      render(
        <RestList
          dataSource={dataSource}
          renderItem={(item) => (
            <RestList.Item key={item.id}>
              <span>{item.name}</span>
            </RestList.Item>
          )}
        />
      );

      expect(screen.getByText("张三")).toBeInTheDocument();
      expect(screen.getByText("李四")).toBeInTheDocument();
    });

    it("should render with custom style and className", () => {
      const { container } = render(
        <RestList
          style={{ backgroundColor: "red" }}
          className="custom-list"
          dataSource={[{ id: 1, name: "张三" }]}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      const list = container.querySelector(".ant-list");
      expect(list).toHaveStyle("background-color: red");
      expect(list).toHaveClass("custom-list");
    });

    it("should expose RestList.Item as List.Item", () => {
      expect(RestList.Item).toBeDefined();
      expect(RestList.displayName).toBe("RestList");
    });
  });

  describe("远程数据请求测试", () => {
    it("should make API request when restful is provided", async () => {
      const mockResponse = {
        data: {
          results: [
            { id: 1, name: "张三" },
            { id: 2, name: "李四" },
          ],
          count: 2,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      render(
        <RestList
          restful="/api/users"
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        expect(mockMakeRequest).toHaveBeenCalledWith({ delay: 200, key: "restlist" });
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
      render(
        <RestList
          restful="/api/users"
          isActive={false}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      expect(mockMakeRequest).not.toHaveBeenCalled();
    });

    it("should handle API response correctly", async () => {
      const mockResponse = {
        data: {
          results: [
            { id: 1, name: "张三" },
            { id: 2, name: "李四" },
          ],
          count: 2,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      render(
        <RestList
          restful="/api/users"
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("张三")).toBeInTheDocument();
        expect(screen.getByText("李四")).toBeInTheDocument();
      });
    });

    it("should handle custom parseRowsPath and parseTotalPath", async () => {
      const mockResponse = {
        data: {
          data: {
            items: [{ id: 1, name: "张三" }],
            total: 1,
          },
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      render(
        <RestList
          restful="/api/users"
          parseRowsPath="data.items"
          parseTotalPath="data.total"
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("张三")).toBeInTheDocument();
      });
    });

    it("should use custom fieldPage and fieldPageSize", async () => {
      const mockResponse = {
        data: { results: [{ id: 1, name: "张三" }], count: 1 },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      render(
        <RestList
          restful="/api/users"
          fieldPage="current"
          fieldPageSize="size"
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

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

  describe("loadMore 模式测试", () => {
    it("should show load more button when there is more data", async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: "张三" }],
          count: 5,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      render(
        <RestList
          restful="/api/users"
          defaultPageSize={2}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("加载更多")).toBeInTheDocument();
      });
    });

    it("should not show load more button when all data is loaded", async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: "张三" }],
          count: 1,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      render(
        <RestList
          restful="/api/users"
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("张三")).toBeInTheDocument();
      });

      expect(screen.queryByText("加载更多")).not.toBeInTheDocument();
    });

    it("should append data when load more is clicked", async () => {
      const mockGet = jest.fn();
      mockGet
        .mockResolvedValueOnce({
          data: { results: [{ id: 1, name: "张三" }], count: 2 },
        })
        .mockResolvedValueOnce({
          data: { results: [{ id: 2, name: "李四" }], count: 2 },
        });

      mockMakeRequest.mockReturnValue({ get: mockGet });

      render(
        <RestList
          restful="/api/users"
          defaultPageSize={1}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("张三")).toBeInTheDocument();
      });

      const loadMoreBtn = screen.getByText("加载更多");
      await act(async () => {
        await user.click(loadMoreBtn);
      });

      await waitFor(() => {
        expect(screen.getByText("张三")).toBeInTheDocument();
        expect(screen.getByText("李四")).toBeInTheDocument();
      });
    });
  });

  describe("loadMoreProps 自定义测试", () => {
    it("should render custom text from loadMoreProps.text", async () => {
      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: { results: [{ id: 1, name: "张三" }], count: 5 },
        }),
      });

      render(
        <RestList
          restful="/api/users"
          defaultPageSize={2}
          loadMoreProps={{ text: "展开更多" }}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("展开更多")).toBeInTheDocument();
      });
      expect(screen.queryByText("加载更多")).not.toBeInTheDocument();
    });

    it("should apply custom style from loadMoreProps.style", async () => {
      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: { results: [{ id: 1, name: "张三" }], count: 5 },
        }),
      });

      render(
        <RestList
          restful="/api/users"
          defaultPageSize={2}
          loadMoreProps={{ style: { marginTop: 30 } }}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        const btn = screen.getByRole("button", { name: "加载更多" });
        const container = btn.parentElement;
        expect(container).toHaveStyle("margin-top: 30px");
        expect(container).toHaveStyle("text-align: center");
      });
    });

    it("should use custom render function from loadMoreProps.render", async () => {
      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: { results: [{ id: 1, name: "张三" }], count: 5 },
        }),
      });

      const customRender = jest.fn((fetchMore, loadingMore) => (
        <button onClick={fetchMore} disabled={loadingMore}>
          自定义加载
        </button>
      ));

      render(
        <RestList
          restful="/api/users"
          defaultPageSize={2}
          loadMoreProps={{ render: customRender }}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("自定义加载")).toBeInTheDocument();
      });
      expect(customRender).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Boolean),
        expect.any(Boolean)
      );
    });
  });

  describe("pagination 模式测试", () => {
    it("should not show load more button when pagination is enabled", async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: "张三" }],
          count: 5,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      render(
        <RestList
          restful="/api/users"
          defaultPageSize={2}
          pagination={true}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("张三")).toBeInTheDocument();
      });

      expect(screen.queryByText("加载更多")).not.toBeInTheDocument();
    });

    it("should show total count in pagination", async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: "张三" }],
          count: 100,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      render(
        <RestList
          restful="/api/users"
          pagination={true}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("总计：100 条")).toBeInTheDocument();
      });
    });

    it("should accept pagination as object with custom config", async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: "张三" }],
          count: 10,
        },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      render(
        <RestList
          restful="/api/users"
          defaultPageSize={2}
          pagination={{ showSizeChanger: true, pageSizeOptions: [2, 4, 10] }}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("张三")).toBeInTheDocument();
      });
    });
  });

  describe("grid + page_size 校验测试", () => {
    it("should log console.error when page_size is not multiple of grid.column", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: { results: [{ id: 1, name: "张三" }], count: 1 },
        }),
      });

      render(
        <RestList
          restful="/api/users/"
          defaultPageSize={3}
          grid={{ gutter: 16, column: 2 }}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("page_size=3 必须是 grid.column=2 的倍数"));
      });
    });

    it("should include restful in the error message", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: { results: [], count: 0 },
        }),
      });

      render(
        <RestList
          restful="/api/items/"
          defaultPageSize={5}
          grid={{ gutter: 16, column: 3 }}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('restful="/api/items/"'));
      });
    });

    it("should not log error when page_size is valid multiple", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: { results: [{ id: 1, name: "张三" }], count: 1 },
        }),
      });

      render(
        <RestList
          restful="/api/users/"
          defaultPageSize={4}
          grid={{ gutter: 16, column: 2 }}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("张三")).toBeInTheDocument();
      });

      const gridErrors = consoleSpy.mock.calls.filter(
        (call) => typeof call[0] === "string" && call[0].includes("grid.column")
      );
      expect(gridErrors).toHaveLength(0);
    });
  });

  describe("filterFormProps 测试", () => {
    it("should render filter form when filterFormProps is provided", () => {
      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: { results: [], count: 0 },
        }),
      });

      const { container } = render(
        <RestList
          restful="/api/users"
          filterFormProps={{
            fields: [{ key: "name", label: "姓名", type: "input" }],
          }}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      expect(container.querySelector(".ant-form")).toBeInTheDocument();
    });

    it("should not render filter form when restful is not provided", () => {
      const { container } = render(
        <RestList
          dataSource={[{ id: 1, name: "张三" }]}
          filterFormProps={{
            fields: [{ key: "name", label: "姓名", type: "input" }],
          }}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      expect(container.querySelector(".ant-form")).not.toBeInTheDocument();
    });

    it("should trigger search when form is submitted", async () => {
      const mockGet = jest.fn().mockResolvedValue({
        data: { results: [{ id: 1, name: "张三" }], count: 1 },
      });
      mockMakeRequest.mockReturnValue({ get: mockGet });

      const { container } = render(
        <RestList
          restful="/api/users"
          filterFormProps={{
            fields: [{ key: "name", label: "姓名", type: "input" }],
          }}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      const submitButton = container.querySelector('button[type="submit"]');
      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith("/api/users", {
          params: expect.objectContaining({ page: 1 }),
        });
      });
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

      render(
        <RestList
          restful="/api/users"
          onDataSourceChange={onDataSourceChange}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        expect(onDataSourceChange).toHaveBeenCalledWith({
          dataSource: [{ id: 1, name: "张三" }],
          total: 1,
        });
      });
    });

    it("should call onFiltersChange when filters change", async () => {
      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: { results: [], count: 0 },
        }),
      });

      const onFiltersChange = jest.fn();

      render(
        <RestList
          restful="/api/users"
          onFiltersChange={onFiltersChange}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenCalledWith({});
      });
    });
  });

  describe("参数合并测试", () => {
    it("should merge baseParams, routeParams, and forceParams", async () => {
      const mockResponse = {
        data: { results: [{ id: 1, name: "张三" }], count: 1 },
      };

      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      render(
        <RestList
          restful="/api/users"
          baseParams={{ status: "active" }}
          routeParams={{ search: "test" }}
          forceParams={{ category: "tech" }}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        const mockGet = mockMakeRequest().get;
        expect(mockGet).toHaveBeenCalledWith("/api/users", {
          params: expect.objectContaining({
            status: "active",
            search: "test",
            category: "tech",
          }),
        });
      });
    });

    it("should prioritize forceParams over other params", async () => {
      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: { results: [], count: 0 },
        }),
      });

      render(
        <RestList
          restful="/api/users"
          baseParams={{ status: "active" }}
          routeParams={{ status: "inactive" }}
          forceParams={{ status: "pending" }}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        const mockGet = mockMakeRequest().get;
        expect(mockGet).toHaveBeenCalledWith("/api/users", {
          params: expect.objectContaining({
            status: "pending",
          }),
        });
      });
    });
  });

  describe("ref 方法测试", () => {
    it("should expose refreshList, fetchMore, and getDataSource methods", async () => {
      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: { results: [{ id: 1, name: "张三" }], count: 1 },
        }),
      });

      const listRef = React.createRef();

      render(
        <RestList
          ref={listRef}
          restful="/api/users"
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        expect(listRef.current).toBeDefined();
        expect(typeof listRef.current.refreshList).toBe("function");
        expect(typeof listRef.current.fetchMore).toBe("function");
        expect(typeof listRef.current.getDataSource).toBe("function");
      });
    });

    it("should return current data from getDataSource", async () => {
      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: { results: [{ id: 1, name: "张三" }], count: 1 },
        }),
      });

      const listRef = React.createRef();

      render(
        <RestList
          ref={listRef}
          restful="/api/users"
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );

      await waitFor(() => {
        const data = listRef.current.getDataSource();
        expect(data.dataSource).toEqual([{ id: 1, name: "张三" }]);
        expect(data.total).toBe(1);
      });
    });
  });

  describe("快照测试", () => {
    it("should match snapshot with basic props", () => {
      const { container } = render(
        <RestList
          dataSource={[
            { id: 1, name: "张三" },
            { id: 2, name: "李四" },
          ]}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with grid", () => {
      const { container } = render(
        <RestList
          dataSource={[{ id: 1, name: "张三" }]}
          grid={{ gutter: 16, column: 2 }}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with pagination", () => {
      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: { results: [], count: 0 },
        }),
      });

      const { container } = render(
        <RestList
          restful="/api/users"
          pagination={true}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with filter form", () => {
      mockMakeRequest.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          data: { results: [], count: 0 },
        }),
      });

      const { container } = render(
        <RestList
          restful="/api/users"
          filterFormProps={{
            fields: [{ key: "name", label: "姓名", type: "input" }],
          }}
          renderItem={(item) => <RestList.Item key={item.id}>{item.name}</RestList.Item>}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});

import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import TableSelect from "src/components/formitems/TableSelect";
import requests from "src/requests";

const MOCK_DATA = [
  { id: 1, name: "张三", age: 25, city: "北京" },
  { id: 2, name: "李四", age: 30, city: "上海" },
  { id: 3, name: "王五", age: 28, city: "广州" },
];

const MOCK_COLUMNS = [
  { title: "姓名", dataIndex: "name", key: "name" },
  { title: "年龄", dataIndex: "age", key: "age" },
  { title: "城市", dataIndex: "city", key: "city" },
];

describe("TableSelect", () => {
  it("should render", () => {
    const { container } = render(
      <TableSelect dataSource={MOCK_DATA} columns={MOCK_COLUMNS} rowKey="id" value={[MOCK_DATA[0]]} />
    );
    // 生成快照
    expect(container).toMatchSnapshot();
  });

  it("should render in readOnly mode", () => {
    const { container } = render(
      <TableSelect dataSource={MOCK_DATA} columns={MOCK_COLUMNS} rowKey="id" value={[MOCK_DATA[0]]} readOnly />
    );
    expect(container).toMatchSnapshot();
  });

  it("should render in disabled mode", () => {
    const { container } = render(
      <TableSelect dataSource={MOCK_DATA} columns={MOCK_COLUMNS} rowKey="id" value={[MOCK_DATA[0]]} disabled />
    );
    expect(container).toMatchSnapshot();
  });

  it("should render with expandSelected", () => {
    const { container } = render(
      <TableSelect dataSource={MOCK_DATA} columns={MOCK_COLUMNS} rowKey="id" value={[MOCK_DATA[0]]} expandSelected />
    );
    expect(container).toMatchSnapshot();
  });

  it("should display selected count", () => {
    const { getByText } = render(
      <TableSelect dataSource={MOCK_DATA} columns={MOCK_COLUMNS} rowKey="id" value={[MOCK_DATA[0], MOCK_DATA[1]]} />
    );
    expect(getByText("选中 2 条数据")).toBeInTheDocument();
  });

  it("should handle row selection", () => {
    const handleChange = jest.fn();
    const { container } = render(
      <TableSelect dataSource={MOCK_DATA} columns={MOCK_COLUMNS} rowKey="id" value={[]} onChange={handleChange} />
    );

    // 找到第一行的复选框
    const checkbox = container.querySelector(".ant-checkbox-input");
    fireEvent.click(checkbox);

    // 检查是否触发了onChange
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ id: 1 })]));
  });

  it("should handle row deselection via cancel button", () => {
    const handleChange = jest.fn();
    const { container } = render(
      <TableSelect
        dataSource={MOCK_DATA}
        columns={MOCK_COLUMNS}
        rowKey="id"
        value={[MOCK_DATA[0]]}
        onChange={handleChange}
      />
    );

    // 找到取消按钮
    const cancelButton = container.querySelector(".ant-btn-text");
    fireEvent.click(cancelButton);

    // 检查是否触发了onChange，并且移除了选中项
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it("should not show cancel button in readOnly mode", () => {
    const { container } = render(
      <TableSelect dataSource={MOCK_DATA} columns={MOCK_COLUMNS} rowKey="id" value={[MOCK_DATA[0]]} readOnly />
    );

    // 取消按钮不应该存在
    const cancelButton = container.querySelector(".anticon-close");
    expect(cancelButton).toBeNull();
  });

  it("should not show cancel button in disabled mode", () => {
    const { container } = render(
      <TableSelect dataSource={MOCK_DATA} columns={MOCK_COLUMNS} rowKey="id" value={[MOCK_DATA[0]]} disabled />
    );

    // 取消按钮不应该存在
    const cancelButton = container.querySelector(".anticon-close");
    expect(cancelButton).toBeNull();
  });

  it("should fetch data when using restful", async () => {
    // Mock fetch requests
    const fetch = jest.spyOn(requests, "get").mockResolvedValue({
      data: { results: MOCK_DATA, count: MOCK_DATA.length },
    });

    const restful = "/api/tableselect";
    render(<TableSelect restful={restful} columns={MOCK_COLUMNS} rowKey="id" value={[]} />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(restful, expect.any(Object));
    });
  });

  it("should handle empty value gracefully", () => {
    const { getByText } = render(
      <TableSelect dataSource={MOCK_DATA} columns={MOCK_COLUMNS} rowKey="id" value={null} />
    );
    expect(getByText("选中 0 条数据")).toBeInTheDocument();
  });

  it("should handle custom rowKey", () => {
    const customData = [
      { customId: 1, name: "张三", age: 25 },
      { customId: 2, name: "李四", age: 30 },
    ];
    const handleChange = jest.fn();
    const { container } = render(
      <TableSelect
        dataSource={customData}
        columns={MOCK_COLUMNS}
        rowKey="customId"
        value={[]}
        onChange={handleChange}
      />
    );

    // 选择第一行
    const checkbox = container.querySelector(".ant-checkbox-input");
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ customId: 1 })]));
  });

  it("should preserve selected rows when data changes", () => {
    const handleChange = jest.fn();
    const { rerender } = render(
      <TableSelect
        dataSource={MOCK_DATA}
        columns={MOCK_COLUMNS}
        rowKey="id"
        value={[MOCK_DATA[0]]}
        onChange={handleChange}
      />
    );

    // 更改数据源，但保持选中的值
    const newData = [MOCK_DATA[1], MOCK_DATA[2]];
    rerender(
      <TableSelect
        dataSource={newData}
        columns={MOCK_COLUMNS}
        rowKey="id"
        value={[MOCK_DATA[0]]}
        onChange={handleChange}
      />
    );

    // 选中的项应该仍然存在于折叠面板中
    expect(handleChange).not.toHaveBeenCalled();
  });
});

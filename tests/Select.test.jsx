import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import RestSelect from "src/components/formitems/RestSelect";
import requests from "src/requests";

const MOCK_OPTIONS = [
  { value: 1, label: "Option 1", "data-testid": "option-1" },
  { value: 2, label: "Option 2", "data-testid": "option-2" },
];

describe("RestSelect", () => {
  // 打开下拉选择
  function toggleOpen(container) {
    const selector = container.querySelector(".ant-select-selector");
    fireEvent.mouseDown(selector);
  }

  it("should render", () => {
    const { container } = render(<RestSelect options={MOCK_OPTIONS} value={1} enableCopy />);
    // 生成快照
    expect(container).toMatchSnapshot();
  });

  it("should render in readOnly mode", () => {
    const { container } = render(<RestSelect options={MOCK_OPTIONS} value={1} readOnly />);
    expect(container).toMatchSnapshot();
  });

  it("should fetch options by value", async () => {
    // Mock fetch requests
    const fetch = jest.spyOn(requests, "get").mockResolvedValue({ data: { results: MOCK_OPTIONS } });

    const restful = "/api/options";
    const { container, getByTestId } = render(<RestSelect restful={restful} value={1} />);
    await waitFor(() => {
      // eslint-disable-next-line camelcase
      expect(fetch).toHaveBeenCalledWith(restful, expect.objectContaining({ params: { value__in: "1" } }));
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    toggleOpen(container);
    expect(getByTestId("option-1")).toBeInTheDocument();
  });

  it("should trigger onChange when value changes", async () => {
    const handleChange = jest.fn();
    const { container, getByTestId } = render(<RestSelect onChange={handleChange} options={MOCK_OPTIONS} />);
    // 触发打开下拉选择
    toggleOpen(container);
    const option = getByTestId("option-2");
    expect(option).toBeInTheDocument();
    // 点击选项
    fireEvent.click(option);
    // 触发onChange
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledWith(2, expect.anything());
  });
});

import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RestAutoComplete from "src/components/formitems/RestAutoComplete";
import requests from "src/requests";

const MOCK_OPTIONS = [
  { value: "apple", label: "Option 1", "data-testid": "option-1" },
  { value: "banana", label: "Option 2", "data-testid": "option-2" },
];

describe("RestAutoComplete", () => {
  it("should render in readOnly mode", () => {
    const { container } = render(
      <RestAutoComplete value={MOCK_OPTIONS[0].value} options={MOCK_OPTIONS} readOnly />
    );
    expect(container).toMatchSnapshot();
  });

  it("should render with basic props", async () => {
    // Mock fetch requests
    const fetch = jest.spyOn(requests, "get").mockResolvedValue({ data: { results: MOCK_OPTIONS } });

    const restful = "/api/options";
    const { getByRole, getByTitle } = render(<RestAutoComplete restful={restful} />);
    // 获取输入框
    const input = getByRole("combobox");
    const _v = "app";
    // 模拟用户输入
    await userEvent.type(input, _v);
    // 断言输入内容
    expect(input).toHaveValue(_v);
    await waitFor(() => {
      // 每输入一个字母就会触发一次; 由于是模拟用户输入，可能有些请求会被取消
      expect(fetch).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith(restful, expect.objectContaining({ params: { search: _v } }));
    });
    expect(getByTitle("Option 1")).toBeInTheDocument();
  });

  it("should trigger onChange when value changes", async () => {
    const handleChange = jest.fn();
    const { getByRole, getByTestId } = render(
      <RestAutoComplete value={1} options={MOCK_OPTIONS} onChange={handleChange} />
    );

    fireEvent.mouseDown(getByRole("combobox"));

    const option = getByTestId("option-2");
    fireEvent.click(option);

    expect(handleChange).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledWith("banana");
  });
});

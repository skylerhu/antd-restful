import fs from "fs";
import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import RestCascader from "src/components/formitems/RestCascader";
import requests from "src/requests";

const jsonData = fs.readFileSync("demo/fixtures/city.json", "utf8");
// 解析 JSON
const cityData = JSON.parse(jsonData)["rows"];

describe("RestCascader", () => {
  const fieldParent = "belong";
  // 打开下拉选择
  function toggleOpen(container) {
    const selector = container.querySelector(".ant-select-selector");
    fireEvent.mouseDown(selector);
  }

  it("should render", async () => {
    const { container, queryByTitle } = render(
      <RestCascader options={[cityData[0]]} fieldNames={{ value: "key", label: "name" }} enableCopy />
    );
    // 打开下拉选择
    toggleOpen(container);
    expect(queryByTitle("安徽")).toBeInTheDocument();
    expect(container).toMatchSnapshot();

  });

  it("should render in readOnly mode", () => {
    const { container } = render(
      <RestCascader
        value={[cityData[0].key]}
        options={[cityData[0]]}
        fieldNames={{ value: "key", label: "name" }}
        readOnly
      />
    );
    expect(container).toMatchSnapshot();
  });

  it("should trigger loadData and onChange when selecting values", async () => {
    const handleChange = jest.fn();
    const baseProps = {
      restful: "/api/cities",
      fieldParent,
      fieldNames: { value: "key", label: "name" },
      onChange: handleChange,
    };
    const mockResponse = (params) => {
      if (params?.[`${fieldParent}__isnull`]) {
        const results = cityData.filter((item) => item[fieldParent] === null);
        expect(results.length).toBeGreaterThan(1);
        expect(results.some((item) => item.key === "anhui")).toBeTruthy();
        return { data: { results } };
      }
      const rets = cityData.filter((item) => item[fieldParent] === params[fieldParent]);
      expect(rets.length).toBeGreaterThan(0);
      return { data: { results: rets } };
    };
    const mockGet = jest.spyOn(requests, "get").mockImplementation((url, { params }) => {
      return Promise.resolve(mockResponse(params));
    });

    const { container, queryByTitle } = render(<RestCascader {...baseProps} />);

    // Wait for initial load
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith("/api/cities", expect.objectContaining({
        // eslint-disable-next-line camelcase
        params: { [`${fieldParent}__isnull`]: true },
      }));
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    toggleOpen(container);
    expect(queryByTitle("安徽")).toBeInTheDocument();
    fireEvent.click(queryByTitle("安徽"));

    // Verify onChange was called
    expect(handleChange).toHaveBeenCalled();
    await waitFor(() => {
      // Verify loadData was triggered for next level
      expect(mockGet).toHaveBeenCalledWith("/api/cities", expect.objectContaining({
        params: { [fieldParent]: expect.anything() },
      }));
    });
  });
});

import fs from "fs";
import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import RestTreeSelect from "src/components/formitems/RestTreeSelect";
import requests from "src/requests";

const jsonData = fs.readFileSync("demo/fixtures/city.json", "utf8");
// 解析 JSON
const cityData = JSON.parse(jsonData)["rows"];
describe("RestTreeSelect", () => {
  const fieldParent = "belong";
  // 打开下拉选择
  function toggleOpen(container) {
    const selector = container.querySelector(".ant-select-selector");
    fireEvent.mouseDown(selector);
  }

  it("should render", async () => {
    const { container } = render(
      <RestTreeSelect options={[cityData[0]]} fieldNames={{ value: "key", label: "name" }} enableCopy />
    );
    expect(container).toMatchSnapshot();
  });

  it("should render in readOnly mode", () => {
    const { container } = render(
      <RestTreeSelect options={[cityData[0]]} fieldNames={{ value: "key", label: "name" }} readOnly />
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

    const { container, queryByTitle } = render(<RestTreeSelect {...baseProps} />);

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
  });
});

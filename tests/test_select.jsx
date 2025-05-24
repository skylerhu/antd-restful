import React from "react";
import { render } from "@testing-library/react";
import SelectView from "../src/components/SelectView";
import requests from "../src/requests";

describe("SelectView", () => {
  it("should render", () => {
    render(<SelectView />);
  });
  it("should fetch options by value and search", async () => {
    const mockData = {
      results: [
        { id: 1, name: "Option 1" },
        { id: 2, name: "Option 2" },
      ],
    };

    // Mock fetch requests
    const fetch = jest.spyOn(requests, "get").mockResolvedValue(url => {
      return mockData;
    });

    const { rerender } = render(
      <SelectView
        restful="/api/options"
        value={1}
        fieldNames={{
          label: "name",
          value: "id",
        }}
      />
    );

    // Should fetch initial options based on value
    await new Promise(resolve => setTimeout(resolve, 300));
    expect(fetch).toHaveBeenCalledWith("/api/options?id__in=1");
    expect(fetch).toHaveBeenCalledTimes(1);

  });
  afterEach(() => {
    jest.restoreAllMocks(); // 恢复所有被 spy 的方法
  });
});

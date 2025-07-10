import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import UploadView from "src/components/formitems/UploadView";
import requests from "src/requests";

describe("UploadView", () => {
  const MOCK_FILE = {
    uid: "1",
    name: "test.png",
    size: 1024,
    type: "image/png",
    status: "done",
    url: "http://example.com/test.png",
    thumbUrl: "http://example.com/thumb.png",
  };

  it("should render", () => {
    const { container } = render(<UploadView uploadUrl="/api/upload/" />);
    expect(container).toMatchSnapshot();
  });

  it("should render in readOnly mode", () => {
    const { container } = render(<UploadView uploadUrl="/api/upload/" readOnly />);
    expect(container).toMatchSnapshot();
  });

  it("should initialize with value", () => {
    const { container } = render(<UploadView uploadUrl="/api/upload/" value={MOCK_FILE} />);
    expect(container.querySelector(".ant-upload-list-item-name")).toHaveTextContent("test.png");
  });

  it("should trigger onChange when file uploaded", async () => {
    const handleChange = jest.fn();
    jest.spyOn(requests, "post").mockResolvedValue({
      data: {
        url: "http://example.com/uploaded.png",
        thumbUrl: "http://example.com/uploaded-thumb.png",
      },
    });

    const { container } = render(<UploadView uploadUrl="/api/upload/" onChange={handleChange} />);

    const input = container.querySelector("input[type=\"file\"]");
    const file = new File(["test"], "test.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalled();
      expect(handleChange.mock.calls[0][0]).toMatchObject({
        name: "test.png",
        type: "image/png",
      });
    });
  });
});

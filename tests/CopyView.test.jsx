import React from "react";
import { message } from "antd";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import copy from "copy-to-clipboard";
import CopyView from "src/components/CopyView";

// Mock copy-to-clipboard
jest.mock("copy-to-clipboard", () => jest.fn());

// Mock antd message
jest.mock("antd", () => ({
  ...jest.requireActual("antd"),
  message: {
    success: jest.fn(),
  },
}));

describe("CopyView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render basic string value", () => {
    const { container } = render(<CopyView value="hello world" />);
    expect(container).toMatchSnapshot();
    expect(screen.getByText("hello world")).toBeInTheDocument();
  });

  it("should render number value", () => {
    const { container } = render(<CopyView value={123} />);
    expect(container).toMatchSnapshot();
    expect(screen.getByText("123")).toBeInTheDocument();
  });

  it("should render boolean value", () => {
    const { container } = render(<CopyView value={true} />);
    expect(container).toMatchSnapshot();
    expect(screen.getByText("true")).toBeInTheDocument();
  });

  it("should render array value", () => {
    const { container } = render(<CopyView value={[1, 2, 3]} />);
    expect(container).toMatchSnapshot();
    expect(screen.getByText("1,2,3")).toBeInTheDocument();
  });

  it("should render object value", () => {
    const { container } = render(<CopyView value={{ name: "John", age: 30 }} />);
    expect(container).toMatchSnapshot();
  });

  it("should render with custom separator", () => {
    const { container } = render(<CopyView value={[1, 2, 3]} separator=" | " />);
    expect(container).toMatchSnapshot();
  });

  it("should render truncated text with short prop", () => {
    const { container } = render(<CopyView value="hello world" short={5} />);
    expect(container).toMatchSnapshot();
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("should render with custom children", () => {
    const { container } = render(
      <CopyView value="original value">
        <span>custom display</span>
      </CopyView>
    );
    expect(container).toMatchSnapshot();
    expect(screen.getByText("custom display")).toBeInTheDocument();
  });

  it("should render with copy icon when showIcon is true", () => {
    const { container } = render(<CopyView value="test" showIcon />);
    expect(container).toMatchSnapshot();
    expect(container.querySelector(".anticon-copy")).toBeInTheDocument();
  });

  it("should render with hidden value and copy icon", () => {
    const { container } = render(<CopyView value="secret" hiddenValue />);
    expect(container).toMatchSnapshot();
    expect(container.querySelector(".anticon-copy")).toBeInTheDocument();
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });

  it("should render with custom style and className", () => {
    const style = { color: "red" };
    const className = "custom-class";
    const { container } = render(<CopyView value="test" style={style} className={className} />);
    const span = container.querySelector("span");
    expect(span).toHaveStyle("color: red");
    expect(span).toHaveClass("custom-class");
  });

  it("should copy text when clicked", async () => {
    copy.mockReturnValue(true);
    render(<CopyView value="hello world" />);

    const text = screen.getByText("hello world");
    await userEvent.click(text);

    expect(copy).toHaveBeenCalledWith("hello world");
    expect(message.success).toHaveBeenCalledWith("复制 hello world 成功");
  });

  it("should copy via icon button when showIcon is true", async () => {
    copy.mockReturnValue(true);
    const { container } = render(<CopyView value="test" showIcon />);

    const copyButton = container.querySelector(".antd-restful-copy-button");
    await userEvent.click(copyButton);

    expect(copy).toHaveBeenCalledWith("test");
    expect(message.success).toHaveBeenCalledWith("复制 test 成功");
  });

  it("should copy via icon button when hiddenValue is true", async () => {
    copy.mockReturnValue(true);
    const { container } = render(<CopyView value="secret" hiddenValue />);

    const copyButton = container.querySelector(".antd-restful-copy-button");
    await userEvent.click(copyButton);

    expect(copy).toHaveBeenCalledWith("secret");
    expect(message.success).toHaveBeenCalledWith("复制 secret 成功");
  });

  it("should copy array with custom separator", async () => {
    copy.mockReturnValue(true);
    render(<CopyView value={[1, 2, 3]} separator=" | " />);

    const text = screen.getByText("1 | 2 | 3");
    await userEvent.click(text);

    expect(copy).toHaveBeenCalledWith("1 | 2 | 3");
    expect(message.success).toHaveBeenCalledWith("复制 1 | 2 | 3 成功");
  });

  it("should copy full text even when short is set", async () => {
    copy.mockReturnValue(true);
    render(<CopyView value="hello world" short={5} />);

    const text = screen.getByText("hello");
    await userEvent.click(text);

    expect(copy).toHaveBeenCalledWith("hello world");
    expect(message.success).toHaveBeenCalledWith("复制 hello world 成功");
  });

  it("should not copy when disabled", async () => {
    render(<CopyView value="test" disabled />);

    const text = screen.getByText("test");
    await userEvent.click(text);

    expect(copy).not.toHaveBeenCalled();
    expect(message.success).not.toHaveBeenCalled();
  });

  it("should not copy when copy function returns false", async () => {
    copy.mockReturnValue(false);
    render(<CopyView value="test" />);

    const text = screen.getByText("test");
    await userEvent.click(text);

    expect(copy).toHaveBeenCalledWith("test");
    expect(message.success).not.toHaveBeenCalled();
  });

  it("should not copy when clicking on text if showIcon is true", async () => {
    copy.mockReturnValue(true);
    render(<CopyView value="test" showIcon />);

    const text = screen.getByText("test");
    await userEvent.click(text);

    expect(copy).not.toHaveBeenCalled();
    expect(message.success).not.toHaveBeenCalled();
  });

  it("should handle empty value", () => {
    const { container } = render(<CopyView value="" />);
    expect(container.textContent).toBe("");
  });

  it("should handle null value", () => {
    const { container } = render(<CopyView value={null} />);
    expect(container.textContent).toBe("");
  });

  it("should handle undefined value", () => {
    const { container } = render(<CopyView value={undefined} />);
    expect(container.textContent).toBe("");
  });

  it("should not copy empty values", async () => {
    render(<CopyView value="" />);

    // 由于空值不会渲染任何可点击元素，所以不需要测试点击行为
    expect(copy).not.toHaveBeenCalled();
    expect(message.success).not.toHaveBeenCalled();
  });

  it("should handle complex object copying", async () => {
    copy.mockReturnValue(true);
    const complexObject = {
      users: [
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
      ],
      count: 2,
    };

    const { container } = render(<CopyView value={complexObject} showIcon />);

    const copyButton = container.querySelector(".antd-restful-copy-button");
    await userEvent.click(copyButton);

    expect(copy).toHaveBeenCalled();
    expect(message.success).toHaveBeenCalled();
  });

  it("should handle disabled copy button", async () => {
    const { container } = render(<CopyView value="test" disabled showIcon />);

    const copyButton = container.querySelector(".antd-restful-copy-button");
    await userEvent.click(copyButton);

    expect(copy).not.toHaveBeenCalled();
    expect(message.success).not.toHaveBeenCalled();
  });
});

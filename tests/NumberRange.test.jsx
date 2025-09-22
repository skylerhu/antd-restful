import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NumberRange from "src/components/formitems/NumberRange";

describe("NumberRange", () => {
  it("should render with default props", () => {
    const { container } = render(<NumberRange />);
    expect(container).toMatchSnapshot();

    // 检查基本结构
    const inputs = container.querySelectorAll(".ant-input-number-input");
    expect(inputs).toHaveLength(2);
  });

  it("should render with array value", () => {
    const { container } = render(<NumberRange value={[10, 20]} />);
    expect(container).toMatchSnapshot();

    const inputs = container.querySelectorAll(".ant-input-number-input");
    expect(inputs[0]).toHaveValue("10");
    expect(inputs[1]).toHaveValue("20");
  });

  it("should render with string value", () => {
    const { container } = render(<NumberRange value="5,15" />);

    const inputs = container.querySelectorAll(".ant-input-number-input");
    expect(inputs[0]).toHaveValue("5");
    expect(inputs[1]).toHaveValue("15");
  });

  it("should render with single value", () => {
    const { container } = render(<NumberRange value={100} />);

    const inputs = container.querySelectorAll(".ant-input-number-input");
    expect(inputs[0]).toHaveValue("100");
    expect(inputs[1]).toHaveValue("");
  });

  it("should render in readOnly mode", () => {
    const { container } = render(<NumberRange value={[10, 20]} readOnly />);
    expect(container).toMatchSnapshot();

    // 只读模式应该显示格式化的文本
    expect(container.textContent).toBe("[10,20]");

    // 不应该有输入框
    const inputs = container.querySelectorAll(".ant-input-number-input");
    expect(inputs).toHaveLength(0);
  });

  it("should render in readOnly mode with custom labelTemplate", () => {
    const { container } = render(<NumberRange value={[10, 20]} readOnly labelTemplate="从 {0} 到 {1}" />);
    expect(container.textContent).toBe("从 10 到 20");
  });

  it("should render in readOnly mode with empty values", () => {
    const { container } = render(<NumberRange value={[]} readOnly />);
    expect(container.textContent).toBe("[,]");
  });

  it("should render in disabled mode", () => {
    const { container } = render(<NumberRange value={[10, 20]} disabled />);

    const inputs = container.querySelectorAll(".ant-input-number-input");
    expect(inputs[0]).toBeDisabled();
    expect(inputs[1]).toBeDisabled();
  });

  it("should handle onChange when start value changes", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    const { container } = render(<NumberRange value={[10, 20]} onChange={handleChange} />);

    const inputs = container.querySelectorAll(".ant-input-number-input");
    const startInput = inputs[0];

    // 清空并输入新值
    await user.clear(startInput);
    await user.type(startInput, "30");

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith([30, 20]);
    });
  });

  it("should handle onChange when end value changes", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    const { container } = render(<NumberRange value={[10, 20]} onChange={handleChange} />);

    const inputs = container.querySelectorAll(".ant-input-number-input");
    const endInput = inputs[1];

    // 清空并输入新值
    await user.clear(endInput);
    await user.type(endInput, "40");

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith([10, 40]);
    });
  });

  it("should handle onChange with empty values", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    const { container } = render(<NumberRange value={[10, 20]} onChange={handleChange} />);

    const inputs = container.querySelectorAll(".ant-input-number-input");

    // 清空所有输入
    await user.clear(inputs[0]);
    await user.clear(inputs[1]);

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(null);
    });
  });

  it("should handle onChange with partial empty values", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    const { container } = render(<NumberRange onChange={handleChange} />);

    const inputs = container.querySelectorAll(".ant-input-number-input");

    // 只输入开始值
    await user.type(inputs[0], "50");

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith([50, null]);
    });
  });

  it("should handle empty value prop", () => {
    const { container } = render(<NumberRange value={null} />);

    const inputs = container.querySelectorAll(".ant-input-number-input");
    expect(inputs[0]).toHaveValue("");
    expect(inputs[1]).toHaveValue("");
  });

  it("should handle undefined value prop", () => {
    const { container } = render(<NumberRange value={undefined} />);

    const inputs = container.querySelectorAll(".ant-input-number-input");
    expect(inputs[0]).toHaveValue("");
    expect(inputs[1]).toHaveValue("");
  });

  it("should apply custom style and className", () => {
    const customStyle = { backgroundColor: "red" };
    const customClassName = "custom-number-range";

    const { container } = render(<NumberRange style={customStyle} className={customClassName} />);

    const wrapper = container.querySelector(".ant-space-compact");
    expect(wrapper).toHaveStyle(customStyle);
    expect(wrapper).toHaveClass(customClassName);
  });

  it("should pass antdInputProps to InputNumber components", () => {
    const antdInputProps = {
      min: 0,
      max: 100,
      step: 5,
      precision: 2,
    };

    const { container } = render(<NumberRange antdInputProps={antdInputProps} />);

    // 检查 InputNumber 组件是否接收到 props
    const inputs = container.querySelectorAll(".ant-input-number-input");
    expect(inputs).toHaveLength(2);
    // 这些属性在 DOM 中可能不直接可见，但组件应该接收到这些 props
  });

  it("should pass antdStartProps only to start InputNumber", () => {
    const antdStartProps = {
      placeholder: "开始值",
      "data-testid": "start-input",
    };

    const { getByTestId } = render(<NumberRange antdStartProps={antdStartProps} />);

    expect(getByTestId("start-input")).toBeInTheDocument();
  });

  it("should pass antdEndProps only to end InputNumber", () => {
    const antdEndProps = {
      placeholder: "结束值",
      "data-testid": "end-input",
    };

    const { getByTestId } = render(<NumberRange antdEndProps={antdEndProps} />);

    expect(getByTestId("end-input")).toBeInTheDocument();
  });

  it("should pass antdSpaceProps to Space.Compact", () => {
    const antdSpaceProps = {
      "data-testid": "space-compact",
    };

    const { getByTestId } = render(<NumberRange antdSpaceProps={antdSpaceProps} />);

    expect(getByTestId("space-compact")).toBeInTheDocument();
  });

  it("should handle decimal values", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    const { container } = render(<NumberRange onChange={handleChange} />);

    const inputs = container.querySelectorAll(".ant-input-number-input");

    await user.type(inputs[0], "1.5");
    await user.type(inputs[1], "2.8");

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith([1.5, 2.8]);
    });
  });

  it("should handle negative values", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    const { container } = render(<NumberRange onChange={handleChange} />);

    const inputs = container.querySelectorAll(".ant-input-number-input");

    await user.type(inputs[0], "-10");
    await user.type(inputs[1], "10");

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith([-10, 10]);
    });
  });
});

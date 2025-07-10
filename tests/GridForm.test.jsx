import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FieldType } from "src/common/constants";
import GridForm from "src/components/GridForm";

// Mock FormItems components
jest.mock("src/components/formitems", () => ({
  // eslint-disable-next-line react/prop-types
  RestSelect: ({ value, ...props }) => (
    <select data-testid="rest-select" value={value} {...props}>
      <option value="">请选择</option>
      <option value="option1">选项1</option>
      <option value="option2">选项2</option>
    </select>
  ),
  // eslint-disable-next-line react/prop-types
  DateStrPicker: ({ value, ...props }) => <input data-testid="date-picker" type="date" value={value} {...props} />,
  // eslint-disable-next-line react/prop-types
  RangeStrPicker: ({ value, ...props }) => <input data-testid="range-picker" type="text" value={value} {...props} />,
  // eslint-disable-next-line react/prop-types
  NumberRange: ({ value, ...props }) => <input data-testid="number-range" type="text" value={value} {...props} />,
  // eslint-disable-next-line react/prop-types
  RestAutoComplete: ({ value, ...props }) => <input data-testid="auto-complete" type="text" value={value} {...props} />,
  UploadView: (props) => (
    <div data-testid="upload-view" {...props}>
      Upload Component
    </div>
  ),
  // eslint-disable-next-line react/prop-types
  RestCascader: ({ value, ...props }) => <input data-testid="cascader" type="text" value={value} {...props} />,
  // eslint-disable-next-line react/prop-types
  RestTreeSelect: ({ value, ...props }) => (
    <select data-testid="tree-select" value={value} {...props}>
      <option value="">请选择</option>
      <option value="node1">节点1</option>
      <option value="node2">节点2</option>
    </select>
  ),
}));

describe("GridForm", () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    // 抑制控制台错误（因为未处理的 Promise rejection 会输出错误）
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("基本渲染测试", () => {
    it("should render with empty fields", () => {
      const { container } = render(<GridForm fields={[{ key: "username", label: "用户名", type: FieldType.INPUT }]} />);
      // 根据 type="submit" 获取提交按钮
      const submitButton = container.querySelector('button[type="submit"]');
      const resetButton = container.querySelector('button[type="reset"]');

      expect(submitButton).toBeInTheDocument();
      expect(resetButton).toBeInTheDocument();
    });

    it("should render with custom style and className", () => {
      const style = { backgroundColor: "red" };
      const className = "custom-form";
      const { container } = render(<GridForm fields={[{ key: "username", label: "用户名", type: FieldType.INPUT }]} style={style} className={className} />);

      const form = container.querySelector("form");
      expect(form).toHaveStyle("background-color: red");
      expect(form).toHaveClass("custom-form");
    });
  });

  describe("字段类型渲染测试", () => {
    it("should render INPUT field (default)", () => {
      const fields = [{ key: "username", label: "用户名", type: FieldType.INPUT }];
      render(<GridForm fields={fields} />);

      expect(screen.getByLabelText("用户名")).toBeInTheDocument();
      expect(screen.getByLabelText("用户名")).toHaveAttribute("type", "text");
    });

    it("should render INPUT field when type is not specified", () => {
      const fields = [{ key: "username", label: "用户名" }];
      render(<GridForm fields={fields} />);

      expect(screen.getByLabelText("用户名")).toBeInTheDocument();
      expect(screen.getByLabelText("用户名")).toHaveAttribute("type", "text");
    });

    it("should render SELECT field", () => {
      const fields = [{ key: "category", label: "分类", type: FieldType.SELECT }];
      render(<GridForm fields={fields} />);

      expect(screen.getByLabelText("分类")).toBeInTheDocument();
      expect(screen.getByTestId("rest-select")).toBeInTheDocument();
    });

    it("should render RADIO field", () => {
      const fields = [
        {
          key: "gender",
          label: "性别",
          type: FieldType.RADIO,
          antdFieldProps: {
            options: [
              { label: "男", value: "male" },
              { label: "女", value: "female" },
            ],
          },
        },
      ];
      render(<GridForm fields={fields} />);

      expect(screen.getByTitle("性别")).toBeInTheDocument();
      expect(screen.getByLabelText("男")).toBeInTheDocument();
      expect(screen.getByLabelText("女")).toBeInTheDocument();
    });

    it("should render CHECKBOX field", () => {
      const fields = [
        {
          key: "hobbies",
          label: "爱好",
          type: FieldType.CHECKBOX,
          antdFieldProps: {
            options: [
              { label: "读书", value: "reading" },
              { label: "运动", value: "sports" },
            ],
          },
        },
      ];
      render(<GridForm fields={fields} />);

      expect(screen.getByTitle("爱好")).toBeInTheDocument();
      expect(screen.getByLabelText("读书")).toBeInTheDocument();
      expect(screen.getByLabelText("运动")).toBeInTheDocument();
    });

    it("should render NUMBER field", () => {
      const fields = [{ key: "age", label: "年龄", type: FieldType.NUMBER }];
      render(<GridForm fields={fields} />);

      expect(screen.getByLabelText("年龄")).toBeInTheDocument();
      expect(screen.getByLabelText("年龄")).toHaveClass("ant-input-number-input");
    });

    it("should render DATE_PICKER field", () => {
      const fields = [{ key: "birthday", label: "生日", type: FieldType.DATE_PICKER }];
      render(<GridForm fields={fields} />);

      expect(screen.getByLabelText("生日")).toBeInTheDocument();
      expect(screen.getByTestId("date-picker")).toBeInTheDocument();
    });

    it("should render DATE_RANGE_PICKER field", () => {
      const fields = [{ key: "dateRange", label: "日期范围", type: FieldType.DATE_RANGE_PICKER }];
      render(<GridForm fields={fields} />);

      expect(screen.getByLabelText("日期范围")).toBeInTheDocument();
      expect(screen.getByTestId("range-picker")).toBeInTheDocument();
    });

    it("should render NUMBER_RANGE field", () => {
      const fields = [{ key: "priceRange", label: "价格范围", type: FieldType.NUMBER_RANGE }];
      render(<GridForm fields={fields} />);

      expect(screen.getByLabelText("价格范围")).toBeInTheDocument();
      expect(screen.getByTestId("number-range")).toBeInTheDocument();
    });

    it("should render AUTO_COMPLETE field", () => {
      const fields = [{ key: "city", label: "城市", type: FieldType.AUTO_COMPLETE }];
      render(<GridForm fields={fields} />);

      expect(screen.getByLabelText("城市")).toBeInTheDocument();
      expect(screen.getByTestId("auto-complete")).toBeInTheDocument();
    });

    it("should render UPLOAD field", () => {
      const fields = [{ key: "avatar", label: "头像", type: FieldType.UPLOAD }];
      render(<GridForm fields={fields} />);

      expect(screen.getByTitle("头像")).toBeInTheDocument();
      expect(screen.getByTestId("upload-view")).toBeInTheDocument();
    });

    it("should render CASCADER field", () => {
      const fields = [{ key: "location", label: "地区", type: FieldType.CASCADER }];
      render(<GridForm fields={fields} />);

      expect(screen.getByLabelText("地区")).toBeInTheDocument();
      expect(screen.getByTestId("cascader")).toBeInTheDocument();
    });

    it("should render TREE_SELECT field", () => {
      const fields = [{ key: "department", label: "部门", type: FieldType.TREE_SELECT }];
      render(<GridForm fields={fields} />);

      expect(screen.getByLabelText("部门")).toBeInTheDocument();
      expect(screen.getByTestId("tree-select")).toBeInTheDocument();
    });

    it("should render custom field with render function", () => {
      const fields = [
        {
          key: "custom",
          label: "自定义字段",
          render: () => <div data-testid="custom-field">Custom Content</div>,
        },
      ];
      render(<GridForm fields={fields} />);

      expect(screen.getByTitle("自定义字段")).toBeInTheDocument();
      expect(screen.getByTestId("custom-field")).toBeInTheDocument();
    });
  });

  describe("初始值测试", () => {
    it("should render with string initial value", () => {
      const fields = [{ key: "name", label: "姓名", type: FieldType.INPUT }];
      const initialValues = { name: "张三" };
      render(<GridForm fields={fields} initialValues={initialValues} />);

      expect(screen.getByLabelText("姓名")).toHaveValue("张三");
    });

    it("should render with boolean initial value for checkbox", () => {
      const fields = [
        {
          key: "agree",
          label: "同意协议",
          type: FieldType.CHECKBOX,
          antdFieldProps: {
            options: [{ label: "同意", value: true }],
          },
        },
      ];
      const initialValues = { agree: [true] };
      render(<GridForm fields={fields} initialValues={initialValues} />);

      expect(screen.getByLabelText("同意")).toBeChecked();
    });

    it("should render with array initial value for checkbox group", () => {
      const fields = [
        {
          key: "hobbies",
          label: "爱好",
          type: FieldType.CHECKBOX,
          antdFieldProps: {
            options: [
              { label: "读书", value: "reading" },
              { label: "运动", value: "sports" },
              { label: "音乐", value: "music" },
            ],
          },
        },
      ];
      const initialValues = { hobbies: ["reading", "sports"] };
      render(<GridForm fields={fields} initialValues={initialValues} />);

      expect(screen.getByLabelText("读书")).toBeChecked();
      expect(screen.getByLabelText("运动")).toBeChecked();
      expect(screen.getByLabelText("音乐")).not.toBeChecked();
    });

    it("should render with radio initial value", () => {
      const fields = [
        {
          key: "gender",
          label: "性别",
          type: FieldType.RADIO,
          antdFieldProps: {
            options: [
              { label: "男", value: "male" },
              { label: "女", value: "female" },
            ],
          },
        },
      ];
      const initialValues = { gender: "male" };
      render(<GridForm fields={fields} initialValues={initialValues} />);

      expect(screen.getByLabelText("男")).toBeChecked();
      expect(screen.getByLabelText("女")).not.toBeChecked();
    });
  });

  describe("表单交互测试", () => {
    it("should call onSubmit with form values when submit button is clicked", async () => {
      const mockOnSubmit = jest.fn();
      const fields = [{ key: "name", label: "姓名", type: FieldType.INPUT }];
      const initialValues = { name: "测试用户" };

      const { container } = render(<GridForm fields={fields} initialValues={initialValues} onSubmit={mockOnSubmit} />);

      const submitButton = container.querySelector('button[type="submit"]');

      await user.click(submitButton);

      // Wait for the async form validation to complete
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({ name: "测试用户" });
      }, { timeout: 3000 });
    });

    it("should call onReset when reset button is clicked", async () => {
      const mockOnReset = jest.fn();
      const fields = [{ key: "name", label: "姓名", type: FieldType.INPUT }];
      const initialValues = { name: "测试用户" };

      const { container } = render(<GridForm fields={fields} initialValues={initialValues} onReset={mockOnReset} />);

      const resetButton = container.querySelector('button[type="reset"]');
      await user.click(resetButton);

      expect(mockOnReset).toHaveBeenCalledWith({ name: "测试用户" });
    });

    it("should call onValuesChange when form values change", async () => {
      const mockOnValuesChange = jest.fn();
      const fields = [{ key: "name", label: "姓名", type: FieldType.INPUT }];

      render(<GridForm fields={fields} onValuesChange={mockOnValuesChange} />);

      const input = screen.getByLabelText("姓名");
      await user.type(input, "新用户");

      await waitFor(() => {
        expect(mockOnValuesChange).toHaveBeenCalled();
      });
    });

    it("should trigger submit on Enter key press in input field", async () => {
      const mockOnSubmit = jest.fn();
      const fields = [{ key: "name", label: "姓名", type: FieldType.INPUT }];

      render(<GridForm fields={fields} onSubmit={mockOnSubmit} />);

      const input = screen.getByTitle("姓名");
      await user.type(input, "测试用户");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({ name: "测试用户" });
      });
    });
  });

  describe("ref 方法测试", () => {
    it("should expose form instance via ref", () => {
      const ref = React.createRef();
      const fields = [{ key: "name", label: "姓名", type: FieldType.INPUT }];

      render(<GridForm ref={ref} fields={fields} />);

      expect(ref.current).toBeDefined();
      expect(ref.current.getFormInstance).toBeDefined();
      expect(typeof ref.current.getFormInstance).toBe("function");

      const formInstance = ref.current.getFormInstance();
      expect(formInstance).toBeDefined();
      expect(formInstance.validateFields).toBeDefined();
      expect(formInstance.resetFields).toBeDefined();
      expect(formInstance.getFieldsValue).toBeDefined();
    });
  });

  describe("表单验证测试", () => {
    it("should not call onSubmit when form validation fails", async () => {
      const mockOnSubmit = jest.fn();
      const fields = [
        {
          key: "email",
          label: "邮箱",
          type: FieldType.INPUT,
          antdFormItemProps: {
            rules: [{ required: true, message: "请输入邮箱" }],
          },
        },
      ];

      const { container } = render(<GridForm fields={fields} onSubmit={mockOnSubmit} />);
      const submitButton = container.querySelector('button[type="submit"]');

      await user.click(submitButton);

      // 等待异步操作和错误显示
      await waitFor(() => {
        // 检查是否显示了验证错误信息
        expect(screen.getByText("请输入邮箱")).toBeInTheDocument();
      });

      // onSubmit 不应该被调用
      expect(mockOnSubmit).not.toHaveBeenCalled();

    });
  });

  describe("props 传递测试", () => {
    it("should pass antdFormProps to Form component", () => {
      const fields = [{ key: "name", label: "姓名", type: FieldType.INPUT }];
      const antdFormProps = {
        layout: "vertical",
        size: "large",
      };

      const { container } = render(<GridForm fields={fields} antdFormProps={antdFormProps} />);

      const form = container.querySelector("form");
      expect(form).toHaveClass("ant-form-vertical");
      expect(form).toHaveClass("ant-form-large");
    });

    it("should pass antdListProps to List component", () => {
      const fields = [{ key: "name", label: "姓名", type: FieldType.INPUT }];
      const antdListProps = {
        grid: { gutter: 20, xs: 1, sm: 1, md: 2 },
      };

      render(<GridForm fields={fields} antdListProps={antdListProps} />);

      // List组件应该正常渲染
      expect(screen.getByLabelText("姓名")).toBeInTheDocument();
    });

    it("should pass antdFormItemProps to FormItem", () => {
      const fields = [
        {
          key: "name",
          label: "姓名",
          type: FieldType.INPUT,
          antdFormItemProps: {
            help: "请输入您的真实姓名",
            extra: "用于身份验证",
          },
        },
      ];

      render(<GridForm fields={fields} />);

      expect(screen.getByText("请输入您的真实姓名")).toBeInTheDocument();
      expect(screen.getByText("用于身份验证")).toBeInTheDocument();
    });

    it("should pass antdFieldProps to field component", () => {
      const fields = [
        {
          key: "name",
          label: "姓名",
          type: FieldType.INPUT,
          antdFieldProps: {
            placeholder: "请输入姓名",
            maxLength: 20,
          },
        },
      ];

      render(<GridForm fields={fields} />);

      const input = screen.getByLabelText("姓名");
      expect(input).toHaveAttribute("placeholder", "请输入姓名");
      expect(input).toHaveAttribute("maxlength", "20");
    });
  });

  describe("边界情况测试", () => {
    it("should handle fields without label", () => {
      const fields = [{ key: "noLabel", type: FieldType.INPUT }];

      render(<GridForm fields={fields} />);

      expect(screen.getByLabelText("noLabel")).toBeInTheDocument();
    });

    it("should handle fields without type", () => {
      const fields = [{ key: "defaultType", label: "默认类型" }];

      render(<GridForm fields={fields} />);

      expect(screen.getByLabelText("默认类型")).toBeInTheDocument();
      expect(screen.getByLabelText("默认类型")).toHaveAttribute("type", "text");
    });
  });
});

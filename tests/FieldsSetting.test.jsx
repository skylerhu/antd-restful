import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FieldsSetting from "src/components/FieldsSetting";
import * as hooks from "src/hooks";

// Mock hooks
jest.mock("src/hooks", () => ({
  useSettingsStorage: jest.fn(),
}));


describe("FieldsSetting", () => {
  let user;
  let mockUseSettingsStorage;

  const mockFields = [
    { key: "name", label: "Name" },
    { key: "age", label: "Age" },
    { key: "email", label: "Email", hidden: true },
    { key: "address", label: "Address" },
  ];

  beforeEach(() => {
    user = userEvent.setup();
    localStorage.clear();

    // Mock useSettingsStorage hook
    mockUseSettingsStorage = hooks.useSettingsStorage;
    mockUseSettingsStorage.mockReturnValue({
      keys: ["name", "age", "address"],
      setKeys: jest.fn(),
      allKeys: ["name", "age", "email", "address"],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render with default button when no children provided", () => {
    render(
      <FieldsSetting
        storageKey="test-key"
        value={mockFields}
      />
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should render with custom children", () => {
    render(
      <FieldsSetting
        storageKey="test-key"
        value={mockFields}
      >
        <button>Custom Button</button>
      </FieldsSetting>
    );

    expect(screen.getByText("Custom Button")).toBeInTheDocument();
  });

  it("should display tooltip content when clicked", async () => {
    render(
      <FieldsSetting
        storageKey="test-key"
        value={mockFields}
        title="字段设置"
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("字段设置")).toBeInTheDocument();
      expect(screen.getByText("全选")).toBeInTheDocument();
    });
  });

  it("should display all field options in checkbox group", async () => {
    render(
      <FieldsSetting
        storageKey="test-key"
        value={mockFields}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Age")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Address")).toBeInTheDocument();
    });
  });

  it("should handle label as node type and display checkbox correctly", async () => {
    const fieldsWithNodeLabel = [
      {
        key: "name",
        label: <span data-testid="custom-label">Custom Name Label</span>
      },
      {
        key: "age",
        label: <div>Age Field</div>
      },
    ];

    render(
      <FieldsSetting
        storageKey="test-key"
        value={fieldsWithNodeLabel}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("custom-label")).toBeInTheDocument();
      expect(screen.getByText("Custom Name Label")).toBeInTheDocument();
      expect(screen.getByText("Age Field")).toBeInTheDocument();
    });
  });

  it("should display tip icon when field has tip property", async () => {
    const fieldsWithTip = [
      {
        key: "name",
        label: "Name",
        tip: "This is a helpful tip for name field"
      },
      {
        key: "age",
        label: "Age",
        tip: "Age field tip"
      },
    ];

    render(
      <FieldsSetting
        storageKey="test-key"
        value={fieldsWithTip}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      // Check that tip icons are rendered (excluding the setting button icon)
      const tipIcons = screen.getAllByLabelText("question-circle");
      expect(tipIcons).toHaveLength(2);
    });
  });

  it("should display tip icon with node label and tip", async () => {
    const fieldsWithNodeLabelAndTip = [
      {
        key: "name",
        label: <span>Custom Name</span>,
        tip: "This is a helpful tip"
      },
    ];

    render(
      <FieldsSetting
        storageKey="test-key"
        value={fieldsWithNodeLabelAndTip}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("Custom Name")).toBeInTheDocument();
      // Check that tip icon is rendered
      const tipIcon = screen.getByLabelText("question-circle");
      expect(tipIcon).toBeInTheDocument();
    });
  });

  it("should handle disabled fields correctly", async () => {
    const fieldsWithDisabled = [
      { key: "name", label: "Name", hidden: false }, // disabled
      { key: "age", label: "Age" },
    ];

    render(
      <FieldsSetting
        storageKey="test-key"
        value={fieldsWithDisabled}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      // The disabled field should still be visible but not selectable
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Age")).toBeInTheDocument();
    });
  });

  it("should call onChange when selection changes", async () => {
    const onChange = jest.fn();

    render(
      <FieldsSetting
        storageKey="test-key"
        value={mockFields}
        onChange={onChange}
      />
    );

    // The onChange should be called during initialization
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  it("should handle empty value array", async () => {
    render(
      <FieldsSetting
        storageKey="test-key"
        value={[]}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("全选")).toBeInTheDocument();
      // Should not crash with empty array
    });
  });

  it("should handle undefined value", async () => {
    render(
      <FieldsSetting
        storageKey="test-key"
        value={undefined}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("全选")).toBeInTheDocument();
      // Should not crash with undefined value
    });
  });

  it("should handle select all functionality", async () => {
    const mockSetKeys = jest.fn();
    mockUseSettingsStorage.mockReturnValue({
      keys: ["name", "age"],
      setKeys: mockSetKeys,
      allKeys: ["name", "age", "email", "address"],
    });

    render(
      <FieldsSetting
        storageKey="test-key"
        value={mockFields}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      const selectAllCheckbox = screen.getByText("全选").closest("label").querySelector("input[type='checkbox']");
      expect(selectAllCheckbox).toBeInTheDocument();
    });
  });

  it("should handle individual checkbox selection", async () => {
    const mockSetKeys = jest.fn();
    mockUseSettingsStorage.mockReturnValue({
      keys: ["name"],
      setKeys: mockSetKeys,
      allKeys: ["name", "age", "email", "address"],
    });

    render(
      <FieldsSetting
        storageKey="test-key"
        value={mockFields}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      // Check that individual checkboxes are rendered
      const nameCheckbox = screen.getByDisplayValue("name");
      const ageCheckbox = screen.getByDisplayValue("age");
      expect(nameCheckbox).toBeInTheDocument();
      expect(ageCheckbox).toBeInTheDocument();
    });
  });

  it("should display indeterminate state for partial selection", async () => {
    const mockSetKeys = jest.fn();
    mockUseSettingsStorage.mockReturnValue({
      keys: ["name", "age"], // partial selection
      setKeys: mockSetKeys,
      allKeys: ["name", "age", "email", "address"],
    });

    render(
      <FieldsSetting
        storageKey="test-key"
        value={mockFields}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      const selectAllCheckboxSpan = screen.getByText("全选").closest("label").querySelector(".ant-checkbox");
      expect(selectAllCheckboxSpan).toHaveClass("ant-checkbox-indeterminate");
    });
  });

  it("should display checked state for full selection", async () => {
    const mockSetKeys = jest.fn();
    mockUseSettingsStorage.mockReturnValue({
      keys: ["name", "age", "email", "address"], // full selection
      setKeys: mockSetKeys,
      allKeys: ["name", "age", "email", "address"],
    });

    render(
      <FieldsSetting
        storageKey="test-key"
        value={mockFields}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      const selectAllCheckbox = screen.getByText("全选").closest("label").querySelector("input[type='checkbox']");
      expect(selectAllCheckbox).toBeChecked();
    });
  });

  it("should call setKeys with allKeys when select all checkbox is checked", async () => {
    const mockSetKeys = jest.fn();
    mockUseSettingsStorage.mockReturnValue({
      keys: ["name", "age"], // partial selection
      setKeys: mockSetKeys,
      allKeys: ["name", "age", "email", "address"],
    });

    render(
      <FieldsSetting
        storageKey="test-key"
        value={mockFields}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      const selectAllCheckbox = screen.getByText("全选").closest("label").querySelector("input[type='checkbox']");
      expect(selectAllCheckbox).toBeInTheDocument();
    });

    // Click the select all checkbox
    const selectAllCheckbox = screen.getByText("全选").closest("label").querySelector("input[type='checkbox']");
    await user.click(selectAllCheckbox);

    // Verify setKeys was called with allKeys
    expect(mockSetKeys).toHaveBeenCalledWith(["name", "age", "email", "address"]);
  });

  it("should call setKeys with forceChecks when select all checkbox is unchecked", async () => {
    const mockSetKeys = jest.fn();
    mockUseSettingsStorage.mockReturnValue({
      keys: ["name", "age", "email", "address"], // full selection
      setKeys: mockSetKeys,
      allKeys: ["name", "age", "email", "address"],
    });

    // Mock fields with some disabled (forceChecks)
    const fieldsWithDisabled = [
      { key: "name", label: "Name", hidden: false }, // disabled
      { key: "age", label: "Age" },
      { key: "email", label: "Email" },
      { key: "address", label: "Address" },
    ];

    render(
      <FieldsSetting
        storageKey="test-key"
        value={fieldsWithDisabled}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      const selectAllCheckbox = screen.getByText("全选").closest("label").querySelector("input[type='checkbox']");
      expect(selectAllCheckbox).toBeInTheDocument();
    });

    // Click the select all checkbox to uncheck it
    const selectAllCheckbox = screen.getByText("全选").closest("label").querySelector("input[type='checkbox']");
    await user.click(selectAllCheckbox);

    // Verify setKeys was called with forceChecks (disabled fields)
    expect(mockSetKeys).toHaveBeenCalledWith(["name"]);
  });

  it("should handle individual checkbox group onChange", async () => {
    const mockSetKeys = jest.fn();
    mockUseSettingsStorage.mockReturnValue({
      keys: ["name"],
      setKeys: mockSetKeys,
      allKeys: ["name", "age", "email", "address"],
    });

    render(
      <FieldsSetting
        storageKey="test-key"
        value={mockFields}
      />
    );

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      const ageCheckbox = screen.getByDisplayValue("age");
      expect(ageCheckbox).toBeInTheDocument();
    });

    // Click the age checkbox
    const ageCheckbox = screen.getByDisplayValue("age");
    await user.click(ageCheckbox);

    // Verify setKeys was called with the new selection
    expect(mockSetKeys).toHaveBeenCalledWith(["name", "age"]);
  });
});

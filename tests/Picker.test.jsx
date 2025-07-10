import React from "react";
import { render } from "@testing-library/react";
import DateStrPicker from "src/components/formitems/DateStrPicker";
import RangeStrPicker from "src/components/formitems/RangeStrPicker";

describe("DateStrPicker", () => {
  it("should render", () => {
    const { container } = render(<DateStrPicker value="2025-05-25" />);
    expect(container).toMatchSnapshot();
  });
  it("should render in readOnly mode", () => {
    const { container } = render(<DateStrPicker value="12:00" readOnly picker="time" />);
    expect(container).toMatchSnapshot();
  });
});

describe("RangeStrPicker", () => {
  it("should render", () => {
    const { container } = render(<RangeStrPicker value={"2025-05-25,2025-05-26"} />);
    expect(container).toMatchSnapshot();

    const { container: container2 } = render(<RangeStrPicker value={"2025_05_25"} format="YYYY_MM_DD" />);
    expect(container2).toMatchSnapshot();
  });
  it("should render in readOnly mode", () => {
    const { container } = render(<RangeStrPicker value={"2025-05-25,2025-05-26"} readOnly />);
    expect(container).toMatchSnapshot();
  });
});

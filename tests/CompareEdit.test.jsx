import React from "react";
import { render } from "@testing-library/react";
import RestSelect from "src/components/formitems/RestSelect";
import CompareEdit from "src/components/formitems/CompareEdit";

const MOCK_OPTIONS = [
  { value: 1, label: "Option 1", "data-testid": "option-1" },
  { value: 2, label: "Option 2", "data-testid": "option-2" },
];
describe("CompareEdit", () => {
  it("should render in readOnly mode", () => {
    const { container } = render(
      <CompareEdit historyValue={1} fieldValue="value" readOnly>
        <RestSelect options={MOCK_OPTIONS} />
      </CompareEdit>
    );
    expect(container).toMatchSnapshot();
  });
  it("should render with history value", () => {
    const { container } = render(
      <CompareEdit historyValue={1} fieldValue="value">
        <RestSelect options={MOCK_OPTIONS} />
      </CompareEdit>
    );
    expect(container).toMatchSnapshot();
  });

  it("should render when value changes", async () => {
    const { container } = render(
      <CompareEdit historyValue={1} fieldValue="value">
        <RestSelect options={MOCK_OPTIONS} value={2} />
      </CompareEdit>
    );
    expect(container).toMatchSnapshot();
  });
});



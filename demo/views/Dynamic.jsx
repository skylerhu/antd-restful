import React from "react";
import { Form } from "antd";

import { SelectView } from "../libs";

export default function Main() {
  return (
    <div>
      Hello World
      <Form>
        <Form.Item name="name" label="Name">
          <SelectView
            options={[
              { label: "first", value: 1 },
              { label: "second", value: 2 },
            ]}
          />
        </Form.Item>
      </Form>
    </div>
  );
}

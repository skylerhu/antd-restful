import React from "react";
import { Tabs } from "antd";

import DynamicForm from "./views/Dynamic";

export default function Main() {
  return (
    <Tabs
      items={[
        {
          key: "dynamic_form",
          label: "动态表单",
          children: <DynamicForm />,
        },
      ]}
    />
  );
}

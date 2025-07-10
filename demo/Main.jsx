import React from "react";
import { Tabs } from "antd";
import { useNavigate, useParams } from "react-router";
import ReadView from "./views/ReadView";
import DynamicForm from "./views/StaticForm";
import JSONForm from "./views/JSONForm";
import TableDemo from "./views/TableDemo";

export default function Main() {
  const navigate = useNavigate();
  const { tab } = useParams();

  return (
    <Tabs
      activeKey={tab || "form"}
      destroyInactiveTabPane
      items={[
        {
          key: "form",
          label: "自定义表单",
          children: <DynamicForm />,
        },
        {
          key: "read",
          label: "只读",
          children: <ReadView />,
        },
        {
          key: "jsonform",
          label: "JSON表单",
          children: <JSONForm />,
        },
        {
          key: "table",
          label: "路由列表",
          children: <TableDemo />,
        },
      ]}
      onChange={(key) => {
        navigate(`/${key}`);
      }}
    />
  );
}

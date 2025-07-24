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
          label: "StaticForm",
          children: <DynamicForm />,
        },
        {
          key: "read",
          label: "ReadView",
          children: <ReadView />,
        },
        {
          key: "jsonform",
          label: "JSONForm",
          children: <JSONForm />,
        },
        {
          key: "table",
          label: "TableDemo & RouteTable",
          children: <TableDemo />,
        },
      ]}
      onChange={(key) => {
        navigate(`/${key}`);
      }}
    />
  );
}

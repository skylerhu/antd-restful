import React, { useState } from "react";
import { Button, Checkbox } from "antd";
import libs from "demo/libs";
import RouteTable from "./RouteTable";

const {
  RestTable,
  constants: { FieldType },
} = libs;

const TableDemo = () => {
  const [linkRoute, setLinkRoute] = useState(true);

  const Component = linkRoute ? RouteTable : RestTable;
  return (
    <div>
      <Checkbox
        style={{ marginBottom: 20 }}
        checked={linkRoute}
        onChange={(e) => {
          setLinkRoute(e.target.checked);
        }}
      >
        联动路由
      </Checkbox>
      <Component
        restful="api/users/"
        baseParams={{
          // search: "u",
          nickname: "u",
          page_size: 2, // eslint-disable-line camelcase
          // age__range: [0, 100], // eslint-disable-line camelcase
          // gender: "female",
        }}
        showHeaderTags={true}
        tools={{
          downloadKey: "_download",
          advancedSearch: true,
          settings: true,
          // refreshInterval: 3000,
          advancedDefaultOpen: true,
        }}
        // tools={false}
        extraTools={
          <>
            <Button>按钮1</Button>
            <Button>按钮2</Button>
          </>
        }
        columns={[
          {
            title: "ID",
            dataIndex: "id",
          },
          {
            title: "唯一标识",
            dataIndex: "username",
            sorter: true,
            filterMultiple: true,
            filterDropdownConfig: {
              type: FieldType.SELECT,
              dropdownProps: {
                mode: "multiple",
                restful: "api/users/",
                fieldNames: {
                  label: "nickname",
                  value: "username",
                },
              },
              antdSpaceProps: {
                direction: "horizontal",
              },
            },
          },
          {
            title: "名称",
            dataIndex: "nickname",
            sorter: true,
            filterDropdownConfig: {
              type: FieldType.INPUT,
            },
            filterMultiple: false,
          },
          {
            title: "性别",
            dataIndex: "gender__in",
            fieldName: "gender",
            sorter: true,
            filters: [
              {
                text: "男",
                value: "male",
              },
              {
                text: "女",
                value: "female",
              },
            ],
          },
          {
            title: "年龄",
            dataIndex: "age__range",
            sorter: true,
            filterMultiple: false,
            render: (value, record) => record.age,
            filterDropdownConfig: {
              type: FieldType.NUMBER_RANGE,
            },
            dropdownLocalConfig: {
              type: FieldType.NUMBER,
            },
          },
          {
            title: "城市",
            dataIndex: "city",
            labelTemplate: "城市：{name}",
            hidden: true,
          },
          {
            key: "key1",
            title: "key1",
          },
          {
            key: "key2",
            title: "key2",
          },
          // {
          //   key: "key3",
          //   title: "key3",
          // },
          // {
          //   key: "key4",
          //   title: "key4",
          // },
          // {
          //   key: "key5",
          //   title: "key5",
          // },
          // {
          //   key: "key6",
          //   title: "key6",
          // },
          // {
          //   key: "key7",
          //   title: "key7",
          // },
        ]}
        filterFormProps={{
          advancedSearch: true,
          antdListProps: {
            grid: { gutter: 30, column: 3 },
          },
          fields: [
            {
              key: "age",
              type: FieldType.NUMBER,
            },
            {
              key: "search",
              label: "搜索",
              type: FieldType.INPUT,
            },
            {
              key: "search_",
              label: "搜索",
              antdFormItemProps: {
                // 隐藏占位使用
                hidden: true,
              },
            },
            {
              key: "gender",
              type: FieldType.RADIO,
              antdFieldProps: {
                // optionType: "button",
                options: [
                  { label: "全部", value: "" },
                  { label: "男", value: "male" },
                  { label: "女", value: "female" },
                ],
              },
            },
          ],
        }}
      />
    </div>
  );
};

export default TableDemo;

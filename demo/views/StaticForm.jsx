import React, { useMemo, useState } from "react";
import { Modal, Radio } from "antd";
import libs from "demo/libs";
import Enum from "js-enumerate";

const {
  formitems,
  GridForm,
  constants: { FieldType, FilterType },
  typeTools: { isEmpty },
} = libs;

const EditType = new Enum([
  { key: "EDIT", label: "编辑", value: "edit" },
  { key: "DISABLED", label: "禁用", value: "disabled" },
  { key: "READONLY", label: "只读", value: "readonly" },
]);

const { CompareEdit, RestSelect, RestTreeSelect, TableSelect, ExpansionView, MentionView } = formitems;

export default function StaticForm() {
  const [formValues, setFormValues] = useState(null);

  const [editType, setEditType] = useState(EditType.EDIT);

  const editProps = useMemo(() => {
    if (editType === EditType.EDIT) {
      return {};
    }
    return { disabled: editType === EditType.DISABLED, readOnly: editType === EditType.READONLY };
  }, [editType]);

  const formItems = [
    {
      key: "city",
      label: "级联选择",
      type: FieldType.CASCADER,
      antdFieldProps: {
        restful: "api/cities/",
        fieldNames: { label: "name", value: "key" },
        fieldParent: "belong",
        enableCopy: true,
        onChange: (value, selectedOptions, treeOpts) => {
          console.log("Cascader onChange", value, treeOpts); // eslint-disable-line no-console
        },
        options: [{ key: "anhui", name: "安徽", children: [{ key: "anqing", name: "安庆" }] }],
        antdCascaderProps: {
          multiple: true,
        },
        ...editProps,
      },
    },
    {
      key: "user",
      label: "单选",
      type: FieldType.SELECT,
      antdFieldProps: {
        restful: "api/users/",
        labelFields: ["nickname", "username", "id"],
        urlDetailTemplate: "/api/users/?username={0}",
        fieldNames: { value: "username" },
        labelTemplate: "{nickname} {username} {id}",
        // eslint-disable-next-line camelcase
        baseParams: { is_active: true },
        ...editProps,
      },
    },

    {
      key: "users",
      label: "多选",
      render: () => (
        <CompareEdit
          historyValue={["admin", "user5"]}
          fieldValue="username"
          enableCopy
          labelTemplate="{nickname}({username})"
          options={[
            { username: "admin", nickname: "管理员" },
            { username: "skyler", nickname: "Skyler" },
          ]}
          {...editProps}
        >
          <RestSelect
            enableCopy
            mode="multiple"
            restful="api/users/"
            fieldNames={{ label: "nickname", value: "username" }}
          />
        </CompareEdit>
      ),
    },
    {
      key: "auto",
      label: "自动补全",
      type: FieldType.AUTO_COMPLETE,
      antdFieldProps: {
        restful: "api/users/",
        fieldNames: { label: "username", value: "username" },
        options: [],
        ...editProps,
      },
    },
    {
      key: "dateStr",
      label: "日期",
      antdFormItemProps: {
        rules: [{ required: true, message: "请选择日期" }],
      },
      type: FieldType.DATE_PICKER,
      antdFieldProps: {
        picker: "time",
        ...editProps,
      },
    },
    {
      key: "dateRange",
      label: "日期范围",
      // antdFormItemProps: {
      //   required: true,
      //   rules: [{ required: true, message: "请选择日期范围" }],
      // },
      type: FieldType.DATE_RANGE_PICKER,
      antdFieldProps: {
        format: "YYYY年MM月DD日HH:mm:ss",
        antdRangePickerProps: { picker: "date", showTime: true },
        ...editProps,
      },
    },
    {
      key: "upload",
      label: "上传",
      type: FieldType.UPLOAD,
      antdFieldProps: {
        uploadUrl: "api/upload/",
        data: { type: "image" },
        ...editProps,
      },
    },
    {
      key: "mention",
      label: "提及",
      render: () => {
        return (
          <MentionView
            restful="api/users/"
            fieldNames={{ label: "username", value: "username" }}
            antdMentionsProps={{ rows: 3 }}
            {...editProps}
          />
        );
      },
    },
    {
      key: "numberRange",
      label: "数字范围",
      type: FieldType.NUMBER_RANGE,
      antdFieldProps: {
        ...editProps,
      },
    },
    {
      key: "tree",
      label: "树形选择",
      render: () => (
        <RestTreeSelect
          restful="api/cities/"
          fieldNames={{ label: "name", value: "key" }}
          fieldParent="belong"
          enableCopy
          // antdTreeSelectProps={{ treeCheckable: true }}
          onChange={(value, nodes) => {
            console.log("TreeSelect onChange", value, nodes); // eslint-disable-line no-console
          }}
          {...editProps}
        />
      ),
    },
    {
      key: "expansion",
      label: "扩展输入",
      render: () => {
        return (
          <ExpansionView
            inputKey="username"
            // restful="api/validate/arr/"
            baseParams={{ prefix: "prefix", suffix: "suffix" }}
            valueTemplate="{prefix}-{value}-{suffix}"
            enableBraceExpansion
            longTextProps={{ maxLength: 2 }}
            longErrorProps={{ maxLength: 16 }}
            {...editProps}
          />
        );
      },
    },
    {
      key: "table",
      label: "表格选择",
      render: () => (
        <TableSelect
          restful="api/users/"
          {...editProps}
          defaultPageSize={5}
          titleTemplate="选中 {count} 个用户，按照性别统计[ {stat} ]"
          titleAggPath="gender"
          showHeaderTags={true}
          baseParams={
            {
              page_size: 2, // eslint-disable-line camelcase
              // is_active: false, // eslint-disable-line camelcase
            }
          }
          // expandedAllRows={true}
          columns={[
            {
              title: "ID",
              dataIndex: "id",
            },
            {
              title: "唯一标识",
              dataIndex: "username",
              sorter: true,
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
              },
              filterMultiple: true,
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
              expandable: true,
            },
            {
              title: "年龄",
              fieldName: "age",
              dataIndex: "age__range",
              sorter: true,
              filterMultiple: false,
              render: (value, record) => record.age,
              filterDropdownConfig: {
                type: FieldType.NUMBER_RANGE,
                dropdownProps: {
                  placeholder: "输入年龄范围",
                },
              },
              dropdownLocalConfig: {
                type: FieldType.NUMBER_RANGE,
                filterType: FilterType.RANGE,
              }
            },
            {
              title: "创建日期",
              dataIndex: "created_at__range",
              filterDropdownConfig: {
                type: FieldType.DATE_RANGE_PICKER,
                dropdownProps: {
                  antdRangePickerProps: { picker: "date", showTime: true },
                },
              },
              fieldName: "created_at",
              dropdownLocalConfig: {
                type: FieldType.DATE_RANGE_PICKER,
                filterType: FilterType.RANGE,
              },
            },
          ]}
        />
      ),
    },
  ];

  // 方便调试单个组件
  const showFields = [];
  // const showFields = ["table"];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Radio.Group
          value={editType}
          onChange={(e) => setEditType(e.target.value)}
          options={EditType.options}
          optionType="button"
        />
      </div>
      <GridForm
        fields={formItems.filter((field) => isEmpty(showFields) || showFields.includes(field.key))}
        onSubmit={(values) => {
          setFormValues(values);
        }}
        initialValues={{
          user: "skyler",
          users: [
            { id: 1, username: "admin", nickname: "管理员" },
            { id: 2, username: "skyler", nickname: "Skyler" },
          ],
          dateStr: "2025-05-25",
          dateRange: ",2025年05月25日00:00:00",
          // dateRange: ["2025-05-25", "2025-05-26"],
          city: ["anhui", "anqing"],
          // expansion: {
          //   input: "admin",
          //   output: {
          //     error: "error",
          //     output: "output",
          //   },
          // },
          auto: "admin",
          tree: "anqing",
          upload: {
            uid: "rc-upload-1748693175705-3",
            status: "done",
            type: "image/png",
            size: 227310,
            name: "1C4A5F16-612C-446C-8307-6BD471BEA02B20230208.png",
            url: "http://gips2.baidu.com/it/u=195724436,3554684702&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960",
            thumbUrl: "http://gips2.baidu.com/it/u=195724436,3554684702&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960",
          },
          // upload: [
          //   { name: "test1", url: "http://gips2.baidu.com/it/u=195724436,3554684702&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960" },
          //   { name: "test2", url: "http://gips2.baidu.com/it/u=195724436,3554684702&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960" },
          //   { name: "test3", url: "http://gips2.baidu.com/it/u=195724436,355484702&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960" },
          //   { name: "test4", url: "http://gips2.baidu.com/it/u=195724436,3554684702&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960" },
          // ],
          table: [{ id: 1, username: "admin", nickname: "管理员", gender: "female", age: 20 }],
        }}
        antdFormProps={{
          labelCol: { flex: "80px" },
          wrapperCol: { span: 20 },
        }}
        antdListProps={{
          grid: { gutter: 10, column: 1 },
        }}
      />

      <Modal
        title="表单数据"
        open={formValues !== null}
        footer={null}
        onOk={() => {
          setFormValues(null);
        }}
        onCancel={() => {
          setFormValues(null);
        }}
      >
        <p style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(formValues, null, 2)}</p>
      </Modal>
    </div>
  );
}

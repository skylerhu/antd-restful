import React, { useRef } from "react";
import {
  ArrayItems,
  ArrayTable,
  Cascader,
  Checkbox,
  FormButtonGroup,
  FormCollapse,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  Password,
  Radio,
  Reset,
  Select,
  Space,
  Submit,
  Switch,
  Transfer,
} from "@formily/antd-v5";
import { createForm, onFieldValueChange, registerValidateRules } from "@formily/core";
import { connect, createSchemaField, FormProvider, mapReadPretty } from "@formily/react";
import libs from "demo/libs";

const {
  formitems,
  request,
  apiTools: { formatRequestError },
  typeTools: { isEmpty },
} = libs;

// https://core.formilyjs.org/zh-CN/api/entry/form-validator-registry
registerValidateRules({
  // 扩展 ExpansionView 组件的校验
  expansionValidator: (value, rule) => {
    if (!rule["expansionValidator"] || isEmpty(value) || isEmpty(value.error)) {
      return Promise.resolve();
    }
    return Promise.reject(rule.message || "请按照要求输入数据");
  },
  // 远程请求接口校验, 一般场景使用 ExpansionView 组件可实现类似效果
  remoteValidator: (value, rule, ctx) => {
    // const { field, form } = ctx;
    const config = rule["remoteValidator"];
    if (isEmpty(value) || isEmpty(config) || !config.restful) {
      return Promise.resolve();
    }
    // value 和 表单的key
    const data = { value, field: ctx.field.path.entire };
    if (config.withForm) {
      // 带上表单值
      data.form = ctx.form.values;
    }
    return request.post(config.restful, data, { disableNotiError: true }).then(
      (res) => {
        // 校验成功/失败都返回200，避免http接口4xx过多； validated=True表示成功
        if (res.status === 200 && res.data.validated) {
          return Promise.resolve();
        }
        return Promise.reject(res.data.message || rule.message || "请按照要求输入数据");
      },
      (error) => {
        const { message, description } = formatRequestError(error);
        return Promise.reject(`${message}: ${description}`);
      }
    );
  },
});

// https://react.formilyjs.org/zh-CN/api/shared/map-read-pretty
// 自定义组件，支持 readOnly 模式
const customComponents = {};
Object.keys(formitems).forEach((key) => {
  const Component = formitems[key];
  customComponents[key] = connect(
    Component,
    mapReadPretty((props) => <Component {...props} readOnly />)
  );
});

const v5Components = {
  ArrayItems,
  ArrayTable,
  Cascader,
  Checkbox,
  FormButtonGroup,
  FormCollapse,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  Password,
  Radio,
  Reset,
  Select,
  Space,
  Submit,
  Switch,
  Transfer,
};

const testSchema = {
  type: "object",
  properties: {
    layout: {
      type: "void",
      "x-component": "FormLayout",
      "x-component-props": {
        // labelCol: 4,
        // wrapperCol: 20,
        labelWidth: 120,
      },
      properties: {
        grid: {
          type: "void",
          "x-component": "FormGrid",
          "x-component-props": {
            maxColumns: 2,
          },
          properties: {
            text: {
              type: "string",
              title: "源数据",
              "x-component": "Input",
              "x-decorator": "FormItem",
              "x-validator": [
                {
                  required: true,
                  remoteValidator: {
                    restful: "api/validate/remote/",
                    withForm: true,
                    // restful: "api/validate/arr/",
                  },
                },
              ],
            },
            expansion: {
              type: "object",
              title: "扩展",
              "x-component": "ExpansionView",
              "x-decorator": "FormItem",
              "x-component-props": {
                inputKey: "value",
                restful: "api/validate/arr/",
                // enableBraceExpansion: true,
                valueTemplate: "{text}-{value}",
                longTextProps: {
                  labelTemplate: "{nickname}({username})",
                },
              },
              "x-reactions": {
                dependencies: ["text"],
                fulfill: {
                  schema: {
                    "x-component-props": {
                      baseParams: {
                        text: "{{$deps[0]}}",
                      },
                    },
                  },
                },
              },
              "x-validator": [
                {
                  required: true,
                  expansionValidator: true,
                },
              ],
            },
            age: {
              type: "array",
              title: "年龄范围",
              "x-component": "NumberRange",
              "x-decorator": "FormItem",
            },
            gender: {
              type: "string",
              title: "性别",
              "x-component": "Select",
              "x-decorator": "FormItem",
              // "x-read-pretty": true,
              enum: ["male", "female"],
              "x-component-props": {
                onChange: (value, option) => {
                  // eslint-disable-next-line no-console
                  console.log("Select onChange", value, option);
                },
              },
            },
            user: {
              type: "string",
              title: "用户",
              "x-decorator": "FormItem",
              "x-component": "RestSelect",
              "x-component-props": {
                restful: "api/users/",
                fieldNames: {
                  label: "nickname",
                  value: "username",
                },
              },
              "x-reactions": {
                dependencies: ["age", "gender"],
                fulfill: {
                  schema: {
                    "x-component-props": {
                      baseParams: {
                        age: "{{$deps[0]}}",
                        gender: "{{$deps[1]}}",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const FactoryView = () => {
  const form = createForm({
    values: {
      text: "123",
      age: [1, 2],
      gender: "male",
      user: "admin",
    },
    // pattern: "readPretty",
    // readPretty: true,
    effects: () => {
      onFieldValueChange("text", (field, form) => {
        // eslint-disable-next-line no-console
        console.log("onFieldValueChange", field.value, form.values);
      });
    },
  });

  const SchemaField = useRef(
    // https://react.formilyjs.org/zh-CN/api/components/schema-field
    createSchemaField({
      components: {
        ...v5Components,
        ...customComponents,
      },
    })
  );

  return (
    <div>
      <FormProvider form={form}>
        <SchemaField.current schema={testSchema} />
      </FormProvider>
    </div>
  );
};

export default FactoryView;

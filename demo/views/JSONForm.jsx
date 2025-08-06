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
  typeTools: { isEmpty, isNumber, isArray, isString, isDict },
} = libs;

// https://core.formilyjs.org/zh-CN/api/entry/form-validator-registry
registerValidateRules({
  /**
   * 扩展 ExpansionView 组件的校验
   * eg:
      {
        expansionValidator: true,
        message: "请按照要求输入数据",
      } or
      {
        expansionValidator: {
          min: 1,
          max: 10,
        },
        message: "请按照要求输入数据",
      }

   */
  expansionValidator: (value, rule) => {
    const config = rule.expansionValidator;
    if (!config || isEmpty(config) || isEmpty(value)) {
      return Promise.resolve();
    }
    if (isDict(config) && (isArray(value.output) || isString(value.output))) {
      const { max, min } = config;
      if (isNumber(max) && max > 0) {
        if (value.output.length > max) {
          return Promise.reject(`最大长度为 ${max}`);
        }
      }
      if (isNumber(min) && min > 0) {
        if (value.output.length < min) {
          return Promise.reject(`最小长度为 ${min}`);
        }
      }
    }
    if (isEmpty(value.error)) {
      return Promise.resolve();
    }
    return Promise.reject(value.error || rule.message || "请按照要求输入数据");
  },
  /**
   * 扩展 ExpansionView 组件的校验
   * eg:
      {
        remoteValidator: {
          withForm: true,  // 是否带上表单所有数据
          extraParams: {},  // 请求参数
          restful: "api/validate/remote/",
          reqConfig: {},  // 请求配置
        }
      }
   */
  remoteValidator: (value, rule, ctx) => {
    // const { field, form } = ctx;
    const config = rule.remoteValidator;
    if (isEmpty(value) || isEmpty(config) || !config.restful) {
      return Promise.resolve();
    }
    const { withForm, restful, reqConfig, extraParams } = config;
    // value 和 表单的key
    const data = { value, field: ctx.field.path.entire, extraParams };
    if (withForm) {
      // 带上表单值
      data.form = ctx.form.values;
    }
    return request.post(restful, data, { disableNotiError: true, ...reqConfig }).then(
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

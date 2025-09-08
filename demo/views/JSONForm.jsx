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
  validators: { expansionValidator, remoteValidator },
} = libs;

// https://core.formilyjs.org/zh-CN/api/entry/form-validator-registry
registerValidateRules({
  expansionValidator,
  remoteValidator: (value, rule, ctx) => {
    const fieldName = ctx?.field?.path?.entire;
    const formValues = ctx?.form?.values;
    return remoteValidator(value, rule, { fieldName, formValues });
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
              title: "远程校验",
              "x-component": "Input",
              "x-decorator": "FormItem",
              "x-validator": [
                {
                  required: true,
                  remoteValidator: {
                    restful: "api/validate/remote/",
                    withForm: true,
                    // restful: "api/validate/arr/",
                    makeRequestOptions: {
                      delay: 1000,
                    }
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
                  console.log("Select onChange", value, option); // eslint-disable-line no-console
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
        console.log("onFieldValueChange", field.value, form.values); // eslint-disable-line no-console
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

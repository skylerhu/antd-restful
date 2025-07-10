# antd-restful

[![NPM Version](https://img.shields.io/npm/v/antd-restful)](https://github.com/SkylerHu/antd-restful)
[![GitHub Actions Workflow Status](https://github.com/SkylerHu/antd-restful/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/SkylerHu/antd-restful)
[![Coveralls](https://img.shields.io/coverallsCoverage/github/SkylerHu/antd-restful)](https://github.com/SkylerHu/antd-restful)
[![GitHub License](https://img.shields.io/github/license/SkylerHu/antd-restful)](https://github.com/SkylerHu/antd-restful)


基于 `React` + `Antd Design` 组件，扩展组件支持配置即可支持远程获取restful接口的数据。对接远程接口根据restful标准化、降低使用成本，也可以用于动态表单中的JSON配置。

可查看版本变更记录[ChangeLog](./docs/CHANGELOG-1.x.md)


## 一. 安装

    npm install antd-restful

还需要安装库自身的依赖：

    npm install react react-dom antd @ant-design/icons axios

使用示例：
```jsx
import antdRestful from "antd-restufl";

const {
  GridForm, RestTable,
  formitems: { RestSelect, RestTable },
  constants: { FieldType },
  typeTools: { isEmpty },
} = antdRestful;
```

## 二. 使用(Usage)

需要注意的是： 组件中远程请求，内部关于 `query` 序列化的处理，使用的是 `query-string` 库，设置了 `{ arrayFormat: "comma", skipNull: true, skipEmptyString: true }` 等参数。

若是需要调整，可以在入口中修改：
```jsx
import antdRestful from "antd-restufl";

const { setGlobalConfig } = antdRestful;
// 修改成自己需要的处理方式
setGlobalConfig({
    queryStringify: (params) => Qs.stringify(params, {arrayFormat: 'brackets'}),
    queryParse: (string) => Qs.parse(string, {arrayFormat: 'brackets'}),
})
```

- [通用组件](#21-通用组件)
  - [RestTable](./docs/reference/RestTable.md)
  - [GridForm](./docs/reference/GridForm.md)
  - [LongText](./docs/reference/LongText.md)
  - [CopyView](./docs/reference/CopyView.md)
- [表单项(formitems)](#22-表单项formitems)
  - [RestSelect](./docs/reference/formitems/RestSelect.md)
  - [DateStrPicker](./docs/reference/formitems/DateStrPicker.md)
  - [RangeStrPicker](./docs/reference/formitems/RangeStrPicker.md)
  - [ExpansionView](./docs/reference/formitems/ExpansionView.md)
  - [NumberRange](./docs/reference/formitems/NumberRange.md)
  - [TableSelect](./docs/reference/formitems/TableSelect.md)
  - [UploadView](./docs/reference/formitems/UploadView.md)
  - [CompareEdit](./docs/reference/formitems/CompareEdit.md)
  - [RestAutoComplete](./docs/reference/formitems/RestAutoComplete.md)
  - [RestCascader](./docs/reference/formitems/RestCascader.md)
  - [RestTreeSelect](./docs/reference/formitems/RestTreeSelect.md)
  - [MentionView](./docs/reference/formitems/MentionView.md)
- [hooks](./docs/reference/hooks.md)
- [typeTools](./docs/reference/typeTools.md)


## 三、应用场景
- [依赖restful接口的列表数据展示](./demo/views/TableDemo.jsx)
- [动态表单中的应用](./demo/views/JSONForm.jsx)

# antd-restful

[![NPM Version](https://img.shields.io/npm/v/antd-restful)](https://www.npmjs.com/package/antd-restful)
[![GitHub Actions Workflow Status](https://github.com/skylerhu/antd-restful/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/skylerhu/antd-restful)
[![Coveralls](https://img.shields.io/coverallsCoverage/github/skylerhu/antd-restful)](https://github.com/skylerhu/antd-restful)
[![GitHub License](https://img.shields.io/github/license/skylerhu/antd-restful)](https://github.com/skylerhu/antd-restful)


基于 `React` + `Antd Design` 组件，扩展组件支持配置即可支持远程获取restful接口的数据。对接远程接口根据restful标准化、降低使用成本，也可以用于动态表单中的JSON配置。

可查看版本变更记录[ChangeLog](./docs/CHANGELOG-0.x.md)


## 一. 安装

    npm install antd-restful

还需要安装库自身的依赖：

    npm install react react-dom antd @ant-design/icons axios

使用示例：
```jsx
import antdRestful from "antd-restful";

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
import antdRestful from "antd-restful";

const { setGlobalConfig } = antdRestful;
// 修改成自己需要的处理方式
setGlobalConfig({
    queryStringify: (params) => Qs.stringify(params, {arrayFormat: 'brackets'}),
    queryParse: (string) => Qs.parse(string, {arrayFormat: 'brackets'}),
})
```

### 2.1 通用组件

| 组件 | 说明 |
|------|------|
| [RestTable](./docs/reference/RestTable.md) | Table 的 RESTful 封装，支持远程数据加载、筛选、工具栏及列设置 |
| [GridForm](./docs/reference/GridForm.md) | 响应式栅格表单，支持多种字段类型与校验 |
| [LongText](./docs/reference/LongText.md) | 长文本截断展示，支持弹窗查看完整内容与模板格式化 |
| [CopyView](./docs/reference/CopyView.md) | 一键复制文本，支持字符串、数组、对象等多种数据类型 |
| [RouteBaseTable](./docs/reference/RouteBaseTable.md) | RestTable 变体，将筛选参数同步到 URL，刷新后恢复筛选状态 |

### 2.2 表单项 (formitems)

| 组件 | 说明 |
|------|------|
| [RestSelect](./docs/reference/formitems/RestSelect.md) | Select 远程选项加载，支持搜索、缓存与多选 |
| [DateStrPicker](./docs/reference/formitems/DateStrPicker.md) | 日期选择器，以字符串而非 dayjs 对象读写值 |
| [RangeStrPicker](./docs/reference/formitems/RangeStrPicker.md) | 日期范围选择器，以字符串或字符串数组读写值 |
| [ExpansionView](./docs/reference/formitems/ExpansionView.md) | 花括号展开输入框，支持远程校验与错误提示 |
| [NumberRange](./docs/reference/formitems/NumberRange.md) | 闭区间数字范围输入，适用于价格、年龄等范围场景 |
| [TableSelect](./docs/reference/formitems/TableSelect.md) | 基于 RestTable 的多选弹窗，展示已选行并支持取消选择 |
| [UploadView](./docs/reference/formitems/UploadView.md) | 文件上传，支持拖拽、进度条、预览及大小/数量限制 |
| [CompareEdit](./docs/reference/formitems/CompareEdit.md) | 差异对比编辑器，可视化展示当前值与历史值的变更 |
| [RestAutoComplete](./docs/reference/formitems/RestAutoComplete.md) | 远程搜索自动补全，支持防抖与自定义字段映射 |
| [RestCascader](./docs/reference/formitems/RestCascader.md) | 远程级联选择，支持懒加载与多选 |
| [RestTreeSelect](./docs/reference/formitems/RestTreeSelect.md) | 远程树形选择，支持懒加载与多选 |
| [MentionView](./docs/reference/formitems/MentionView.md) | 远程 @提及输入框，支持搜索与防抖 |

### 2.3 工具与 Hooks

| 模块 | 说明 |
|------|------|
| [requests](./docs/reference/requests.md) | HTTP 请求模块，提供 axios 实例、拦截器、useSafeRequest 等 |
| [hooks](./docs/reference/hooks.md) | React Hooks 集合：localStorage/sessionStorage、定时器、防抖等 |
| [typeTools](./docs/reference/typeTools.md) | 类型判断工具函数：isNull、isBlank 等 |


## 三、应用场景
- [依赖restful接口的列表数据展示](./demo/views/TableDemo.jsx)
- [动态表单中的应用](./demo/views/JSONForm.jsx)

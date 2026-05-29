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
// 默认导入（CommonJS 兼容场景）
import antdRestful from "antd-restful";
// 某些构建环境下需要使用 namespace import
// import * as antdRestful from "antd-restful";

const {
  GridForm, RestTable,
  request,
  formitems: { RestSelect },
  apiTools: { useSafeRequest },
  constants: { FieldType },
  typeTools: { isEmpty },
} = antdRestful;
```

最常见的用法——在组件中发起安全的 HTTP 请求：
```jsx
import antdRestful from "antd-restful";
const { apiTools: { useSafeRequest } } = antdRestful;

function UserList() {
  const [makeRequest] = useSafeRequest();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    makeRequest().get('/api/users').then((resp) => setUsers(resp.data));
  }, []);

  return <RestTable dataSource={users} columns={[{ title: '名称', dataIndex: 'name' }]} />;
}
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
| [RestTable](./docs/reference/RestTable.md) | 基于 Table 的 RESTful 封装，支持远程数据加载、多种表头筛选类型（输入/选择/数字范围/日期范围）、排序、工具栏（高级搜索/自动刷新/下载/列设置）及展开行 |
| [RestList](./docs/reference/RestList.md) | 基于 List 的 RESTful 封装，支持 loadMore（加载更多）与 pagination（分页器）两种模式、筛选表单及 Grid 卡片布局 |
| [GridForm](./docs/reference/GridForm.md) | 响应式栅格表单，支持 12 种字段类型、高级搜索/单项模式切换、自定义按钮文案、智能表单项激活策略及占位字段自动补充 |
| [LongText](./docs/reference/LongText.md) | 长文本截断展示，支持数组/对象/字符串等多种数据类型、模板格式化、弹窗查看完整内容及原始数据切换 |
| [CopyView](./docs/reference/CopyView.md) | 一键复制组件，支持字符串、数组、对象等多种数据类型，支持文本截断显示、自定义分隔符及隐藏值模式 |
| [RouteBaseTable](./docs/reference/RouteBaseTable.md) | RestTable/RestList 的路由联动封装，通过 viewType 切换表格/列表视图，将筛选参数同步到 URL 并自动推断参数解析类型 |

### 2.2 表单项 (formitems)

| 组件 | 说明 |
|------|------|
| [RestSelect](./docs/reference/formitems/RestSelect.md) | 基于 Select 的远程选择器，支持搜索防抖、数据缓存、多选、复制功能、labelTemplate 模板及只读模式 |
| [DateStrPicker](./docs/reference/formitems/DateStrPicker.md) | 字符串格式日期选择器，自动处理字符串与 dayjs 对象转换，支持 date/time/week/month/year 等 picker 类型 |
| [RangeStrPicker](./docs/reference/formitems/RangeStrPicker.md) | 字符串格式日期范围选择器，支持逗号分隔字符串与数组两种输入格式，支持时间范围选择 |
| [ExpansionView](./docs/reference/formitems/ExpansionView.md) | 文本扩展输入组件，支持 brace-expansion 语法扩展与远程验证，可配合 expansionValidator 在表单中使用 |
| [NumberRange](./docs/reference/formitems/NumberRange.md) | 闭区间数字范围输入，支持数组/字符串/数字多种输入格式，支持自定义只读模板及起止输入框分别配置 |
| [TableSelect](./docs/reference/formitems/TableSelect.md) | 基于 RestTable 的表格选择器，支持多行选择、折叠面板展示已选数据、取消选择及聚合统计 |
| [UploadView](./docs/reference/formitems/UploadView.md) | 文件上传组件，支持拖拽上传、自定义请求配置、进度显示、预览/下载及大小/数量限制 |
| [CompareEdit](./docs/reference/formitems/CompareEdit.md) | 历史值对比编辑器，可视化展示新增/删除/未修改的差异，支持基础类型与数组对比及复制功能 |
| [RestAutoComplete](./docs/reference/formitems/RestAutoComplete.md) | 基于 AutoComplete 的远程搜索自动补全，支持防抖、最小搜索字符数、自定义 fieldNames 映射及 labelTemplate |
| [RestCascader](./docs/reference/formitems/RestCascader.md) | 基于 Cascader 的远程级联选择，支持子节点懒加载、多选、复制路径及只读展示 |
| [RestTreeSelect](./docs/reference/formitems/RestTreeSelect.md) | 基于 TreeSelect 的远程树形选择，支持子节点懒加载、多选、复制功能及自定义字段映射 |
| [MentionView](./docs/reference/formitems/MentionView.md) | 基于 Mentions 的远程 @提及输入框，支持搜索防抖、自定义 fieldNames 映射及 inValue 提及信息提取 |

### 2.3 工具与 Hooks

| 模块 | 说明 |
|------|------|
| [apiTools](./docs/reference/requests.md) | HTTP 请求模块，提供 axios 实例、拦截器、useSafeRequest 等 |
| [hooks](./docs/reference/hooks.md) | React Hooks 集合：localStorage/sessionStorage、定时器、防抖等 |
| [typeTools](./docs/reference/typeTools.md) | 类型判断工具函数：isNull、isBlank 等 |


## 三、应用场景
- [依赖restful接口的表格数据展示](./demo/views/TableDemo.jsx)
- [依赖restful接口的列表数据展示](./demo/views/ListDemo.jsx)
- [动态表单中的应用](./demo/views/JSONForm.jsx)，特别是其中关于[RouteTable](./demo/views/RouteTable.jsx)的使用

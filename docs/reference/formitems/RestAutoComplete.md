## RestAutoComplete
基于 Ant Design AutoComplete 组件扩展的远程自动完成输入框，支持远程数据搜索、自定义字段映射等功能。

**功能特性：**
- 支持远程数据搜索
- 支持搜索防抖处理
- 支持自定义字段名映射
- 支持自定义标签模板
- 支持只读模式展示
- 支持搜索最小字符数限制

### 参数说明
| 参数 | 说明 | 类型 | 默认值 | antd 覆盖说明 | 版本 |
| - | - | - | - | - | - |
| **通用属性** | | | | | |
| style | 自定义样式 | `object` | - | 透传 AutoComplete `style` | - |
| className | 自定义类名 | `string` | - | 透传 AutoComplete `className` | - |
| value | 当前选中的值 | `any` | - | 透传 AutoComplete `value` | - |
| onChange | 值变化时的回调函数 | `function(value)` | - | 透传 AutoComplete `onChange` | - |
| **远程数据相关** | | | | | |
| restful | 远程数据接口地址 | `string` | - | - | - |
| reqConfig | axios 的配置选项 | `object` | - | - | - |
| baseParams | 接口筛选条件 | `object` | - | - | - |
| searchKey | 搜索关键字参数名 | `string` | `'search'` | - | - |
| searchMinEnter | 最少输入字符数 | `number` | `1` | - | - |
| parseRowsPath | 解析接口返回数据的路径 | `string` | `'data.results'` | - | - |
| **显示和交互** | | | | | |
| options | 选项列表 | `array` | - | 覆盖 AutoComplete `options`，远程模式由内部管理 | - |
| fieldNames | 字段名称映射配置（原生组件并不支持如此配置） | `object` | - | - | - |
| labelTemplate | 远程接口返回数据的 label 模板 | `string` | - | - | - |
| **状态控制** | | | | | |
| disabled | 是否禁用 | `boolean` | `false` | 透传 AutoComplete `disabled` | - |
| readOnly | 是否只读模式 | `boolean` | `false` | - | - |
| **Ant Design 原生配置** | | | | | |
| antdAutoCompleteProps | Ant Design [AutoComplete](https://ant.design/components/auto-complete-cn) 组件原生属性 | `object` | - | 透传 AutoComplete 属性，`value` / `onChange` / `options` / `onSearch` 由内部管理 | - |

### 字段映射配置 (fieldNames)
```javascript
{
  value: 'id',    // 选项值字段名
  label: 'name'   // 选项标签字段名
}
```

### 搜索机制
1. **防抖处理**：输入搜索关键字时有 200ms 的防抖延迟
2. **最小字符数**：通过 `searchMinEnter` 控制最小搜索字符数
3. **空搜索**：当 `searchMinEnter` 为 0 时允许空搜索
4. **加载状态**：搜索过程中显示加载指示器

### 使用示例

```jsx
import React, { useState } from 'react';
import { RestAutoComplete } from 'antd-restful';

// 基本远程搜索示例
const BasicRestAutoComplete = () => {
  const [value, setValue] = useState('');

  return (
    <RestAutoComplete
      restful="/api/users/search"
      value={value}
      onChange={setValue}
      searchKey="keyword"
      searchMinEnter={2}
      placeholder="输入用户名搜索"
    />
  );
};

// 自定义字段映射示例
const CustomFieldRestAutoComplete = () => {
  const [value, setValue] = useState('');

  return (
    <RestAutoComplete
      restful="/api/products/search"
      value={value}
      onChange={setValue}
      fieldNames={{ value: 'product_id', label: 'product_name' }}
      searchKey="name"
      searchMinEnter={3}
    />
  );
};

// 使用标签模板示例
const LabelTemplateRestAutoComplete = () => {
  const [value, setValue] = useState('');

  return (
    <RestAutoComplete
      restful="/api/employees/search"
      value={value}
      onChange={setValue}
      fieldNames={{ value: 'emp_id', label: 'emp_name' }}
      labelTemplate="{emp_name} ({department})"
      searchKey="query"
    />
  );
};

// 静态选项示例
const StaticRestAutoComplete = () => {
  const [value, setValue] = useState('');

  const options = [
    { value: 'option1', label: '选项1' },
    { value: 'option2', label: '选项2' },
    { value: 'option3', label: '选项3' },
  ];

  return (
    <RestAutoComplete
      options={options}
      value={value}
      onChange={setValue}
    />
  );
};

// 只读模式示例
const ReadOnlyRestAutoComplete = () => {
  return (
    <RestAutoComplete
      value="示例值"
      readOnly
    />
  );
};

// 带基础参数示例
const BaseParamsRestAutoComplete = () => {
  const [value, setValue] = useState('');

  return (
    <RestAutoComplete
      restful="/api/tags/search"
      value={value}
      onChange={setValue}
      baseParams={{
        category: 'technology',
        status: 'active'
      }}
      searchKey="keyword"
      searchMinEnter={1}
    />
  );
};

// 自定义 Ant Design 属性示例
const CustomAntdRestAutoComplete = () => {
  const [value, setValue] = useState('');

  return (
    <RestAutoComplete
      restful="/api/suggestions"
      value={value}
      onChange={setValue}
      antdAutoCompleteProps={{
        allowClear: true,
        placeholder: "请输入内容",
        style: { width: 300 },
        onSelect: (value, option) => {
          console.log('选中:', value, option);
        },
        onBlur: () => {
          console.log('失去焦点');
        },
      }}
    />
  );
};
```

### 高级用法

#### 复杂搜索条件
```jsx
const ComplexSearchRestAutoComplete = () => {
  const [value, setValue] = useState('');

  return (
    <RestAutoComplete
      restful="/api/complex-search"
      value={value}
      onChange={setValue}
      baseParams={{
        type: 'user',
        department: 'IT',
        active: true
      }}
      searchKey="search_term"
      searchMinEnter={2}
      fieldNames={{ value: 'user_id', label: 'display_name' }}
      labelTemplate="{display_name} - {email}"
    />
  );
};
```

#### 自定义数据解析
```jsx
const CustomParseRestAutoComplete = () => {
  const [value, setValue] = useState('');

  return (
    <RestAutoComplete
      restful="/api/nested-data"
      value={value}
      onChange={setValue}
      parseRowsPath="response.data.items"
      fieldNames={{ value: 'id', label: 'title' }}
    />
  );
};
```

### API 响应格式
组件期望的 API 响应格式：

```javascript
{
  "data": {
    "results": [
      {
        "id": 1,
        "name": "张三",
        "email": "zhangsan@example.com",
        "department": "技术部"
      },
      {
        "id": 2,
        "name": "李四",
        "email": "lisi@example.com",
        "department": "产品部"
      }
    ]
  }
}
```

使用自定义 `parseRowsPath` 时：
```javascript
{
  "response": {
    "data": {
      "items": [
        {
          "user_id": 1,
          "display_name": "张三",
          "email": "zhangsan@example.com"
        }
      ]
    }
  }
}
```

### 请求参数说明
- **搜索参数**：通过 `searchKey` 指定的参数名传递用户输入的搜索关键字
- **基础参数**：`baseParams` 会在每次请求中附加
- **示例请求**：`GET /api/users/search?keyword=zhang&department=IT&active=true`

### 注意事项
1. **搜索防抖**：组件内置 200ms 的搜索防抖机制，避免频繁请求
2. **最小输入长度**：通过 `searchMinEnter` 控制最小搜索字符数，减少无效请求
3. **字段映射**：`fieldNames` 用于映射 API 返回数据的字段名到组件需要的格式
4. **标签模板**：`labelTemplate` 支持使用 `{fieldName}` 语法自定义显示格式
5. **只读模式**：只读时直接显示文本内容，不显示输入框
6. **加载状态**：搜索过程中会显示加载指示器
7. **空搜索**：当 `searchMinEnter` 为 0 时，允许在输入框为空时触发搜索
8. **数据解析**：通过 `parseRowsPath` 指定从 API 响应中解析数据的路径
9. **原生属性**：通过 `antdAutoCompleteProps` 可以传递任何 Ant Design AutoComplete 的原生属性

### 相关组件
- [RestSelect](./RestSelect.md) - 远程下拉选择器
- [MentionView](./MentionView.md) - 提及选择器
- [TableSelect](./TableSelect.md) - 表格选择器

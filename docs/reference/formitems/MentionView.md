## MentionView
基于 Ant Design Mentions 组件扩展的远程提及输入器，支持远程数据搜索、自定义字段映射等功能。

**功能特性：**
- 支持远程数据搜索
- 支持 @ 提及功能
- 支持自定义字段映射
- 支持搜索防抖处理
- 支持只读模式展示
- 支持自定义标签模板

### 参数说明
| 参数 | 说明 | 类型 | 默认值 | antd 覆盖说明 | 版本 |
| - | - | - | - | - | - |
| **通用属性** | | | | | |
| style | 自定义样式 | `object` | - | 透传 Mentions `style` | - |
| className | 自定义类名 | `string` | - | 透传 Mentions `className` | - |
| value | 当前输入的值 | `string` | - | 透传 Mentions `value` | - |
| onChange | 值变化时的回调函数 | `function(value)` | - | 透传 Mentions `onChange` | - |
| **远程数据相关** | | | | | |
| restful | 远程数据接口地址 | `string` | - | - | - |
| reqConfig | axios 的配置选项 | `object` | - | - | - |
| baseParams | 基础请求参数 | `object` | - | - | - |
| searchKey | 搜索关键字参数名 | `string` | `'search'` | - | - |
| searchMinEnter | 最少输入字符数 | `number` | `0` | - | - |
| parseRowsPath | 解析接口返回数据的路径 | `string` | `'data.results'` | - | - |
| **扩展配置** | | | | | |
| fieldNames | 字段名称映射配置 | `object` | - | - | - |
| labelTemplate | 远程接口返回数据的 label 模板 | `string` | - | - | - |
| inValue | 是否在值中包含提及信息 | `boolean` | `false` | - | - |
| **状态控制** | | | | | |
| disabled | 是否禁用 | `boolean` | `false` | 透传 Mentions `disabled` | - |
| readOnly | 是否只读模式 | `boolean` | `false` | - | - |
| **Ant Design 原生配置** | | | | | |
| antdMentionsProps | Ant Design [Mentions](https://ant.design/components/mentions-cn) 组件原生属性 | `object` | - | 透传 Mentions 属性，`value` / `onChange` / `onSearch` / `options` / `loading` 由内部管理 | - |

### 使用示例

```jsx
import React, { useState } from 'react';
import { MentionView } from 'antd-restful';

// 基本使用示例
const BasicMentionView = () => {
  const [value, setValue] = useState('');

  return (
    <MentionView
      restful="/api/users/search"
      value={value}
      onChange={setValue}
      searchKey="keyword"
      fieldNames={{ value: 'username', label: 'nickname' }}
      placeholder="输入 @ 提及用户"
    />
  );
};

// 带模板的示例
const TemplateMentionView = () => {
  const [value, setValue] = useState('');

  return (
    <MentionView
      restful="/api/employees"
      value={value}
      onChange={setValue}
      fieldNames={{ value: 'emp_id', label: 'emp_name' }}
      labelTemplate="{emp_name}({department})"
      searchMinEnter={2}
    />
  );
};

// 包含提及信息的示例
const InValueMentionView = () => {
  const [value, setValue] = useState({ value: '', mentions: [] });

  return (
    <MentionView
      restful="/api/users"
      value={value.value}
      onChange={(data) => {
        console.log('输入内容:', data.value);
        console.log('提及用户:', data.mentions);
        setValue(data);
      }}
      inValue={true}
      fieldNames={{ value: 'id', label: 'name' }}
    />
  );
};

// 只读模式示例
const ReadOnlyMentionView = () => {
  return (
    <MentionView
      value="Hello @张三, 请查看这个任务"
      readOnly
    />
  );
};
```

### 字段映射配置 (fieldNames)
```javascript
{
  value: 'username',  // 提及值字段名
  label: 'nickname'   // 显示标签字段名
}
```

### 注意事项
1. **搜索防抖**：组件内置 200ms 的搜索防抖机制
2. **字段映射**：`fieldNames` 用于映射 API 返回数据的字段名
3. **标签模板**：`labelTemplate` 支持使用 `{fieldName}` 语法自定义显示格式
4. **提及信息**：启用 `inValue` 后，onChange 返回包含 mentions 数组的对象
5. **只读模式**：只读时直接显示文本内容

### 相关组件
- [RestSelect](./RestSelect.md) - 远程下拉选择器
- [RestAutoComplete](./RestAutoComplete.md) - 远程自动完成
- [TableSelect](./TableSelect.md) - 表格选择器
- [GridForm](../GridForm.md) - 网格表单，支持 MentionView 作为自定义字段

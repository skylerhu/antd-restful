## CompareEdit
一个支持历史值对比的编辑组件，可以显示当前值与历史值的差异，适用于需要对比修改前后数据的场景。

**功能特性：**
- 支持历史值与当前值的可视化对比
- 支持多种数据类型的比较（基础类型、数组、对象）
- 支持只读模式和编辑模式
- 支持复制功能
- 支持自定义标签模板和空值显示
- 基于 Ant Design Space 和 Tag 组件实现

### 参数说明
| 参数 | 说明 | 类型 | 默认值 | antd 覆盖说明 | 版本 |
| - | - | - | - | - | - |
| **通用属性** | | | | | |
| children | 子组件，用于编辑当前值 | `ReactNode` | - | - | - |
| style | 自定义样式 | `object` | - | - | - |
| className | 自定义类名 | `string` | - | - | - |
| **数据与对比** | | | | | |
| value | 当前选中的值 | `any` | - | - | - |
| onChange | 值变化时的回调函数 | `function(val, ...args)` | - | - | - |
| historyValue | 历史值，用于与当前值进行对比 | `any` | - | - | - |
| labelTemplate | 格式化显示模板，必须是唯一的，能够观察出来区别 | `string` | - | - | - |
| fieldValue | 从 options 中获取 value 的字段名 | `string` | `'value'` | - | - |
| options | 当 value 是基础类型时，options 用于格式化 label | `array` | - | - | - |
| emptyLabel | 空值显示标签 | `string` | `'(空)'` | - | - |
| **交互控制** | | | | | |
| enableCopy | 是否启用复制功能 | `boolean` | `false` | - | - |
| disabled | 是否禁用编辑功能 | `boolean` | `false` | - | - |
| readOnly | 是否只读模式，只读时只显示对比结果 | `boolean` | `false` | - | - |
| **Ant Design 原生配置** | | | | | |
| antdSpaceProps | Ant Design [Space](https://ant.design/components/space-cn) 组件的属性 | `object` | - | 透传 Space 属性 | - |

### 对比规则
- **未修改**：当历史值与当前值完全相等时，不显示任何对比标签
- **删除的值**：显示为红色删除线样式的标签
- **新增的值**：显示为绿色成功样式的标签
- **空值处理**：空值显示为橙色警告样式的标签
- **类型不一致**：当历史值与当前值类型不一致时，显示"修改前后数据类型不一致"

### 使用示例

```jsx
import React, { useState } from 'react';
import { CompareEdit, RestSelect } from 'antd-restful';

// 基本使用示例
const BasicCompareEdit = () => {
  const [value, setValue] = useState(1);

  const options = [
    { value: 1, label: "选项1" },
    { value: 2, label: "选项2" },
    { value: 3, label: "选项3" },
  ];

  return (
    <CompareEdit
      value={value}
      historyValue={2}
      fieldValue="value"
      options={options}
      onChange={setValue}
    >
      <RestSelect options={options} />
    </CompareEdit>
  );
};

// 只读模式示例
const ReadOnlyCompareEdit = () => {
  const options = [
    { value: 1, label: "选项1" },
    { value: 2, label: "选项2" },
    { value: 3, label: "选项3" },
  ];

  return (
    <CompareEdit
      value={[1, 3]}
      historyValue={[1, 2]}
      fieldValue="value"
      options={options}
      readOnly
      enableCopy
    >
      <RestSelect mode="multiple" options={options} />
    </CompareEdit>
  );
};

// 启用复制功能示例
const CopyEnabledCompareEdit = () => {
  const [value, setValue] = useState("new value");

  return (
    <CompareEdit
      value={value}
      historyValue="old value"
      enableCopy
      onChange={setValue}
    >
      <Input />
    </CompareEdit>
  );
};

// 自定义空值标签示例
const CustomEmptyLabel = () => {
  const [value, setValue] = useState(null);

  return (
    <CompareEdit
      value={value}
      historyValue="some value"
      emptyLabel="无数据"
      onChange={setValue}
    >
      <Input />
    </CompareEdit>
  );
};

// 数组值对比示例
const ArrayCompareEdit = () => {
  const [value, setValue] = useState([1, 3]);

  const options = [
    { value: 1, label: "选项1" },
    { value: 2, label: "选项2" },
    { value: 3, label: "选项3" },
    { value: 4, label: "选项4" },
  ];

  return (
    <CompareEdit
      value={value}
      historyValue={[1, 2]}
      fieldValue="value"
      options={options}
      onChange={setValue}
    >
      <RestSelect mode="multiple" options={options} />
    </CompareEdit>
  );
};
```

### 注意事项
1. **children 组件**：必须传入一个可编辑的组件作为子元素，该组件需要支持 `value` 和 `onChange` 属性
2. **数据类型一致性**：历史值与当前值的数据类型必须一致才能进行有效对比
3. **options 配置**：当值为基础类型时，需要提供 options 数组来格式化显示标签
4. **fieldValue**：指定从 options 中获取 value 的字段名，默认为 'value'
5. **复制功能**：启用复制功能后，每个标签都会显示复制按钮，点击可复制对应的值

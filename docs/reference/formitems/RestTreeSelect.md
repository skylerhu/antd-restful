## RestTreeSelect
基于 Ant Design TreeSelect 组件扩展的远程树形选择器，支持远程数据懒加载、树形结构展示、复制等功能。

**功能特性：**
- 支持远程数据懒加载
- 支持树形结构数据展示
- 支持单选和多选模式
- 支持复制功能
- 支持只读模式展示
- 支持自定义字段名映射

### 参数说明
| 参数 | 说明 | 类型 | 默认值 | antd 覆盖说明 | 版本 |
| - | - | - | - | - | - |
| **通用属性** | | | | | |
| style | 自定义样式 | `object` | - | 透传 TreeSelect `style` | - |
| className | 自定义类名 | `string` | - | 透传 TreeSelect `className` | - |
| value | 当前选中的值 | `any` | - | 透传 TreeSelect `value` | - |
| onChange | 值变化时的回调函数 | `function(value, nodes)` | - | 覆盖 TreeSelect `onChange`，增加 nodes 参数 | - |
| **远程数据相关** | | | | | |
| restful | 远程接口地址 | `string` | - | - | - |
| reqConfig | axios 的配置选项 | `object` | - | - | - |
| baseParams | 基础请求参数 | `object` | - | - | - |
| labelTemplate | 标签模板 | `string` | - | - | - |
| fieldParent | 父级字段名 | `string` | `'parent'` | - | - |
| parseRowsPath | 解析数据路径 | `string` | `'data.results'` | - | - |
| **字段映射** | | | | | |
| fieldNames | 字段映射 | `object` | - | 透传 TreeSelect `fieldNames` | - |
| treeNodeLabelProp | 树节点标签属性 | `string` | - | 透传 TreeSelect `treeNodeLabelProp` | - |
| **状态控制** | | | | | |
| enableCopy | 是否启用复制功能 | `boolean` | `false` | - | - |
| separator | 多选时复制值之间的分隔符 | `string` | `','` | - | - |
| disabled | 是否禁用 | `boolean` | `false` | 透传 TreeSelect `disabled` | - |
| readOnly | 是否只读模式 | `boolean` | `false` | - | - |
| treeData | 静态树形数据 | `array` | - | 覆盖 TreeSelect `treeData`，远程模式由内部管理 | - |
| **Ant Design 原生配置** | | | | | |
| antdTreeSelectProps | Ant Design [TreeSelect](https://ant.design/components/tree-select-cn) 组件属性 | `object` | - | 透传 TreeSelect 属性，`value` / `onChange` / `treeData` / `loadData` 由内部管理 | - |
| antdSpaceProps | Ant Design [Space](https://ant.design/components/space-cn) 组件属性 | `object` | - | 透传 Space 属性 | - |

### 字段映射配置 (fieldNames)
```javascript
{
  value: 'key',      // 选项值字段名
  label: 'name',     // 选项标签字段名
  children: 'children' // 子级字段名
}
```

### 回调函数参数说明
`onChange` 回调函数接收两个参数：
- `value`: 当前选中的值
- `nodes`: 当前选中的节点对象数组

### 使用示例

```jsx
import React, { useState } from 'react';
import { RestTreeSelect } from 'antd-restful';

// 基本使用示例
const BasicRestTreeSelect = () => {
  const [value, setValue] = useState();

  return (
    <RestTreeSelect
      restful="/api/tree-data"
      value={value}
      onChange={(value, nodes) => {
        console.log('选中值:', value);
        console.log('选中节点:', nodes);
        setValue(value);
      }}
      fieldNames={{ value: 'id', label: 'name' }}
      fieldParent="parent_id"
    />
  );
};

// 多选模式示例
const MultipleRestTreeSelect = () => {
  const [value, setValue] = useState([]);

  return (
    <RestTreeSelect
      restful="/api/departments"
      value={value}
      onChange={setValue}
      antdTreeSelectProps={{
        multiple: true,
        treeCheckable: true,
        placeholder: "请选择部门"
      }}
      enableCopy
    />
  );
};

// 只读模式示例
const ReadOnlyRestTreeSelect = () => {
  return (
    <RestTreeSelect
      value={[1, 2]}
      treeData={[
        { id: 1, name: '技术部', children: [] },
        { id: 2, name: '产品部', children: [] },
      ]}
      fieldNames={{ value: 'id', label: 'name' }}
      readOnly
      enableCopy
    />
  );
};
```

### API 数据格式示例

RestTreeSelect 期望的 API 响应数据格式如下：

```json
{
  "results": [
    {
      "id": 1,
      "key": "anhui",
      "name": "安徽",
      "belong": null,
      "isLeaf": false
    },
    {
      "id": 2,
      "key": "beijing",
      "name": "北京",
      "belong": null,
      "isLeaf": false
    },
    {
      "id": 8,
      "key": "hefei",
      "name": "合肥",
      "belong": "anhui",
      "isLeaf": true
    }
  ]
}
```

其中：
- `belong` 字段表示父级节点的 key 值，根节点的 `belong` 为 `null`
- `isLeaf` 字段表示是否为叶子节点
- 组件会根据 `fieldParent` 配置自动构建树状结构

### 注意事项
1. **字段映射**：通过 `fieldNames` 配置数据字段映射
2. **父子关系**：`fieldParent` 指定父级字段名，用于建立树形关系
3. **懒加载**：只有展开节点时才会加载子节点数据
4. **复制功能**：启用后可复制选中的值
5. **只读模式**：以标签形式展示选中的值

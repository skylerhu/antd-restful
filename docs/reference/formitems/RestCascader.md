## RestCascader
基于 Ant Design Cascader 组件扩展的远程级联选择器，支持远程数据懒加载、多选、复制等功能。

**功能特性：**
- 支持远程数据懒加载获取
- 支持单选和多选模式
- 支持树形结构数据展示
- 支持复制功能
- 支持只读模式展示
- 支持自定义字段名映射
- 支持父子关系动态加载

### 参数说明
| 参数 | 说明 | 类型 | 默认值 | 版本 |
| - | - | - | - | - |
| style | 自定义样式 | `object` | - | - |
| className | 自定义类名 | `string` | - | - |
| value | 选中的值（数组格式，表示路径） | `array` | - | - |
| onChange | 值变化时的回调函数 | `function(value, selectedOptions, treeOpts)` | - | - |
| **远程数据相关** | | | | |
| restful | 远程数据接口地址 | `string` | - | - |
| reqConfig | axios 的配置选项 | `object` | - | - |
| baseParams | 基础请求参数 | `object` | - | - |
| fieldParent | 父级字段名 | `string` | `'parent'` | - |
| parseRowsPath | 解析数据路径 | `string` | `'data.results'` | - |
| **显示和交互** | | | | |
| enableCopy | 是否启用复制功能 | `boolean` | `false` | - |
| separator | 复制时，路径之间的分隔符 | `string` | `' / '` | - |
| **原生组件支持** | | | | |
| options | 静态数据 | `array` | - | - |
| fieldNames | 字段映射配置 | `object` | - | - |
| disabled | 是否禁用 | `boolean` | `false` | - |
| readOnly | 是否只读模式 | `boolean` | `false` | - |
| **Ant Design 原生配置** | | | | |
| antdSpaceProps | Ant Design Space 组件的原生属性 | `object` | - | - |
| antdCascaderProps | Ant Design Cascader 组件的原生属性 | `object` | - | - |

### 字段映射配置 (fieldNames)
```javascript
{
  value: 'id',        // 选项值字段名
  label: 'name',      // 选项标签字段名
  children: 'children' // 子选项字段名
}
```

### 数据加载机制
1. **懒加载**：首次加载根节点数据，展开时动态加载子节点
2. **父子关系**：通过 `fieldParent` 字段建立父子关系
3. **去重处理**：避免重复请求相同节点的数据
4. **缓存机制**：已加载的节点数据会被缓存

### 使用示例

```jsx
import React, { useState } from 'react';
import { RestCascader } from 'antd-restful';

// 基本远程数据示例
const BasicRestCascader = () => {
  const [value, setValue] = useState();

  return (
    <RestCascader
      restful="/api/regions"
      value={value}
      onChange={(value, selectedOptions, treeOpts) => {
        console.log('选中路径:', value);
        console.log('选中选项:', selectedOptions);
        console.log('树形选项:', treeOpts);
        setValue(value);
      }}
      fieldNames={{ value: 'id', label: 'name', children: 'children' }}
      fieldParent="parent_id"
    />
  );
};

// 多选模式示例
const MultipleRestCascader = () => {
  const [value, setValue] = useState([]);

  return (
    <RestCascader
      restful="/api/departments"
      value={value}
      onChange={setValue}
      fieldNames={{ value: 'dept_id', label: 'dept_name' }}
      fieldParent="parent_dept"
      enableCopy
      antdCascaderProps={{
        multiple: true,
        placeholder: "请选择部门"
      }}
    />
  );
};

// 静态数据示例
const StaticRestCascader = () => {
  const [value, setValue] = useState();

  const options = [
    {
      value: 'beijing',
      label: '北京',
      children: [
        {
          value: 'haidian',
          label: '海淀区',
        },
        {
          value: 'chaoyang',
          label: '朝阳区',
        },
      ],
    },
    {
      value: 'shanghai',
      label: '上海',
      children: [
        {
          value: 'huangpu',
          label: '黄浦区',
        },
      ],
    },
  ];

  return (
    <RestCascader
      options={options}
      value={value}
      onChange={setValue}
    />
  );
};

// 只读模式示例
const ReadOnlyRestCascader = () => {
  const options = [
    {
      value: 'tech',
      label: '技术部',
      children: [
        { value: 'frontend', label: '前端组' },
        { value: 'backend', label: '后端组' },
      ],
    },
  ];

  return (
    <RestCascader
      options={options}
      value={['tech', 'frontend']}
      readOnly
      enableCopy
    />
  );
};

// 自定义分隔符示例
const CustomSeparatorRestCascader = () => {
  const [value, setValue] = useState();

  return (
    <RestCascader
      restful="/api/categories"
      value={value}
      onChange={setValue}
      separator=" > "
      fieldNames={{ value: 'category_id', label: 'category_name' }}
    />
  );
};

// 带基础参数示例
const BaseParamsRestCascader = () => {
  const [value, setValue] = useState();

  return (
    <RestCascader
      restful="/api/organizational"
      value={value}
      onChange={setValue}
      baseParams={{
        status: 'active',
        type: 'department'
      }}
      fieldParent="parent_id"
      fieldNames={{ value: 'org_id', label: 'org_name' }}
    />
  );
};
```

### 高级用法

#### 自定义字段映射
```jsx
const CustomFieldRestCascader = () => {
  const [value, setValue] = useState();

  return (
    <RestCascader
      restful="/api/tree-data"
      value={value}
      onChange={setValue}
      fieldNames={{
        value: 'node_id',
        label: 'node_name',
        children: 'sub_nodes'
      }}
      fieldParent="parent_node_id"
    />
  );
};
```

#### 多选模式配置
```jsx
const MultiSelectRestCascader = () => {
  const [value, setValue] = useState([]);

  return (
    <RestCascader
      restful="/api/permissions"
      value={value}
      onChange={setValue}
      antdCascaderProps={{
        multiple: true,
        maxTagCount: 'responsive',
        placeholder: "请选择权限",
        showCheckedStrategy: 'SHOW_CHILD'
      }}
      enableCopy
    />
  );
};
```

### API 响应格式
组件期望的 API 响应格式：

**根节点请求**（parent__isnull=true）：
```javascript
{
  "data": {
    "results": [
      {
        "id": 1,
        "name": "北京市",
        "parent": null,
        "isLeaf": false
      },
      {
        "id": 2,
        "name": "上海市",
        "parent": null,
        "isLeaf": false
      }
    ]
  }
}
```

**子节点请求**（parent=1）：
```javascript
{
  "data": {
    "results": [
      {
        "id": 11,
        "name": "海淀区",
        "parent": 1,
        "isLeaf": true
      },
      {
        "id": 12,
        "name": "朝阳区",
        "parent": 1,
        "isLeaf": true
      }
    ]
  }
}
```

### 请求参数说明
- **初始化请求**：`{fieldParent}__isnull=true` 获取根节点
- **子节点请求**：`{fieldParent}={parentValue}` 获取指定父节点的子节点
- **基础参数**：`baseParams` 会在每次请求中附加

### 注意事项
1. **字段映射**：通过 `fieldNames` 配置数据字段映射，支持复杂数据结构
2. **父子关系**：`fieldParent` 指定父级字段名，用于建立树形关系
3. **懒加载**：只有展开节点时才会加载子节点数据，提高性能
4. **叶子节点**：通过 `isLeaf` 字段或空子节点数组判断是否为叶子节点
5. **多选模式**：通过 `antdCascaderProps.multiple` 启用多选功能
6. **复制功能**：启用后可复制选中的完整路径
7. **只读模式**：以标签形式展示选中的路径，支持复制
8. **数据缓存**：已加载的节点数据会被缓存，避免重复请求
9. **路径值**：value 始终是数组格式，表示从根到叶子的完整路径
10. **回调参数**：onChange 提供选中路径、选中选项和树形选项三个参数

### 相关组件
- [RestSelect](./RestSelect.md) - 远程下拉选择器
- [RestTreeSelect](./RestTreeSelect.md) - 远程树形选择器
- [RestAutoComplete](./RestAutoComplete.md) - 远程自动完成选择器

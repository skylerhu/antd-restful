## TableSelect
基于 RestTable 组件的表格选择器，支持多行选择、展示已选数据、取消选择等功能，适用于需要在表格中进行多选操作的场景。

**功能特性：**
- 支持表格形式的多行选择
- 支持展示已选中的数据
- 支持取消选择操作
- 支持折叠/展开已选数据区域
- 支持只读和禁用模式
- 完全继承 RestTable 的所有功能

### 参数说明
| 参数 | 说明 | 类型 | 默认值 | 版本 |
| - | - | - | - | - |
| value | 值仅支持对象数组格式 | `array<object>` | - | - |
| onChange | 值变化时的回调函数 | `function(selectedRows)` | - | - |
| disabled | 禁用后只读 | `boolean` | `false` | - |
| readOnly | 是否只读模式 | `boolean` | `false` | - |
| expandSelected | 是否默认展开显示选中数据 | `boolean` | `true` | - |
| rowKey | 表格行的唯一键名 | `string` | `'id'` | - |
| columns | 表格列配置 | `array` | `[]` | - |
| **Ant Design 原生配置** | | | | |
| antdTableProps | Ant Design Table 组件的原生属性 | `object` | - | - |
| antdTableReadProps | 用于配置只读的Table，覆盖 antdTableProps | `object` | - | - |
| antdCollapseProps | Ant Design Collapse 组件的原生属性 | `object` | - | - |
| antdSpaceProps | Ant Design Space 组件的原生属性 | `object` | - | - |
| **RestTable 属性** | | | | |
| ...restProps | 继承 RestTable 的所有其他属性 | - | - | - |

### 数据格式
- **输入值**：必须是对象数组格式 `[{}, {}, ...]`
- **输出值**：选中的行数据对象数组

### 组件结构
1. **已选数据区域**：可折叠的面板，显示已选中的数据表格
2. **数据选择区域**：RestTable 表格，用于浏览和选择数据
3. **取消选择**：在已选数据中每行都有取消选择按钮

### 使用示例

```jsx
import React, { useState } from 'react';
import { TableSelect } from 'antd-restful';

// 基本使用示例
const BasicTableSelect = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
    },
  ];

  return (
    <TableSelect
      restful="/api/users"
      value={selectedRows}
      onChange={setSelectedRows}
      columns={columns}
      rowKey="id"
      expandSelected={true}
    />
  );
};

// 自定义行键示例
const CustomRowKeyTableSelect = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  const columns = [
    {
      title: '员工号',
      dataIndex: 'employee_id',
      key: 'employee_id',
    },
    {
      title: '员工姓名',
      dataIndex: 'employee_name',
      key: 'employee_name',
    },
  ];

  return (
    <TableSelect
      restful="/api/employees"
      value={selectedRows}
      onChange={setSelectedRows}
      columns={columns}
      rowKey="employee_id"
    />
  );
};

// 带搜索功能示例
const SearchableTableSelect = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  const columns = [
    {
      title: '产品名称',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `¥${price}`,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
    },
  ];

  return (
    <TableSelect
      restful="/api/products"
      value={selectedRows}
      onChange={setSelectedRows}
      columns={columns}
      rowKey="product_id"
      searchKey="keyword"
      enableQuickSearch
      baseParams={{ status: 'active' }}
    />
  );
};

// 只读模式示例
const ReadOnlyTableSelect = () => {
  const selectedData = [
    { id: 1, name: '张三', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', email: 'lisi@example.com' },
  ];

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
  ];

  return (
    <TableSelect
      value={selectedData}
      columns={columns}
      rowKey="id"
      readOnly
    />
  );
};

// 禁用状态示例
const DisabledTableSelect = () => {
  const [selectedRows, setSelectedRows] = useState([
    { id: 1, name: '张三', email: 'zhangsan@example.com' },
  ]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
  ];

  return (
    <TableSelect
      restful="/api/users"
      value={selectedRows}
      onChange={setSelectedRows}
      columns={columns}
      rowKey="id"
      disabled
    />
  );
};

// 自定义表格属性示例
const CustomTablePropsTableSelect = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  const columns = [
    {
      title: '订单号',
      dataIndex: 'order_id',
      key: 'order_id',
    },
    {
      title: '客户名称',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: '订单金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `¥${amount.toFixed(2)}`,
    },
  ];

  return (
    <TableSelect
      restful="/api/orders"
      value={selectedRows}
      onChange={setSelectedRows}
      columns={columns}
      rowKey="order_id"
      antdTableProps={{
        size: 'small',
        scroll: { x: 800 },
        pagination: {
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        },
        rowSelection: {
          type: 'checkbox',
          columnWidth: 60,
        },
      }}
    />
  );
};
```

### 高级用法

#### 表单集成示例
```jsx
import { Form, Button } from 'antd';
import { TableSelect } from 'antd-restful';

const FormTableSelect = () => {
  const [form] = Form.useForm();

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
  ];

  const handleSubmit = (values) => {
    console.log('表单值:', values);
    console.log('选中用户:', values.selectedUsers);
  };

  return (
    <Form form={form} onFinish={handleSubmit}>
      <Form.Item
        name="selectedUsers"
        label="选择用户"
        rules={[
          {
            required: true,
            validator: (_, value) => {
              if (!value || value.length === 0) {
                return Promise.reject('请至少选择一个用户');
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <TableSelect
          restful="/api/users"
          columns={columns}
          rowKey="id"
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};
```

#### 自定义折叠面板示例
```jsx
const CustomCollapseTableSelect = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  const columns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
    },
  ];

  return (
    <TableSelect
      restful="/api/products"
      value={selectedRows}
      onChange={setSelectedRows}
      columns={columns}
      rowKey="id"
      expandSelected={false}
      antdCollapseProps={{
        size: 'small',
        ghost: true,
        collapsible: 'header',
      }}
    />
  );
};
```

#### 带分页的大数据表格示例
```jsx
const PaginatedTableSelect = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
    },
  ];

  return (
    <TableSelect
      restful="/api/articles"
      value={selectedRows}
      onChange={setSelectedRows}
      columns={columns}
      rowKey="id"
      antdTableProps={{
        scroll: { y: 400 },
        pagination: {
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
        },
        rowSelection: {
          preserveSelectedRowKeys: true,
        },
      }}
    />
  );
};
```

### 行为说明
1. **选择行为**：点击表格行的复选框进行选择/取消选择
2. **已选数据展示**：在折叠面板中以表格形式展示已选数据
3. **取消选择**：在已选数据表格的每一行都有红色叉号按钮用于取消选择
4. **数据持久化**：选中的行在翻页或搜索时会被保持
5. **去重处理**：基于 `rowKey` 进行去重，避免重复选择

### 状态管理
- **disabled**：禁用后组件变为只读，无法进行选择操作
- **readOnly**：只读模式下只显示已选数据，不显示数据选择区域
- **expandSelected**：控制已选数据区域是否默认展开

### 注意事项
1. **数据格式**：value 必须是对象数组格式，每个对象必须包含 `rowKey` 指定的字段
2. **rowKey 唯一性**：确保 `rowKey` 字段的值在数据中是唯一的
3. **列配置**：`columns` 配置会同时应用到选择表格和已选数据表格
4. **继承属性**：组件继承了 RestTable 的所有属性，支持分页、搜索、排序等功能
5. **选择状态保持**：通过 `preserveSelectedRowKeys` 确保翻页时选择状态不丢失
6. **取消选择**：组件会自动在已选数据表格中添加取消选择列
7. **Ant Design 兼容**：自动适配 Ant Design v4 和 v5 的 Collapse 组件 API 差异

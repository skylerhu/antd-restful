## RestTable
基于 Ant Design Table 组件实现了远程加载数据。

**功能特性：**
- 远程数据加载：基于 Ant Design Table 组件实现，支持从 RESTful API 接口加载数据
- 静态数据支持：除了远程加载，也支持直接传入静态数据源
- 模板支持：支持 {field} 格式的标签模板
- 多种筛选类型：支持输入框、下拉选择等筛选方式
- 灵活配置：高度可配置的列定义和表格行为
- 工具栏功能：内置高级搜索、刷新、下载、列显示设置等工具
- 智能筛选：支持表头筛选和表单筛选，自动处理参数合并
- 本地存储：支持列显示设置的本地存储
- 自动刷新：支持间隔自动刷新数据

### 参数说明
| 参数 | 说明 | 类型 | 默认值 | 版本 |
| - | - | - | - | - |
| style | 自定义样式 | `object` | - | - |
| className | 自定义类名 | `string` | - | - |
| **远程数据相关** | | | | |
| restful | RESTful API 接口地址 | `string` | - | - |
| reqConfig | 请求配置，axios请求的额外配置 | `object` | - | - |
| urlDetailTemplate | 删除操作的自定义 URL 模板 | `string` | - | - |
| baseParams | 基础请求参数 | `object` | - | - |
| routeParams | 路由参数 | `object` | - | - |
| forceParams | 强制参数，会覆盖路由参数和表单参数 | `object` | - | - |
| fieldPage | 分页字段名 | `string` | `'page'` | - |
| fieldPageSize | 每页条数字段名 | `string` | `'page_size'` | - |
| defaultPageSize | 默认页数 | `number` | `20` | - |
| fieldOrdering | 排序字段名 | `string` | `'ordering'` | - |
| parseRowsPath | 解析数据行的路径 | `string` | `'results'` | - |
| parseTotalPath | 解析总数的路径 | `string` | `'count'` | - |
| showHeaderTags | 是否显示表格header上的筛选条件 | `boolean` | `false` | 0.1.5 |
| **显示和交互** | | | | |
| isActive | 是否激活，为 false 时不更新数据 | `boolean` | `true` | - |
| tools | 工具栏配置 | `object \| boolean` | `{ advancedSearch: true, refreshInterval: 0, settings: true }` | - |
| extraTools | 其他操作工具 | `node` | - | 0.1.9 |
| onFiltersChange | 筛选条件变化回调 | `function(filters)` | - | - |
| onDataSourceChange | 数据源变化回调 | `function(dataSource)` | - | - |
| rowKey | 行数据的 key | `string` | `'id'` | - |
| columns | 表格列配置 | `array` | - | - |
| dataSource | 静态数据源，设置后不使用 restful | `array` | - | - |
| expandFieldPath | 根据字段判断是否使用展开，不配置字段默认根据columns的配置展示 | `boolean` | - | 0.1.9 |
| expandAntdProps | 展开列使用Descptions展示，配置其props | `objects` | - | 0.1.9 |
| expandedAllRows | 未启用tools时也可以配置展开所有行 | `boolean` | - | 0.1.9 |
| filterFormProps | 筛选表单配置，详见 [GridForm](./GridForm.md) | `object` | - | - |
| **Ant Design 原生配置** | | | | |
| antdTableProps | Ant Design [Table](https://ant.design/components/table-cn) 组件的属性 | `object` | - | - |
| antdSpaceProps | 定义选中和列表的间距，Ant Design [Space](https://ant.design/components/space-cn) 组件的属性 | `object` | - | - |

**tools 配置项：**

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| - | - | - | - | - |
| advancedSearch | 是否显示高级搜索切换按钮 | `boolean` | `true` | - |
| advancedDefaultOpen | 是否默认打开高级搜索 | `boolean` | `false` | - |
| refreshInterval | 刷新间隔（毫秒），0为手动刷新，>0为自动刷新，<0为隐藏刷新按钮 | `number` | `0` | - |
| downloadKey | 下载功能的参数名，true时使用'_download'，字符串时使用自定义参数名，false时禁用下载 | `boolean \| string` | `false` | - |
| settings | 列显示设置，true时使用restful作为存储key，字符串时使用自定义key，false时禁用 | `boolean \| string` | `true` | - |
| expandedAllRows | 控制是否默认展开所有行，为false时默认不展开 | `boolean` | - | 0.1.9 |

**columns 配置项：**

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| - | - | - | - | - |
| title | 列标题 | `string` | - | - |
| dataIndex | 列数据在数据项中对应的路径 | `string` | - | - |
| key | 列的唯一标识 | `string` | - | - |
| labelTemplate | 列值显示模板，支持 `{field}` 格式 | `string` | - | - |
| copyProps | 开启复制功能的配置，详见 [CopyView](#copyview) | `object` | - | - |
| copyField | dataIndex配置的值是字典时，可以用此配置复制时使用的字段 | `string` | - | 0.1.9 |
| filterDropdownConfig | 自定义筛选下拉框配置 | `object` | - | - |
| dropdownLocalConfig | 前端Table刷选的配置 | `object` | - | - |
| filterMultiple | 是否支持多选筛选 | `boolean` | - | - |
| fieldName | 本地筛选时使用的真实字段名 | `string` | - | - |
| hidden | 是否默认隐藏该列 | `boolean` | `false` | - |
| sorter | 排序配置 | `boolean \| function` | - | - |
| filters | 筛选选项 | `array` | - | - |
| expandable | 是否在展开功能中显示 | `boolean` | - | 0.1.9 |
| expandableItemProps | 展示样式配置 | `object` | - | 0.1.9 |
| render | 自定义渲染函数 | `function(text, record, index)` | - | - |

**filterDropdownConfig 配置项：**

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| - | - | - | - | - |
| type | 筛选类型 | `'input' \| 'select'` | - | - |
| dropdownProps | 下拉框组件的属性，Ant Design 官方 `filterDropdown` 配置 | `object` | - | - |
| **style** | **筛选下拉框的自定义样式** | `object` | - | - |

**Ref 方法：**

| 方法名 | 说明 | 参数 | 返回值 |
| - | - | - | - |
| refreshList | 刷新表格数据 | - | - |
| deleteRow | 删除指定行 | `row` | - |

### 使用示例

**基本使用：**

```jsx
import React, { useRef } from 'react';
import { RestTable, constants: { FieldType } } from 'antd-restful';

// 基本使用示例
const BasicTable = () => {
  const tableRef = useRef();

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
    },
    {
      title: "用户名",
      dataIndex: "username",
      sorter: true,
      filterDropdownConfig: {
        type: FieldType.INPUT,
      },
      filterMultiple: false,
    },
    {
      title: "昵称",
      dataIndex: "nickname",
      sorter: true,
      filterDropdownConfig: {
        type: FieldType.INPUT,
      },
    },
    {
      title: "性别",
      dataIndex: "gender",
      filters: [
        { text: "男", value: "male" },
        { text: "女", value: "female" },
      ],
    },
    {
      title: "年龄",
      dataIndex: "age",
      sorter: true,
      render: (value, record) => `${value}岁`,
    },
    {
      title: "邮箱",
      dataIndex: "email",
      copyProps: { showIcon: true },
    },
    {
      title: "城市",
      dataIndex: "city",
      labelTemplate: "城市：{name}",
    },
  ];

  return (
    <RestTable
      ref={tableRef}
      restful="api/users/"
      columns={columns}
      rowKey="id"
      baseParams={{
        page_size: 10,
        is_active: true,
      }}
      onFiltersChange={(filters) => {
        console.log('筛选条件变化:', filters);
      }}
      onDataSourceChange={(data) => {
        console.log('数据源变化:', data);
      }}
    />
  );
};
```

**带工具栏的表格：**

```jsx
import React from 'react';
import { RestTable, FieldType } from 'antd-restful';

const TableWithTools = () => {
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
    },
    {
      title: "产品名称",
      dataIndex: "name",
      sorter: true,
      filterDropdownConfig: {
        type: FieldType.INPUT,
      },
    },
    {
      title: "分类",
      dataIndex: "category",
      filterDropdownConfig: {
        type: FieldType.SELECT,
        dropdownProps: {
          restful: '/api/categories/',
          fieldNames: { label: 'name', value: 'id' }
        }
      },
    },
    {
      title: "价格",
      dataIndex: "price",
      sorter: true,
      render: (value) => `¥${value}`,
    },
    {
      title: "状态",
      dataIndex: "status",
      filters: [
        { text: "启用", value: "active" },
        { text: "禁用", value: "inactive" },
      ],
    },
    {
      title: "备注",
      dataIndex: "remark",
      hidden: true, // 默认隐藏，可通过列设置显示
    },
  ];

  return (
    <RestTable
      restful="/api/products/"
      columns={columns}
      tools={{
        advancedSearch: true,        // 显示高级搜索切换按钮
        refreshInterval: 30000,      // 30秒自动刷新
        downloadKey: 'export',       // 启用下载功能，使用export参数
        settings: 'product-table'    // 使用自定义key存储列设置
      }}
      filterFormProps={{
        fields: [
          {
            key: 'name',
            label: '产品名称',
            type: FieldType.INPUT,
            antdFieldProps: {
              placeholder: '请输入产品名称'
            }
          },
          {
            key: 'category',
            label: '分类',
            type: FieldType.SELECT,
            antdFieldProps: {
              restful: '/api/categories/',
              fieldNames: { label: 'name', value: 'id' }
            }
          },
          {
            key: 'status',
            label: '状态',
            type: FieldType.SELECT,
            antdFieldProps: {
              options: [
                { label: '全部', value: '' },
                { label: '启用', value: 'active' },
                { label: '禁用', value: 'inactive' }
              ]
            }
          }
        ]
      }}
    />
  );
};
```

**带筛选表单的表格：**

```jsx
import React from 'react';
import { RestTable, FieldType } from 'antd-restful';

const TableWithFilter = () => {
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "用户名",
      dataIndex: "username",
      sorter: true,
      filterDropdownConfig: {
        type: FieldType.SELECT,
        dropdownProps: {
          restful: "api/users/",
          fieldNames: {
            label: "nickname",
            value: "username",
          },
        },
      },
      filterMultiple: false,
    },
    {
      title: "昵称",
      dataIndex: "nickname",
      sorter: true,
    },
    {
      title: "性别",
      dataIndex: "gender",
      filters: [
        { text: "男", value: "male" },
        { text: "女", value: "female" },
      ],
    },
    {
      title: "年龄",
      dataIndex: "age",
      sorter: true,
      filterDropdownConfig: {
        type: FieldType.INPUT,
      },
    },
  ];

  return (
    <RestTable
      restful="api/users/"
      columns={columns}
      filterFormProps={{
        antdListProps: {
          grid: { gutter: 10, xs: 1, sm: 2, md: 3 }
        },
        fields: [
          {
            key: 'username',
            label: '用户名',
            type: FieldType.INPUT,
            antdFieldProps: {
              placeholder: '请输入用户名'
            }
          },
          {
            key: 'gender',
            label: '性别',
            type: FieldType.SELECT,
            antdFieldProps: {
              options: [
                { label: '全部', value: '' },
                { label: '男', value: 'male' },
                { label: '女', value: 'female' }
              ]
            }
          },
          {
            key: 'age_range',
            label: '年龄范围',
            type: FieldType.NUMBER_RANGE,
            antdFieldProps: {
              placeholder: ['最小年龄', '最大年龄']
            }
          }
        ]
      }}
    />
  );
};
```

**自定义筛选配置：**

```jsx
import React from 'react';
import { RestTable, FieldType } from 'antd-restful';

const CustomFilterTable = () => {
  const columns = [
    {
      title: "产品名称",
      dataIndex: "name",
      filterDropdownConfig: {
        type: FieldType.INPUT,
        style: { width: 250 }, // 自定义筛选框样式
        dropdownProps: {
          placeholder: '输入产品名称搜索',
          allowClear: true
        }
      },
    },
    {
      title: "分类",
      dataIndex: "category_id",
      filterDropdownConfig: {
        type: FieldType.SELECT,
        dropdownProps: {
          restful: '/api/categories/',
          fieldNames: { label: 'name', value: 'id' },
          placeholder: '选择分类',
          allowClear: true
        }
      },
    },
    {
      title: "价格",
      dataIndex: "price",
      sorter: true,
      render: (value) => `¥${value}`,
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      sorter: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <RestTable
      restful="/api/products/"
      columns={columns}
      baseParams={{
        ordering: '-created_at' // 默认按创建时间倒序
      }}
    />
  );
};
```

**本地数据表格：**

```jsx
import React from 'react';
import { RestTable } from 'antd-restful';

const LocalDataTable = () => {
  const columns = [
    {
      title: "姓名",
      dataIndex: "name",
      fieldName: "name", // 用于本地筛选的字段名
      filters: [
        { text: "张三", value: "张三" },
        { text: "李四", value: "李四" },
      ],
    },
    {
      title: "年龄",
      dataIndex: "age",
      fieldName: "age",
      sorter: true, // 本地排序
    },
    {
      title: "城市",
      dataIndex: "city",
      fieldName: "city",
      filters: [
        { text: "北京", value: "北京" },
        { text: "上海", value: "上海" },
      ],
    },
  ];

  const dataSource = [
    { id: 1, name: '张三', age: 25, city: '北京' },
    { id: 2, name: '李四', age: 30, city: '上海' },
    { id: 3, name: '王五', age: 28, city: '北京' },
  ];

  return (
    <RestTable
      dataSource={dataSource}
      columns={columns}
      rowKey="id"
      tools={false} // 禁用工具栏
    />
  );
};
```

**高级配置示例：**

```jsx
import React, { useRef } from 'react';
import { RestTable, FieldType } from 'antd-restful';
import { Button, message, Space } from 'antd';

const AdvancedTable = () => {
  const tableRef = useRef();

  const columns = [
    {
      title: "订单号",
      dataIndex: "order_no",
      copyProps: {
        showIcon: true,
        text: '复制订单号'
      },
    },
    {
      title: "客户信息",
      dataIndex: "customer",
      labelTemplate: "{name} ({phone})", // 使用模板格式化显示
    },
    {
      title: "金额",
      dataIndex: "amount",
      sorter: true,
      render: (value) => `¥${value.toFixed(2)}`,
    },
    {
      title: "状态",
      dataIndex: "status",
      filters: [
        { text: "待付款", value: "pending" },
        { text: "已付款", value: "paid" },
        { text: "已发货", value: "shipped" },
        { text: "已完成", value: "completed" },
      ],
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            size="small"
            danger
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleView = (record) => {
    message.info(`查看订单: ${record.order_no}`);
  };

  const handleDelete = (record) => {
    if (tableRef.current) {
      tableRef.current.deleteRow(record);
    }
  };

  const handleRefresh = () => {
    if (tableRef.current) {
      tableRef.current.refreshList();
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button onClick={handleRefresh}>手动刷新</Button>
      </div>

      <RestTable
        ref={tableRef}
        restful="/api/orders/"
        urlDetailTemplate="/api/orders/{id}/" // 自定义删除URL模板
        columns={columns}
        reqConfig={{
          timeout: 10000, // 10秒超时
          headers: {
            'Custom-Header': 'value'
          }
        }}
        tools={{
          advancedSearch: true,
          refreshInterval: 60000, // 1分钟自动刷新
          downloadKey: true,       // 使用默认的_download参数
          settings: true           // 启用列设置
        }}
        baseParams={{
          page_size: 20
        }}
        forceParams={{
          // 强制参数，不会被其他参数覆盖
          company_id: 123
        }}
        onFiltersChange={(filters) => {
          console.log('当前筛选条件:', filters);
        }}
        antdTableProps={{
          size: 'small',
          scroll: { x: 1000 },
          pagination: {
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100']
          }
        }}
      />
    </div>
  );
};
```

### 工具栏功能详解

**高级搜索切换：**
- 点击高级搜索按钮可以展开/收起筛选表单
- 当有多个筛选条件时，会自动展开高级搜索

**自动刷新：**
- `refreshInterval > 0` 时启用自动刷新
- 点击刷新按钮可以切换自动刷新的开启/关闭状态
- `refreshInterval = 0` 时为手动刷新模式
- `refreshInterval < 0` 时隐藏刷新按钮

**下载功能：**
- 支持当前页下载和全部数据下载
- 下载URL会自动添加当前的筛选和排序参数
- 可以自定义下载参数名

**列显示设置：**
- 支持显示/隐藏列的设置
- 设置会自动保存到localStorage
- 支持全选/反选操作
- 可以自定义存储key

### 筛选功能详解

**表头筛选：**
- 支持输入框和下拉选择两种类型
- 输入框支持模糊搜索
- 下拉选择支持远程数据加载
- 筛选值会自动同步到URL参数

**表单筛选：**
- 使用GridForm组件实现
- 支持所有GridForm的字段类型
- 可以在单项模式和高级搜索模式间切换

**本地筛选：**
- 当没有配置restful时，支持本地筛选和排序
- 需要配置fieldName指定真实的字段名
- 支持多种数据类型的筛选

### 最佳实践

1. **性能优化：**
   - 合理设置分页大小，避免一次加载过多数据
   - 使用forceParams避免不必要的参数变化
   - 对于大表格，考虑使用虚拟滚动

2. **用户体验：**
   - 合理配置工具栏功能，避免功能过载
   - 使用列显示设置让用户自定义显示内容
   - 提供清晰的筛选和排序反馈

3. **数据处理：**
   - 使用labelTemplate简化复杂数据的显示
   - 合理使用copyProps提升数据操作效率
   - 配置合适的解析路径适配不同的API响应格式

4. **错误处理：**
   - 配置合适的请求超时时间
   - 使用reqConfig添加必要的请求头
   - 实现数据变化的回调处理

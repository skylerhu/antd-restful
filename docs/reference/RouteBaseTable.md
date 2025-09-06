## RouteBaseTable
基于 RestTable 组件实现的路由联动表格，支持将表格的筛选参数同步到 URL 查询字符串中，实现页面刷新后保持筛选状态。

**功能特性：**
- 路由联动：表格筛选参数自动同步到 URL 查询字符串
- 状态保持：页面刷新后自动恢复之前的筛选状态
- 参数过滤：自动过滤与默认参数相同的参数，避免冗余的 URL 参数
- 兼容性：兼容 react-router v5 和 v6 版本
- 深度比较：使用深度比较确保参数变化的准确性
- 回调支持：支持筛选变化和搜索变化的自定义回调

### 参数说明
| 参数 | 说明 | 类型 | 默认值 | 版本 |
| - | - | - | - | - |
| location | 路由 location 对象，包含当前 URL 信息 | `object` | - | - |
| onSearchChange | 搜索参数变化回调，用于更新路由 | `function(search)` | - | - |
| parseOptions | 解析query参数的选项, [query-string](https://www.npmjs.com/package/query-string) 的配置项 | `object` | - | - |
| restProps | 传递给 RestTable 的所有属性 | `object` | - | - |

**restProps 中的关键参数：**
| 参数 | 说明 | 类型 | 默认值 | 版本 |
| - | - | - | - | - |
| baseParams | 基础请求参数，与 URL 参数相同时会被过滤 | `object` | - | - |
| onFiltersChange | 筛选条件变化回调 | `function(filters)` | - | - |
| 其他参数 | 所有 RestTable 支持的参数 | - | - | - |

### 使用示例

```jsx
import React, { forwardRef } from 'react';
import PropTypes from "prop-types";
import { useLocation, useNavigate } from 'react-router';
import { RouteBaseTable } from 'antd-restful';

// 封装一个通用的路由表格组件
const RouteTable = ({ parseOptions, ...restProps }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <RouteBaseTable
      restProps={restProps}
      location={location}
      parseOptions={parseOptions}
      onSearchChange={(search) => {
        navigate(`${location.pathname}${search}`);
      }}
    />
  );
};
RouteTable.propTypes = {
  parseOptions: PropTypes.object,
};
RouteTable.displayName = 'RouteTable';

// 使用封装的组件
const UserList = () => {
  return (
    <RouteTable
      restful="api/users/"
      columns={[
        {
          title: "ID",
          dataIndex: "id",
          width: 80,
        },
        {
          title: "用户名",
          dataIndex: "username",
          sorter: true,
        },
        {
          title: "昵称",
          dataIndex: "nickname",
          sorter: true,
        },
      ]}
      baseParams={{
        page_size: 10,
        is_active: true,
      }}
      tools={{
        advancedSearch: true,
        settings: true,
      }}
    />
  );
};
```

### 注意事项

1. **路由兼容性**：由于 react-router v5 和 v6 的 API 差异，组件需要手动传入 `location` 对象和 `onSearchChange` 回调函数。

2. **参数过滤**：组件会自动过滤与 `baseParams` 中相同的参数，避免在 URL 中显示冗余参数。

3. **深度比较**：使用 `dequal` 库进行深度比较，确保参数变化的准确性。

4. **初始化等待**：组件会等待从 URL 解析参数完成后再渲染，避免闪烁。

5. **回调函数**：`onSearchChange` 回调会接收到完整的查询字符串（包含 `?` 前缀），需要根据实际路由库的 API 进行相应处理。

### 与 RestTable 的区别

| 特性 | RestTable | RouteBaseTable |
| - | - | - |
| 路由联动 | ❌ | ✅ |
| 状态保持 | ❌ | ✅ |
| URL 参数同步 | ❌ | ✅ |
| 使用复杂度 | 简单 | 需要路由配置 |
| 适用场景 | 独立表格 | 需要状态保持的表格 |

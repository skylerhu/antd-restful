## RestList

基于 Ant Design List 组件实现了远程加载数据的列表。

**功能特性：**

- 远程数据加载：基于 Ant Design List 组件实现，支持从 RESTful API 接口加载数据
- 静态数据支持：除了远程加载，也支持直接传入静态数据源
- 两种分页模式：支持 loadMore（加载更多）和 pagination（分页器）两种模式，pagination 优先级高于 loadMore
- 筛选表单：通过 filterFormProps 在 List header 中渲染 GridForm 筛选表单
- Grid 布局：支持 antd List 的 grid 配置，并校验 page_size 与 grid.column 的倍数关系
- 灵活渲染：renderItem 直接暴露，不封装 List.Item，由调用方自行控制

### 参数说明


| 参数 | 说明 | 类型 | 默认值 | antd 覆盖说明 | 版本 |
| --- | --- | --- | --- | --- | --- |
| **通用属性** | | | | | |
| style | 自定义样式 | `object` | - | 透传 List `style` | - |
| className | 自定义类名 | `string` | - | 透传 List `className` | - |
| **数据与渲染** | | | | | |
| dataSource | 静态数据源，设置后不使用 restful 远程加载 | `array` | - | 覆盖 List `dataSource`，由内部管理 | - |
| renderItem | 自定义列表项渲染函数，不封装 List.Item | `function(item, index)` | - | 透传 List `renderItem` | - |
| rowKey | 行数据的唯一标识字段名 | `string` | `'id'` | 透传 List `rowKey` | - |
| **分页与布局** | | | | | |
| pagination | 分页器配置，设置后启用分页模式（优先级高于 loadMore） | `boolean \| object` | - | 覆盖 List `pagination`，内部封装分页逻辑 | - |
| grid | 列表栅格配置，详见下方 grid 配置项 | `object` | - | 透传 List `grid`，增加 column 倍数校验 | - |
| **回调函数** | | | | | |
| onDataSourceChange | 数据源变化回调 | `function({ dataSource, total })` | - | - | - |
| onFiltersChange | 筛选条件变化回调 | `function(filters)` | - | - | - |
| **远程数据配置** | | | | | |
| restful | RESTful API 接口地址 | `string` | - | - | - |
| reqConfig | 请求配置，axios 请求的额外配置 | `object` | - | - | - |
| parseOptions | 解析 query 参数的选项，[query-string](https://www.npmjs.com/package/query-string) 的配置项 | `object` | - | - | - |
| baseParams | 基础请求参数 | `object` | - | - | - |
| routeParams | 路由参数 | `object` | - | - | - |
| forceParams | 强制参数，会覆盖路由参数和表单参数 | `object` | - | - | - |
| **请求字段配置** | | | | | |
| fieldPage | 分页字段名 | `string` | `'page'` | - | - |
| fieldPageSize | 每页条数字段名 | `string` | `'page_size'` | - | - |
| defaultPageSize | 默认每页条数 | `number` | `20` | - | - |
| parseRowsPath | 解析数据行的路径 | `string` | `'results'` | - | - |
| parseTotalPath | 解析总数的路径 | `string` | `'count'` | - | - |
| **控制与筛选** | | | | | |
| isActive | 是否激活，为 false 时不请求数据 | `boolean` | `true` | - | - |
| filterFormProps | 筛选表单配置，详见 [GridForm](./GridForm.md) | `object` | - | 内部生成 List `header` | - |
| **Ant Design 原生配置** | | | | | |
| antdListProps | Ant Design [List](https://ant.design/components/list-cn) 的其余属性。注意 `loading` / `header` / `loadMore` / `pagination` / `dataSource` / `renderItem` / `rowKey` 由 RestList 内部管理，通过此属性设置会被覆盖 | `object` | - | 透传剩余属性 | - |


**grid 配置项：**


| 参数     | 说明              | 类型       | 默认值 |
| ------ | --------------- | -------- | --- |
| gutter | 栅格间距            | `number` | -   |
| column | 列数              | `number` | -   |
| xs     | `<576px` 展示的列数  | `number` | -   |
| sm     | `≥576px` 展示的列数  | `number` | -   |
| md     | `≥768px` 展示的列数  | `number` | -   |
| lg     | `≥992px` 展示的列数  | `number` | -   |
| xl     | `≥1200px` 展示的列数 | `number` | -   |
| xxl    | `≥1600px` 展示的列数 | `number` | -   |


> **注意：** 当配置了 grid 时，`defaultPageSize`（或通过参数传入的 page_size）**必须是 grid.column 的倍数**，否则会在控制台输出 `console.error` 警告。

**pagination 配置：**


| 值            | 说明                                                                             |
| ------------ | ------------------------------------------------------------------------------ |
| `false` / 不传 | 使用 loadMore（加载更多）模式，数据追加累积                                                     |
| `true`       | 启用分页器，使用默认配置（showSizeChanger、showQuickJumper、showTotal）                        |
| `object`     | 启用分页器，支持传入 antd [Pagination](https://ant.design/components/pagination-cn) 的配置项 |


> **优先级说明：** pagination 优先级高于 loadMore。当 pagination 启用时，loadMore 按钮不会渲染。

**Ref 方法：**


| 方法名           | 说明                     | 参数  | 返回值                     |
| ------------- | ---------------------- | --- | ----------------------- |
| refreshList   | 刷新列表数据                 | -   | -                       |
| fetchMore     | 手动触发加载更多（loadMore 模式下） | -   | -                       |
| getDataSource | 获取当前数据源                | -   | `{ dataSource, total }` |


**静态属性：**


| 属性              | 说明                   |
| --------------- | -------------------- |
| `RestList.Item` | 等同于 `List.Item`，方便使用 |


### 使用示例

**loadMore 模式（默认）：**

```jsx
import { RestList } from 'antd-restful';

const LoadMoreList = () => (
  <RestList
    restful="/api/users/"
    defaultPageSize={10}
    rowKey="id"
    filterFormProps={{
      fields: [
        { key: 'search', label: '搜索', type: 'input' },
      ],
    }}
    renderItem={(item) => (
      <RestList.Item>
        <RestList.Item.Meta
          title={item.name}
          description={item.email}
        />
      </RestList.Item>
    )}
  />
);
```

**pagination 模式：**

```jsx
import { RestList } from 'antd-restful';

const PaginationList = () => (
  <RestList
    restful="/api/users/"
    defaultPageSize={10}
    rowKey="id"
    pagination={{ showSizeChanger: true, pageSizeOptions: [10, 20, 50] }}
    renderItem={(item) => (
      <RestList.Item>
        <RestList.Item.Meta
          title={item.name}
          description={item.email}
        />
      </RestList.Item>
    )}
  />
);
```

**Grid 卡片布局：**

```jsx
import { Card, Tag } from 'antd';
import { RestList } from 'antd-restful';

// page_size=4 是 column=2 的倍数，布局正确
const GridCardList = () => (
  <RestList
    restful="/api/products/"
    defaultPageSize={4}
    rowKey="id"
    grid={{ gutter: 16, column: 2 }}
    renderItem={(item) => (
      <RestList.Item style={{ height: '100%' }}>
        <Card style={{ height: '100%' }}>
          <p>名称: {item.name}</p>
          <p>价格: ¥{item.price}</p>
        </Card>
      </RestList.Item>
    )}
  />
);
```

**配合 RouteBaseTable 使用（路由联动 + 分页）：**

> RouteBaseTable + viewType="list" 一般与 pagination 配合使用，不推荐与 loadMore 结合。
> loadMore 模式下数据会追加累积，不适合通过 URL 参数还原状态。

```jsx
import { RestList, RouteBaseTable, constants } from 'antd-restful';
import { useLocation, useNavigate } from 'react-router';

const { ViewType, FieldType } = constants;

const RouteListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <RouteBaseTable
      viewType={ViewType.LIST}
      location={location}
      onSearchChange={(search) => {
        navigate(`${location.pathname}${search}`);
      }}
      restProps={{
        restful: '/api/users/',
        defaultPageSize: 10,
        rowKey: 'id',
        pagination: true,
        filterFormProps: {
          fields: [
            { key: 'search', label: '搜索', type: FieldType.INPUT },
          ],
        },
        renderItem: (item) => (
          <RestList.Item>
            <RestList.Item.Meta
              title={item.name}
              description={item.email}
            />
          </RestList.Item>
        ),
      }}
    />
  );
};
```

### 两种分页模式对比


| 特性                | loadMore（默认）        | pagination                |
| ----------------- | ------------------- | ------------------------- |
| 数据管理              | 数据追加累积，越来越多         | 每次切页替换当前数据                |
| 适用场景              | 信息流、瀑布流、内容发现        | 精确导航、搜索结果、管理列表            |
| 路由联动              | 不推荐，数据累积无法通过 URL 还原 | 推荐，page/pageSize 可映射到 URL |
| 配合 RouteBaseTable | 不推荐                 | 推荐                        |
| 用户感知              | "加载更多"按钮            | 页码导航器                     |


### 常见问题

1. **grid 布局最后一行不完整**

当 page_size 不是 grid.column 的倍数时，最后一行的卡片数量不一致，导致布局不对齐。组件会在控制台输出 error 提示：

```
[RestList] restful="api/users/" page_size=3 必须是 grid.column=2 的倍数，当前不满足，会导致列表布局不对齐。
```

确保 `defaultPageSize`（或 `baseParams.page_size`）是 `grid.column` 的倍数即可。

1. **pagination 和 loadMore 能同时使用吗？**

antd List 技术上允许同时传递 `loadMore` 和 `pagination`，但二者的数据管理逻辑冲突（一个追加累积，一个翻页替换），在 RestList 中做了互斥处理：**pagination 优先级高于 loadMore**，当 pagination 启用时不会渲染 loadMore 按钮。

1. **Grid 卡片高度不一致**

在使用 grid 布局时，建议给 `RestList.Item` 和内部的 `Card` 都设置 `style={{ height: '100%' }}`，确保同一行卡片高度对齐。
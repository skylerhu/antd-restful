import React from "react";
import { Avatar, Button, Card, Tag } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router";
import libs from "demo/libs";

const {
  RestList,
  RouteBaseTable,
  constants: { FieldType, ViewType },
} = libs;

const ListDemo = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{ width: "80%", margin: "0 auto" }}>
      <h3>RouteBaseTable + viewType=list + pagination（联动路由 + 分页）</h3>
      <RouteBaseTable
        viewType={ViewType.LIST}
        location={location}
        onSearchChange={(search) => {
          navigate(`${location.pathname}${search}`);
        }}
        restProps={{
          restful: "api/users/",
          defaultPageSize: 2,
          rowKey: "id",
          grid: { gutter: 16, column: 2 },
          pagination: { showSizeChanger: true, pageSizeOptions: [2, 4, 10] },
          filterFormProps: {
            advancedSearch: true,
            antdListProps: {
              grid: { gutter: 30, column: 3 },
            },
            fields: [
              {
                key: "search",
                label: "搜索",
                type: FieldType.INPUT,
              },
              {
                key: "gender",
                label: "性别",
                type: FieldType.RADIO,
                antdFieldProps: {
                  options: [
                    { label: "全部", value: "" },
                    { label: "男", value: "male" },
                    { label: "女", value: "female" },
                  ],
                },
              },
            ],
          },
          renderItem: (item) => (
            <RestList.Item key={item.id} style={{ height: "100%" }}>
              <Card style={{ height: "100%" }}>
                <p>昵称: {item.nickname || item.username}</p>
                <p>用户名: {item.username}</p>
                <p>
                  状态:{" "}
                  {item.is_active ? <Tag color="green">活跃</Tag> : <Tag color="red">禁用</Tag>}
                </p>
              </Card>
            </RestList.Item>
          ),
        }}
      />

      <h3 style={{ marginTop: 40 }}>基础列表（loadMore + loadMoreProps 自定义文案和样式）</h3>
      <RestList
        restful="api/users/"
        defaultPageSize={2}
        rowKey="id"
        loadMoreProps={{
          text: "点击加载更多用户",
          style: { marginTop: 20, marginBottom: 20 },
        }}
        filterFormProps={{
          advancedSearch: true,
          antdListProps: {
            grid: { gutter: 30, column: 3 },
          },
          fields: [
            {
              key: "search",
              label: "搜索",
              type: FieldType.INPUT,
            },
            {
              key: "gender",
              label: "性别",
              type: FieldType.RADIO,
              antdFieldProps: {
                options: [
                  { label: "全部", value: "" },
                  { label: "男", value: "male" },
                  { label: "女", value: "female" },
                ],
              },
            },
          ],
        }}
        renderItem={(item) => (
          <RestList.Item key={item.id}>
            <RestList.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={item.nickname || item.username}
              description={
                <>
                  <span>@{item.username}</span>
                  {item.gender && (
                    <Tag color={item.gender === "male" ? "blue" : "pink"} style={{ marginLeft: 8 }}>
                      {item.gender === "male" ? "男" : "女"}
                    </Tag>
                  )}
                  {item.age !== undefined && <span style={{ marginLeft: 8 }}>年龄: {item.age}</span>}
                </>
              }
            />
          </RestList.Item>
        )}
      />

      <h3 style={{ marginTop: 40 }}>Grid 卡片列表（loadMore + grid + loadMoreProps.render 自定义渲染）</h3>
      <RestList
        restful="api/users/"
        defaultPageSize={4}
        rowKey="id"
        grid={{ gutter: 16, column: 2 }}
        loadMoreProps={{
          render: (fetchMore, loadingMore) => (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <Button type="dashed" onClick={fetchMore} loading={loadingMore} style={{ width: 200 }}>
                {loadingMore ? "努力加载中..." : "展开更多卡片"}
              </Button>
            </div>
          ),
        }}
        renderItem={(item) => (
          <RestList.Item key={item.id} style={{ height: "100%" }}>
            <Card style={{ height: "100%" }}>
              <p>昵称: {item.nickname || item.username}</p>
              <p>用户名: {item.username}</p>
              <p>
                状态:{" "}
                {item.is_active ? <Tag color="green">活跃</Tag> : <Tag color="red">禁用</Tag>}
              </p>
              <p>城市: {item.city?.name || "-"}</p>
              <p>分数: {item.score ?? "-"}</p>
            </Card>
          </RestList.Item>
        )}
      />

      <h3 style={{ marginTop: 40 }}>Grid 列校验（page_size=3, column=2 触发 console.error）</h3>
      <RestList
        restful="api/users/"
        defaultPageSize={3}
        rowKey="id"
        grid={{ gutter: 16, column: 2 }}
        renderItem={(item) => (
          <RestList.Item key={item.id}>
            <Card title={item.nickname || item.username}>
              <p>ID: {item.id}</p>
            </Card>
          </RestList.Item>
        )}
      />
    </div>
  );
};

export default ListDemo;

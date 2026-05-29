## LongText
是一个用于显示长文本的组件，支持文本截断、模态框展示和模板格式化。

**功能特性：**
- 支持字符串、数字、布尔值、数组、对象等多种数据类型
- 自动截断超长内容，显示"查看更多"按钮
- 支持模板格式化显示对象数据
- 模态框展示完整内容，支持原始数据切换
- 响应式设计，适配不同屏幕尺寸
- 智能识别是否需要显示展开按钮
- 支持自定义模态框配置

### 参数说明
| 参数 | 说明 | 类型 | 默认值 | antd 覆盖说明 | 版本 |
| - | - | - | - | - | - |
| **通用属性** | | | | | |
| style | 自定义样式 | `object` | - | - | - |
| className | 自定义类名 | `string` | - | - | - |
| **数据与显示** | | | | | |
| value | 要显示的文本内容 | `any` | - | - | - |
| maxLength | 最大显示长度，数组时为元素个数，字符串时为字符数 | `number` | `64` | - | - |
| titleTemplate | 选中个数的标题显示模板，必须包含 `{count}` 占位符 | `string` | `"长度：{count}"` | - | - |
| titleAggPath | 选中数据根据字段聚合统计显示在 title 上，titleTemplate 中使用 `{stat}` 占位符 | `string` | - | - | - |
| separator | 数组元素间的分隔符 | `string` | `'\n'` | - | - |
| labelTemplate | 对象或数组对象的显示模板，支持 `{field}` 格式 | `string` | - | - | - |
| **Ant Design 原生配置** | | | | | |
| antdModalProps | Ant Design [Modal](https://ant.design/components/modal-cn) 组件的属性 | `object` | - | 透传 Modal 属性，`open` / `onCancel` / `footer` / `title` 由内部管理 | - |

### 使用示例

**基本文本显示：**

```jsx
import { LongText } from 'antd-restful';

// 短文本（不会显示展开按钮）
<LongText value="这是一段短文本" />

// 长文本自动截断
<LongText
  value="这是一段很长的文本内容，超过默认长度会自动截断并显示查看更多按钮，点击可以在模态框中查看完整内容"
  maxLength={20}
/>

// 自定义截断长度
<LongText
  value="自定义截断长度的文本内容示例"
  maxLength={10}
/>
```

**数组数据显示：**

```jsx
// 简单数组
<LongText
  value={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
  separator=", "
  maxLength={5}
/>

// 字符串数组
<LongText
  value={['苹果', '香蕉', '橙子', '葡萄', '西瓜', '草莓']}
  separator=" | "
  maxLength={3}
/>

// 长数组显示
<LongText
  value={Array.from({length: 50}, (_, i) => `项目${i + 1}`)}
  separator="\n"
  maxLength={10}
/>
```

**对象模板显示：**

```jsx
// 单个对象
<LongText
  value={{ id: 1, username: "admin", nickname: "管理员", email: "admin@example.com" }}
  labelTemplate="{nickname}({username}) - {email}"
/>

// 对象数组
<LongText
  value={[
    { id: 1, username: "admin", nickname: "管理员", department: "技术部" },
    { id: 2, username: "skyler", nickname: "Skyler", department: "产品部" },
    { id: 3, username: "john", nickname: "John", department: "设计部" }
  ]}
  labelTemplate="{nickname} - {department}"
  maxLength={2}
  separator="\n"
/>

// 复杂对象模板
<LongText
  value={[
    {
      name: "张三",
      age: 25,
      city: "北京",
      job: "工程师",
      salary: 15000
    },
    {
      name: "李四",
      age: 30,
      city: "上海",
      job: "设计师",
      salary: 12000
    }
  ]}
  labelTemplate="{name} ({age}岁) - {city} {job} ¥{salary}"
  maxLength={1}
/>
```

**模态框自定义：**

```jsx
// 自定义模态框标题和尺寸
<LongText
  value="长文本内容..."
  maxLength={20}
  antdModalProps={{
    title: "详细内容",
    width: 800,
    centered: true,
    maskClosable: false
  }}
/>

// 自定义模态框样式
<LongText
  value={longTextContent}
  antdModalProps={{
    title: "查看详情",
    width: "90%",
    style: { top: 20 },
    bodyStyle: {
      maxHeight: '70vh',
      overflow: 'auto',
      fontSize: '14px',
      lineHeight: '1.6'
    }
  }}
/>
```

**数据类型处理：**

```jsx
// 数字类型
<LongText value={123456789} maxLength={5} />

// 布尔值
<LongText value={true} />

// 复杂对象
<LongText
  value={{
    user: { name: "张三", id: 1 },
    permissions: ["read", "write", "delete"],
    settings: { theme: "dark", language: "zh-CN" },
    metadata: {
      created: "2024-01-01",
      updated: "2024-01-15",
      version: "1.2.0"
    }
  }}
  maxLength={100}
/>
```

**在表格中的应用：**

```jsx
import { RestTable } from 'antd-restful';

const columns = [
  {
    title: "用户信息",
    dataIndex: "users",
    render: (users) => (
      <LongText
        value={users}
        labelTemplate="{name}({email})"
        maxLength={2}
        separator="; "
      />
    )
  },
  {
    title: "描述",
    dataIndex: "description",
    render: (text) => (
      <LongText
        value={text}
        maxLength={50}
        antdModalProps={{
          title: "完整描述",
          width: 600
        }}
      />
    )
  },
  {
    title: "标签",
    dataIndex: "tags",
    render: (tags) => (
      <LongText
        value={tags}
        separator=" • "
        maxLength={3}
      />
    )
  }
];
```

**原始数据切换：**

```jsx
// 对象数据支持原始数据查看
<LongText
  value={[
    {
      id: 1,
      name: "产品A",
      specs: { color: "红色", size: "L", weight: "500g" }
    },
    {
      id: 2,
      name: "产品B",
      specs: { color: "蓝色", size: "M", weight: "300g" }
    }
  ]}
  labelTemplate="{name} - {specs.color} {specs.size}"
  maxLength={1}
/>
```

**响应式显示：**

```jsx
// 在不同屏幕尺寸下自适应截断长度
<LongText
  value="这是一段需要在不同设备上显示的长文本内容"
  maxLength={window.innerWidth < 768 ? 30 : 64}
  antdModalProps={{
    width: window.innerWidth < 768 ? '95%' : 600
  }}
/>
```

**空值处理：**

```jsx
// 空值或无效值处理
<LongText value="" />          {/* 不显示任何内容 */}
<LongText value={null} />      {/* 不显示任何内容 */}
<LongText value={undefined} /> {/* 不显示任何内容 */}
<LongText value={[]} />        {/* 显示空数组 */}
<LongText value={{}} />        {/* 显示空对象 */}
```

**结合其他组件：**

```jsx
import { Card, Space, Tag } from 'antd';

// 在卡片中使用
<Card title="项目详情">
  <Space direction="vertical" style={{ width: '100%' }}>
    <div>
      <strong>参与人员：</strong>
      <LongText
        value={projectMembers}
        labelTemplate="{name}({role})"
        maxLength={3}
        separator=", "
      />
    </div>
    <div>
      <strong>项目描述：</strong>
      <LongText
        value={projectDescription}
        maxLength={100}
      />
    </div>
  </Space>
</Card>

// 与标签组合
<Space>
  <Tag color="blue">数据：</Tag>
  <LongText
    value={complexData}
    maxLength={30}
    antdModalProps={{ title: "数据详情" }}
  />
</Space>
```

### 最佳实践

1. **合理设置截断长度**：根据界面空间和内容重要性设置 `maxLength`
2. **选择合适的分隔符**：数组显示时选择易读的分隔符
3. **模板设计**：对象模板应突出重要信息，保持简洁
4. **模态框配置**：根据内容类型配置合适的模态框尺寸
5. **响应式考虑**：在移动端适当减少截断长度
6. **性能优化**：对于大量数据，考虑虚拟滚动或分页

### 使用场景

- **数据表格**：显示长文本字段，如描述、备注等
- **用户列表**：显示多个用户信息，支持模板格式化
- **日志查看**：显示长日志内容，支持模态框查看
- **配置展示**：显示复杂配置对象
- **标签管理**：显示多个标签，超出时自动折叠

### 常见问题

**Q: 如何自定义"查看更多"按钮的样式？**
A: 可以通过全局 CSS 覆盖相关样式类名。

**Q: 模板中的字段不存在怎么办？**
A: 不存在的字段会显示为空字符串，不会报错。

**Q: 如何在模态框中显示富文本？**
A: 可以通过 `antdModalProps.bodyStyle` 设置样式，并确保数据包含 HTML 标签。

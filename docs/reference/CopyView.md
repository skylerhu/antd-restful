## CopyView
是一个支持一键复制功能的文本显示组件，适用于需要复制功能的场景。

**功能特性：**
- 支持多种数据类型的复制（字符串、数字、布尔值、数组、对象）
- 支持文本截断显示，但复制完整内容
- 支持自定义分隔符
- 支持隐藏值只显示复制按钮
- 支持禁用复制功能
- 复制成功后显示提示信息
- 智能处理空值和无效值
- 集成在多个表单组件中，提供统一的复制体验

### 参数说明
| 参数 | 说明 | 类型 | 默认值 | antd 覆盖说明 | 版本 |
| - | - | - | - | - | - |
| **通用属性** | | | | | |
| style | 自定义样式 | `object` | - | - | - |
| className | 自定义类名 | `string` | - | - | - |
| **数据与显示** | | | | | |
| value | 需要复制的值 | `string \| number \| boolean \| array \| object` | - | - | - |
| short | 截取前N个字符进行展示，仅对字符串生效，复制时仍为完整内容 | `number` | `0` | - | - |
| showIcon | 是否显示复制按钮图标 | `boolean` | `false` | - | - |
| hiddenValue | 是否隐藏值，配合只展示按钮使用 | `boolean` | `false` | - | - |
| children | 直接展示的文本内容，优先级高于 value | `node` | - | - | - |
| **交互控制** | | | | | |
| disabled | 是否禁用复制功能 | `boolean` | `false` | - | - |
| separator | 复制时值之间的分隔符 | `string` | `','` | - | - |

### 使用示例

**基本使用：**

```jsx
import { CopyView } from 'antd-restful';

// 基本文本复制 - 点击文本即可复制
<CopyView value="hello world" />

// 数字复制
<CopyView value={123456} />

// 布尔值复制
<CopyView value={true} />
```

**显示复制按钮：**

```jsx
// 显示复制图标按钮
<CopyView value="secret value" showIcon />

// 隐藏值只显示复制按钮（常用于敏感信息）
<CopyView value="password123" hiddenValue />

// 既显示值又显示按钮
<CopyView value="public info" showIcon={false} />
```

**文本截断：**

```jsx
// 截断显示但复制完整内容
<CopyView
  value="这是一段很长的文本内容，会被截断显示但复制时是完整的"
  short={10}
/>

// 结果：显示"这是一段很长的文..."，复制时是完整内容
```

**数组处理：**

```jsx
// 基本数组复制
<CopyView value={[1, 2, 3, 4, 5]} />

// 自定义分隔符
<CopyView value={['苹果', '香蕉', '橙子']} separator=" | " />

// 对象数组（需要配合 LongText 使用模板）
<CopyView value={[
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]} />
```

**对象处理：**

```jsx
// 对象会自动转换为 JSON 字符串
<CopyView value={{ id: 1, username: "admin", role: "管理员" }} />

// 复制结果：{"id":1,"username":"admin","role":"管理员"}
```

**自定义显示内容：**

```jsx
// 使用 children 自定义显示，但复制原始 value
<CopyView value="original-value-to-copy">
  <span style={{ color: 'blue', fontWeight: 'bold' }}>
    点击复制密钥
  </span>
</CopyView>

// 结合图标和样式
<CopyView value="https://example.com/api/key" showIcon>
  <Tag color="blue">API Key</Tag>
</CopyView>
```

**在表格中使用：**

```jsx
import { RestTable } from 'antd-restful';

const columns = [
  {
    title: "用户ID",
    dataIndex: "id",
    render: (value) => <CopyView value={value} showIcon />
  },
  {
    title: "邮箱",
    dataIndex: "email",
    copyProps: { showIcon: true }, // RestTable 内置支持
  },
  {
    title: "API Key",
    dataIndex: "apiKey",
    render: (value) => (
      <CopyView value={value} hiddenValue>
        <Button size="small">复制密钥</Button>
      </CopyView>
    )
  }
];
```

**禁用状态：**

```jsx
// 禁用复制功能
<CopyView value="只读内容" disabled />

// 条件禁用
<CopyView
  value="内容"
  disabled={!hasPermission}
  showIcon
/>
```

**复杂数据处理：**

```jsx
// 多层嵌套数据
<CopyView
  value={{
    user: { id: 1, name: 'John' },
    permissions: ['read', 'write'],
    config: { theme: 'dark', lang: 'zh' }
  }}
  showIcon
/>

// 长数组
<CopyView
  value={Array.from({length: 100}, (_, i) => i + 1)}
  separator=","
  showIcon
>
  <span>复制所有数字</span>
</CopyView>
```

**与其他组件集成：**

```jsx
import { Space, Tag, Tooltip } from 'antd';

// 组合使用
<Space>
  <Tag>标签内容</Tag>
  <CopyView value="tag-content" hiddenValue />
</Space>

// 带提示信息
<Tooltip title="点击复制完整路径">
  <CopyView
    value="/very/long/file/path/document.pdf"
    short={20}
  />
</Tooltip>
```

**错误处理：**

```jsx
// 空值处理（不会显示任何内容）
<CopyView value="" />
<CopyView value={null} />
<CopyView value={undefined} />
```

### 在表单组件中的应用

CopyView 已经集成在多个表单组件中：

```jsx
// RestSelect 组件
<RestSelect
  restful="/api/users/"
  enableCopy={true}
  separator=" | "
/>

// RestTreeSelect 组件
<RestTreeSelect
  restful="/api/departments/"
  enableCopy={true}
/>

// RestCascader 组件
<RestCascader
  restful="/api/locations/"
  enableCopy={true}
  separator=" > "
/>
```

### 最佳实践

1. **敏感信息**：使用 `hiddenValue` 隐藏敏感内容，只显示复制按钮
2. **长文本**：使用 `short` 属性截断显示，保持界面整洁
3. **数组数据**：选择合适的分隔符，提高可读性
4. **权限控制**：根据用户权限动态设置 `disabled` 属性
5. **用户体验**：为重要的复制功能提供明显的视觉提示
6. **无障碍访问**：确保复制按钮有合适的 aria-label

### 常见问题

**Q: 为什么复制没有反应？**
A: 检查浏览器是否支持 clipboard API，或者 value 是否为空值。

**Q: 如何自定义复制成功的提示信息？**
A: 组件使用 Ant Design 的 message.success，可以通过 ConfigProvider 全局配置。

**Q: 复制的内容格式不对？**
A: 对象和数组会自动序列化，如需特定格式，建议预处理 value 值。

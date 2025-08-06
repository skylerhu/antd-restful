## ExpansionView
支持文本扩展和远程验证的输入组件，可以将用户输入进行扩展处理或远程验证，适用于需要实时处理输入内容的场景。

在表单中使用时，可结合校验 [expansionValidator](../validators.md#expansionValidator) 一起使用。

**功能特性：**
- 支持 brace-expansion 语法扩展
- 支持远程验证和处理
- 支持错误信息展示
- 支持加载状态显示
- 支持只读模式
- 支持自定义输出模板

### 参数说明
| 参数 | 说明 | 类型 | 默认值 | 版本 |
| - | - | - | - | - |
| style | 自定义样式 | `object` | - | - |
| className | 自定义类名 | `string` | - | - |
| value | 当前值对象，包含 input、output、error 等字段 | `object` | - | - |
| onChange | 值变化时的回调函数 | `function(value)` | - | - |
| **扩展功能** | | | | |
| enableBraceExpansion | 开启后，支持 brace-expansion 的语法输入 | `boolean` | `false` | - |
| **远程处理** | | | | |
| restful | 远程处理接口地址 | `string` | - | - |
| reqConfig | axios 的配置选项 | `object` | - | - |
| inputKey | 输入的值作为 value，inputKey 是请求的 key | `string` | `'input'` | - |
| inputMinEnter | 输入最小长度；仅在 restful 有值时有效 | `number` | `1` | - |
| baseParams | 请求的额外参数 | `object` | - | - |
| valueTemplate | 输出值的模板，{value} 则是输入的值，其余 key 值从 baseParams 中获取 | `string` | - | - |
| **UI 配置** | | | | |
| longTextProps | LongText 组件的属性 | `object` | - | - |
| longErrorProps | 错误信息 LongText 组件的属性 | `object` | - | - |
| **状态控制** | | | | |
| disabled | 是否禁用 | `boolean` | `false` | - |
| readOnly | 是否只读模式 | `boolean` | `false` | - |
| **Ant Design 原生配置** | | | | |
| antdSpaceProps | Ant Design Space 组件的原生属性 | `object` | - | - |
| antdInputProps | Ant Design Input 组件的原生属性 | `object` | - | - |
| antdAlertProps | Ant Design Alert 组件的原生属性 | `object` | - | - |

### 使用示例

```jsx
import React, { useState } from 'react';
import { ExpansionView } from 'antd-restful';

// 基本 brace-expansion 示例
const BasicExpansionView = () => {
  const [value, setValue] = useState();

  return (
    <ExpansionView
      value={value}
      onChange={setValue}
      enableBraceExpansion={true}
      placeholder="输入 {a,b,c} 进行扩展"
    />
  );
};

// 远程验证示例
const RemoteValidationExpansionView = () => {
  const [value, setValue] = useState();

  return (
    <ExpansionView
      value={value}
      onChange={setValue}
      restful="/api/validate"
      inputKey="content"
      inputMinEnter={3}
      baseParams={{ type: 'validation' }}
    />
  );
};

// 带模板的示例
const TemplateExpansionView = () => {
  const [value, setValue] = useState();

  return (
    <ExpansionView
      value={value}
      onChange={setValue}
      enableBraceExpansion={true}
      valueTemplate="processed_{value}_result"
      baseParams={{ prefix: 'custom' }}
    />
  );
};

// 只读模式示例
const ReadOnlyExpansionView = () => {
  const value = {
    input: '{a,b,c}',
    output: ['a', 'b', 'c'],
    error: null,
  };

  return (
    <ExpansionView
      value={value}
      readOnly
    />
  );
};
```

### 值对象结构
```javascript
{
  input: 'string',     // 用户输入的内容
  output: 'any',       // 处理后的输出结果
  error: 'string',     // 错误信息
  loading: 'boolean'   // 加载状态
}
```

### brace-expansion 语法
支持类似 bash 的大括号扩展语法：
- `{a,b,c}` → `['a', 'b', 'c']`
- `{1..3}` → `['1', '2', '3']`
- `prefix{a,b}suffix` → `['prefixa suffix', 'prefixbsuffix']`

### 注意事项
1. **表单验证**：在表单中需要配合特定的 validator，校验 `!isBlank(input) && !loading && !error`
2. **防抖处理**：远程请求有 200ms 的防抖延迟
3. **错误处理**：错误信息会以红色 Alert 形式显示
4. **输出展示**：成功结果会以绿色 Alert 形式显示
5. **模板语法**：`valueTemplate` 支持 `{value}` 和 `baseParams` 中的字段

### 相关组件
- [RestSelect](./RestSelect.md) - 远程下拉选择器
- [TableSelect](./TableSelect.md) - 表格选择器
- [CopyView](./CopyView.md) - 支持复制的文本组件

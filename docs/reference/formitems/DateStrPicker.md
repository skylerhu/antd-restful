## DateStrPicker
基于 Ant Design DatePicker/TimePicker 的字符串日期选择器，值以字符串格式输入输出，支持日期和时间选择。

**功能特性：**
- 支持日期和时间选择
- 值以字符串格式处理
- 支持自定义日期格式
- 支持只读模式展示
- 自动处理字符串与 dayjs 对象的转换

### 参数说明
| 参数 | 说明 | 类型 | 默认值 | 版本 |
| - | - | - | - | - |
| style | 自定义样式 | `object` | - | - |
| className | 自定义类名 | `string` | - | - |
| value | 当前选中的日期字符串 | `string` | - | - |
| onChange | 值变化时的回调函数 | `function(dateString, date)` | - | - |
| **日期配置** | | | | |
| defaultValue | 默认日期字符串 | `string` | - | - |
| format | 日期格式 | `string` | - | - |
| picker | 选择器类型 | `string` | `'date'` | - |
| **状态控制** | | | | |
| disabled | 是否禁用 | `boolean` | `false` | - |
| readOnly | 是否只读模式 | `boolean` | `false` | - |
| **Ant Design 原生配置** | | | | |
| antdPickerProps | Ant Design DatePicker/TimePicker 组件的原生属性 | `object` | - | - |

### 使用示例

```jsx
import React, { useState } from 'react';
import { DateStrPicker } from 'antd-restful';

// 基本日期选择示例
const BasicDateStrPicker = () => {
  const [date, setDate] = useState('');

  return (
    <DateStrPicker
      value={date}
      onChange={(dateString, date) => {
        console.log('日期字符串:', dateString);
        console.log('日期对象:', date);
        setDate(dateString);
      }}
      format="YYYY-MM-DD"
      placeholder="请选择日期"
    />
  );
};

// 时间选择示例
const TimeStrPicker = () => {
  const [time, setTime] = useState('');

  return (
    <DateStrPicker
      value={time}
      onChange={setTime}
      picker="time"
      format="HH:mm:ss"
      placeholder="请选择时间"
    />
  );
};

// 日期时间选择示例
const DateTimeStrPicker = () => {
  const [datetime, setDatetime] = useState('');

  return (
    <DateStrPicker
      value={datetime}
      onChange={setDatetime}
      picker="date"
      format="YYYY-MM-DD HH:mm:ss"
      antdPickerProps={{
        showTime: true,
      }}
    />
  );
};

// 只读模式示例
const ReadOnlyDateStrPicker = () => {
  return (
    <DateStrPicker
      value="2023-12-25"
      format="YYYY-MM-DD"
      readOnly
    />
  );
};

### picker 类型
- `'date'` - 日期选择器（默认）
- `'time'` - 时间选择器
- `'week'` - 周选择器
- `'month'` - 月选择器
- `'quarter'` - 季度选择器
- `'year'` - 年选择器

### 注意事项
1. **字符串格式**：组件专门处理字符串格式的日期值
2. **格式转换**：自动处理字符串与 dayjs 对象之间的转换
3. **回调参数**：onChange 提供日期字符串和日期对象两个参数
4. **只读模式**：只读时直接显示日期字符串
5. **picker 类型**：根据 `picker` 参数选择使用 DatePicker 或 TimePicker

### 相关组件
- [RangeStrPicker](./RangeStrPicker.md) - 日期时间范围选择器
- [GridForm](../GridForm.md) - 网格表单，支持 DateStrPicker 作为表单字段类型

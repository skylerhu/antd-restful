## RangeStrPicker
基于 Ant Design DatePicker.RangePicker/TimePicker.RangePicker 的字符串日期范围选择器，值以字符串格式输入输出。

**功能特性：**
- 支持日期和时间范围选择
- 值以字符串或字符串数组格式处理
- 支持自定义日期格式
- 支持只读模式展示
- 自动处理字符串与 dayjs 对象的转换

### 参数说明
| 参数 | 说明 | 类型 | 默认值 | 版本 |
| - | - | - | - | - |
| style | 自定义样式 | `object` | - | - |
| className | 自定义类名 | `string` | - | - |
| value | 当前选中的日期范围（字符串或字符串数组） | `string \| array<string>` | - | - |
| onChange | 值变化时的回调函数 | `function(dateStrings, dates)` | - | - |
| **日期配置** | | | | |
| defaultEmptyValue | 单个输入框为空时的默认值 | `undefined\|null\|''` | `null` | 0.2.0 |
| defaultValue | 默认日期范围（字符串或字符串数组） | `string \| array<string>` | - | - |
| format | 日期格式 | `string` | - | - |
| isTime | 是否为时间选择器 | `boolean` | `false` | - |
| **状态控制** | | | | |
| disabled | 是否禁用 | `boolean` | `false` | - |
| readOnly | 是否只读模式 | `boolean` | `false` | - |
| **Ant Design 原生配置** | | | | |
| antdRangePickerProps | Ant Design RangePicker 组件的原生属性 | `object` | - | - |

### 使用示例

```jsx
import React, { useState } from 'react';
import { RangeStrPicker } from 'antd-restful';

// 基本日期范围选择示例
const BasicRangeStrPicker = () => {
  const [dateRange, setDateRange] = useState([]);

  return (
    <RangeStrPicker
      value={dateRange}
      onChange={(dateStrings, dates) => {
        console.log('日期字符串数组:', dateStrings);
        console.log('日期对象数组:', dates);
        setDateRange(dateStrings);
      }}
      format="YYYY-MM-DD"
      placeholder={['开始日期', '结束日期']}
    />
  );
};

// 时间范围选择示例
const TimeRangeStrPicker = () => {
  const [timeRange, setTimeRange] = useState([]);

  return (
    <RangeStrPicker
      value={timeRange}
      onChange={setTimeRange}
      isTime={true}
      format="HH:mm:ss"
      placeholder={['开始时间', '结束时间']}
    />
  );
};

// 日期时间范围选择示例
const DateTimeRangeStrPicker = () => {
  const [datetimeRange, setDatetimeRange] = useState([]);

  return (
    <RangeStrPicker
      value={datetimeRange}
      onChange={setDatetimeRange}
      format="YYYY-MM-DD HH:mm:ss"
      antdRangePickerProps={{
        showTime: true,
      }}
    />
  );
};

// 字符串格式输入示例
const StringValueRangeStrPicker = () => {
  const [range, setRange] = useState('2023-01-01,2023-12-31');

  return (
    <RangeStrPicker
      value={range}
      onChange={setRange}
      format="YYYY-MM-DD"
    />
  );
};

// 只读模式示例
const ReadOnlyRangeStrPicker = () => {
  return (
    <RangeStrPicker
      value={['2023-01-01', '2023-12-31']}
      format="YYYY-MM-DD"
      readOnly
    />
  );
};
```

### 值格式支持
组件支持多种输入值格式：
1. **字符串数组**：`['2023-01-01', '2023-12-31']`
2. **逗号分隔字符串**：`'2023-01-01,2023-12-31'`
3. **空值**：`null`、`undefined`、`[]`

### 输出格式
- **有值时**：返回字符串数组 `[startDate, endDate]`
- **无值时**：返回 `null`

### 注意事项
1. **字符串格式**：组件专门处理字符串格式的日期范围值
2. **格式转换**：自动处理字符串与 dayjs 对象之间的转换
3. **回调参数**：onChange 提供日期字符串数组和日期对象数组两个参数
4. **只读模式**：只读时以 " ~ " 分隔显示日期范围
5. **时间模式**：通过 `isTime` 参数选择使用时间范围选择器

### 相关组件
- [DateStrPicker](./DateStrPicker.md) - 单个日期时间选择器
- [NumberRange](./NumberRange.md) - 数字范围选择器
- [GridForm](../GridForm.md) - 网格表单，支持 RangeStrPicker 作为表单字段类型

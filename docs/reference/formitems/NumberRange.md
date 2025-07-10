## NumberRange
基于 Ant Design InputNumber 组件的数字区间输入器，支持闭区间数值范围输入，适用于价格区间、年龄范围等场景。

**功能特性：**
- 支持闭区间数值范围输入
- 支持多种输入格式（数组、字符串、单个数值）
- 支持只读模式展示
- 支持自定义显示模板
- 支持分别配置起始和结束输入框属性

### 参数说明
| 参数 | 说明 | 类型 | 默认值 | 版本 |
| - | - | - | - | - |
| style | 自定义样式 | `object` | - | - |
| className | 自定义类名 | `string` | - | - |
| value | 当前值，支持数组、字符串、数字格式 | `array \| string \| number` | - | - |
| onChange | 值变化时的回调函数 | `function(value)` | - | - |
| labelTemplate | 只读场景下显示的模板，{0} 是 startValue，{1} 是 endValue | `string` | `'[{0},{1}]'` | - |
| disabled | 是否禁用 | `boolean` | `false` | - |
| readOnly | 是否只读模式 | `boolean` | `false` | - |
| **Ant Design 原生配置** | | | | |
| antdSpaceProps | Ant Design Space 组件的原生属性 | `object` | - | - |
| antdInputProps | 两个 InputNumber 组件的共同属性 | `object` | - | - |
| antdStartProps | 起始 InputNumber 组件的专属属性 | `object` | - | - |
| antdEndProps | 结束 InputNumber 组件的专属属性 | `object` | - | - |

### 值格式支持
组件支持多种输入值格式：

1. **数组格式**：`[startValue, endValue]`
2. **字符串格式**：`"startValue,endValue"`
3. **单个数值**：`startValue`（endValue 为 undefined）
4. **空值**：`null`、`undefined`、`[]`

### 输出格式
- **有值时**：返回 `[startValue, endValue]` 数组格式
- **无值时**：返回 `undefined`

### 使用示例

```jsx
import React, { useState } from 'react';
import { NumberRange } from 'antd-restful';

// 基本使用示例
const BasicNumberRange = () => {
  const [value, setValue] = useState();

  return (
    <NumberRange
      value={value}
      onChange={(value) => {
        console.log('选择的范围:', value);
        setValue(value);
      }}
      placeholder={['最小值', '最大值']}
    />
  );
};

// 价格区间示例
const PriceRangeNumberRange = () => {
  const [priceRange, setPriceRange] = useState([100, 1000]);

  return (
    <NumberRange
      value={priceRange}
      onChange={setPriceRange}
      antdInputProps={{
        min: 0,
        precision: 2,
        formatter: (value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
        parser: (value) => value.replace(/¥\s?|(,*)/g, ''),
      }}
      antdStartProps={{
        placeholder: '最低价格'
      }}
      antdEndProps={{
        placeholder: '最高价格'
      }}
    />
  );
};

// 年龄范围示例
const AgeRangeNumberRange = () => {
  const [ageRange, setAgeRange] = useState();

  return (
    <NumberRange
      value={ageRange}
      onChange={setAgeRange}
      antdInputProps={{
        min: 0,
        max: 120,
        precision: 0,
      }}
      antdStartProps={{
        placeholder: '最小年龄'
      }}
      antdEndProps={{
        placeholder: '最大年龄'
      }}
    />
  );
};

// 只读模式示例
const ReadOnlyNumberRange = () => {
  return (
    <NumberRange
      value={[18, 65]}
      readOnly
      labelTemplate="年龄范围：{0} - {1} 岁"
    />
  );
};

// 自定义样式示例
const CustomStyleNumberRange = () => {
  const [value, setValue] = useState();

  return (
    <NumberRange
      value={value}
      onChange={setValue}
      style={{ width: '100%' }}
      antdSpaceProps={{
        style: { display: 'flex', alignItems: 'center' }
      }}
      antdInputProps={{
        style: { flex: 1 }
      }}
    />
  );
};

// 带步长的示例
const StepNumberRange = () => {
  const [value, setValue] = useState();

  return (
    <NumberRange
      value={value}
      onChange={setValue}
      antdInputProps={{
        step: 10,
        min: 0,
        max: 1000,
      }}
      antdStartProps={{
        placeholder: '起始值'
      }}
      antdEndProps={{
        placeholder: '结束值'
      }}
    />
  );
};

// 禁用状态示例
const DisabledNumberRange = () => {
  return (
    <NumberRange
      value={[10, 100]}
      disabled
    />
  );
};
```

### 高级用法

#### 表单验证集成
```jsx
import { Form, Button } from 'antd';
import { NumberRange } from 'antd-restful';

const FormNumberRange = () => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log('表单值:', values);
  };

  return (
    <Form form={form} onFinish={handleSubmit}>
      <Form.Item
        name="priceRange"
        label="价格区间"
        rules={[
          {
            validator: (_, value) => {
              if (!value || value.length !== 2) {
                return Promise.reject('请输入完整的价格区间');
              }
              const [min, max] = value;
              if (min >= max) {
                return Promise.reject('最小值必须小于最大值');
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <NumberRange
          antdInputProps={{
            min: 0,
            precision: 2,
          }}
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

#### 受控组件示例
```jsx
const ControlledNumberRange = () => {
  const [range, setRange] = useState([0, 100]);

  const handleRangeChange = (value) => {
    if (value && value.length === 2) {
      const [min, max] = value;
      // 确保最小值不大于最大值
      if (min <= max) {
        setRange(value);
      }
    } else {
      setRange(value);
    }
  };

  return (
    <div>
      <NumberRange
        value={range}
        onChange={handleRangeChange}
      />
      <p>当前范围: {range ? `${range[0]} ~ ${range[1]}` : '未设置'}</p>
    </div>
  );
};
```

### 模板语法说明
`labelTemplate` 支持占位符语法：
- `{0}` - 起始值（startValue）
- `{1}` - 结束值（endValue）

示例模板：
- `"[{0},{1}]"` - 默认格式，显示如 "[10,100]"
- `"{0} ~ {1}"` - 显示如 "10 ~ 100"
- `"范围：{0} 到 {1}"` - 显示如 "范围：10 到 100"

### 数据处理逻辑
1. **输入处理**：
   - 数组格式直接使用
   - 字符串格式按逗号分割
   - 单个数值转为 `[value, undefined]`
   - 空值转为 `[undefined, undefined]`

2. **输出处理**：
   - 两个值都为空时返回 `undefined`
   - 其他情况返回 `[startValue, endValue]` 数组

### 注意事项
1. **闭区间**：组件实现的是闭区间，包含边界值
2. **值格式**：支持多种输入格式，统一转换为数组格式处理
3. **回调参数**：onChange 返回 `[startValue, endValue]` 格式或 `undefined`
4. **只读显示**：只读模式下使用 `labelTemplate` 格式化显示
5. **属性继承**：`antdInputProps` 会同时应用到两个输入框，`antdStartProps` 和 `antdEndProps` 分别配置专属属性
6. **数值验证**：建议在表单验证中确保最小值小于最大值
7. **精度控制**：通过 `precision` 属性控制小数位数
8. **范围限制**：通过 `min` 和 `max` 属性限制输入范围

### 相关组件
- [RangeStrPicker](./RangeStrPicker.md) - 日期时间范围选择器
- [GridForm](../GridForm.md) - 网格表单，支持 NumberRange 作为表单字段类型
- [DateStrPicker](./DateStrPicker.md) - 日期时间选择器

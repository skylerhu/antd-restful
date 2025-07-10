## GridForm
基于 Ant Design 的网格布局表单组件，支持多种字段类型和响应式布局。

**功能特性：**
- 支持 12 种表单字段类型（输入框、选择器、日期选择等）
- 基于 Ant Design Form 和 List 组件实现，继承其所有特性
- 内置响应式网格布局，自动适配不同屏幕尺寸
- 支持表单验证和自定义验证规则
- 内置提交和重置按钮，支持自定义回调
- 支持自定义渲染函数，灵活扩展
- 支持初始值设置和表单值变化监听
- 自动处理 Enter 键提交表单
- 支持单项模式和高级搜索模式切换
- 智能的表单项激活策略，提升单项模式用户体验

### 参数说明
| 参数 | 说明 | 类型 | 默认值 | 版本 |
| - | - | - | - | - |
| style | 自定义样式 | `object` | - | - |
| className | 自定义类名 | `string` | - | - |
| fields | 表单项配置数组 | `array` | - | - |
| advancedSearch | 是否启用高级搜索模式，false时为单项模式 | `boolean` | `true` | - |
| onSubmit | 表单提交回调 | `function(values)` | - | - |
| onReset | 表单重置回调 | `function(values)` | - | - |
| onValuesChange | 表单值变化回调 | `function(changedValues, allValues)` | - | - |
| initialValues | 表单初始值 | `object` | - | - |
| antdFormProps | Ant Design [Form](https://ant.design/components/form-cn) 组件的属性 | `object` | - | - |
| antdListProps | Ant Design [List](https://ant.design/components/list-cn) 组件的属性 | `object` | `{ grid: { gutter: 10, xs: 1, sm: 2, md: 4 } }` | - |

**fields 配置项：**

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| - | - | - | - | - |
| key | 字段唯一标识，同时作为表单字段的 name | `string` | - | - |
| label | 字段标签，未设置时使用 key 值 | `string` | `key` | - |
| type | 字段类型，详见下方支持的字段类型 | `string` | `'input'` | - |
| antdFormItemProps | Ant Design Form.Item 组件的属性，如验证规则等 | `object` | - | - |
| antdFieldProps | 对应字段组件的属性 | `object` | - | - |
| antdSingleProps | 单项模式下字段组件的特殊属性 | `object` | - | - |
| render | 自定义渲染函数，返回完整的 Form.Item | `function(item)` | - | - |

**支持的字段类型：**

| 类型值 | 说明 | 对应组件 | 特殊说明 |
| - | - | - | - |
| `input` | 输入框 | Ant Design Input | 默认类型，支持 Enter 键提交 |
| `select` | 下拉选择 | RestSelect | 支持远程数据加载 |
| `radio` | 单选 | Ant Design Radio.Group | 需在 antdFieldProps 中配置 options |
| `checkbox` | 多选 | Ant Design Checkbox.Group | 需在 antdFieldProps 中配置 options |
| `number` | 数字输入 | Ant Design InputNumber | 支持数字格式化 |
| `date-picker` | 日期选择 | DateStrPicker | 字符串格式的日期选择器 |
| `date-range-picker` | 日期范围选择 | RangeStrPicker | 字符串格式的日期范围选择器 |
| `number-range` | 数字范围 | NumberRange | 数字范围输入组件 |
| `auto-complete` | 自动完成 | RestAutoComplete | 支持远程搜索 |
| `cascader` | 级联选择 | RestCascader | 支持远程数据加载的级联选择 |
| `tree-select` | 树形选择 | RestTreeSelect | 支持远程数据加载的树形选择 |
| `upload` | 文件上传 | UploadView | 文件上传组件 |

**Ref 方法：**

| 方法名 | 说明 | 参数 | 返回值 |
| - | - | - | - |
| getFormInstance | 获取 Ant Design 表单实例 | - | `FormInstance` |

### 模式说明

**高级搜索模式（默认）:**
- 显示所有配置的字段
- 使用网格布局，响应式排列
- 适合字段较多的复杂表单

**单项模式:**
- 同时只显示一个字段和下拉选择器
- 用户可通过下拉选择器切换字段
- 智能激活策略：优先激活有值的字段，否则激活第一个字段
- 适合简单搜索或移动端场景

### 使用示例

**基本使用（高级搜索模式）：**

```jsx
import React from 'react';
import { GridForm, FieldType } from 'antd-restful';

const BasicForm = () => {
  const fields = [
    {
      key: 'username',
      label: '用户名',
      type: FieldType.INPUT,
      antdFormItemProps: {
        rules: [{ required: true, message: '请输入用户名' }]
      },
      antdFieldProps: {
        placeholder: '请输入用户名'
      }
    },
    {
      key: 'password',
      label: '密码',
      type: FieldType.INPUT,
      antdFormItemProps: {
        rules: [
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码至少6位' }
        ]
      },
      antdFieldProps: {
        type: 'password',
        placeholder: '请输入密码'
      }
    },
    {
      key: 'gender',
      label: '性别',
      type: FieldType.RADIO,
      antdFormItemProps: {
        rules: [{ required: true, message: '请选择性别' }]
      },
      antdFieldProps: {
        options: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' }
        ]
      }
    }
  ];

  const handleSubmit = (values) => {
    console.log('表单提交:', values);
    // 处理表单提交逻辑
  };

  const handleReset = (values) => {
    console.log('表单重置:', values);
  };

  return (
    <GridForm
      fields={fields}
      onSubmit={handleSubmit}
      onReset={handleReset}
      initialValues={{
        gender: 'male'
      }}
    />
  );
};
```

**单项模式使用：**

```jsx
import React from 'react';
import { GridForm, FieldType } from 'antd-restful';

const SingleModeForm = () => {
  const fields = [
    {
      key: 'keyword',
      label: '关键词',
      type: FieldType.INPUT,
      antdFieldProps: {
        placeholder: '请输入搜索关键词'
      }
    },
    {
      key: 'category',
      label: '分类',
      type: FieldType.SELECT,
      antdFieldProps: {
        restful: '/api/categories/',
        fieldNames: { label: 'name', value: 'id' },
        placeholder: '请选择分类'
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
  ];

  return (
    <GridForm
      fields={fields}
      advancedSearch={false}  // 关键配置：启用单项模式
      onSubmit={(values) => {
        console.log('搜索条件:', values);
        // 执行搜索逻辑
      }}
      initialValues={{
        status: ''
      }}
    />
  );
};
```

**高级用法 - 远程数据和自定义布局：**

```jsx
import React, { useRef } from 'react';
import { GridForm, FieldType } from 'antd-restful';
import { Button, message } from 'antd';

const AdvancedForm = () => {
  const formRef = useRef();

  const fields = [
    {
      key: 'category',
      label: '商品分类',
      type: FieldType.SELECT,
      antdFormItemProps: {
        rules: [{ required: true, message: '请选择商品分类' }]
      },
      antdFieldProps: {
        restful: '/api/categories/',
        fieldNames: { label: 'name', value: 'id' },
        placeholder: '请选择分类'
      }
    },
    {
      key: 'tags',
      label: '标签',
      type: FieldType.CHECKBOX,
      antdFieldProps: {
        options: [
          { label: '热门', value: 'hot' },
          { label: '推荐', value: 'recommend' },
          { label: '新品', value: 'new' }
        ]
      }
    },
    {
      key: 'price',
      label: '价格',
      type: FieldType.NUMBER,
      antdFormItemProps: {
        rules: [{ required: true, message: '请输入价格' }]
      },
      antdFieldProps: {
        min: 0,
        precision: 2,
        formatter: (value) => `¥ ${value}`,
        parser: (value) => value.replace(/¥\s?|(,*)/g, '')
      }
    },
    {
      key: 'dateRange',
      label: '销售时间',
      type: FieldType.DATE_RANGE_PICKER,
      antdFieldProps: {
        format: 'YYYY-MM-DD'
      }
    },
    {
      key: 'location',
      label: '销售地区',
      type: FieldType.CASCADER,
      antdFieldProps: {
        restful: '/api/locations/',
        fieldParent: 'parent_id',
        fieldNames: {
          label: 'name',
          value: 'id',
          children: 'children'
        }
      }
    }
  ];

  const handleSubmit = async (values) => {
    try {
      // 模拟 API 调用
      console.log('提交数据:', values);
      message.success('保存成功');
    } catch (error) {
      message.error('保存失败');
    }
  };

  const handleGetValues = () => {
    const form = formRef.current?.getFormInstance();
    const values = form?.getFieldsValue();
    console.log('当前表单值:', values);
  };

  const handleValidate = async () => {
    const form = formRef.current?.getFormInstance();
    try {
      const values = await form?.validateFields();
      console.log('验证通过:', values);
      message.success('验证通过');
    } catch (error) {
      console.log('验证失败:', error);
      message.error('请检查表单输入');
    }
  };

  return (
    <div>
      <GridForm
        ref={formRef}
        fields={fields}
        onSubmit={handleSubmit}
        onValuesChange={(changed, all) => {
          console.log('表单值变化:', { changed, all });
        }}
        antdListProps={{
          grid: { gutter: 16, xs: 1, sm: 1, md: 2, lg: 3 }
        }}
      />

      <div style={{ marginTop: 16 }}>
        <Button onClick={handleGetValues} style={{ marginRight: 8 }}>
          获取表单值
        </Button>
        <Button onClick={handleValidate}>
          验证表单
        </Button>
      </div>
    </div>
  );
};
```

**自定义渲染：**

```jsx
import React from 'react';
import { GridForm } from 'antd-restful';
import { Form, Input, Button } from 'antd';
import { MailOutlined } from '@ant-design/icons';

const CustomRenderForm = () => {
  const fields = [
    {
      key: 'email',
      label: '邮箱地址',
      render: (item) => (
        <Form.Item
          {...item.antdFormItemProps}
          name={item.key}
          label={item.label}
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' }
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="请输入邮箱地址"
            size="large"
          />
        </Form.Item>
      )
    },
    {
      key: 'verification',
      label: '验证码',
      render: (item) => (
        <Form.Item {...item.antdFormItemProps} name={item.key} label={item.label}>
          <Input.Group compact>
            <Input style={{ width: '70%' }} placeholder="请输入验证码" />
            <Button style={{ width: '30%' }}>发送验证码</Button>
          </Input.Group>
        </Form.Item>
      )
    }
  ];

  return (
    <GridForm
      fields={fields}
      onSubmit={(values) => console.log(values)}
    />
  );
};
```

**表单联动：**

```jsx
import React, { useState } from 'react';
import { GridForm, FieldType } from 'antd-restful';

const LinkedForm = () => {
  const [formValues, setFormValues] = useState({});

  const fields = [
    {
      key: 'userType',
      label: '用户类型',
      type: FieldType.RADIO,
      antdFieldProps: {
        options: [
          { label: '个人用户', value: 'individual' },
          { label: '企业用户', value: 'company' }
        ]
      }
    },
    // 根据用户类型显示不同字段
    ...(formValues.userType === 'company' ? [
      {
        key: 'companyName',
        label: '公司名称',
        type: FieldType.INPUT,
        antdFormItemProps: {
          rules: [{ required: true, message: '请输入公司名称' }]
        }
      },
      {
        key: 'taxNumber',
        label: '税号',
        type: FieldType.INPUT,
        antdFormItemProps: {
          rules: [{ required: true, message: '请输入税号' }]
        }
      }
    ] : []),
    {
      key: 'contactPhone',
      label: '联系电话',
      type: FieldType.INPUT,
      antdFormItemProps: {
        rules: [
          { required: true, message: '请输入联系电话' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
        ]
      }
    }
  ];

  return (
    <GridForm
      fields={fields}
      onSubmit={(values) => console.log('提交:', values)}
      onValuesChange={(changed, all) => {
        setFormValues(all);
      }}
      initialValues={{
        userType: 'individual'
      }}
    />
  );
};
```

**单项模式下的特殊配置：**

```jsx
import React from 'react';
import { GridForm, FieldType } from 'antd-restful';

const SingleModeAdvanced = () => {
  const fields = [
    {
      key: 'keyword',
      label: '关键词',
      type: FieldType.INPUT,
      antdFieldProps: {
        placeholder: '高级搜索模式下的输入框'
      },
      // 单项模式下的特殊配置
      antdSingleProps: {
        placeholder: '单项模式下的输入框',
        size: 'large'
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
    }
  ];

  return (
    <GridForm
      fields={fields}
      advancedSearch={false}
      onSubmit={(values) => console.log('搜索:', values)}
    />
  );
};
```

### 最佳实践

1. **模式选择**：
   - 字段数量少（≤3个）或移动端场景，建议使用单项模式
   - 复杂表单或桌面端场景，建议使用高级搜索模式

2. **字段类型选择**：根据数据类型选择合适的字段类型，提升用户体验

3. **验证规则**：合理配置验证规则，提供清晰的错误提示

4. **布局优化**：根据字段数量和重要性调整网格布局

5. **性能优化**：对于大量字段的表单，考虑使用分步骤或分组的方式

6. **无障碍访问**：确保所有字段都有合适的 label 和 placeholder

7. **单项模式优化**：
   - 合理设置初始值，让智能激活策略工作更好
   - 使用 antdSingleProps 为单项模式提供特殊配置
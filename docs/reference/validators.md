# Validators 验证器

`validators` 提供了一系列自定义验证函数，用于表单验证和数据处理。这些验证器特别适用于 ExpansionView 组件和远程验证场景。

## 目录

- [expansionValidator](#expansionvalidator) - 扩展验证器
- [remoteValidator](#remotevalidator) - 远程验证器
- [使用场景](#使用场景)
- [最佳实践](#最佳实践)
- [注意事项](#注意事项)

---

## expansionValidator

用于 ExpansionView 组件的扩展验证器，支持长度限制和错误检查。

### 函数签名

```javascript
expansionValidator(value, rule) => Promise
```

### 参数说明

- `value` - 要验证的值，通常包含 `output` 和 `error` 属性
- `rule` - 验证规则配置对象
  - `rule.expansionValidator` - 扩展校验配置，可以是布尔值或对象
  - `rule.expansionValidator.min` - 最小长度限制（可选）
  - `rule.expansionValidator.max` - 最大长度限制（可选）
  - `rule.message` - 校验失败时的错误提示信息（可选）

### 返回值

- `Promise` - 验证结果
  - **成功**: 返回 resolved promise（无返回值）
  - **失败**: 返回 rejected promise 并包含错误信息字符串
  - **错误信息优先级**: 自定义消息 > 默认错误消息

### 配置选项

- `expansionValidator` - 验证配置，可以是布尔值或对象
  - `min` - 最小长度限制（可选）
  - `max` - 最大长度限制（可选）
- `message` - 自定义错误消息（可选）

### 使用示例

#### 基本使用

```javascript
const rule = {
  required: true,
  expansionValidator: true,
  message: "请按照要求输入数据"
};
```

#### 带长度限制

```javascript
const rule = {
  expansionValidator: {
    min: 1,
    max: 10
  },
  message: "请按照要求输入数据"
};
```

#### 完整配置示例

```javascript
// 基本配置
{
  required: true,  // 若是必填字段，可以配合该rule使用
  expansionValidator: true,
  message: "请按照要求输入数据",
}

// 带长度限制的配置
{
  expansionValidator: {
    min: 1,
    max: 10,
  },
  message: "请按照要求输入数据",
}
```

### 验证逻辑

1. **空值检查**: 如果配置为空或值为空，直接通过验证
2. **错误检查**: 如果值包含 `error` 属性，返回该错误信息
3. **长度验证**: 如果配置了 `min`/`max` 且值为数组或字符串，检查长度限制
4. **错误返回**: 长度超出限制时返回相应的错误信息
5. **成功返回**: 验证通过时返回 resolved promise
6. **失败返回**: 验证失败时返回 rejected promise 并包含错误信息

### 完整示例

```javascript
import { expansionValidator } from 'src/common/validators';

// 在表单规则中使用
const formRules = {
  description: [
    { required: true, message: '请输入描述' },
    {
      expansionValidator: {
        min: 10,
        max: 500
      },
      message: '描述长度应在10-500字符之间'
    }
  ]
};
```

---

## remoteValidator

远程验证器，通过 API 请求进行服务器端验证。

### 函数签名

```javascript
remoteValidator(value, rule, ctx) => Promise
```

### 参数说明

- `value` - 要验证的值
- `rule` - 验证规则配置对象
  - `rule.remoteValidator` - 远程校验配置对象
  - `rule.remoteValidator.withForm` - 是否带上表单所有数据，默认为 false（可选）
  - `rule.remoteValidator.extraParams` - 额外的请求参数（可选）
  - `rule.remoteValidator.restful` - 远程校验的 API 接口地址（必需）
  - `rule.remoteValidator.reqConfig` - 请求配置，会合并到请求选项中（可选）
  - `rule.remoteValidator.makeRequestOptions` - makeRequest 的配置选项（可选）
    - `rule.remoteValidator.makeRequestOptions.delay` - 防抖延迟时间，默认 200ms（可选）
    - `rule.remoteValidator.makeRequestOptions.key` - 防抖标识键（可选）
  - `rule.message` - 校验失败时的错误提示信息（可选）
- `ctx` - 上下文对象，配合 formily 使用，包含表单和字段信息

### 返回值

- `Promise` - 验证结果
  - **成功**: 返回 resolved promise（无返回值）
  - **失败**: 返回 rejected promise 并包含错误信息字符串
  - **错误信息优先级**: 服务器返回消息 > 自定义消息 > 默认消息

### 配置选项

- `restful` - 验证接口地址（必需）
- `withForm` - 是否带上表单所有数据，默认为 false（可选）
- `extraParams` - 额外的请求参数（可选）
- `reqConfig` - 请求配置，会合并到请求选项中（可选）
- `makeRequestOptions` - makeRequest 的配置选项（可选）
  - `makeRequestOptions.delay` - 防抖延迟时间，默认 200ms（可选）
  - `makeRequestOptions.key` - 防抖标识键（可选）

### 使用示例

#### 基本远程验证

```javascript
const rule = {
  remoteValidator: {
    restful: "api/validate/remote/",
    message: "验证失败"
  }
};
```

#### 带表单数据的远程验证

```javascript
const rule = {
  remoteValidator: {
    withForm: true,
    extraParams: { type: "user" },
    restful: "api/validate/remote/",
    reqConfig: { timeout: 5000 }
  }
};
```

#### 带防抖配置的远程验证

```javascript
const rule = {
  remoteValidator: {
    withForm: true,
    extraParams: { type: "user" },
    restful: "api/validate/remote/",
    reqConfig: { timeout: 5000 },
    makeRequestOptions: {
      delay: 300,
      key: "remote-validator"
    }
  }
};
```

#### 完整配置示例

```javascript
{
  remoteValidator: {
    withForm: true,  // 是否带上表单所有数据
    extraParams: {},  // 请求参数
    restful: "api/validate/remote/",
    reqConfig: {},  // 请求配置
    makeRequestOptions: { delay: 200, key: "remote-validator" },  // 防抖相关配置
  }
}
```

### 验证逻辑

1. **空值检查**: 如果值为空或配置不完整，直接通过验证
2. **数据构造**: 构造请求数据，包含字段值、字段名和额外参数
3. **表单数据**: 如果 `withForm` 为 true，还会包含整个表单的数据
4. **请求发送**: 发送 POST 请求到指定的验证接口
5. **结果判断**: 根据返回的 `validated` 字段判断验证结果
6. **错误处理**: 验证失败时返回服务器消息或自定义消息
7. **网络错误**: 处理网络请求错误，返回格式化的错误信息
8. **成功返回**: 验证通过时返回 resolved promise
9. **失败返回**: 验证失败时返回 rejected promise 并包含错误信息

### 完整示例

```javascript
import { remoteValidator } from 'src/common/validators';

// 用户名唯一性验证
const usernameRules = [
  { required: true, message: '请输入用户名' },
  {
    remoteValidator: {
      restful: '/api/validate/username/',
      withForm: false,
      extraParams: { excludeId: currentUserId }
    },
    message: '用户名已存在'
  }
];

// 邮箱格式和唯一性验证
const emailRules = [
  { required: true, message: '请输入邮箱' },
  { type: 'email', message: '请输入有效的邮箱地址' },
  {
    remoteValidator: {
      restful: '/api/validate/email/',
      withForm: true,
      extraParams: { type: 'registration' }
    },
    message: '邮箱已被注册'
  }
];
```

---

## 使用场景

### ExpansionView 组件验证

```javascript
import { expansionValidator } from 'src/common/validators';

// 在表单规则中使用
const formRules = {
  description: [
    { required: true, message: '请输入描述' },
    {
      expansionValidator: {
        min: 10,
        max: 500
      },
      message: '描述长度应在10-500字符之间'
    }
  ]
};
```

### 远程验证

```javascript
import { remoteValidator } from 'src/common/validators';

// 用户名唯一性验证
const usernameRules = [
  { required: true, message: '请输入用户名' },
  {
    remoteValidator: {
      restful: '/api/validate/username/',
      withForm: false,
      extraParams: { excludeId: currentUserId }
    },
    message: '用户名已存在'
  }
];

// 邮箱格式和唯一性验证
const emailRules = [
  { required: true, message: '请输入邮箱' },
  { type: 'email', message: '请输入有效的邮箱地址' },
  {
    remoteValidator: {
      restful: '/api/validate/email/',
      withForm: true,
      extraParams: { type: 'registration' }
    },
    message: '邮箱已被注册'
  }
];
```

### 复杂验证场景

```javascript
// 产品编码验证
const productCodeRules = [
  { required: true, message: '请输入产品编码' },
  { pattern: /^[A-Z]{2}\d{6}$/, message: '编码格式为2位字母+6位数字' },
  {
    remoteValidator: {
      restful: '/api/validate/product-code/',
      withForm: true,
      extraParams: {
        category: formValues.category,
        brand: formValues.brand
      },
      reqConfig: {
        timeout: 10000,
        headers: { 'X-Validation-Source': 'form' }
      }
    },
    message: '产品编码已存在或不符合规范'
  }
];

// 动态验证规则
const getDynamicRules = (formValues) => [
  { required: true, message: '请输入内容' },
  {
    expansionValidator: {
      min: formValues.minLength || 1,
      max: formValues.maxLength || 100
    },
    message: `内容长度应在${formValues.minLength || 1}-${formValues.maxLength || 100}字符之间`
  },
  {
    remoteValidator: {
      restful: '/api/validate/content/',
      withForm: true,
      extraParams: {
        contentType: formValues.type,
        sensitivity: formValues.sensitivity
      }
    },
    message: '内容不符合要求'
  }
];
```

---

## 与 Ant Design Form 集成

```javascript
import { Form } from 'antd';
import { expansionValidator, remoteValidator } from 'src/common/validators';

const CustomForm = () => {
  const [form] = Form.useForm();

  const rules = {
    content: [
      { required: true, message: '请输入内容' },
      {
        validator: (_, value) => expansionValidator(value, {
          expansionValidator: { min: 10, max: 1000 },
          message: '内容长度应在10-1000字符之间'
        })
      }
    ],
    username: [
      { required: true, message: '请输入用户名' },
      {
        validator: (_, value) => remoteValidator(value, {
          remoteValidator: {
            restful: '/api/validate/username/',
            withForm: true
          },
          message: '用户名已存在'
        }, {
          field: { path: { entire: 'username' } },
          form: { values: form.getFieldsValue() }
        })
      }
    ]
  };

  return (
    <Form form={form} rules={rules}>
      <Form.Item name="content" label="内容">
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="username" label="用户名">
        <Input />
      </Form.Item>
    </Form>
  );
};
```

---

## 与 Formily 集成

```javascript
import { registerValidateRules } from "@formily/core";
import { expansionValidator, remoteValidator } from 'src/common/validators';

registerValidateRules({
  expansionValidator,
  remoteValidator,
});
```

---

## 最佳实践

### 1. 错误消息处理

```javascript
// 提供清晰的错误消息
const rule = {
  expansionValidator: { min: 5, max: 100 },
  message: '内容长度应在5-100字符之间，当前长度不符合要求'
};
```

### 2. 错误处理

```javascript
// 处理网络错误
const rule = {
  remoteValidator: {
    restful: '/api/validate/',
    reqConfig: {
      timeout: 10000,
      retry: 3
    }
  },
  message: '验证服务暂时不可用，请稍后重试'
};
```

---

## 注意事项

1. **expansionValidator** 主要用于 ExpansionView 组件，验证其输出结果
2. **remoteValidator** 需要服务器端配合，返回格式应为 `{ validated: boolean, message?: string }`
3. 远程验证会发送 POST 请求，确保接口支持该请求方式
4. 验证器返回 Promise，需要正确处理异步验证结果
5. 建议为远程验证设置合理的超时时间，避免用户等待过久
6. 在生产环境中，建议对远程验证进行缓存或防抖处理
7. 验证失败时，优先使用服务器返回的错误消息，其次使用自定义消息
8. 当 `withForm` 为 true 时，会发送整个表单数据，注意数据安全和隐私保护

## 服务器端响应格式

### 成功响应

```javascript
{
  "validated": true,
  "message": "验证通过"  // 可选
}
```

### 失败响应

```javascript
{
  "validated": false,
  "message": "验证失败的具体原因"  // 可选，会作为错误信息返回
}
```

### 网络错误处理

当网络请求失败时，会返回格式化的错误信息：

```javascript
// 错误信息格式
"Network Error: Failed to connect"
"Request Timeout: 5000ms"
"Server Error: 500 Internal Server Error"
```

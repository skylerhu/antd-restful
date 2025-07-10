## UploadView
基于 Ant Design Upload 组件扩展的文件上传器，支持拖拽上传、进度显示、文件预览等功能。

**功能特性：**
- 支持文件上传和拖拽上传
- 支持上传进度显示
- 支持文件预览和下载
- 支持只读模式展示
- 支持文件大小和数量限制
- 支持自定义上传参数

### 参数说明
| 参数 | 说明 | 类型 | 默认值 | 版本 |
| - | - | - | - | - |
| style | 自定义样式 | `object` | - | - |
| className | 自定义类名 | `string` | - | - |
| children | 自定义上传触发内容 | `ReactNode` | - | - |
| value | 当前文件列表 | `FileObject \| FileObject[]` | - | - |
| onChange | 文件变化时的回调函数 | `function(fileList)` | - | - |
| **上传配置** | | | | |
| method | 上传请求方法 | `string` | `'post'` | - |
| uploadUrl | 上传接口地址（必需） | `string` | - | - |
| timeout | 上传超时时间，单位毫秒 | `number` | `10000` | - |
| name | 表单中文件字段名 | `string` | `'file'` | - |
| reqConfig | axios 的配置选项 | `object` | - | - |
| baseParams | 上传请求的额外参数 | `object` | - | - |
| enableDragger | 是否支持拖拽文件 | `boolean` | `false` | - |
| maxSize | 限制文件大小（字节） | `number` | `104857600` | - |
| **原生组件支持** | | | | |
| listType | 文件列表类型 | `string` | `'picture'` | - |
| maxCount | 限制文件个数；0 表示不限制 | `number` | `1` | - |
| disabled | 是否禁用 | `boolean` | `false` | - |
| readOnly | 是否只读模式 | `boolean` | `false` | - |
| **Ant Design 原生配置** | | | | |
| antdUploadProps | Ant Design Upload 组件的原生属性 | `object` | - | - |
| antdButtonConfig | 上传按钮的配置 | `object` | - | - |
| antdSpaceProps | Ant Design Space 组件的原生属性 | `object` | - | - |
| antdReadonlyItemProps | 只读模式下文件项的属性 | `object` | - | - |

### 文件对象类型定义
组件的 value 支持单个文件对象或文件对象数组。每个文件对象包含以下属性：

| 属性 | 说明 | 类型 | 必需 |
| - | - | - | - |
| uid | 文件唯一标识符 | `string` | ✅ |
| name | 文件名 | `string` | ❌ |
| url | 文件访问地址 | `string` | ❌ |
| thumbUrl | 文件缩略图地址 | `string` | ❌ |
| size | 文件大小（字节） | `number` | ❌ |
| type | 文件MIME类型，如 `image/png` | `string` | ❌ |
| status | 上传状态 | `string` | ❌ |

### 文件值格式示例
组件支持两种文件值格式：

#### 单文件格式
```javascript
{
  uid: "rc-upload-1748693175705-3", // 必需字段
  status: "done",
  type: "image/png",
  size: 227310,
  name: "example.png",
  url: "http://example.com/uploaded.png",
  thumbUrl: "http://example.com/thumb.png"
}
```

#### 多文件格式
```javascript
[
  {
    uid: "rc-upload-1748693175705-3", // 必需字段
    status: "done",
    type: "image/png",
    size: 227310,
    name: "example1.png",
    url: "http://example.com/uploaded1.png",
    thumbUrl: "http://example.com/thumb1.png"
  }
]
```

### 上传状态
组件定义了以下上传状态：
- `uploading`: 上传中
- `error`: 上传失败
- `done`: 上传成功
- `removed`: 已删除

### 使用示例

```jsx
import React, { useState } from 'react';
import { UploadView } from 'antd-restful';

// 基本使用示例
const BasicUploadView = () => {
  const [fileList, setFileList] = useState([]);

  return (
    <UploadView
      uploadUrl="/api/upload"
      value={fileList}
      onChange={setFileList}
      maxCount={3}
      maxSize={10 * 1024 * 1024} // 10MB
    />
  );
};

// 拖拽上传示例
const DraggerUploadView = () => {
  const [files, setFiles] = useState([]);

  return (
    <UploadView
      uploadUrl="/api/upload"
      value={files}
      onChange={setFiles}
      enableDragger={true}
      maxCount={5}
      listType="text"
    />
  );
};

// 图片上传示例
const ImageUploadView = () => {
  const [images, setImages] = useState([]);

  return (
    <UploadView
      uploadUrl="/api/upload/image"
      value={images}
      onChange={setImages}
      listType="picture-card"
      maxCount={6}
      baseParams={{ type: 'image' }}
    />
  );
};

// 只读模式示例
const ReadOnlyUploadView = () => {
  const files = [
    { uid: '1', url: '/files/document.pdf', name: 'document.pdf' },
    { uid: '2', url: '/files/image.jpg', name: 'image.jpg' },
  ];

  return (
    <UploadView
      value={files}
      readOnly
      listType="picture"
    />
  );
};
```

### 注意事项
1. **uploadUrl 必需**：必须提供有效的上传接口地址
2. **文件对象结构**：文件对象必须包含 `uid` 字段，其他字段（name、url、thumbUrl、size、type、status）均为可选
3. **文件格式**：组件返回包含 url、name 等信息的文件对象或文件对象数组
4. **大小限制**：通过 `maxSize` 控制单个文件大小限制
5. **数量限制**：通过 `maxCount` 控制文件上传数量
6. **拖拽功能**：启用 `enableDragger` 后支持拖拽文件上传

### 相关组件
- [GridForm](../GridForm.md) - 网格表单，支持 UploadView 作为表单字段类型

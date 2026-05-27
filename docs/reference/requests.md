# 请求模块 (apiTools)

本文档介绍 antd-restful 的 HTTP 请求模块，基于 [axios](https://axios-http.com/) 封装，提供统一的请求实例、拦截器机制、错误通知、请求取消与防抖等能力。

**导入方式：**

```javascript
import antdRestful from 'antd-restful';

// request 实例（axios）直接从顶层获取
const { request } = antdRestful;

// 其他工具函数和 Hook 通过 apiTools 命名空间获取
const { apiTools: { useSafeRequest, makeSafeRequest, formatRequestError, getCookie } } = antdRestful;

// 拦截器 ID 也在 apiTools 下
const { apiTools: { reqInterceptor, resInterceptor } } = antdRestful;
```

## useSafeRequest

React Hook，提供安全的 HTTP 请求功能，支持请求取消和防抖。组件卸载时自动取消所有未完成的请求。

**签名：**

```javascript
const [makeRequest] = useSafeRequest()
```

**返回值：**

- `makeRequest` (function): 请求工厂函数，接受配置选项，返回包含各种 HTTP 方法的对象

**配置选项：**

- `key` (string, 可选): 请求标识。不传时每次调用自动生成递增的数字 ID，请求完成后自动清理；传入固定字符串时，相同 key 的请求会自动取消前一次未完成的请求，适用于去重场景。**注意**：不允许传入数字类型的 key，数字会被自动加上 `key-` 前缀以避免与内部自增 ID 冲突
- `delay` (number): 防抖延迟（毫秒），默认 `0`（不防抖）。必须搭配 `key` 使用——防抖依赖固定 key 来识别"同一类请求"，从而取消前一次并延迟发送。首次调用立即发送，后续调用在 delay 时间内如有新调用则取消前一次

**支持的 HTTP 方法：**

- `get(url, config)`
- `head(url, config)`
- `options(url, config)`
- `post(url, data, config)`
- `put(url, data, config)`
- `patch(url, data, config)`
- `delete(url, data, config)`

**使用示例：**

最常见的用法——不传 `key`，每次调用自动分配独立 ID，组件卸载时统一取消：

```javascript
import antdRestful from 'antd-restful';
const { apiTools: { useSafeRequest } } = antdRestful;

function MyComponent() {
  const [makeRequest] = useSafeRequest();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await makeRequest({ delay: 300, key: 'fetch-data' })
        .get('/api/data');
      setData(response.data);
    } catch (error) {
      console.error('Fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (itemData) => {
    try {
      const response = await makeRequest().post('/api/items', itemData);
      console.log('Item created:', response.data);
    } catch (error) {
      console.error('Create failed:', error);
    }
  };

  return (
    <div>
      <button onClick={fetchData} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

需要防抖或去重时，传入 `delay` 和 `key`：

```javascript
import antdRestful from 'antd-restful';
const { apiTools: { useSafeRequest } } = antdRestful;

function SearchComponent() {
  const [makeRequest] = useSafeRequest();
  const [results, setResults] = useState([]);

  const onSearch = (keyword) => {
    makeRequest({ delay: 300, key: 'search' })
      .get('/api/search', { params: { q: keyword } })
      .then((resp) => setResults(resp.data));
  };

  return <Input.Search onChange={(e) => onSearch(e.target.value)} />;
}
```

### 防抖行为

当设置 `delay > 0` 时，`makeRequest` 具备防抖能力：

- 首次调用立即发送请求
- 在 `delay` 时间窗口内的后续调用会取消前次请求，等待 delay 后发送
- 超过 `5 * delay` 未发起新请求，则下一次视为"首次调用"立即发送

```javascript
const [makeRequest] = useSafeRequest();

// 搜索框防抖：用户停止输入 500ms 后发送请求
const onSearch = (keyword) => {
  makeRequest({ delay: 500, key: 'search' })
    .get('/api/search', { params: { q: keyword } })
    .then((resp) => setResults(resp.data));
};
```

### 请求去重

通过 `key` 实现同类请求去重——相同 key 的新请求会自动取消上一次未完成的请求：

```javascript
const [makeRequest] = useSafeRequest();

// 切换 tab 时，前一个 tab 的请求自动取消
const onTabChange = (tabKey) => {
  makeRequest({ key: 'tab-data' })
    .get(`/api/tab/${tabKey}`)
    .then((resp) => setTabData(resp.data));
};
```

## Axios 实例

模块默认导出一个预配置的 axios 实例，可直接用于所有标准的 axios 方法：

```javascript
import antdRestful from 'antd-restful';
const { request } = antdRestful;

const response = await request.get('/api/users');
```

**默认配置：**

- `timeout`: 10000ms
- `Content-Type`: `application/json`
- `paramsSerializer`: 使用 `globalConfig.queryStringify` 序列化查询参数

### globalConfig

请求实例的 `paramsSerializer` 依赖全局配置 `globalConfig`，默认使用 [query-string](https://github.com/sindresorhus/query-string) 库，预设 `arrayFormat: "comma"` 格式。

可以通过 `setGlobalConfig` 替换序列化和解析逻辑：

```javascript
import antdRestful from 'antd-restful';
const { setGlobalConfig } = antdRestful;

import Qs from 'qs';
setGlobalConfig({
  queryStringify: (params) => Qs.stringify(params, { arrayFormat: 'brackets' }),
  queryParse: (string) => Qs.parse(string, { arrayFormat: 'brackets' }),
});
```

`globalConfig` 支持的字段：

| 字段 | 类型 | 默认行为 | 说明 |
|------|------|----------|------|
| `queryStringify` | `(params, options?) => string` | `query-string.stringify`，`arrayFormat: "comma"` | 将对象序列化为 URL 查询字符串 |
| `queryParse` | `(string, options?) => object` | `query-string.parse`，`arrayFormat: "comma"` | 将 URL 查询字符串解析为对象 |

该配置影响所有通过 axios 实例发出的请求的查询参数序列化，同时也被 `RouteBaseTable` 等组件用于 URL 参数的解析与生成。

## 拦截器

### 内置请求拦截器

模块内置了一个请求拦截器，自动为写操作（POST / PUT / PATCH / DELETE）附加 Django CSRF Token：

```javascript
const { apiTools: { reqInterceptor } } = antdRestful;
```

Token 获取顺序：

1. 从页面中查找 `<input name="csrfmiddlewaretoken">` 元素
2. 回退到 `csrftoken` Cookie

### 内置响应拦截器

模块内置了一个响应拦截器，统一处理请求错误：

```javascript
const { apiTools: { resInterceptor } } = antdRestful;
```

默认行为：

- 非 `CanceledError` 的错误会通过 `notification.error` 弹出通知
- 401 / 403 / 404 错误通过 `key` 去重，避免多次弹出
- 可通过 `config.disableNotiError = true` 关闭单次请求的错误通知

### 自定义拦截器

你可以在内置拦截器的基础上添加自定义拦截器，或者移除内置拦截器后完全自定义。

#### 添加自定义拦截器

```javascript
import antdRestful from 'antd-restful';
const { request, apiTools: { reqInterceptor, resInterceptor } } = antdRestful;

// 添加请求拦截器：注入 Authorization 头
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 添加响应拦截器：处理 401 跳转登录
request.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      return new Promise(() => {}); // 阻止后续 then/catch 执行
    }
    return Promise.reject(error);
  }
);
```

#### 移除内置拦截器

如果内置拦截器不满足需求，可以移除后替换为自定义实现：

```javascript
import antdRestful from 'antd-restful';
const { request, apiTools: { reqInterceptor, resInterceptor } } = antdRestful;

// 移除内置拦截器
request.interceptors.request.eject(reqInterceptor);
request.interceptors.response.eject(resInterceptor);

// 注册自定义拦截器
request.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    switch (status) {
      case 401:
        window.location.href = '/login';
        return new Promise(() => {});
      case 403:
        window.location.href = '/403';
        return new Promise(() => {});
      default:
        return Promise.reject(error);
    }
  }
);
```

#### 禁用单次请求的错误通知

```javascript
const { request } = antdRestful;

// disableNotiError 会阻止内置响应拦截器弹出通知
request.get('/api/silent', { disableNotiError: true });
```

## makeSafeRequest

非 Hook 版本的安全请求工厂，适用于非 React 组件的场景。使用方式与 `useSafeRequest` 返回的 `makeRequest` 相同，但需要手动调用 `unmount()` 释放资源。

```javascript
import antdRestful from 'antd-restful';
const { apiTools: { makeSafeRequest } } = antdRestful;

const makeRequest = makeSafeRequest();

// 发起请求
makeRequest({ key: 'my-request' }).get('/api/data');

// 不再需要时，手动释放
makeRequest.unmount();
```

## 工具函数

### formatRequestError

格式化 axios 错误对象为通知友好的格式。

```javascript
const { apiTools: { formatRequestError } } = antdRestful;

const { message, description } = formatRequestError(error);
// message: "HttpError(404)" 或 "未知错误"
// description: 包含请求方法、URL 和响应内容的详细信息
```

### getCookie

从 `document.cookie` 中读取指定名称的 Cookie 值。

```javascript
const { apiTools: { getCookie } } = antdRestful;

const token = getCookie('csrftoken');
```

## 导出总览

| 访问路径 | 类型 | 说明 |
|------|------|------|
| `antdRestful.request` | axios 实例 | 预配置的 axios 实例 |
| `antdRestful.apiTools.reqInterceptor` | number | 内置请求拦截器 ID，可用于 `eject` |
| `antdRestful.apiTools.resInterceptor` | number | 内置响应拦截器 ID，可用于 `eject` |
| `antdRestful.apiTools.useSafeRequest` | Hook | React Hook，组件级安全请求 |
| `antdRestful.apiTools.makeSafeRequest` | function | 非 Hook 版安全请求工厂 |
| `antdRestful.apiTools.formatRequestError` | function | 错误格式化工具 |
| `antdRestful.apiTools.getCookie` | function | Cookie 读取工具 |
| `antdRestful.apiTools.AbortablePromise` | class | 可中止的 Promise 实现 |



# React Hooks 参考文档

本文档介绍了 antd-restful 库中提供的所有 React Hooks。

## 存储相关 Hooks

### useLocalStorage

用于在 localStorage 中存储和读取数据，支持自动序列化和反序列化。

**签名：**
```javascript
const [value, setValue, removeValue] = useLocalStorage(key, initialValue)
```

**参数：**
- `key` (string): 存储键名
- `initialValue` (any): 初始值，默认为 `null`

**返回值：**
- `value` (any): 当前存储的值
- `setValue` (function): 设置值的函数，支持函数式更新
- `removeValue` (function): 删除存储项的函数

**特性：**
- 自动处理 JSON 序列化和反序列化
- 支持函数式更新（类似 useState）
- 自动同步 localStorage 变化
- 错误处理：解析失败时返回初始值

**使用示例：**
```javascript
import { useLocalStorage } from 'src/hooks';

function MyComponent() {
  const [user, setUser, removeUser] = useLocalStorage('user', { name: 'John' });

  const updateUser = () => {
    setUser(prev => ({ ...prev, age: 30 }));
  };

  const clearUser = () => {
    removeUser();
  };

  return (
    <div>
      <p>User: {user?.name}</p>
      <button onClick={updateUser}>Update User</button>
      <button onClick={clearUser}>Clear User</button>
    </div>
  );
}
```

### useSessionStorage

用于在 sessionStorage 中存储和读取数据，功能与 useLocalStorage 相同，但数据在会话结束后清除。

**签名：**
```javascript
const [value, setValue, removeValue] = useSessionStorage(key, initialValue)
```

**使用示例：**
```javascript
import { useSessionStorage } from 'src/hooks';

function MyComponent() {
  const [theme, setTheme] = useSessionStorage('theme', 'light');

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>Switch to Dark</button>
      <button onClick={() => setTheme('light')}>Switch to Light</button>
    </div>
  );
}
```

## 定时器 Hooks

### useInterval

提供可控的定时器功能，支持手动启动、停止和重置。

**签名：**
```javascript
const [runInterval, setEnable] = useInterval(callback, delay)
```

**参数：**
- `callback` (function): 要执行的函数
- `delay` (number | null): 间隔时间（毫秒），`null` 表示暂停

**返回值：**
- `runInterval` (function): 启动定时器的函数，可传入 `enableInterval` 参数控制是否持续运行
- `setEnable` (function): 设置定时器启用状态的函数

**特性：**
- 支持手动控制启动和停止
- 调用 `runInterval()` 会立即执行一次回调
- 支持动态修改 delay 参数
- 组件卸载时自动清理定时器

**使用示例：**
```javascript
import useInterval from 'src/hooks/interval';

function MyComponent() {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [runInterval, setEnable] = useInterval(() => {
    setCount(c => c + 1);
  }, isRunning ? 1000 : null);

  const startTimer = () => {
    setIsRunning(true);
    runInterval(); // 立即执行一次
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={startTimer}>Start</button>
      <button onClick={stopTimer}>Stop</button>
    </div>
  );
}
```

## 保护性 Hooks

### useProtect

用于保护回调函数，防止在组件卸载后执行，主要用于异步操作。

**签名：**
```javascript
const [protect] = useProtect()
```

**返回值：**
- `protect` (function): 保护函数，接受一个回调函数作为参数，返回受保护的回调函数

**特性：**
- 防止组件卸载后的内存泄漏
- 自动清理已注册的回调函数
- 支持任意参数的回调函数

**使用示例：**
```javascript
import { useProtect } from 'src/hooks';

function MyComponent() {
  const [protect] = useProtect();
  const [data, setData] = useState(null);

  const fetchData = async () => {
    const protectedSetData = protect(setData);

    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      protectedSetData(result); // 如果组件已卸载，此调用将被忽略
    } catch (error) {
      console.error('Fetch failed:', error);
    }
  };

  return (
    <div>
      <button onClick={fetchData}>Fetch Data</button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

### useDeepCompareMemoize

用于深度比较对象，避免不必要的重新渲染。

**签名：**
```javascript
const memoizedValue = useDeepCompareMemoize(value)
```

**参数：**
- `value` (any): 需要记忆化的值

**返回值：**
- `memoizedValue` (any): 记忆化的值，如果深度相等则返回相同的引用

**特性：**
- 使用深度比较而非引用比较
- 支持嵌套对象和数组
- 基于 `dequal` 库实现深度比较

**使用示例：**
```javascript
import { useDeepCompareMemoize } from 'src/hooks';

function MyComponent({ config }) {
  const memoizedConfig = useDeepCompareMemoize(config);

  useEffect(() => {
    // 只有当 config 真正改变时才会执行
    console.log('Config changed:', memoizedConfig);
  }, [memoizedConfig]);

  return <div>Config: {JSON.stringify(memoizedConfig)}</div>;
}
```

### useDictState

用于管理多个状态值的集中式状态管理。

**签名：**
```javascript
const [state, setState] = useDictState(initialData)
```

**参数：**
- `initialData` (object): 初始状态对象

**返回值：**
- `state` (object): 当前状态
- `setState` (function): 更新状态的函数，支持部分更新

**特性：**
- 支持部分状态更新
- 自动合并新状态与现有状态
- 基于 useReducer 实现

**使用示例：**
```javascript
import { useDictState } from 'src/hooks';

function MyComponent() {
  const [user, setUser] = useDictState({
    name: 'John',
    age: 30,
    email: 'john@example.com'
  });

  const updateName = () => {
    setUser({ name: 'Jane' }); // 只更新 name，其他字段保持不变
  };

  const updateAge = () => {
    setUser({ age: 31 }); // 只更新 age
  };

  return (
    <div>
      <p>Name: {user.name}</p>
      <p>Age: {user.age}</p>
      <p>Email: {user.email}</p>
      <button onClick={updateName}>Update Name</button>
      <button onClick={updateAge}>Update Age</button>
    </div>
  );
}
```

## 请求相关 Hooks

### useSafeRequest

> 已迁移至 [请求模块文档](./requests.md#usesaferequest)，包含完整的 API 说明、防抖行为、请求去重及拦截器用法。

## 最佳实践

### 1. 存储 Hooks 使用建议
- 使用 `useLocalStorage` 存储用户偏好设置等持久化数据
- 使用 `useSessionStorage` 存储临时会话数据
- 注意存储数据的序列化限制，避免存储函数等不可序列化的值

### 2. 定时器 Hooks 使用建议
- 使用 `useInterval` 替代原生的 `setInterval`，确保组件卸载时正确清理
- 合理设置 delay 参数，避免过于频繁的执行
- 使用 `runInterval` 函数手动控制定时器的启动时机

### 3. 保护性 Hooks 使用建议
- 在异步操作中使用 `useProtect` 防止内存泄漏
- 使用 `useDeepCompareMemoize` 优化依赖复杂对象的 useEffect
- 使用 `useDictState` 管理相关的多个状态值

### 4. 请求 Hooks 使用建议
- 详见 [请求模块文档](./requests.md)

## 注意事项

1. **存储限制**：localStorage 和 sessionStorage 有存储大小限制（通常为 5-10MB）
2. **序列化**：存储 Hooks 会自动进行 JSON 序列化，不支持存储函数等特殊类型
3. **性能考虑**：`useDeepCompareMemoize` 的深度比较可能影响性能，避免在频繁更新的场景中使用
4. **请求取消**：详见 [请求模块文档](./requests.md)
5. **定时器清理**：虽然 Hooks 会自动清理定时器，但在复杂场景下建议手动控制定时器的生命周期

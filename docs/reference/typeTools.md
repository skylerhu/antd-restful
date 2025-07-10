# TypeTools 类型工具函数

`typeTools` 提供了一系列用于类型判断的工具函数，帮助开发者进行更精确的类型检查。

## 函数列表

### isNull(value)
如果值为 `null` 或 `undefined` 则返回 `true`，否则返回 `false`

```javascript
isNull(null)        // true
isNull(undefined)   // true
isNull(0)          // false
isNull("")         // false
```

### isBlank(value)
如果值为 `null`、`undefined` 或空字符串则返回 `true`，否则返回 `false`

```javascript
isBlank(null)      // true
isBlank(undefined) // true
isBlank("")        // true
isBlank(" ")       // false
isBlank(0)         // false
```

### isEmpty(value)
如果值为空（null/undefined/空字符串/空数组/空对象）则返回 `true`，否则返回 `false`

```javascript
isEmpty(null)      // true
isEmpty([])        // true
isEmpty({})        // true
isEmpty([1])       // false
isEmpty({a: 1})    // false
```

### isBooleanTrue(value)
如果值为真值（true/"true"/"True"/"1"/1）则返回 `true`，否则返回 `false`

```javascript
isBooleanTrue(true)   // true
isBooleanTrue("true") // true
isBooleanTrue("1")    // true
isBooleanTrue(1)      // true
isBooleanTrue(false)  // false
```

### isBooleanFalse(value)
如果值为假值（false/"false"/"False"/"0"/0）则返回 `true`，否则返回 `false`

```javascript
isBooleanFalse(false)  // true
isBooleanFalse("false") // true
isBooleanFalse("0")     // true
isBooleanFalse(0)       // true
isBooleanFalse(true)    // false
```

### isAbsBoolean(value)
如果值为严格的布尔类型则返回 `true`，否则返回 `false`

```javascript
isAbsBoolean(true)   // true
isAbsBoolean(false)  // true
isAbsBoolean("true") // false
isAbsBoolean(1)      // false
```

### isBoolean(value)
如果值为布尔类型或布尔字符串则返回 `true`，否则返回 `false`

```javascript
isBoolean(true)      // true
isBoolean("true")    // true
isBoolean("0")       // true
isBoolean("string")  // false
```

### isString(value)
 如果值为字符串类型则返回 `true`，否则返回 `false`

```javascript
isString("test")     // true
isString(123)        // false
isString(null)       // false
```

### isFunction(value)
如果值为函数类型则返回 `true`，否则返回 `false`

```javascript
isFunction(() => {}) // true
isFunction("function") // false
```

### isAbsNumber(value)
如果值为有限数字类型则返回 `true`，否则返回 `false`

```javascript
isAbsNumber(123)     // true
isAbsNumber(Infinity) // false
isAbsNumber("123")   // false
```

### isNumber(value)
如果值为数字类型或可转换为数字的字符串则返回 `true`，否则返回 `false`

```javascript
isNumber(123)        // true
isNumber("123")      // true
isNumber("abc")      // false
```

### isArray(value)
如果值为数组类型则返回 `true`，否则返回 `false`

```javascript
isArray([])          // true
isArray({})          // false
```

### isDict(value)
如果值为普通对象类型则返回 `true`，否则返回 `false`

```javascript
isDict({})           // true
isDict(null)         // false
isDict([])           // false
```

### isBasicType(value)
如果值为基础类型（空值/布尔/数字/字符串）则返回 `true`，否则返回 `false`

```javascript
isBasicType(null)    // true
isBasicType(true)    // true
isBasicType(123)     // true
isBasicType("test")  // true
isBasicType([])      // false
isBasicType({})      // false
```

## 使用示例

```javascript
import { isNull, isArray, isNumber } from 'src/common/typeTools';

// 类型检查
if (isNull(value)) {
  console.log('值为空');
}

if (isArray(data)) {
  data.forEach(item => {
    // 处理数组元素
  });
}

if (isNumber(input)) {
  const result = input * 2;
}
```

## 注意事项

1. `isNull` 同时检查 `null` 和 `undefined`
2. `isBlank` 在 `isNull` 基础上增加了空字符串检查
3. `isEmpty` 是最全面的空值检查，包括空数组和空对象
4. `isAbsNumber` 只检查严格的数字类型，不包括字符串数字
5. `isNumber` 包括字符串数字，但会排除 `NaN`
6. `isDict` 使用 `Object.prototype.toString.call()` 来准确判断普通对象，避免与 `null` 和数组混淆

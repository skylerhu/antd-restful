# Release Notes

## 0.2.0
- perf: 优化 RestTable 和 RouteBaseTable 处理路由参数
    - 升级 query-string@9, `parseOptions` 支持通过 `types` 配置字段类型（连带打包无需额外安装）
    - 默认会根据 `columns` 或是 `filterFormProps.fields` 的配置类型初始化 `types`
- fix: 统一 `NumberRange` 和 `RangeStrPicker` 默认值的处理，并提供 `defaultEmptyValue` 配置单项的默认值
- fix: `parser.queryString` 使用 `query-sting` 默认参数中去掉了 `{skipNull:true, skipEmptyString: true}`
    - 为了解决 Range 组件有null值的场景，例如 [null, 1] 需要处理成 ",1"
    - 会在 RestTable 组件中自行调用 `clearEmptyValue` 处理远程请求时去掉空值
- fix: 修复 RangeStrPicker 在 antd>=5 版本场景下，dayjs 未正确处理 format 的问题
- fix: 修复 `typeTools.isNumber` 判断问题，`""` 不是数值

## 0.1.18
- fix: 修复 RestTable 表单值在路由参数变更时频繁更新的问题
    - 调整后，需要注意`路由参数`和`表单参数`的行为
        - 表单配置`展示`的筛选项无法`手动`从路由上新增参数 (原则上，无论表单项展示与否，其对应key在路由上的参数都不支持手动修改) (从0.2.0开始可手动从路由上新增了)
        - 点击`重置`可以清除隐藏的表单项的筛选条件 (点击搜索按钮不会清除，支持分享链接场景点开后还可以在此基础上修改筛选条件)
        - 筛选表单项有值时不允许设置隐藏，需要先清空数据后再操作隐藏
    - 修复点击 搜索/重置 按钮 会多次触发请求的问题
    - 修复 表单筛选值 处理 `,1` 多选场景下（例如CheckBox、Select多选）值处理的问题
    - `columns[].filterMultiple` 可不配置，会根据配置的 `columns[].type` 判断是否是多选处理

## 0.1.17
- style: 优化 RestTable 在没有筛选条件场景下 tools 按钮的位置样式

## 0.1.16
- fix: 无论如何设置 parseOptions，确保 RestTable 中处理 page和page_size 一定是int类型
- fix: 修复 `parseQueryTypes` 未正确处理数组值的问题

## 0.1.15
- fix: 修复 RestTable 点击搜索时 未重置 页码`page=1` 的问题
- fix: requests 请求 被取消时 不提示弹窗
- feat: requests 增加export `reqInterceptor` 和 `resInterceptor`，可在合适的时候移除拦截器

## 0.1.14
fix: 修复 RestSelect 不配置 restful 的情况下不应触发远程调用

## 0.1.13
- feat: 调整 RestTable 组件中 advancedSearch 参数控制搜索字段的展示
- fix: RouteBaseTable 需要透传 ref 参数，解决调用 RestTable 中组件方法的问题
- fix: 修复 RestTable 通过 ref 调用 refreshList 丢失参数的问题 (变个了函数顺序，依赖的函数放使用地方的上面)
- fix: RestTable 增加 `parseOptions` 和 `parseTypes` 可以配置处理 query 参数
    - query-string 在 本项目中默认设置了 `parseNumbers: true`
    - 虽然是 RestTable 增加的配置，但主要是在 RouteBaseTable 中用到将query参数转换成object
    - 在处理query中有超大数值会有溢出精度问题，可以设置为 False 当做字符串处理
- fix: RestTable 的 onFiltersChange 在处理回调值时`移除`跟 baseParams 和 forceParams 相同的值
    - 避免还原为原来值的情况下显示在路由上

## 0.1.12
- style: 调整 TableSelect 内2个元素之间的间隔
- fix: 修复 TableSelect也能够直接开启高级搜索
- fix: 兼容 DataStrPicker、RangeStrPicker 组件 在v4(moment)和v5(dayjs) 上时间处理的问题
- feat: GridForm 增加配置 submitTitle 和 resetTitle 可配置按钮显示
- fix: 移除 RestTable 的 tools.advancedDefaultOpen 配置项，设置默认是否开启高级筛选配置 filterFormProps?.advancedSearch
- feat: 新增 RouteBaseTable 为表单与路由联动提供支持

## 0.1.11
- style: 修复 LongText / RestTable 组件文本样式
  - `white-space: pre-wrap; word-break: break-all` 组合用于文本显示，主要是增加了 word-break
- perf: makeSafeRequest 优化 delay 模式下，长时间未请求后的一次请求不会执行delay逻辑
- fix: 修复 RestTable 刷选表单未正常渲染 baseParams 设置的筛选值问题

## 0.1.10
- fix: 修复RestTable tools配置为空时样式问题
    - tools配置的显示依赖配置restful
    - 筛选Tag兼容antd 4.x版本显示是设置 closable
- feat: 增加了 validators 可应用于表单校验
    - expansionValidator: ExpansionView 组件的校验
    - remoteValidator: 配置远端接口校验数据
- perf: makeSafeRequest 配置 delay 防抖的情况下，优化首次请求不执行delay

## 0.1.9
- feat: 扩展 RestTable
    - 配置 extraTools 可以自定义其他操作按钮
    - 配置 tools.advancedDefaultOpen 可以定义默认打开高级搜索
    - 配置 columns.expandable 定义是否启用展开功能
    - columns.fieldValue 变更为 columns.copyField
- fix: 修复 GridForm 关闭高级搜索时选项初始化的问题

## 0.1.8
- fix: 修复RestTable header筛选选择多值初始化数据的问题

## 0.1.7
- style: 调整 RestTable 中 showHeaderTags 的样式

## 0.1.5
- feat: 扩展 RestTable 配置 showHeaderTags 可显示表头筛选值

## 0.1.4
- feat: 扩展 RestTable
    - 刷选类型 type 扩展支持 FieldType.DATE_RANGE_PICKER 时间筛选
- fix: 修复 RestTable cloumns.filterMultiple 默认值时处理数组数据问题
- fix: 调整 RangeStrPicker 增加默认值 `allowClear={true}` `allowEmpty={[true, true]}`

## 0.1.3
- feat: 扩展 RestTable
    - 刷选类型 type 扩展支持 FieldType.NUMBER 和 FieldType.NUMBER_RANGE
- fix: 修复 RestTable 个别问题
    - 修复刷选输入 placeholder 的展示
    - 本地开启搜索必须配置 dropdownLocalConfig

## 0.1.2
- feat: 扩展TableSelect
    - 配置 titleAggPath 支持选中数据根据字段聚合统计显示在title上
- feat: 扩展 LongText
    - 配置 titleTemplate 、titleAggPath 可以统计数量展示

## 0.1.1
- fix: 扩展 RestTable
    - 配置 defaultPageSize 初始化 pagination 中的页码
    - 配置 dropdownLocalConfig 设置前端table搜索条件，详见 commonFilter 的实现
- fix: 扩展 TableSelect
    - 配置 titleTemplate 配置选中个数的模板标题展示
    - 配置 antdTableReadProps 设置只读Table的属性

## 0.1.0 (2025-07-07)
- build: lib发版

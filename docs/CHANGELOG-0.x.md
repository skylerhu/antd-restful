# Release Notes

## 0.1.12
- style: 调整 TableSelect 内2个元素之间的间隔
- fix: 修复 TableSelect也能够直接开启高级搜索
- fix: 兼容 DataStrPicker、RangeStrPicker 组件 在v4(moment)和v5(dayjs) 上时间处理的问题
- feat: GridForm 增加配置 submitTitle 和 resetTitle 可配置按钮显示
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

# Release Notes

## 0.1.9
- feat: 扩展 RestTable
    - 配置 extraTools 可以自定义其他操作按钮
    - 配置 tools.advancedDefaultOpen 可以定义默认打开高级搜索
    - 配置 columns.expandable 定义是否启用展开功能
- fix: 修复 GridFrom 关闭高级搜索时选项初始化的问题

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

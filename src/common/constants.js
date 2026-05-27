import Enum from "js-enumerate";

// 默认的数组元素之间的连接符
export const DEFAULT_SEPARATOR = ",";

// 默认的接口返回数据路径
export const DEFAULT_ROWS_PATH = "results";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;

export const SorterEnum = new Enum([
  { key: "ASCEND", value: "ascend", label: "升序" },
  { key: "DESCEND", value: "descend", label: "降序" },
]);

export const FieldType = new Enum([
  { key: "INPUT", value: "input", label: "输入" },
  { key: "SELECT", value: "select", label: "下拉选择" },
  { key: "RADIO", value: "radio", label: "单选" },
  { key: "CHECKBOX", value: "checkbox", label: "多选" },
  { key: "NUMBER", value: "number", label: "数字" },
  { key: "DATE_PICKER", value: "date-picker", label: "日期选择" },
  { key: "DATE_RANGE_PICKER", value: "date-range-picker", label: "日期范围选择" },
  { key: "NUMBER_RANGE", value: "number-range", label: "数字范围" },
  { key: "AUTO_COMPLETE", value: "auto-complete", label: "自动完成" },
  { key: "CASCADER", value: "cascader", label: "级联选择" },
  { key: "TREE_SELECT", value: "tree-select", label: "树形选择" },
  { key: "UPLOAD", value: "upload", label: "上传" },
]);

export const ViewType = new Enum([
  { key: "TABLE", value: "table", label: "表格" },
  { key: "LIST", value: "list", label: "列表" },
]);

export const READ_ONLY_CLASS = "cls-antd-restful-readonly";

export const FilterType = new Enum([
  { key: "SEARCH", value: "search", label: "模糊搜索" },
  { key: "EQUAL", value: "equal", label: "精确搜索" },
  { key: "RANGE", value: "range", label: "范围搜索" },
]);

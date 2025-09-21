import format from "string-format";
import objectPath from "object-path";
import libQuery from "query-string";
import { DEFAULT_SEPARATOR, SorterEnum, FieldType } from "src/common/constants";
import { isArray, isBlank, isBoolean, isDict, isEmpty, isNumber, isString } from "src/common/typeTools";

export const commonFormat = (template, ...values) => {
  if (isBlank(template)) {
    if (values.length === 1) {
      return toBeString(values[0]);
    }
    return toBeString(values);
  }
  return format(template, ...values);
};

export const findDataByPath = (data, path, defaultValue = undefined) => {
  let ret;
  if (isBlank(path)) {
    // 设置空值时直接返回
    ret = data;
  } else {
    ret = objectPath.get(data, path, defaultValue);
  }
  // if (isEmpty(ret)) {
  //   // eslint-disable-next-line no-console
  //   console.warn(`findDataByPath path is ${path} , ret:`, ret);
  // }
  return ret;
};

/**
 * 将数值强制转化成字符串
 * @param {any} value
 * @param {string} separator 数组元素之间的连接符，默认值为逗号
 * @param {number} depth >0时 处理数组使用separator连接
 * @returns {string}
 */
export const toBeString = (value, separator, depth = 0) => {
  if (isBlank(value)) {
    return "";
  }
  if (isString(value)) {
    return value;
  }
  if (isNumber(value) || isBoolean(value)) {
    return value.toString();
  }
  if (depth > 0 && isArray(value)) {
    return value.map((v) => toBeString(v, separator, depth - 1)).join(separator || DEFAULT_SEPARATOR);
  }
  return JSON.stringify(value);
};

// 根据values 从opts中查找对应的选项，只保留opts中包含的value的选项
export const findTreeOptionsByValues = (opts, values, optKey = "value", optChildren = "children") => {
  if (isEmpty(opts) || isEmpty(values)) return [];

  const nodes = [];
  for (const opt of opts) {
    let _opt = { ...opt };
    if (!isEmpty(_opt[optChildren])) {
      // 递归查找子节点
      const children = findTreeOptionsByValues(_opt[optChildren], values, optKey, optChildren);
      if (isEmpty(children)) {
        // 子节点中没有符合需求的，则去掉子节点
        delete _opt[optChildren];
      } else {
        // 仅保留符合需求的子结点
        _opt[optChildren] = children;
      }
    }
    if (values.includes(_opt[optKey]) || !isEmpty(_opt[optChildren])) {
      // 当前结点包含 或者 子结点中有
      nodes.push(_opt);
    }
  }
  return nodes;
};

export const treeValuesToLabels = (
  values,
  treeOpts,
  optKey = "value",
  optLabel = "label",
  optChildren = "children"
) => {
  if (isEmpty(values)) return [];
  if (!isArray(values)) {
    values = [values];
  }
  if (isEmpty(treeOpts)) return values;
  let labels = [];
  const firstValue = values[0];
  let finded = false;
  for (const opt of treeOpts) {
    if (firstValue !== opt[optKey]) {
      continue;
    }
    labels.push(opt[optLabel]);
    finded = true;
    // 递归查找子结点
    labels.push(...treeValuesToLabels(values.slice(1), opt[optChildren], optKey, optLabel, optChildren));
  }
  // 后面values没有找到对应的label，则直接返回
  if (!finded) {
    labels.push(...values);
  }
  return labels;
};

// 根据value从treeData中查找对应的label
export const findLabelFromTreeData = (
  value,
  treeData,
  optKey = "value",
  optLabel = "label",
  optChildren = "children"
) => {
  if (isEmpty(treeData)) return value;
  for (const opt of treeData) {
    if (opt[optKey] === value) {
      return opt[optLabel];
    } else if (!isEmpty(opt[optChildren])) {
      const label = findLabelFromTreeData(value, opt[optChildren], optKey, optLabel, optChildren);
      if (!isEmpty(label)) {
        return label;
      }
    }
  }
  return "";
};

// 将value转换需要的数据；包含value/label; 原来value是数组返回的还是数组
export const transformValue = (value, { options, fieldValue, labelTemplate }) => {
  let item = {
    value, // 唯一标识
    // label: value, // 要显示的值
    data: value, // 保留原值，不做任何处理
  };
  if (isDict(value)) {
    item.value = value[fieldValue];
    item.label = commonFormat(labelTemplate, value);
  } else if (isArray(value)) {
    item = value.map((item) => transformValue(item, { options, fieldValue, labelTemplate }));
  } else {
    item.label = toBeString(value);
    if (fieldValue && !isEmpty(options)) {
      // 找出对应的options
      const _opt = options.find((opt) => opt[fieldValue] === value);
      if (_opt) {
        item.label = commonFormat(labelTemplate, _opt);
      }
    }
  }
  return item;
};

/**
 * 初始化范围值
*/
export const initRangeValues = (input, { number = false, defaultEmptyValue = null } = {}) => {
  if (isEmpty(input)) {
    return undefined;
  }
  let values;
  if (isString(input) && input.includes(",")) {
    values = input.split(",").slice(0, 2).map(v => v === "" ? defaultEmptyValue : v);
  } else if (!isArray(input)) {
    values = [input];
  } else {
    values = input.slice(0, 2);
  }
  if (number) {
    values = values.map((v) => {
      let newV = Number(v);
      return isNaN(newV) ? v : newV;
    });
  }
  if (values.length === 1) {
    values.push(defaultEmptyValue);
  }
  return values;
};

// see https://github.com/sindresorhus/query-string
export const queryString = {
  ...libQuery,
  parse: (string, options) => {
    let _options = {
      arrayFormat: "comma",
      parseNumbers: true,
      parseBooleans: true,
      ...options,
    };
    return libQuery.parse(string, _options);
  },
  stringify: (object, options) => {
    let _options = {
      arrayFormat: "comma",
      ...options,
    };
    return libQuery.stringify(object, _options);
  },
  parseUrl: (string, options) => {
    let _options = {
      arrayFormat: "comma",
      parseNumbers: true,
      parseBooleans: true,
      parseFragmentIdentifier: false,
      ...options,
    };
    return libQuery.parseUrl(string, _options);
  },
  stringifyUrl: (object, options) => {
    let _options = {
      arrayFormat: "comma",
      ...options,
    };
    return libQuery.stringifyUrl(object, _options);
  },
};

/**
 * 将query的值根据types的类型进行转换
 * 因为低版本 query-string 从 9.x 才开始支持 types 指定个别字段的类型
 */
export const parseQueryTypes = (query, types) => {
  if (isEmpty(types) || isEmpty(query)) {
    return query;
  }
  let _query = {};
  Object.keys(query).forEach((key) => {
    let v = query[key];
    const _type = types[key];
    if (!isEmpty(v) && !isEmpty(_type)) {
      // 只处理基础类型
      if (_type === "string") {
        v = isArray(v) ? v.map((v) => toBeString(v)) : toBeString(v);
      } else if (_type === "number") {
        v = isArray(v) ? v.map((v) => isNumber(v) ? Number(v) : v) : (isNumber(v) ? Number(v) : v);
      } else if (_type === "boolean") {
        v = isArray(v) ? v.map((v) => Boolean(v)) : Boolean(v);
      }
    }
    _query[key] = v;
  });
  return _query;
};

/**
 * 根据配置的显示列 或者 筛选表单项 猜测query中key值的类型
 */
export const guessQueryTypes = (fields) => {
  if (isEmpty(fields)) {
    return {};
  }
  // query-string@9 中处理结果：若是字符串类型，还会是字符串
  const defaultArrayType = "number[]";
  const newV = fields.reduce((acc, field) => {
    const k = genColumnKey(field);
    // 兼容 列表配置columns 和 筛选表单 filterFormProps.fields 两种场景
    const fileType = field.type || field.filterDropdownConfig?.type;
    const selectMode = field.antdFieldProps?.mode || field.filterDropdownConfig?.dropdownProps?.mode;
    if (fileType === FieldType.INPUT) {
      // 输入框肯定是字符串
      acc[k] = "string";
    } else if (fileType === FieldType.SELECT && selectMode === "multiple") {
      acc[k] = defaultArrayType;
    } else if (fileType === FieldType.CHECKBOX) {
      // 这个在RestTable中没支持，可以通过 columns.filters 配置
      acc[k] = defaultArrayType;
    } else if ([FieldType.NUMBER_RANGE, FieldType.DATE_RANGE_PICKER].includes(fileType)) {
      // range是数组
      acc[k] = defaultArrayType;
    } else if (field.filters) {
      // 如果开启了刷选，则默认是多选; 是table原生决定的
      acc[k] = defaultArrayType;
    }
    return acc;
  }, {});
  return newV;
};

export const clearEmptyValue = (data) => {
  let newV = {};
  Object.keys(data).forEach((key) => {
    const v = data[key];
    if (isEmpty(v)) {
      return;
    }
    newV[key] = v;
  });
  return newV;
};

// 将table的排序参数转换为api的排序参数; eg: { field: "name", order: "descend" } => "-name"
export const tableSorterToApiSorter = (sorter) => {
  if (isEmpty(sorter)) {
    return;
  }
  if (isArray(sorter)) {
    // 如果是数组，则递归转换
    return sorter.map((s) => tableSorterToApiSorter(s)).filter((v) => !isBlank(v));
  }
  let operator;
  if (sorter.order === SorterEnum.ASCEND) {
    // operator = '+';
    // 前端会转移成%2B，但是drf无法识别；所以使用默认空字符串
    operator = "";
  } else if (sorter.order === SorterEnum.DESCEND) {
    operator = "-";
  }
  if (operator !== undefined) {
    return `${operator}${sorter.field}`;
  }
  return;
};

// 将api的排序参数转换为table的排序字典; eg: "-name" => { name: "descend" }
export const apiSorterToTableSorterDict = (sorter) => {
  if (isBlank(sorter)) {
    return {};
  }
  let dict = {};
  if (isString(sorter) && sorter.includes(",")) {
    // 转换成数组
    sorter = sorter.split(",");
  }
  if (isArray(sorter)) {
    sorter.forEach((s) => {
      const sorterDict = apiSorterToTableSorterDict(s);
      if (!isEmpty(sorterDict)) {
        dict = { ...dict, ...sorterDict };
      }
    });
    return dict;
  }
  let order;
  let field = sorter;
  if (sorter.startsWith("-")) {
    order = SorterEnum.DESCEND;
    field = field.slice(1);
  } else if (sorter.startsWith("+")) {
    order = SorterEnum.ASCEND;
    field = field.slice(1);
  } else if (sorter) {
    // 不为空的时候默认升序
    order = SorterEnum.ASCEND;
  }
  if (order) {
    dict[field] = order;
  }
  return dict;
};

// 根据rows和titleTemplate和titleAggPath获取显示的标题
export const getShowTitle = (rows, titleTemplate, titleAggPath) => {
  let statStr = "";
  if (titleAggPath) {
    const stat = {};
    rows.forEach((row) => {
      let v = findDataByPath(row, titleAggPath);
      v = isEmpty(v) ? "-" : toBeString(v);
      stat[v] = (stat[v] || 0) + 1;
    });
    // 按数量从高到低排序
    if (!isEmpty(stat)) {
      const sortedEntries = Object.entries(stat).sort(([, a], [, b]) => b - a);
      statStr = `${sortedEntries.map(([k, v]) => `${k}: ${v}`).join(", ")}`;
    }
  }
  return commonFormat(titleTemplate, { count: rows?.length || 0, stat: statStr });
};

// 生成列的唯一key
export const genColumnKey = (column) => {
  let key = column.key || column.dataIndex;
  if (isArray(key)) {
    key = key.join("__");
  }
  return key;
};

// 根据keys返回需要的fields
export const genFields = (fields, keys) => {
  if (!keys?.length) {
    return fields;
  }
  const _fields = fields.filter((field) => keys.includes(genColumnKey(field)));
  return _fields;
};

// 处理表单值，保证所有字段都有值
export const handleFormValues = (values, fields) => {
  if (!fields?.length) {
    return values;
  }
  // 保证设置的值都有key
  const data = { ...values };
  fields.forEach((field) => {
    const v = data[field.key];
    if (field.type && [FieldType.CHECKBOX, FieldType.RADIO].includes(field.type) && isBlank(v)) {
      // 为了能够正确显示“全部”选项
      data[field.key] = "";
    } else if (data[field.key] === undefined) {
      // 需要重置表单的值
      data[field.key] = null;
    }
  });
  return data;
};
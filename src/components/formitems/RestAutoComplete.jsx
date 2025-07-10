import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { AutoComplete, Spin } from "antd";
import { dequal as deepEqual } from "dequal";
import { DEFAULT_ROWS_PATH, READ_ONLY_CLASS } from "src/common/constants";
import { commonFormat, findDataByPath } from "src/common/parser";
import { isArray, isBlank, isFunction } from "src/common/typeTools";
import { useDeepCompareMemoize } from "src/hooks";
import { useSafeRequest } from "src/requests";

const RestAutoComplete = ({
  style,
  className,
  value,
  onChange,
  restful,
  reqConfig,
  baseParams = null,
  searchKey = "search",
  searchMinEnter = 1,
  options,
  parseRowsPath = DEFAULT_ROWS_PATH,
  labelTemplate,
  fieldNames,
  disabled = false,
  readOnly = false,
  antdAutoCompleteProps,
}) => {
  const [makeRequest] = useSafeRequest();
  const reqConfigRef = useRef(reqConfig);

  const [innerValue, setInnerValue] = useState(value);
  const [loading, setLoading] = useState(false);
  const [innerOptions, setInnerOptions] = useState(options || []);

  const optKey = useMemo(() => fieldNames?.value || "value", [fieldNames?.value]);
  const optLabel = useMemo(() => fieldNames?.label || "label", [fieldNames?.label]);

  useEffect(() => {
    setInnerValue((oldV) => {
      return oldV === value ? oldV : value;
    });
  }, [value]);

  useEffect(() => {
    if (isArray(options)) {
      setInnerOptions((oldV) => (deepEqual(oldV, options) ? oldV : options));
    }
  }, [options]);

  const onValueChange = useCallback(
    (value) => {
      setInnerValue(value);
      if (isFunction(onChange)) {
        onChange(value);
      }
    },
    [onChange]
  );

  const memBaseParams = useDeepCompareMemoize(baseParams);

  const fetchOptions = useCallback(
    (search) => {
      if (!restful || disabled || readOnly) return;
      if (isBlank(search) && searchMinEnter > 0) return;
      if (!isBlank(search) && search.length < searchMinEnter) return;

      setLoading(true);
      const params = { ...memBaseParams };
      if (!isBlank(search)) {
        params[searchKey] = search;
      }
      makeRequest({ delay: 200, key: "autocomplete" })
        .get(restful, { params, disableNotiError: true, ...reqConfigRef.current })
        .then((response) => {
          const data = findDataByPath(response.data, parseRowsPath);
          const _opts = data.map((item) => ({
            value: item[optKey],
            label: labelTemplate ? commonFormat(labelTemplate, item) : item[optLabel],
          }));
          setInnerOptions(_opts);
        })
        .finally(() => setLoading(false));
    },
    [
      makeRequest,
      restful,
      searchKey,
      optKey,
      optLabel,
      labelTemplate,
      searchMinEnter,
      disabled,
      readOnly,
      memBaseParams,
      parseRowsPath,
    ]
  );

  const onSearch = useCallback(
    (search) => {
      fetchOptions(search);
    },
    [fetchOptions]
  );

  const notFoundContent = useMemo(() => {
    return loading ? <Spin size="small" /> : "暂无数据";
  }, [loading]);

  if (readOnly) {
    return (
      <span style={style} className={className ? `${className} ${READ_ONLY_CLASS}` : READ_ONLY_CLASS}>
        {value}
      </span>
    );
  }
  return (
    <AutoComplete
      style={style}
      className={className}
      notFoundContent={notFoundContent}
      allowClear={true}
      {...antdAutoCompleteProps}
      disabled={disabled}
      options={innerOptions}
      value={innerValue}
      onSearch={onSearch}
      onChange={onValueChange}
    />
  );
};

RestAutoComplete.propTypes = {
  // 自定义样式
  style: PropTypes.object,
  // 自定义类名
  className: PropTypes.string,
  // 当前选中的值
  value: PropTypes.any,
  // 值变化时的回调函数
  onChange: PropTypes.func,

  // 远程数据接口地址
  restful: PropTypes.string,
  // axios的配置
  reqConfig: PropTypes.object,
  // 接口筛选条件
  baseParams: PropTypes.object,
  // 搜索关键字参数名
  searchKey: PropTypes.string,
  searchMinEnter: PropTypes.number,
  // 选项列表
  options: PropTypes.array,
  // 解析接口返回数据的函数
  parseRowsPath: PropTypes.string,
  // 字段名称映射配置, 原生组件并不支持如此配置
  fieldNames: PropTypes.object,
  // 远程接口返回数据的label模板
  labelTemplate: PropTypes.string,

  // 是否禁用
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  // Antd AutoComplete组件原生属性
  antdAutoCompleteProps: PropTypes.object,
};

export default RestAutoComplete;

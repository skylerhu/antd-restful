import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Select, Space, Spin, Tag, Tooltip } from "antd";
import { dequal as deepEqual } from "dequal";
import { DEFAULT_ROWS_PATH, DEFAULT_SEPARATOR, READ_ONLY_CLASS } from "src/common/constants";
import { commonFormat, findDataByPath } from "src/common/parser";
import { isArray, isBlank, isDict, isEmpty, isFunction } from "src/common/typeTools";
import CopyView from "src/components/CopyView";
import { useDeepCompareMemoize } from "src/hooks";
import { useSafeRequest } from "src/requests";

const RestSelect = ({
  style,
  className,

  value,
  onChange,

  restful,
  reqConfig,
  urlDetailTemplate = null,
  baseParams = null,
  searchKey = "search",
  searchMinEnter = 0,
  parseRowsPath = DEFAULT_ROWS_PATH,
  enableCopy = false,
  separator = DEFAULT_SEPARATOR,

  options,
  fieldNames,
  labelInValue = false,
  labelTemplate,
  mode,
  disabled = false,
  readOnly = false,
  antdSpaceProps,
  antdSelectProps,
}) => {
  const [makeRequest] = useSafeRequest();
  const reqConfigRef = useRef(reqConfig);
  // 是否多选
  const [isMultiple, setMultiple] = useState(mode === "multiple");
  // 选中的值
  const [innerValue, setInnverValue] = useState();
  // 远程搜索，用户输入的关键字
  const [searchValue, setSearchValue] = useState();
  const [loading, setLoading] = useState(false);
  // 下拉选项列表
  const [innerOptions, setInnerOptions] = useState(options || []);
  // 已经初始化过options,有可能会404,不重复获取
  const fetchedValuesRef = useRef(new Set());
  const [optsByValue, setOptsByValue] = useState();

  const optKey = useMemo(() => fieldNames?.value || "value", [fieldNames?.value]);
  const optLabel = useMemo(() => fieldNames?.label || "label", [fieldNames?.label]);
  const getOptionValue = useCallback((item) => item[optKey], [optKey]);
  // 避免有options在异步赋值时有重复的情况
  const cacheValuesRef = useRef(new Set());
  const optValuesRef = useRef(new Set(innerOptions.map((opt) => getOptionValue(opt))));

  const memOptions = useDeepCompareMemoize(options);
  useEffect(() => {
    if (isArray(memOptions)) {
      setInnerOptions((oldV) => (deepEqual(oldV, memOptions) ? oldV : memOptions));
    }
  }, [memOptions]);

  const onValueChange = useCallback(
    (value, option) => {
      setInnverValue(value);
      if (isFunction(onChange)) {
        onChange(value, option);
      }
    },
    [onChange]
  );

  const updateOptions = useCallback(
    (addOptions, isPatch) => {
      if (isPatch && isBlank(addOptions)) {
        return;
      }
      setInnerOptions((oldOpts) => {
        // 找出选中的opts
        const selectedOpts = oldOpts.filter((opt) => cacheValuesRef.current.has(getOptionValue(opt)));
        let opts = selectedOpts.concat(addOptions);
        if (isPatch) {
          opts = opts.concat(oldOpts);
        }
        // 去重
        const optValueSet = new Set();
        opts = opts.filter((opt) => {
          const v = getOptionValue(opt);
          if (optValueSet.has(v)) {
            return false;
          } else {
            optValueSet.add(v);
            return true;
          }
        });
        optValuesRef.current = optValueSet;
        return opts;
      });
    },
    [getOptionValue]
  );

  // 初始化是否多选
  useEffect(() => {
    setMultiple(mode === "multiple");
  }, [mode]);

  // 初始化值
  useEffect(() => {
    setInnverValue((oldValue) => {
      if (deepEqual(oldValue, value)) {
        return oldValue;
      }
      let newV = value;
      if (isMultiple) {
        if (isArray(value)) {
          // pass
        } else if (!isBlank(value)) {
          newV = [value];
        } else {
          newV = [];
        }
      }
      if (!isEmpty(newV)) {
        let _options = [];
        if (labelInValue) {
          // 根据value初始化options
          if (isMultiple) {
            _options = [...newV];
          } else {
            _options = [newV];
          }
        } else {
          // 兼容处理初始值传入的都是object，根据optKey将object转化成需要的值
          if (isMultiple) {
            newV = newV.map((item) => {
              let v = item;
              if (isDict(item)) {
                _options.push(item);
                v = item[optKey];
              }
              return v;
            });
          } else if (isDict(newV)) {
            _options.push(newV);
            newV = newV[optKey];
          }
        }
        if (_options.length > 0) {
          updateOptions(_options, true);
          setOptsByValue(_options);
        }
      }
      if (isEmpty(newV)) {
        cacheValuesRef.current = new Set();
      } else {
        cacheValuesRef.current = new Set(isMultiple ? newV : [newV]);
      }
      return newV;
    });
  }, [value, isMultiple, labelInValue, optKey, updateOptions]);

  useEffect(() => {
    if (isEmpty(optsByValue)) {
      return;
    }
    // 因为 onValueChange 不能在 上面 setInnverValue 函数中调用，所以增加 optsByValue 进行控制
    onValueChange(innerValue, optsByValue);
  }, [innerValue, optsByValue, onValueChange]);

  // 被选中的值
  const selectedValues = useMemo(() => {
    if (isEmpty(innerValue)) {
      return [];
    }
    if (isMultiple) {
      return innerValue;
    }

    return [innerValue];
  }, [innerValue, isMultiple]);

  const optionsWithLabel = useMemo(() => {
    if (!labelTemplate) {
      return innerOptions;
    }
    return innerOptions.map((opt) => {
      return { ...opt, label: commonFormat(labelTemplate, opt) };
    });
  }, [labelTemplate, innerOptions]);

  const memBaseParams = useDeepCompareMemoize(baseParams);

  // 当值发生改变时
  useEffect(() => {
    if (isEmpty(selectedValues)) {
      return;
    }
    // 没有options的选中项
    const fetchValues = selectedValues.filter(
      (v) => !isDict(v) && !optValuesRef.current.has(v) && !fetchedValuesRef.current.has(v)
    );
    if (!fetchValues.length) {
      return;
    }
    fetchValues.forEach((v) => fetchedValuesRef.current.add(v));
    // 根据restful接口获取详情数据初始化options
    let url = restful;
    let params = { ...memBaseParams };
    const _vs = fetchValues.join(",");
    if (urlDetailTemplate) {
      url = commonFormat(urlDetailTemplate, _vs);
    } else {
      params[`${optKey}__in`] = _vs;
    }
    makeRequest()
      .get(url, { params })
      .then((resp) => {
        let results = findDataByPath(resp.data, parseRowsPath);
        if (!isArray(results) && !isEmpty(results)) {
          results = [results];
        }
        updateOptions(results, true);
      });
  }, [
    makeRequest,
    getOptionValue,
    selectedValues,
    restful,
    urlDetailTemplate,
    optKey,
    updateOptions,
    memBaseParams,
    parseRowsPath,
  ]);

  useEffect(() => {
    // 搜索值变化时
    if (disabled || !restful || readOnly) {
      return;
    }
    if (isBlank(searchValue) && searchMinEnter > 0) return;
    if (!isBlank(searchValue) && searchValue.length < searchMinEnter) return;

    setLoading(true);
    let params = { ...memBaseParams };
    if (!isBlank(searchValue)) {
      params[searchKey] = searchValue;
    }
    makeRequest({ delay: 200, key: "restselect" })
      .get(restful, { params, disableNotiError: true, ...reqConfigRef.current })
      .then((resp) => {
        const results = findDataByPath(resp.data, parseRowsPath) || [];
        updateOptions(results);
      })
      .finally(() => setLoading(false));
  }, [
    restful,
    searchKey,
    searchValue,
    makeRequest,
    disabled,
    searchMinEnter,
    updateOptions,
    readOnly,
    memBaseParams,
    parseRowsPath,
  ]);

  const notFoundView = useMemo(() => {
    let _view = "无更多数据";
    if (restful) {
      if (loading) {
        _view = <Spin size="small" />;
      } else {
        _view = "请输入合适的关键字进行搜索";
      }
      return _view;
    }
  }, [restful, loading]);

  let view = null;
  if (readOnly) {
    view = (
      <div style={style} className={className ? `${className} ${READ_ONLY_CLASS}` : READ_ONLY_CLASS}>
        {selectedValues.map((v) => {
          const opt = optionsWithLabel?.find((opt) => opt[optKey] === v);
          const label = opt?.[optLabel] || v;
          return (
            <CopyView key={v} value={v} disabled={!enableCopy}>
              <Tooltip title={v}>
                {isMultiple ? <Tag>{label}</Tag> : label}
              </Tooltip>
            </CopyView>
          );
        })}
      </div>
    );
    return view;
  }

  view = (
    <Select
      {...(!enableCopy ? { style, className } : {})}
      notFoundContent={notFoundView}
      allowClear={true}
      placeholder="可输入关键内容搜索，从下拉列表中选择"
      {...antdSelectProps}
      mode={mode}
      labelInValue={labelInValue}
      disabled={disabled}
      readOnly={readOnly}
      options={optionsWithLabel}
      fieldNames={fieldNames}
      value={innerValue}
      filterOption={false}
      showSearch={true}
      onSearch={(v) => setSearchValue(v)}
      onClear={() => onValueChange(null)}
      onChange={(value, option) => onValueChange(value, option)}
    />
  );
  if (!enableCopy) {
    return view;
  }

  return (
    <Space.Compact block style={style} className={className} {...antdSpaceProps}>
      {view}
      <div style={{ alignSelf: "center" }}>
        <CopyView value={innerValue} hiddenValue separator={separator} />
      </div>
    </Space.Compact>
  );
};

RestSelect.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,

  // 选中的值
  value: PropTypes.any,
  onChange: PropTypes.func,

  // 远程获取数据的接口
  restful: PropTypes.string,
  // axios的配置
  reqConfig: PropTypes.object,
  // 根据value初始化能够get到对应options的接口地址；函数输入参数即初始化的value，多选时是数组
  urlDetailTemplate: PropTypes.string,
  // 接口刷选条件
  baseParams: PropTypes.object,
  // 模糊搜索使用的key
  searchKey: PropTypes.string,
  // 最少输入字符数，为0时允许为空时获取远程options
  searchMinEnter: PropTypes.number,
  // 从接口返回值解析出列表数据，函数输入参数是 response.body 的具体内容
  parseRowsPath: PropTypes.string,
  enableCopy: PropTypes.bool,
  // 复制时，值之间的分隔符
  separator: PropTypes.string,
  // 远程接口返回数据的label模板
  labelTemplate: PropTypes.string,

  // 原生组件支持的配置
  // 使用该方式的时候，fieldNames配置将失效
  labelInValue: PropTypes.bool,
  // 通antd官方配置，配置options的key/value字段
  fieldNames: PropTypes.object,
  // 初始化的下拉选项
  options: PropTypes.arrayOf(PropTypes.object),
  // 默认单选，多选： multiple
  mode: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  // antd原生配置项
  antdSpaceProps: PropTypes.object,
  antdSelectProps: PropTypes.object,
};

export default RestSelect;

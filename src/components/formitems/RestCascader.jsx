import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Cascader, Space, Spin, Tooltip, Tag } from "antd";
import { dequal as deepEqual } from "dequal";
import { DEFAULT_ROWS_PATH, READ_ONLY_CLASS } from "src/common/constants";
import { findDataByPath, findTreeOptionsByValues, treeValuesToLabels } from "src/common/parser";
import { isArray, isEmpty, isFunction } from "src/common/typeTools";
import CopyView from "src/components/CopyView";
import { useDeepCompareMemoize } from "src/hooks";
import { useSafeRequest } from "src/requests";

const RestCascader = ({
  style,
  className,
  value,
  onChange,
  restful,
  reqConfig,
  baseParams = null,
  fieldParent = "parent",
  parseRowsPath = DEFAULT_ROWS_PATH,
  enableCopy = false,
  separator = " / ",
  options,
  fieldNames,
  disabled = false,
  readOnly = false,
  antdSpaceProps,
  antdCascaderProps,
}) => {
  const [makeRequest] = useSafeRequest();
  const reqConfigRef = useRef(reqConfig);

  const [innerValue, setInnerValue] = useState(value);
  const [innerOptions, setInnerOptions] = useState(options || []);

  const optKey = useMemo(() => fieldNames?.value || "value", [fieldNames?.value]);
  const optLabel = useMemo(() => fieldNames?.label || "label", [fieldNames?.label]);
  const optChildren = useMemo(() => fieldNames?.children || "children", [fieldNames?.children]);

  useEffect(() => {
    setInnerValue((oldV) => (deepEqual(oldV, value) ? oldV : value));
  }, [value]);

  const memOptions = useDeepCompareMemoize(options);

  useEffect(() => {
    if (isArray(memOptions)) {
      setInnerOptions((oldV) => (deepEqual(oldV, memOptions) ? oldV : memOptions));
    }
  }, [memOptions]);

  const onValueChange = useCallback(
    (value, selectedOptions) => {
      setInnerValue(value);
      if (isFunction(onChange)) {
        // 初始化树状options用于快照保存
        let treeOpts = [];
        if (!isEmpty(value) && !isEmpty(selectedOptions)) {
          const valueArr = antdCascaderProps?.multiple ? value.flat() : value;
          let optArr = [];
          const keys = new Set(); // 用于去重
          if (antdCascaderProps?.multiple) {
            for (const items of selectedOptions) {
              if (isEmpty(items)) {
                continue;
              }
              // 只需要取第一个，options都会自带children
              const item = items[0];
              if (keys.has(item[optKey])) {
                continue;
              }
              keys.add(item[optKey]);
              optArr.push(item);
            }
          } else {
            optArr = [selectedOptions[0]];
          }
          treeOpts = findTreeOptionsByValues(optArr, valueArr, optKey, optChildren);
        }
        onChange(value, selectedOptions, treeOpts);
      }
    },
    [onChange, optKey, optChildren, antdCascaderProps?.multiple]
  );

  const initFirstRef = useRef(true);
  useEffect(() => {
    // 仅在第一次的时候回主动初始化options
    if (initFirstRef.current) {
      initFirstRef.current = false;
      fetchOptions();
    }
  }, [fetchOptions, value]);

  useEffect(() => {
    if (isEmpty(innerValue)) {
      fetchOptions([]);
    }
  }, [innerValue, fetchOptions]);

  // 是否已经初始化过options
  const isOptsInited = useRef(false);
  // 避免多次重复请求, 同一个值只请求一次
  const avoidDuplicateRequest = useRef({});

  const memBaseParams = useDeepCompareMemoize(baseParams);

  const fetchOptions = useCallback(
    (selectedOptions) => {
      if (!restful || disabled || readOnly) return;

      const params = { ...memBaseParams };
      let targetOpt = null;
      if (!isEmpty(selectedOptions) && selectedOptions.length > 0) {
        // 根据最后一个记录寻找值
        targetOpt = selectedOptions[selectedOptions.length - 1];
        if (avoidDuplicateRequest.current[targetOpt[optKey]]) {
          return;
        } else {
          avoidDuplicateRequest.current[targetOpt[optKey]] = true;
        }
        params[fieldParent] = targetOpt[optKey];
      } else {
        if (isOptsInited.current) {
          return;
        } else {
          isOptsInited.current = true;
        }
        params[`${fieldParent}__isnull`] = true;
      }
      makeRequest()
        .get(restful, { params, disableNotiError: true, ...reqConfigRef.current })
        .then((response) => {
          const data = findDataByPath(response.data, parseRowsPath);
          setInnerOptions((oldOpts) => {
            if (!targetOpt) {
              // 直接重置第一级的options
              return data;
            }
            if (data.length == 0) {
              // 没有子节点,则标记为叶子节点
              targetOpt.isLeaf = true;
            } else {
              targetOpt[optChildren] = data;
            }
            return [...oldOpts];
          });
        })
        .finally(() => {
          // 置为false可以重新刷新下第一层数据；会在 清空完选择的值后 重新触发
          isOptsInited.current = false;
          if (targetOpt) {
            delete avoidDuplicateRequest.current[targetOpt[optKey]];
          }
        });
    },
    [makeRequest, restful, fieldParent, optKey, optChildren, memBaseParams, parseRowsPath, disabled, readOnly]
  );

  let view = null;
  if (readOnly) {
    // 考虑多选的情况
    const _values = isArray(innerValue)
      ? innerValue.flat().length === innerValue.length
        ? [innerValue]
        : innerValue
      : [];
    view = (
      <div style={style} className={className ? `${className} ${READ_ONLY_CLASS}` : READ_ONLY_CLASS}>
        {_values.map((v) => {
          const valueStr = v?.join(separator);
          return (
            <CopyView key={valueStr} value={valueStr} disabled={!enableCopy}>
              <Tooltip title={valueStr}>
                <Tag>{treeValuesToLabels(v, innerOptions, optKey, optLabel, optChildren).join(separator)}</Tag>
              </Tooltip>
            </CopyView>
          );
        })}
      </div>
    );
    return view;
  }

  view = (
    <Cascader
      style={style}
      className={className}
      allowClear={true}
      displayRender={(label) => label.join(separator)}
      changeOnSelect={true}
      notFoundContent={!isOptsInited.current ? <Spin /> : null}
      {...antdCascaderProps}
      fieldNames={fieldNames}
      disabled={disabled}
      options={innerOptions}
      value={innerValue}
      onChange={onValueChange}
      loadData={(selectedOptions) => {
        fetchOptions(selectedOptions);
      }}
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

RestCascader.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,

  value: PropTypes.arrayOf(PropTypes.any),
  onChange: PropTypes.func,
  restful: PropTypes.string,
  reqConfig: PropTypes.object,
  baseParams: PropTypes.object,
  // 父级字段名
  fieldParent: PropTypes.string,
  parseRowsPath: PropTypes.string,
  enableCopy: PropTypes.bool,
  separator: PropTypes.string, // 多选时有效

  // 原生组件支持的配置
  options: PropTypes.array,
  fieldNames: PropTypes.object,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  // 原生配置
  antdSpaceProps: PropTypes.object,
  antdCascaderProps: PropTypes.object,
};

export default RestCascader;

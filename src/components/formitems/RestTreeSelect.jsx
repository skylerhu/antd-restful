import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Space, Spin, Tag, TreeSelect, Tooltip } from "antd";
import { dequal as deepEqual } from "dequal";
import { DEFAULT_ROWS_PATH, DEFAULT_SEPARATOR, READ_ONLY_CLASS } from "src/common/constants";
import { findDataByPath, findLabelFromTreeData } from "src/common/parser";
import { insertChildrenToTreeNode, patchTreeNodeInfo, refreshTreeKeyMap } from "src/common/treeUtils";
import { isArray, isEmpty, isFunction } from "src/common/typeTools";
import CopyView from "src/components/CopyView";
import { useDeepCompareMemoize } from "src/hooks";
import { useSafeRequest } from "src/requests";

const RestTreeSelect = ({
  style,
  className,
  value,
  onChange,

  restful,
  reqConfig,
  baseParams,
  fieldParent = "parent",
  labelTemplate,
  parseRowsPath = DEFAULT_ROWS_PATH,
  enableCopy,
  separator = DEFAULT_SEPARATOR,

  treeData,
  fieldNames,
  treeNodeLabelProp,
  disabled = false,
  readOnly = false,
  antdTreeSelectProps,
  antdSpaceProps,
}) => {
  const [makeRequest] = useSafeRequest();
  const reqConfigRef = useRef(reqConfig);

  const [innerValue, setInnerValue] = useState(value);
  const [loading, setLoading] = useState(false);
  const [treeInnerData, setTreeInnerData] = useState(treeData || []);
  // key: node 存储数据
  const treeKeyMap = useRef({});

  const fieldKey = useMemo(() => fieldNames?.value || "value", [fieldNames?.value]);
  const fieldLabel = useMemo(
    () => treeNodeLabelProp || fieldNames?.label || "label",
    [fieldNames?.label, treeNodeLabelProp]
  );
  const fieldChildren = useMemo(() => fieldNames?.children || "children", [fieldNames?.children]);

  useEffect(() => {
    setInnerValue((oldV) => {
      return deepEqual(oldV, value) ? oldV : value;
    });
  }, [value]);

  const memTreeData = useDeepCompareMemoize(treeData);
  useEffect(() => {
    if (isArray(memTreeData)) {
      setTreeInnerData((oldV) => (deepEqual(oldV, memTreeData) ? oldV : memTreeData));
    }
  }, [memTreeData]);

  const initDataFirstRef = useRef(true);

  useEffect(() => {
    // 仅第一时候初始化一级结点
    if (initDataFirstRef.current) {
      initDataFirstRef.current = false;
      refreshByNode();
    }
  }, [value, refreshByNode]);

  const onValueChange = useCallback(
    (value) => {
      setInnerValue(value);
      if (isFunction(onChange)) {
        let nodes = [];
        if (!isEmpty(value)) {
          nodes = (isArray(value) ? value : [value]).map((v) => treeKeyMap.current[v]);
        }
        onChange(value, nodes);
      }
    },
    [onChange]
  );

  const memBaseParams = useDeepCompareMemoize(baseParams);

  const refreshByNode = useCallback(
    (node, callback) => {
      if (!restful || disabled || readOnly) {
        return;
      }

      setLoading(true);
      const params = { ...memBaseParams };
      if (node && node[fieldKey]) {
        params[fieldParent] = node[fieldKey];
      } else {
        params[`${fieldParent}__isnull`] = true;
      }

      // 以node[fieldKey]作为key，避免频繁刷新相同的node
      makeRequest({ delay: 200, key: `treeselect-${node ? node[fieldKey] : ""}` })
        .get(restful, { params, disableNotiError: true, ...reqConfigRef.current })
        .then((response) => {
          const data = findDataByPath(response.data, parseRowsPath);
          patchTreeNodeInfo(data, { fieldKey, fieldChildren, labelTemplate });
          if (!node) {
            setTreeInnerData(data);
          } else {
            setTreeInnerData((oldV) => {
              const nodes = insertChildrenToTreeNode(oldV, data, node[fieldKey], { fieldKey, fieldChildren });
              return [...nodes];
            });
          }
        })
        .finally(() => {
          setLoading(false);
          if (isFunction(callback)) {
            callback();
          }
        });
    },
    [
      makeRequest,
      restful,
      fieldParent,
      disabled,
      readOnly,
      memBaseParams,
      parseRowsPath,
      labelTemplate,
      fieldKey,
      fieldChildren,
    ]
  );

  useEffect(() => {
    if (isArray(treeInnerData)) {
      treeKeyMap.current = refreshTreeKeyMap(treeInnerData, { fieldKey, fieldChildren });
    }
  }, [treeInnerData, fieldKey, fieldChildren]);

  const notFoundContent = useMemo(() => {
    return loading ? <Spin size="small" /> : "暂无数据";
  }, [loading]);

  let view = null;

  if (readOnly) {
    let _values = [];
    if (isArray(innerValue)) {
      _values = innerValue;
    } else if (!isEmpty(innerValue)) {
      _values = [innerValue];
    }
    view = (
      <div style={style} className={className ? `${className} ${READ_ONLY_CLASS}` : READ_ONLY_CLASS}>
        {_values.map((v) => {
          const label = findLabelFromTreeData(v, treeInnerData, fieldKey, fieldLabel, fieldChildren);
          return (
            <CopyView key={v} value={v} disabled={!enableCopy}>
              <Tooltip title={v}>
                {isArray(innerValue) ? <Tag>{label}</Tag> : label}
              </Tooltip>
            </CopyView>
          );
        })}
      </div>
    );
    return view;
  }

  view = (
    <TreeSelect
      {...(!enableCopy ? { style, className } : {})}
      notFoundContent={notFoundContent}
      allowClear
      showSearch
      filterTreeNode={(inputValue, node) => {
        if (inputValue) {
          const key = node[fieldKey];
          if (key && key.indexOf(inputValue) > -1) {
            return true;
          }
          const label = node[fieldLabel];
          if (label && label.indexOf(inputValue) > -1) {
            return true;
          }
          return false;
        }
        return true;
      }}
      {...antdTreeSelectProps}
      fieldNames={fieldNames}
      treeNodeLabelProp={fieldLabel}
      disabled={disabled}
      treeData={treeInnerData}
      value={innerValue}
      loadData={(node) =>
        new Promise((resolve) => {
          refreshByNode(node, resolve);
        })
      }
      onChange={onValueChange}
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

RestTreeSelect.propTypes = {
  // 自定义样式
  style: PropTypes.object,
  // 自定义类名
  className: PropTypes.string,
  // 当前选中的值
  value: PropTypes.any,
  // 值变化时的回调函数
  onChange: PropTypes.func,

  // 远程接口地址
  restful: PropTypes.string,
  // axios的配置
  reqConfig: PropTypes.object,
  // 基础请求参数
  baseParams: PropTypes.object,
  // 标签模板
  labelTemplate: PropTypes.string,
  // 父级字段名
  fieldParent: PropTypes.string,
  // 解析数据路径
  parseRowsPath: PropTypes.string,

  enableCopy: PropTypes.bool,
  // 多选时复制值之间的分隔符
  separator: PropTypes.string,

  // 字段映射
  fieldNames: PropTypes.object,
  treeNodeLabelProp: PropTypes.string,
  // 是否禁用
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  treeData: PropTypes.array,
  // antd TreeSelect 属性
  antdTreeSelectProps: PropTypes.object,
  antdSpaceProps: PropTypes.object,
};

export default RestTreeSelect;

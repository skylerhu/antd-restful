import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Mentions, Spin } from "antd";
import { dequal as deepEqual } from "dequal";
import { DEFAULT_ROWS_PATH, READ_ONLY_CLASS } from "src/common/constants";
import { commonFormat, findDataByPath } from "src/common/parser";
import { isBlank, isDict, isFunction } from "src/common/typeTools";
import { useDeepCompareMemoize } from "src/hooks";
import { useSafeRequest } from "src/requests";

const MentionView = ({
  style,
  className,
  value,
  onChange,

  restful,
  reqConfig,
  baseParams = null,
  searchKey = "search",
  searchMinEnter = 0,
  parseRowsPath = DEFAULT_ROWS_PATH,

  fieldNames,
  labelTemplate,
  inValue = false,

  disabled = false,
  readOnly = false,
  antdMentionsProps,
}) => {
  const [makeRequest] = useSafeRequest();
  const reqConfigRef = useRef(reqConfig);

  const [innerValue, setInnerValue] = useState(value);
  const [loading, setLoading] = useState(false);
  const [innerOptions, setInnerOptions] = useState();

  const optKey = useMemo(() => fieldNames?.value || "value", [fieldNames?.value]);
  const optLabel = useMemo(() => fieldNames?.label || "label", [fieldNames?.label]);

  useEffect(() => {
    setInnerValue((oldV) => {
      if (deepEqual(oldV, value)) {
        return oldV;
      }
      if (isDict(value)) {
        return value.value;
      }
      return value;
    });
  }, [value]);

  const onValueChange = useCallback(
    (value) => {
      if (isFunction(onChange)) {
        if (inValue) {
          const mentions = Mentions.getMentions(value);
          onChange({ value, mentions });
        } else {
          onChange(value);
        }
      }
    },
    [onChange, inValue]
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
      makeRequest({ delay: 200, key: "mention" })
        .get(restful, { params, disableNotiError: true, ...reqConfigRef.current })
        .then((response) => {
          const data = findDataByPath(response.data, parseRowsPath);
          setInnerOptions(
            data.map((opt) => ({
              // ...opt,
              key: opt.key || opt[optKey],
              value: opt[optKey],
              label: labelTemplate ? commonFormat(labelTemplate, opt) : opt[optLabel],
            }))
          );
        })
        .finally(() => setLoading(false));
    },
    [
      restful,
      disabled,
      readOnly,
      searchKey,
      makeRequest,
      optKey,
      optLabel,
      labelTemplate,
      searchMinEnter,
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

  if (readOnly) {
    return (
      <span style={style} className={className ? `${className} ${READ_ONLY_CLASS}` : READ_ONLY_CLASS}>
        {innerValue}
      </span>
    );
  }

  return (
    <Mentions
      style={style}
      className={className}
      notFoundContent={loading ? <Spin /> : null}
      {...antdMentionsProps}
      value={innerValue}
      onChange={onValueChange}
      onSearch={onSearch}
      disabled={disabled}
      readOnly={readOnly}
      loading={loading}
    >
      {innerOptions?.map((opt) => (
        <Mentions.Option key={opt.key} value={opt.value}>
          {opt.label}
        </Mentions.Option>
      ))}
    </Mentions>
  );
};

MentionView.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,

  value: PropTypes.string,
  onChange: PropTypes.func,

  restful: PropTypes.string,
  reqConfig: PropTypes.object,
  baseParams: PropTypes.object,
  searchKey: PropTypes.string,
  searchMinEnter: PropTypes.number,
  parseRowsPath: PropTypes.string,
  // 扩展支持的配置
  fieldNames: PropTypes.object,
  labelTemplate: PropTypes.string,
  inValue: PropTypes.bool,

  // 原生组件支持的配置
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  antdMentionsProps: PropTypes.object,
};

export default MentionView;

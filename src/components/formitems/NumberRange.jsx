// 实现的是 闭区间
import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { InputNumber, Space } from "antd";
import { dequal as deepEqual } from "dequal";
import { READ_ONLY_CLASS } from "src/common/constants";
import { commonFormat, initRangeValues } from "src/common/parser";
import { isBlank, isFunction } from "src/common/typeTools";

const NumberRange = ({
  style,
  className,

  value,
  onChange,

  labelTemplate = "[{0},{1}]",

  disabled = false,
  readOnly = false,

  antdSpaceProps,
  antdInputProps,
  antdStartProps,
  antdEndProps,
}) => {
  const [innerValue, setInnerValue] = useState();

  useEffect(() => {
    setInnerValue((oldV) => {
      const newV = initRangeValues(value, true);
      return deepEqual(newV, oldV) ? oldV : newV;
    });
  }, [value]);

  const onValueChange = useCallback(
    (v1, v2) => {
      setInnerValue((oldV) => {
        const newV = [v1, v2];
        return deepEqual(newV, oldV) ? oldV : newV;
      });
      if (isFunction(onChange)) {
        if (isBlank(v1) && isBlank(v2)) {
          onChange(null);
        } else {
          onChange([v1, v2]);
        }
      }
    },
    [onChange]
  );

  const startValue = innerValue && innerValue.length > 0 ? innerValue[0] : null;
  const endValue = innerValue && innerValue.length > 1 ? innerValue[1] : null;

  if (readOnly) {
    return (
      <Space.Compact style={style} className={className ? `${className} ${READ_ONLY_CLASS}` : READ_ONLY_CLASS} {...antdSpaceProps}>
        {commonFormat(labelTemplate, startValue || "", endValue || "")}
      </Space.Compact>
    );
  }

  return (
    <Space.Compact block style={style} className={className} {...antdSpaceProps}>
      <InputNumber
        placeholder={"最小值"}
        {...antdInputProps}
        {...antdStartProps}
        disabled={disabled}
        value={startValue}
        onChange={(v) => onValueChange(v, endValue)}
      />
      <span style={{ margin: "0 8px" }}>~</span>
      <InputNumber
        placeholder={"最大值"}
        {...antdInputProps}
        {...antdEndProps}
        disabled={disabled}
        value={endValue}
        onChange={(v) => onValueChange(startValue, v)}
      />
    </Space.Compact>
  );
};

NumberRange.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,

  value: PropTypes.oneOfType([PropTypes.array, PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,

  // 只读场景下，显示的模板，模板中 {0} 是 startValue，{1} 是 endValue
  labelTemplate: PropTypes.string,

  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  antdSpaceProps: PropTypes.object,
  antdInputProps: PropTypes.object,
  antdStartProps: PropTypes.object,
  antdEndProps: PropTypes.object,
};

export default NumberRange;

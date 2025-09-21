import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { DatePicker, TimePicker } from "antd";
import { createDate } from "src/common/dateUtils";
import { READ_ONLY_CLASS } from "src/common/constants";
import { initRangeValues } from "src/common/parser";
import { isArray, isEmpty, isFunction } from "src/common/typeTools";

const RangeStrPicker = ({
  style,
  className,
  value,
  defaultValue,
  defaultEmptyValue = null,
  format,
  onChange,
  disabled = false,
  readOnly = false,
  isTime = false,
  antdRangePickerProps,
}) => {
  const onValueChange = useCallback(
    (dates, dateStrings) => {
      if (isFunction(onChange)) {
        if (isEmpty(dateStrings) || dateStrings.every(v => isEmpty(v))) {
          onChange(undefined);
        } else {
          const values = dateStrings.map((v) => v ? v : defaultEmptyValue);
          onChange(values, dates);
        }
      }
    },
    [onChange, defaultEmptyValue]
  );

  const getDateValue = useCallback(
    (val) => {
      const rangeValues = initRangeValues(val, { defaultEmptyValue });
      const newV = rangeValues?.map((item) => (item ? createDate(item, format) : item));
      return newV;
    },
    [format, defaultEmptyValue]
  );

  if (readOnly) {
    return (
      <span style={style} className={className ? `${className} ${READ_ONLY_CLASS}` : READ_ONLY_CLASS}>
        {isArray(value) ? value.join(" ~ ") : value}
      </span>
    );
  }

  const RangePicker = isTime ? TimePicker.RangePicker : DatePicker.RangePicker;

  return (
    <RangePicker
      style={style}
      className={className}
      allowClear={true}
      allowEmpty={[true, true]}
      {...antdRangePickerProps}
      disabled={disabled}
      value={getDateValue(value)}
      defaultValue={getDateValue(defaultValue)}
      onChange={onValueChange}
      format={format}
    />
  );
};

RangeStrPicker.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,

  value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  onChange: PropTypes.func,
  // 原生组件支持的配置
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  defaultEmptyValue: PropTypes.oneOf([null, undefined, ""]),
  format: PropTypes.string,

  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,

  isTime: PropTypes.bool,
  antdRangePickerProps: PropTypes.object,
};

export default RangeStrPicker;

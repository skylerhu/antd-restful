import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { DatePicker, TimePicker } from "antd";
import dayjs from "dayjs";
import { READ_ONLY_CLASS } from "src/common/constants";
import { isArray, isEmpty, isFunction } from "src/common/typeTools";

const RangeStrPicker = ({
  style,
  className,
  value,
  defaultValue,
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
          onChange(null, null);
        } else {
          onChange(dateStrings, dates);
        }
      }
    },
    [onChange]
  );

  const getDayjsValue = useCallback(
    (val) => {
      if (isEmpty(val)) return undefined;
      if (!isArray(val)) {
        // 不是数组
        val = val.split(",");
      }
      return val.map((item) => (item ? dayjs(item, format) : undefined));
    },
    [format]
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
      value={getDayjsValue(value)}
      defaultValue={getDayjsValue(defaultValue)}
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
  format: PropTypes.string,

  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,

  isTime: PropTypes.bool,
  antdRangePickerProps: PropTypes.object,
};

export default RangeStrPicker;

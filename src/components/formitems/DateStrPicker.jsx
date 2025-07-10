import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { DatePicker, TimePicker } from "antd";
import dayjs from "dayjs";
import { READ_ONLY_CLASS } from "src/common/constants";
import { isFunction } from "src/common/typeTools";

const DateStrPicker = ({
  style,
  className,
  value,
  defaultValue,
  format,
  onChange,
  disabled = false,
  readOnly = false,
  picker = "date",
  antdPickerProps,
}) => {
  const onValueChange = useCallback(
    (date, dateString) => {
      if (isFunction(onChange)) {
        onChange(dateString, date);
      }
    },
    [onChange]
  );

  const getDayjsValue = useCallback(
    (val) => {
      return val ? dayjs(val, format) : undefined;
    },
    [format]
  );

  if (readOnly) {
    return (
      <span style={style} className={className ? `${className} ${READ_ONLY_CLASS}` : READ_ONLY_CLASS}>
        {value}
      </span>
    );
  }

  const Picker = picker === "time" ? TimePicker : DatePicker;
  return (
    <Picker
      style={style}
      className={className}
      {...antdPickerProps}
      picker={picker}
      disabled={disabled}
      value={getDayjsValue(value)}
      defaultValue={getDayjsValue(defaultValue)}
      onChange={onValueChange}
      format={format}
    />
  );
};
DateStrPicker.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,

  value: PropTypes.string,
  onChange: PropTypes.func,
  // 原生组件支持的配置
  defaultValue: PropTypes.string,
  format: PropTypes.string,

  picker: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  antdPickerProps: PropTypes.object,
};

export default DateStrPicker;

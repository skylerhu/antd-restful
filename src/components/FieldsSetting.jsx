import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Button, Checkbox, Space, Tooltip } from "antd";
import { QuestionCircleOutlined, SettingOutlined } from "@ant-design/icons";
import { dequal as deepEqual } from "dequal";
import { genColumnKey } from "src/common/parser";
import { isFunction } from "src/common/typeTools";
import { useSettingsStorage } from "src/hooks/index";


export const initFileds = (fields) => {
  return fields?.map((field) => {
    const key = genColumnKey(field);
    return {
      key,
      value: key,
      // 原有antd columns的配置项
      hidden: field.hidden,
    };
  }) || [];
};


const FieldsSetting = ({ style, className, title, storageKey, value, onChange, children }) => {

  const [fields, setFields] = useState(initFileds(value));

  const { keys, setKeys, allKeys } = useSettingsStorage(storageKey, fields);

  useEffect(() => {
    setFields(oldV => {
      const newV = initFileds(value);
      if (deepEqual(newV, oldV)) {
        return oldV;
      }
      return newV;
    });
  }, [value]);

  // 全选
  const checkAll = useMemo(() => deepEqual(keys, allKeys), [keys, allKeys]);
  // 部分选中
  const checkIndeterminate = useMemo(() => keys.length > 0 && !checkAll, [keys, checkAll]);

  const data = useMemo(() => {
    const options = value?.map((field) => {
      const key = genColumnKey(field);
      // 若是配置的node类型，在 dequal 中会报错，所以没有放在 fields 中
      const label = field.label || field.title || key;
      return {
        key,
        value: key,
        // 如果强制设置的 false，则禁止配置； 用于Checkbox
        disabled: field.hidden === false,
        label: (
          <div style={{ width: 100 }}>
            {label}
            &nbsp;&nbsp;
            {field.tip && (
              <Tooltip title={field.tip}>
                <QuestionCircleOutlined />
              </Tooltip>
            )}
          </div>
        ),
      };
    });
    const forceChecks = options?.filter((option) => option.disabled).map((option) => option.value);
    return {
      options,
      forceChecks,
    };
  }, [value]);

  useEffect(() => {
    // 不能再回调中处理fields, 因为使用该组件的时候可能没有配置onChange
    if (isFunction(onChange)) {
      onChange(keys);
    }
  }, [keys, onChange]);

  return (
    <Tooltip
      style={style}
      className={className}
      trigger="click"
      color="white"
      title={
        <Space direction="vertical" style={{ width: 400 }}>
          <div style={{ color: "black" }}>{title || "设置"}</div>
          <Checkbox
            indeterminate={checkIndeterminate}
            checked={checkAll}
            onChange={(e) => {
              setKeys(e.target.checked ? allKeys : data.forceChecks);
            }}
          >
            全选
          </Checkbox>
          <Checkbox.Group
            value={keys}
            options={data.options}
            onChange={(v) => {
              setKeys(v);
            }}
          />
        </Space>
      }
    >
      {children || <Button icon={<SettingOutlined />} />}
    </Tooltip>
  );
};

FieldsSetting.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,

  title: PropTypes.string,
  storageKey: PropTypes.string.isRequired,
  // 字段配置，key为字段名，label为字段名，hidden为是否隐藏
  value: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
      hidden: PropTypes.bool,
    })
  ),

  onChange: PropTypes.func,
  children: PropTypes.node,
};

export default FieldsSetting;
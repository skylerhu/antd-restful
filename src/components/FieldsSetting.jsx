import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Button, Checkbox, Space, Tooltip } from "antd";
import { QuestionCircleOutlined, SettingOutlined } from "@ant-design/icons";
import { dequal as deepEqual } from "dequal";
import { genColumnKey } from "src/common/parser";
import { isFunction } from "src/common/typeTools";
import { useSettingsStorage } from "src/hooks/index";


export const initFileds = (fields, simple = false) => {
  return fields?.map((field) => {
    const key = genColumnKey(field);
    const item = {
      key,
      value: key,
      // 原有antd columns的配置项
      hidden: field.hidden,
      // 如果强制设置的 false，则禁止配置； 用于Checkbox
      disabled: field.hidden === false,
    };
    if (!simple) {
      // 若是配置的node类型，在 dequal 中会报错，显示字段不用于对比
      item.label = field.label || field.title || key;
      item.tip = field.tip;
    }
    return item;
  }) || [];
};


const FieldsSetting = ({ style, className, title, storageKey, value, onChange, children }) => {

  const [fieldConf, setFieldConf] = useState({
    fields: initFileds(value),
    simple: initFileds(value, true),
  });

  const { keys, setKeys, allKeys } = useSettingsStorage(storageKey, fieldConf.simple);

  useEffect(() => {
    setFieldConf(oldV => {
      const simple = initFileds(value, true);
      if (deepEqual(simple, oldV.simple)) {
        return oldV;
      }
      return {
        simple,
        fields: initFileds(value),
      };
    });
  }, [value]);

  // 全选
  const checkAll = useMemo(() => deepEqual(keys, allKeys), [keys, allKeys]);
  // 部分选中
  const checkIndeterminate = useMemo(() => keys.length > 0 && !checkAll, [keys, checkAll]);

  const data = useMemo(() => {
    const options = fieldConf.fields?.map((field) => {
      return {
        ...field,
        label: (
          <div style={{ width: 100 }}>
            {field.label}
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
    const forceChecks = fieldConf.fields?.filter((option) => option.disabled).map((option) => option.value);
    return {
      options,
      forceChecks,
    };
  }, [fieldConf.fields]);

  useEffect(() => {
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
import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Button, Checkbox, Space, Tooltip } from "antd";
import { QuestionCircleOutlined, SettingOutlined } from "@ant-design/icons";
import { dequal as deepEqual } from "dequal";
import { genColumnKey } from "src/common/parser";
import { isFunction } from "src/common/typeTools";
import { useSettingsStorage } from "src/hooks/index";

const FieldsSetting = ({ style, className, title, storageKey, value, onChange, children }) => {
  const { showColumns, keys, setKeys, allKeys } = useSettingsStorage(storageKey, value);

  // 全选
  const checkAll = useMemo(() => deepEqual(keys, allKeys), [keys, allKeys]);
  // 部分选中
  const checkIndeterminate = useMemo(() => keys.length > 0 && !checkAll, [keys, checkAll]);

  const allColumnOptions = useMemo(() => {
    return value.map((column) => {
      const key = genColumnKey(column);
      return {
        label: (
          <div style={{ width: 100 }}>
            {column.label || column.title || key}
            &nbsp;&nbsp;
            {column.tip && (
              <Tooltip title={column.tip}>
                <QuestionCircleOutlined />
              </Tooltip>
            )}
          </div>
        ),
        value: key,
      };
    });
  }, [value]);

  useEffect(() => {
    if (isFunction(onChange)) {
      onChange(showColumns, keys);
    }
  }, [showColumns, keys, onChange]);

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
              setKeys(e.target.checked ? allKeys : []);
            }}
          >
            全选
          </Checkbox>
          <Checkbox.Group
            value={keys}
            options={allColumnOptions}
            onChange={(value) => {
              setKeys(value);
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
      label: PropTypes.string,
      hidden: PropTypes.bool,
    })
  ),

  onChange: PropTypes.func,
  children: PropTypes.node,
};

export default FieldsSetting;

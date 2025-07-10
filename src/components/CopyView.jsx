import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { Button, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import copy from "copy-to-clipboard";
import { DEFAULT_SEPARATOR } from "src/common/constants";
import { toBeString } from "src/common/parser";
import { isEmpty, isString } from "src/common/typeTools";

function CopyView({
  style,
  className,
  value,
  short = 0,
  showIcon = false,
  hiddenValue = false,
  disabled = false,
  children,
  separator = DEFAULT_SEPARATOR,
}) {
  // 用于展示的字段
  const show = useMemo(() => {
    if (children) {
      return children;
    }
    let v = value;
    if (hiddenValue) {
      v = "";
    }
    if (short > 0 && isString(value)) {
      v = value.slice(0, short);
    }
    return toBeString(v, separator, 1);
  }, [value, short, hiddenValue, children, separator]);

  const onCopy = useCallback(() => {
    if (disabled) {
      return;
    }
    if (isEmpty(value)) {
      return;
    }
    let v = toBeString(value, separator, 1);
    const ret = copy(v);
    if (ret) {
      message.success(`复制 ${v} 成功`);
    }
  }, [value, separator, disabled]);

  if (isEmpty(value)) {
    return value;
  }

  return (
    <span style={style} className={className}>
      <span onClick={() => !showIcon && onCopy()}>{show}</span>
      {(hiddenValue || showIcon) && (
        <Button className="antd-restful-copy-button" icon={<CopyOutlined />} onClick={() => onCopy()} />
      )}
    </span>
  );
}

CopyView.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,

  // 需要复制的值
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool, PropTypes.array, PropTypes.object]),
  // 截取value前N个字符进行展示，但copy还是完整的value; 仅当value是字符串时生效
  short: PropTypes.number,
  // 是否显示复制按钮
  showIcon: PropTypes.bool,
  // 是否隐藏value; 一般配合只展示按钮使用
  hiddenValue: PropTypes.bool,
  // 直接展示的文本，不进行任何处理
  children: PropTypes.node,
  // 是否禁用复制
  disabled: PropTypes.bool,
  // 复制时，值之间的分隔符
  separator: PropTypes.string,
};

export default CopyView;

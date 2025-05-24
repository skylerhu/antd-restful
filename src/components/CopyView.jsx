import React, { useCallback, useMemo } from "react";
import { CopyOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import copy from "copy-to-clipboard";
import PropTypes from "prop-types";
import { isBlank, isString, toBeString } from "src/common/utils";

function CopyView({ style, className, text, short = 0, showIcon = false, hiddenValue = false }) {

  // 用于展示的字段
  const show = useMemo(() => {
    let v = text;
    if (hiddenValue) {
      v = "";
    }
    if (short > 0 && isString(text)) {
      v = text.slice(0, short);
    }
    return v;
  }, [text, short, hiddenValue]);

  const onCopy = useCallback(() => {
    if (isBlank(text)) {
      return;
    }
    let v = toBeString(text);
    const ret = copy(v);
    if (ret) {
      message.success(`复制 ${v} 成功`);
    }
  }, [text]);

  if (!text) {
    return text;
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

  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool, PropTypes.array, PropTypes.object]),
  // 截取前N个字符进行展示，但copy还是完整的text; 仅当text是字符串时生效
  short: PropTypes.number,
  showIcon: PropTypes.bool,
  hiddenValue: PropTypes.bool,
};

export default CopyView;

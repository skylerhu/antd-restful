import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal } from "antd";
import { EllipsisOutlined, EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { commonFormat, toBeString } from "src/common/parser";
import { isArray, isBlank, isDict, isString } from "src/common/typeTools";

const tipColor = "rgba(0, 0, 0, 0.45)";

const LongText = ({ value, maxLength = 64, labelTemplate, separator = "\n", style, className, antdModalProps }) => {
  const [visible, setVisible] = useState(false);
  const [showOrigin, setShowOrigin] = useState(false);

  const shortConf = useMemo(() => {
    let shortText = "";
    let showEye = false; // 是否需要展示原始数据
    let showMore = false;

    if (isArray(value)) {
      showEye = !isBlank(labelTemplate) && value.some((item) => isDict(item));

      let showArr = value;
      if (value.length > maxLength) {
        showMore = true;
        showArr = value.slice(0, maxLength);
      }
      shortText = showArr.map((item) => {
        return isDict(item) && labelTemplate ? commonFormat(labelTemplate, item) : toBeString(item);
      });
      shortText = shortText.join(separator);
    } else if (isDict(value) && labelTemplate) {
      showEye = true;
      shortText = commonFormat(labelTemplate, value);
    } else {
      shortText = toBeString(value);
      if (shortText.length > maxLength) {
        showMore = true;
        shortText = shortText.slice(0, maxLength);
      }
    }
    return { shortText, showMore, showEye };
  }, [value, maxLength, labelTemplate, separator]);

  const realText = useMemo(() => {
    let text = "";
    if (isArray(value)) {
      if (!isBlank(labelTemplate) && !showOrigin) {
        text = value.map((item) => {
          return isDict(item) && labelTemplate ? commonFormat(labelTemplate, item) : toBeString(item);
        });
        text = text.join(separator);
      } else {
        text = JSON.stringify(value, null, 2);
      }
    } else if (isDict(value)) {
      if (!isBlank(labelTemplate) && !showOrigin) {
        text = commonFormat(labelTemplate, value);
      } else {
        text = JSON.stringify(value, null, 2);
      }
    } else {
      text = toBeString(value);
    }
    return text;
  }, [value, labelTemplate, separator, showOrigin]);

  return (
    <div style={style} className={className}>
      <p style={{ whiteSpace: "pre-wrap" }}>
        <span>{shortConf.shortText}</span>
        {(shortConf.showMore || shortConf.showEye) && (
          <>
            <Button
              size="small"
              type="link"
              onClick={() => {
                setVisible(true);
                if (shortConf.showEye && !shortConf.showMore) {
                  // 若是没有更多，则展示原始数据
                  setShowOrigin(true);
                }
              }}
            >
              <EllipsisOutlined />
              {isArray(value) || isString(value) ? <span style={{ color: tipColor }}>(长度 {value.length})</span> : ""}
            </Button>
          </>
        )}
      </p>
      <Modal
        title={
          <span>
            {antdModalProps?.title || "查看详情"}
            {shortConf.showEye && (
              <Button
                style={{ marginLeft: 4 }}
                type="link"
                icon={showOrigin ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => setShowOrigin((oldV) => !oldV)}
              />
            )}
          </span>
        }
        onCancel={() => setVisible(false)}
        footer={null}
        {...antdModalProps}
        open={visible}
      >
        <p style={{ whiteSpace: "pre-wrap" }}>{realText}</p>
      </Modal>
    </div>
  );
};

LongText.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,
  value: PropTypes.any,
  // value为数组时，maxLength为数组长度； 其他情况为字符串长度
  maxLength: PropTypes.number,
  separator: PropTypes.string,
  labelTemplate: PropTypes.string,

  antdModalProps: PropTypes.object,
};

export default LongText;

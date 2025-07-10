import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Space, Tag } from "antd";
import { dequal as deepEqual } from "dequal";
import { READ_ONLY_CLASS } from "src/common/constants";
import { transformValue } from "src/common/parser";
import { isArray, isBasicType, isBlank, isDict, isEmpty, isFunction } from "src/common/typeTools";
import { useDeepCompareMemoize } from "src/hooks";
import CopyView from "../CopyView";

const oldTagProps = { color: "error", style: { textDecoration: "line-through" } };
const newTagProps = { color: "success" };

const CompareEdit = ({
  children,
  style,
  className,
  value,
  onChange,

  historyValue,
  labelTemplate,
  emptyLabel = "(空)",
  enableCopy = false,

  fieldValue = "value",
  options,

  disabled = false,
  readOnly = false,
  antdSpaceProps,
}) => {
  const [innerValue, setInnerValue] = useState(value);
  const [hisValue, setHisValue] = useState();

  useEffect(() => {
    setHisValue((oldV) => (deepEqual(oldV, historyValue) ? oldV : historyValue));
  }, [historyValue]);

  const memOptions = useDeepCompareMemoize(options);

  const compareResult = useMemo(() => {
    let view = null;
    if (deepEqual(hisValue, innerValue)) {
      // 未修改
      return view;
    }
    // 是否允许比较
    let allowCompare = false;
    if (isBlank(hisValue) || isBlank(innerValue)) {
      // 空值时，认为可以比较
      allowCompare = true;
    } else if (isBasicType(hisValue) && isBasicType(innerValue)) {
      allowCompare = true;
    } else if (isDict(hisValue) && isDict(innerValue)) {
      allowCompare = true;
    } else if (isArray(hisValue) && isArray(innerValue)) {
      allowCompare = true;
    }
    if (!allowCompare) {
      // 不同类型
      return "修改前后数据类型不一致";
    }

    view = [];
    let count = 0;
    // 若是单个值，返回的是字典；若是多值，返回的是数组
    const oldItem = transformValue(hisValue, { options: memOptions, fieldValue, labelTemplate });
    const oldValues = isArray(oldItem) ? oldItem.map((item) => item.value) : [];
    const newItem = transformValue(innerValue, { options: memOptions, fieldValue, labelTemplate });
    const newValues = isArray(newItem) ? newItem.map((item) => item.value) : [];

    // 历史值
    if (isArray(oldItem)) {
      // 数组
      oldItem.forEach((item) => {
        if (isEmpty(newValues) || !newValues.includes(item.value)) {
          // 被删除的
          view.push(
            <Tag {...oldTagProps} key={`${count++}`}>
              {enableCopy ? <CopyView value={item.value}>{item.label}</CopyView> : item.label}
            </Tag>
          );
        } else if (readOnly) {
          // 未修改，仅在只读时展示
          view.push(
            <Tag key={`${count++}`}>
              {enableCopy ? <CopyView value={item.value}>{item.label}</CopyView> : item.label}
            </Tag>
          );
        }
      });
    } else if (isBlank(oldItem.label)) {
      // 空值
      view.push(
        <Tag {...oldTagProps} color="warning" key={`${count++}`}>
          {emptyLabel}
        </Tag>
      );
    } else {
      // 历史单个值
      view.push(
        <Tag {...oldTagProps} key={`${count++}`}>
          {enableCopy ? <CopyView value={oldItem.value}>{oldItem.label}</CopyView> : oldItem.label}
        </Tag>
      );
    }
    if (!readOnly) {
      // 可编辑时，不处理新值
      return view;
    }
    // 处理新值
    if (isArray(newItem)) {
      // 新增的值
      newItem
        .filter((item) => isEmpty(oldValues) || !oldValues.includes(item.value))
        .forEach((item) => {
          view.push(
            <Tag {...newTagProps} key={`${count++}`}>
              {enableCopy ? <CopyView value={item.value}>{item.label}</CopyView> : item.label}
            </Tag>
          );
        });
    } else if (isBlank(newItem.label)) {
      // 新增的空值不做处理，相当于是删除了所有旧值
      // view.push(
      //   <Tag {...newTagProps} key={`${count++}`}>
      //     {emptyLabel}
      //   </Tag>
      // );
    } else {
      view.push(
        <Tag {...newTagProps} key={`${count++}`}>
          {enableCopy ? <CopyView value={newItem.value}>{newItem.label}</CopyView> : newItem.label}
        </Tag>
      );
    }

    return view;
  }, [hisValue, innerValue, readOnly, emptyLabel, enableCopy, memOptions, fieldValue, labelTemplate]);

  return (
    <Space.Compact block direction="vertical" {...antdSpaceProps}>
      {!readOnly && (
        <div style={{ marginBottom: 10 }}>
          {React.cloneElement(children, {
            value,
            disabled,
            onChange: (val, ...args) => {
              setInnerValue((oldV) => (deepEqual(oldV, val) ? oldV : val));
              if (isFunction(onChange)) {
                onChange(val, ...args);
              }
            },
          })}
        </div>
      )}
      <div
        style={style}
        className={readOnly ? (className ? `${className} ${READ_ONLY_CLASS}` : READ_ONLY_CLASS) : className}
      >
        {compareResult}
      </div>
    </Space.Compact>
  );
};

CompareEdit.propTypes = {
  children: PropTypes.node,
  // 自定义样式
  style: PropTypes.object,
  // 自定义类名
  className: PropTypes.string,
  // 当前选中的值
  value: PropTypes.any,
  // 值变化时的回调函数
  onChange: PropTypes.func,
  // 历史值
  historyValue: PropTypes.any,
  // 格式化出来的显示 必须是唯一的，能够观察出来区别
  labelTemplate: PropTypes.string,
  // 从options中获取value
  fieldValue: PropTypes.string,
  // 当value是基础类型时，options用于格式化label
  options: PropTypes.array,
  emptyLabel: PropTypes.string,

  enableCopy: PropTypes.bool,
  disabled: PropTypes.bool,
  // 是否只读
  readOnly: PropTypes.bool,
  // Antd 组件原生属性
  antdSpaceProps: PropTypes.object,
};

export default CompareEdit;

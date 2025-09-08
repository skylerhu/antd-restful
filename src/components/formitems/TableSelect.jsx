import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { version as antdVersion, Button, Collapse, Space } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { dequal as deepEqual } from "dequal";
import { getShowTitle } from "src/common/parser";
import { isArray, isDict, isFunction } from "src/common/typeTools";
import RestTable from "src/components/RestTable";

const TableSelect = ({
  value,
  onChange,
  disabled = false,
  readOnly = false,
  expandSelected = true,
  rowKey = "id",
  columns = [],
  antdTableReadProps,
  antdTableProps,
  antdCollapseProps,
  titleTemplate = "选中 {count} 条数据",
  titleAggPath,
  antdSpaceProps,
  ...restProps
}) => {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    setSelectedKeys((oldv) => {
      let newV = [];
      if (isArray(value)) {
        newV = value.map((v) => v[rowKey]);
      }
      if (deepEqual(oldv, newV)) {
        return oldv;
      }
      return newV;
    });
    setSelectedRows((oldV) => {
      const newV = value || [];
      if (deepEqual(oldV, newV)) {
        return oldV;
      }
      return newV;
    });
  }, [value, rowKey]);

  const updateSelectedRows = useCallback(
    (keys, rows, deleteKey = null) => {
      const _keys = deleteKey ? keys.filter((k) => k !== deleteKey) : keys;
      if (deleteKey) {
        setSelectedKeys(oldV => oldV.filter((k) => k !== deleteKey));
      } else {
        setSelectedKeys(keys);
      }
      // 保留已选中的行
      let newRows = selectedRows.filter((item) => isDict(item) && _keys.includes(item[rowKey]));
      if (isArray(rows)) {
        const partKeys = newRows.map((item) => item[rowKey]);
        // 添加新选中的行
        const partRows = rows.filter(
          (item) => isDict(item) && !partKeys.includes(item[rowKey]) && _keys.includes(item[rowKey])
        );
        newRows = [...newRows, ...partRows];
      }
      if (deepEqual(newRows, selectedRows)) {
        return;
      }
      setSelectedRows(newRows);
      if (isFunction(onChange)) {
        onChange(newRows);
      }
    },
    [rowKey, onChange, selectedRows]
  );

  const onCancelSelected = useCallback(
    (record) => {
      updateSelectedRows(selectedKeys.filter((k) => k !== record[rowKey]));
    },
    [selectedKeys, rowKey, updateSelectedRows]
  );

  // 添加取消选择按钮
  const columensWithActions = useMemo(() => {
    let _columns = [...columns];
    if (!disabled && !readOnly) {
      _columns.push({
        title: "取消",
        key: "__actions",
        width: 80,
        render: (text, record) => {
          return (
            <Button
              icon={<CloseOutlined style={{ color: "red" }} />}
              type="text"
              onClick={() => onCancelSelected(record)}
            />
          );
        },
      });
    }
    return _columns;
  }, [columns, disabled, readOnly, onCancelSelected]);

  const rowSelection = useMemo(() => {
    if (disabled) {
      return undefined;
    }
    return {
      ...antdTableProps?.rowSelection,
      hideSelectAll: disabled || antdTableProps?.rowSelection?.hideSelectAll,
      preserveSelectedRowKeys: true, // 当数据被删除时仍然保留选项的 key
      selectedRowKeys: selectedKeys,
      onChange: (_selectedRowKeys, _selectedRows) => {
        updateSelectedRows(_selectedRowKeys, _selectedRows);
      },
      getCheckboxProps: (record) => ({
        disabled: disabled || record.disabled,
      }),
    };
  }, [disabled, antdTableProps?.rowSelection, selectedKeys, updateSelectedRows]);

  const title = useMemo(
    () => getShowTitle(selectedRows, titleTemplate, titleAggPath),
    [titleTemplate, titleAggPath, selectedRows]
  );

  const readOnlyView = useMemo(() => {
    const _props = { ...antdTableProps, ...antdTableReadProps };
    return (
      <RestTable
        {...restProps}
        tools={false}
        antdTableProps={_props}
        baseParams={{}}
        forceParams={{}}
        restful={null}
        dataSource={selectedRows}
        rowKey={rowKey}
        columns={columensWithActions}
      />
    );
  }, [selectedRows, rowKey, columensWithActions, restProps, antdTableProps, antdTableReadProps]);

  if (disabled || readOnly) {
    if (titleAggPath) {
      return (
        <div>
          <div style={{ lineHeight: "32px" }}>{title}</div>
          {readOnlyView}
        </div>
      );
    }
    return readOnlyView;
  }
  return (
    <Space.Compact block direction="vertical" {...antdSpaceProps} style={{ rowGap: 8, ...antdSpaceProps?.style }}>
      {antdVersion && antdVersion >= "5" ? (
        <Collapse
          defaultActiveKey={expandSelected ? "title" : undefined}
          {...antdCollapseProps}
          items={[
            {
              key: "title",
              label: title,
              children: readOnlyView,
            },
          ]}
        />
      ) : (
        <Collapse defaultActiveKey={expandSelected ? "title" : undefined} {...antdCollapseProps}>
          <Collapse.Panel key="title" header={title}>
            {readOnlyView}
          </Collapse.Panel>
        </Collapse>
      )}
      <RestTable
        tools={false}
        {...restProps}
        rowKey={rowKey}
        columns={columns}
        antdTableProps={{
          ...antdTableProps,
          rowSelection,
        }}
      />
    </Space.Compact>
  );
};

TableSelect.propTypes = {
  // 值仅支持 [{}] 格式
  value: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,

  // 禁用后只读
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  // 是否默认展开显示选中数据
  expandSelected: PropTypes.bool,

  rowKey: PropTypes.string,
  columns: PropTypes.array,

  // 选中数据标题模板, 必须包含 {count} 占位符，count表示选中个数
  titleTemplate: PropTypes.string,
  // 选中数据根据字段聚合统计显示在title上，titleTemplate中使用 {stat} 占位符
  titleAggPath: PropTypes.string,
  antdTableReadProps: PropTypes.object,
  antdTableProps: PropTypes.object,
  antdCollapseProps: PropTypes.object,
  antdSpaceProps: PropTypes.object,
};

export default TableSelect;

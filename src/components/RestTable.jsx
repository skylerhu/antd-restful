import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Col,
  Descriptions,
  Dropdown,
  Input,
  InputNumber,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  CloseOutlined,
  DownloadOutlined,
  NodeExpandOutlined,
  ReloadOutlined,
  SearchOutlined,
  SecurityScanOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { dequal as deepEqual } from "dequal";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, DEFAULT_ROWS_PATH, FieldType, FilterType } from "src/common/constants";
import {
  apiSorterToTableSorterDict,
  commonFormat,
  findDataByPath,
  genColumnKey,
  tableSorterToApiSorter,
  toBeString,
  transformFilters,
  genFields,
} from "src/common/parser";
import { commonFilter, commonSorter } from "src/common/sorter";
import { isArray, isBlank, isDict, isEmpty, isFunction, isString } from "src/common/typeTools";
import CopyView from "src/components/CopyView";
import FieldsSetting from "src/components/FieldsSetting";
import NumberRange from "src/components/formitems/NumberRange";
import RangeStrPicker from "src/components/formitems/RangeStrPicker";
import RestSelect from "src/components/formitems/RestSelect";
import GridForm from "src/components/GridForm";
import globalConfig from "src/config";
import { useDeepCompareMemoize, useInterval } from "src/hooks/index";
import { useSafeRequest } from "src/requests";

// 处理table表头中列的筛选
export const getColumnSearchProps = (dataIndex, column, inputRef) => {
  const { filterDropdownConfig: config } = column;
  // 处理数组转字符串的情况
  const handleValue = (v) => {
    let _value = v;
    if (isArray(v) && v.length > 0 && isString(v[0]) && v[0].includes(",")) {
      _value = v[0].split(",");
    }
    return _value;
  };
  const _props = {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
      let searchItem = null;
      const placeholder = config.dropdownProps?.placeholder || "输入搜索";
      switch (config.type) {
        case FieldType.INPUT: {
          searchItem = (
            <Input
              allowClear={true}
              {...config.dropdownProps}
              placeholder={placeholder}
              ref={(node) => (inputRef = node)}
              value={selectedKeys}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => confirm()}
            />
          );
          break;
        }
        case FieldType.NUMBER: {
          searchItem = (
            <InputNumber
              {...config.dropdownProps}
              placeholder={placeholder}
              value={selectedKeys}
              onChange={(v) => setSelectedKeys(isBlank(v) ? [] : [v])}
              onPressEnter={() => confirm()}
            />
          );
          break;
        }
        case FieldType.NUMBER_RANGE: {
          let _value = handleValue(selectedKeys);
          searchItem = (
            <NumberRange
              {...config.dropdownProps}
              placeholder={placeholder}
              value={_value}
              onChange={(v) => setSelectedKeys(isBlank(v) ? [] : isArray(v) ? v : [v])}
              onPressEnter={() => confirm()}
            />
          );
          break;
        }
        case FieldType.DATE_RANGE_PICKER: {
          let _value = handleValue(selectedKeys);
          searchItem = (
            <RangeStrPicker
              {...config.dropdownProps}
              placeholder={placeholder}
              value={_value}
              onChange={(v) => setSelectedKeys(isBlank(v) ? [] : isArray(v) ? v : [v])}
              onPressEnter={() => confirm()}
            />
          );
          break;
        }
        case FieldType.SELECT: {
          const isMultiple = config.dropdownProps?.mode === "multiple";
          let _value = isMultiple ? handleValue(selectedKeys) : selectedKeys;
          searchItem = (
            <RestSelect
              style={{ width: "100%", minWidth: 100 }}
              {...config.dropdownProps}
              value={_value}
              onChange={(value) => {
                const keys = isBlank(value) ? [] : isArray(value) ? value : [value];
                setSelectedKeys(keys);
                if (!isMultiple) {
                  // 单选时，直接确认
                  confirm();
                }
              }}
            />
          );
          break;
        }
        default:
          break;
      }
      if (!searchItem) {
        return undefined;
      }
      const direction = config.antdSpaceProps?.direction || "vertical";
      const view = (
        <Space style={{ padding: 8, ...config.style }} {...config.antdSpaceProps} direction={direction}>
          {searchItem}
          <Row gutter={10}>
            {direction === "vertical" ? (
              <>
                <Col span={12}>
                  <Button
                    size="small"
                    style={{ width: "100%" }}
                    onClick={() => {
                      clearFilters();
                      confirm();
                    }}
                  >
                    重置
                  </Button>
                </Col>
                <Col span={12}>
                  <Button type="primary" size="small" style={{ width: "100%" }} onClick={() => confirm()}>
                    搜索
                  </Button>
                </Col>
              </>
            ) : (
              <>
                <Col span={24}>
                  <Button type="primary" size="small" style={{ width: "100%" }} onClick={() => confirm()}>
                    搜索
                  </Button>
                </Col>
              </>
            )}
          </Row>
        </Space>
      );
      return view;
    },
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined, padding: "0 5px" }} />,
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (config.type === FieldType.INPUT && visible) {
          // 让输入框聚焦
          setTimeout(() => {
            if (inputRef) {
              inputRef.select();
            }
          }, 100);
        }
      },
    },
  };
  return _props;
};

export const renderRowLabel = (record, column) => {
  let label;
  if (column.fieldName) {
    // 用真实字段值
    label = findDataByPath(record, column.fieldName);
  } else {
    label = record[genColumnKey(column)];
  }
  if (isEmpty(label)) {
    return label;
  }
  // 处理显示的值, 转换成数组方便统一处理
  let data = label;
  let copyV; // 复制值
  if (!isArray(label)) {
    data = [label];
    if (column.copyProps) {
      copyV = column.copyField && isDict(label) ? label[column.copyField] : label;
    }
  } else {
    if (column.copyProps) {
      copyV = label.map((d) => (column.copyField && isDict(d) ? d[column.copyField] : d));
    }
  }
  let show = data.map((d, i) => {
    // 格式化label
    let _label = commonFormat(column.labelTemplate, d);
    if (column.showTag) {
      // 按照Tag展示
      _label = (
        <Tag color="blue" key={i}>
          {_label}
        </Tag>
      );
    }
    return _label;
  });
  if (!column.showTag) {
    // 按照逗号展示
    show = toBeString(show, ",", 1);
  }
  if (column.copyProps) {
    // 复制值
    show = (
      <CopyView {...column.copyProps} value={copyV}>
        {show}
      </CopyView>
    );
  }
  return show;
};

const RestTable = forwardRef(
  (
    {
      style,
      className,

      restful,
      reqConfig,
      parseOptions,
      urlDetailTemplate,
      baseParams,
      routeParams,
      forceParams,
      fieldPage = "page",
      fieldPageSize = "page_size",
      defaultPageSize = DEFAULT_PAGE_SIZE,
      fieldOrdering = "ordering",
      parseRowsPath = DEFAULT_ROWS_PATH,
      parseTotalPath = "count",
      isActive = true,
      tools = true,
      extraTools,
      showHeaderTags = false,
      onDataSourceChange,
      onFiltersChange,

      rowKey = "id",
      columns,
      expandFieldPath,
      expandAntdProps,
      expandedAllRows = false,
      dataSource,
      antdTableProps,
      filterFormProps,
      antdSpaceProps,
    },
    ref
  ) => {
    const [makeRequest] = useSafeRequest();
    const reqConfigRef = useRef(reqConfig);
    const memParseOptions = useDeepCompareMemoize(parseOptions);

    const [loading, setLoading] = useState(false);
    // table数据源
    const [innerData, setInnerData] = useState({
      total: 0,
      dataSource: [],
    });

    // 表单筛选条件
    const filterFormRef = useRef();

    // 筛选参数，优先级从低到高，innerFilters 是最终用于请求的筛选条件
    // 基础参数
    const memBaseParams = useDeepCompareMemoize(baseParams);
    // 路由参数
    const memRouteParams = useDeepCompareMemoize(routeParams);
    // table内置header上的筛选条件
    const [headerFilters, setHeaderFilters] = useState({});
    const [formFilters, setFormFilters] = useState({});
    // 强制参数
    const memForceParams = useDeepCompareMemoize(forceParams);
    // 真实用于请求的筛选条件
    const [innerFilters, setInnerFilters] = useState({});

    // 标记字段 是否开启了 多选，用于处理query参数转化成数组
    const [multipleMap, setMultipleMap] = useState({});

    // 默认开启高级搜索和列显示隐藏设置
    const innerTools = useDeepCompareMemoize(
      tools ? Object.assign({ advancedSearch: true, refreshInterval: 0, settings: true }, tools) : {}
    );
    const [enableAdvancedSearch, setEnableAdvancedSearch] = useState(filterFormProps?.advancedSearch || false);
    const [enableRefresh, setEnableRefresh] = useState(innerTools.refreshInterval > 0);
    // 控制显示的表单字段
    const [filterFieldKeys, setFilterFieldKeys] = useState([]);
    // 控制显示的列
    const [showColumnsKeys, setShowColumnsKeys] = useState([]);

    // 因为有未使用 FieldsSettings的场景，所以不能直接使用 value 作为设置的值设置, 无法监听columns的变化
    const onToolsFilterChange = useCallback((_, keys) => {
      setFilterFieldKeys(keys);
    }, []);
    const onToolsSettingsChange = useCallback((_, keys) => {
      setShowColumnsKeys(keys);
    }, []);

    const filterFields = useMemo(() => genFields(filterFormProps?.fields, filterFieldKeys), [filterFormProps?.fields, filterFieldKeys]);
    const showColumns = useMemo(() => genFields(columns, showColumnsKeys), [columns, showColumnsKeys]);

    useEffect(() => {
      if (isArray(dataSource)) {
        setInnerData((oldV) => {
          const newV = { dataSource, total: dataSource?.length };
          return deepEqual(oldV, newV) ? oldV : newV;
        });
      }
    }, [dataSource]);

    useEffect(() => {
      if (isFunction(onDataSourceChange)) {
        onDataSourceChange(innerData);
      }
    }, [innerData, onDataSourceChange]);

    // setMultipleMap
    useEffect(() => {
      setMultipleMap((oldV) => {
        const newV = columns.reduce((acc, column) => {
          const field = column.dataIndex || column.key;
          if (column.filterMultiple === undefined) {
            if (column.filters) {
              // 如果开启了刷选，则默认是多选; 是table原生决定的
              acc[field] = true;
            }
          } else {
            acc[field] = column.filterMultiple;
          }
          return acc;
        }, {});
        return deepEqual(oldV, newV) ? oldV : newV;
      });
    }, [columns]);

    const pageSize = useMemo(() => {
      return parseInt(innerFilters[fieldPageSize] || defaultPageSize);
    }, [innerFilters, fieldPageSize, defaultPageSize]);

    const pageSizeOptions = useMemo(() => {
      let opts = antdTableProps?.pagination?.pageSizeOptions || [10, 20, 50, 100];
      let change = false;
      if (!opts.includes(pageSize)) {
        change = true;
        opts.push(pageSize);
      }
      if (!opts.includes(defaultPageSize)) {
        change = true;
        opts.push(defaultPageSize);
      }
      if (memBaseParams && memBaseParams[fieldPageSize] && !opts.includes(memBaseParams[fieldPageSize])) {
        change = true;
        opts.push(memBaseParams[fieldPageSize]);
      }
      if (change) {
        opts.sort((a, b) => a - b);
      }
      return opts;
    }, [pageSize, defaultPageSize, antdTableProps?.pagination?.pageSizeOptions, memBaseParams, fieldPageSize]);

    // setInnerFilters
    useEffect(() => {
      setInnerFilters((oldV) => {
        // 几个赋值顺序不要随意变动
        // basePrarams 优先级最低，可以被 route和headerFilters操作覆盖
        // routeParams 优先级次之，可以被 headerFilters 用户操作覆盖
        // formFilters 一般不与 headerFilters 同时使用, 至少表单key没有重叠的部分
        // forceParams 优先级最高，是用户手动设置的，不会被其他参数覆盖
        let newV = {
          // [fieldPage]: DEFAULT_PAGE,
          // [fieldPageSize]: defaultPageSize,
          ...memBaseParams,
          ...memRouteParams,
          ...headerFilters,
          ...formFilters,
          ...memForceParams,
        };
        // 避免传递过来空字符串的情况
        newV[fieldPage] = newV[fieldPage] || DEFAULT_PAGE;
        newV[fieldPageSize] = newV[fieldPageSize] || defaultPageSize;
        newV = transformFilters(newV, { skipEmpty: true, multipleMap });
        if (deepEqual(oldV, newV)) {
          return oldV;
        }
        return newV;
      });
    }, [
      fieldPage,
      fieldPageSize,
      defaultPageSize,
      memBaseParams,
      memRouteParams,
      memForceParams,
      headerFilters,
      multipleMap,
      formFilters,
    ]);

    const filterFormKeys = useDeepCompareMemoize(
      filterFormProps?.fields?.map((field) => ({
        key: field.key,
        type: field.type,
      })) || []
    );

    // 更新筛选表单的值
    useEffect(() => {
      if (filterFormRef.current) {
        const values = {};
        filterFormKeys.forEach((field) => {
          let v = memRouteParams ? memRouteParams[field.key] : undefined;
          if (v === undefined) {
            v = memBaseParams ? memBaseParams[field.key] : undefined;
          }
          if (v === undefined) {
            // 需要重置表单的值
            values[field.key] = null;
          } else {
            values[field.key] = v;
          }
          if (field.type && [FieldType.CHECKBOX, FieldType.RADIO].includes(field.type) && isBlank(values[field.key])) {
            // 为了能够正确显示“全部”选项
            values[field.key] = "";
          }
        });
        delete values[fieldPage];
        delete values[fieldPageSize];

        if (innerTools.advancedSearch) {
          const noEmptyKeys = Object.keys(values).filter((key) => !isBlank(values[key]));
          if (noEmptyKeys.length > 1) {
            // 如果多个表单有值，则开启高级搜索
            setEnableAdvancedSearch(true);
          }
        }
        if (isEmpty(values)) {
          filterFormRef.current.getFormInstance().resetFields();
        } else {
          filterFormRef.current.getFormInstance().setFieldsValue(values);
        }
        setFormFilters((oldV) => (deepEqual(oldV, values) ? oldV : values));
      }
    }, [memRouteParams, memBaseParams, filterFormKeys, fieldPage, fieldPageSize, innerTools.advancedSearch]);

    // 处理筛选条件变化 onFiltersChange
    useEffect(() => {
      if (!innerFilters[fieldPage] || !innerFilters[fieldPageSize]) {
        // 因为page_size一定会赋予默认值，避免首次会多次触发回调
        return;
      }
      if (isFunction(onFiltersChange)) {
        const filters = {
          ...innerFilters,
        };
        // 删除默认值
        if (filters[fieldPage] === DEFAULT_PAGE) {
          delete filters[fieldPage];
        }
        if (memBaseParams && memBaseParams[fieldPageSize]) {
          if (filters[fieldPageSize] === memBaseParams[fieldPageSize]) {
            delete filters[fieldPageSize];
          }
        } else {
          if (filters[fieldPageSize] === defaultPageSize) {
            delete filters[fieldPageSize];
          }
        }
        // forceParams 会覆盖其他参数，去掉相同key的
        if (memForceParams) {
          Object.keys(memForceParams).forEach((key) => {
            // 直接删除，肯定相等
            delete filters[key];
          });
        }
        // baseParams 相同值的可以去掉
        if (memBaseParams) {
          Object.keys(memBaseParams).forEach((key) => {
            if (deepEqual(filters[key], memBaseParams[key])) {
              delete filters[key];
            }
          });
        }
        onFiltersChange(filters);
      }
    }, [fieldPage, fieldPageSize, defaultPageSize, memBaseParams, memForceParams, innerFilters, onFiltersChange]);

    // 请求远端数据
    const fetchData = useCallback(() => {
      if (!isActive || !restful) {
        return;
      }
      setLoading(true);
      const _config = {
        params: innerFilters,
        ...reqConfigRef.current,
      };
      if (memParseOptions) {
        _config.paramsSerializer = (p) => globalConfig.queryStringify(p, memParseOptions);
      }
      makeRequest({ delay: 200, key: `resttable` })
        .get(restful, _config)
        .then((response) => {
          const data = findDataByPath(response.data, parseRowsPath);
          const _total = findDataByPath(response.data, parseTotalPath);
          setInnerData({ dataSource: data, total: _total || 0 });
        })
        .finally(() => {
          setLoading(false);
        });
    }, [isActive, makeRequest, restful, parseRowsPath, parseTotalPath, innerFilters, memParseOptions]);

    useEffect(() => {
      if (!innerFilters[fieldPage]) {
        // 因为page_size一定会赋予默认值，避免首次会多请求一次
        return;
      }
      fetchData();
    }, [innerFilters, fetchData, fieldPage]);

    const [runInterval] = useInterval(() => fetchData(), innerTools.refreshInterval, innerTools.refreshInterval > 0);
    // 删除行
    const deleteRow = useCallback(
      (row) => {
        if (!restful || !row[rowKey]) {
          return;
        }
        setLoading(true);
        let url;
        if (urlDetailTemplate) {
          url = commonFormat(urlDetailTemplate, row);
        } else {
          if (restful.endsWith("/")) {
            url = `${restful}${row[rowKey]}/`;
          } else {
            url = `${restful}/${row[rowKey]}`;
          }
        }
        makeRequest()
          .delete(url)
          .then(() => {
            // 删除成功后，刷新数据
            fetchData();
          })
          .catch(() => {
            setLoading(false);
          });
      },
      [rowKey, restful, urlDetailTemplate, fetchData, makeRequest]
    );

    // 暴露给ref调用的方法
    useImperativeHandle(
      ref,
      () => ({
        refreshList: fetchData,
        deleteRow,
      }),
      [fetchData, deleteRow]
    );

    const columnSearchViewRef = useRef(null);

    // 处理table的cloumns
    const memColumns = useMemo(() => {
      const sorterDict = apiSorterToTableSorterDict(innerFilters[fieldOrdering]);
      const arr = showColumns
        .filter((item) => !item.expandable && !item.hidden)
        .map((column) => {
          // 获取唯一字段; antd默认dataIndex优先，但其取值可能是数组，不能作为key使用
          const field = genColumnKey(column);
          let newCloumn = { ...column };
          if (newCloumn.hidden) {
            // 隐藏的字段后续无需处理
            return newCloumn;
          }
          if (!newCloumn.render && (column.labelTemplate || !isEmpty(column.copyProps) || column.fieldName)) {
            // 转换为render函数，处理显示的值
            newCloumn.render = (value, record) => renderRowLabel(record, column);
          }
          if (column.sorter) {
            // 设置是降序还是升序
            newCloumn.sortOrder = sorterDict[field];
            if (!restful && column.sorter === true) {
              if (column.fieldName) {
                // 如果未开启restful，且配置的是bool值，开启本地排序
                newCloumn.sorter = (a, b) =>
                  commonSorter(findDataByPath(a, column.fieldName), findDataByPath(b, column.fieldName));
              } else {
                // 又因为配置的dataIndex并不一定是record里的field，所以无法正确排序
                delete newCloumn.sorter;
              }
            }
          }
          if (restful) {
            if (column.filterDropdownConfig) {
              delete newCloumn.dropdownLocalConfig;
              newCloumn = {
                ...newCloumn,
                ...getColumnSearchProps(field, newCloumn, columnSearchViewRef.current),
              };
              delete newCloumn.filterDropdownConfig;
            }
          } else {
            if (!newCloumn.onFilter && (newCloumn.filters || column.dropdownLocalConfig)) {
              const fieldName = column.dropdownLocalConfig?.fieldName || column.fieldName || field;
              if (fieldName) {
                newCloumn = {
                  ...newCloumn,
                  ...getColumnSearchProps(
                    field,
                    {
                      ...column,
                      filterDropdownConfig: { type: FieldType.INPUT, ...column.dropdownLocalConfig },
                    },
                    columnSearchViewRef.current
                  ),
                };
                // 支持本地筛选
                newCloumn.onFilter = (input, record) => {
                  const v = findDataByPath(record, fieldName);
                  let _filterType = column.dropdownLocalConfig?.filterType || FilterType.SEARCH;
                  if (!isEmpty(column.filters)) {
                    // 如果配置了精确筛选，则使用精确筛选
                    _filterType = FilterType.EQUAL;
                  }
                  return commonFilter(input, v, { filterType: _filterType });
                };
              } else {
                // 因为 dataIndex 可能不是 record 里的 field，所以无法正确处理筛选
                delete newCloumn.onFilter;
                delete newCloumn.filters;
                delete newCloumn.filterDropdown;
              }
              delete newCloumn.dropdownLocalConfig;
              delete newCloumn.filterDropdownConfig;
            }
          }

          // 初始刷选值
          newCloumn.filteredValue = [];
          if (newCloumn.filterDropdown !== undefined || newCloumn.filters !== undefined) {
            // 开启了刷选的字段
            let value = innerFilters[field];
            // 不是数组需要转成数组
            if (isBlank(value)) {
              value = [];
            } else if (!isArray(value)) {
              value = [value];
            }
            newCloumn.filteredValue = value;
          }
          return newCloumn;
        });
      return arr.filter((item) => !item.hidden);
    }, [innerFilters, fieldOrdering, showColumns, restful]);

    // 表头上的筛选条件，按照Tags的形式都展示出来
    const headerTags = useMemo(() => {
      if (!showHeaderTags) {
        return [];
      }
      const arr = showColumns
        .filter(
          (column) => !column.hidden && (column.filterDropdownConfig || column.dropdownLocalConfig || column.filters)
        )
        .map((column) => {
          let field = genColumnKey(column);
          const v = innerFilters[field];
          return { key: field, value: toBeString(v, ",", 1), label: column.title || field };
        })
        .filter((item) => !isEmpty(item.value));
      return arr;
    }, [innerFilters, showColumns, showHeaderTags]);

    // 展开的列
    const memExpandableColumns = useMemo(() => {
      return showColumns.filter((item) => item.expandable && !item.hidden);
    }, [showColumns]);
    const [isExpandedAll, setIsExpandedAll] = useState(expandedAllRows || innerTools.expandedAllRows);
    const [expandedRows, setExpandedRows] = useState();
    useEffect(() => {
      if (isExpandedAll) {
        setExpandedRows(innerData.dataSource.map((row) => row[rowKey]));
      } else {
        setExpandedRows([]);
      }
    }, [innerData.dataSource, rowKey, isExpandedAll]);

    const expandableProps = useMemo(() => {
      if (memExpandableColumns.length === 0) {
        return antdTableProps?.expandable;
      }
      return {
        expandedRowRender: (record) => {
          return (
            <Descriptions {...expandAntdProps}>
              {memExpandableColumns.map((column) => {
                const _key = genColumnKey(column);
                return (
                  <Descriptions.Item key={_key} {...column.expandItemProps} label={column.title}>
                    {renderRowLabel(record, column)}
                  </Descriptions.Item>
                );
              })}
            </Descriptions>
          );
        },
        rowExpandable: (record) => !expandFieldPath || findDataByPath(record, expandFieldPath),
        expandedRowKeys: expandedRows,
        onExpandedRowsChange: (rowKeys) => {
          setExpandedRows(rowKeys);
        },
        ...antdTableProps?.expandable,
      };
    }, [memExpandableColumns, antdTableProps?.expandable, expandAntdProps, expandFieldPath, expandedRows]);

    // 处理table的onChange事件
    const onTableChange = useCallback(
      (pagination, filters, sorter) => {
        // filters是字典，但是 对应的值都是数组
        // sorter是字典，table一般只允许一列进行排序
        const _filters = {
          ...filters,
          [fieldPage]: pagination.current,
          [fieldPageSize]: pagination.pageSize,
        };
        const ordering = tableSorterToApiSorter(sorter);
        // 为空的时候也要赋值，需要覆盖routeParams，触发路由变更
        _filters[fieldOrdering] = ordering;
        setHeaderFilters(_filters);
      },
      [fieldPage, fieldPageSize, fieldOrdering]
    );

    // 生成下载链接
    const genDownloadUrl = useCallback(
      (isAll = false) => {
        if (!restful || !innerTools.downloadKey) {
          return "";
        }
        let url = restful;
        const query = { ...innerFilters, [innerTools.downloadKey]: 1 };
        if (isAll) {
          delete query[fieldPage];
          delete query[fieldPageSize];
        }
        if (isString(innerTools.downloadKey)) {
          query[innerTools.downloadKey] = 1;
        } else {
          query._download = 1;
        }
        const search = globalConfig.queryStringify(query);
        if (search) {
          url += `?${search}`;
        }
        return url;
      },
      [restful, innerFilters, fieldPage, fieldPageSize, innerTools.downloadKey]
    );

    const hasHeader = useMemo(() => {
      if (!isEmpty(innerTools) || extraTools) {
        return true;
      }
      if (restful && !isEmpty(filterFormProps)) {
        return true;
      }
      return false;
    }, [innerTools, extraTools, filterFormProps, restful]);

    return (
      <Space direction="vertical" {...antdSpaceProps} style={{ width: "100%", ...antdSpaceProps?.style }}>
        {hasHeader && (
          <div style={{ position: "relative" }} className="cls-resttable-header">
            {restful && filterFormProps && (
              <Spin spinning={loading}>
                <GridForm
                  key="filterForm"
                  submitTitle="搜索"
                  enablePlaceholder={!isEmpty(innerTools) || extraTools}
                  {...filterFormProps}
                  fields={filterFields}
                  initialValues={{ ...memBaseParams, ...filterFormProps?.initialValues }}
                  advancedSearch={enableAdvancedSearch}
                  ref={filterFormRef}
                  onSubmit={(values) => {
                    setHeaderFilters((oldV) => {
                      return { ...oldV, [fieldPage]: 1 };
                    });
                    setFormFilters((oldV) => {
                      if (deepEqual(oldV, values)) {
                        // 数据没有变更刷新列表
                        fetchData();
                        return oldV;
                      }
                      return values;
                    });
                  }}
                  onReset={(values) => {
                    setHeaderFilters((oldV) => {
                      return { ...oldV, [fieldPage]: 1 };
                    });
                    setFormFilters((oldV) => {
                      if (deepEqual(oldV, values)) {
                        // 数据没有变更刷新列表
                        fetchData();
                        return oldV;
                      }
                      return values;
                    });
                  }}
                />
              </Spin>
            )}
            {(!isEmpty(innerTools) || extraTools) && (
              <div
                style={{ position: "absolute", right: 10, bottom: 15 }}
                className="cls-resttable-tools"
              >
                <Space key="tools">
                  {extraTools}
                  {innerTools.expandedAllRows !== undefined && memExpandableColumns.length > 0 && (
                    <Tooltip title={isExpandedAll ? "收起所有行" : "展开所有行"}>
                      <Button
                        icon={<NodeExpandOutlined />}
                        type={isExpandedAll ? "primary" : undefined}
                        onClick={() => {
                          setIsExpandedAll((oldV) => !oldV);
                        }}
                      />
                    </Tooltip>
                  )}
                  {restful && innerTools.refreshInterval >= 0 && (
                    <Tooltip
                      title={
                        innerTools.refreshInterval > 0
                          ? enableRefresh
                            ? `点击关闭 ${innerTools.refreshInterval}ms 刷新`
                            : `开启间隔 ${innerTools.refreshInterval}ms 刷新`
                          : "点击刷新"
                      }
                    >
                      <Button
                        icon={<ReloadOutlined />}
                        type={enableRefresh && innerTools.refreshInterval > 0 ? "primary" : undefined}
                        onClick={() => {
                          const v = !enableRefresh;
                          setEnableRefresh(v);
                          runInterval(v && innerTools.refreshInterval > 0);
                        }}
                      />
                    </Tooltip>
                  )}
                  {restful && innerTools.downloadKey && (
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: "download_current",
                            label: (
                              <Button href={genDownloadUrl(false)} type="link" target="blank" size="small">
                                导出当前页
                              </Button>
                            ),
                          },
                          {
                            key: "download_all",
                            label: (
                              <Button href={genDownloadUrl(true)} type="link" target="blank" size="small">
                                导出全部数据
                              </Button>
                            ),
                          },
                        ],
                      }}
                      placement="bottom"
                    >
                      <Button icon={<DownloadOutlined />} />
                    </Dropdown>
                  )}
                  {restful && filterFormProps && innerTools.advancedSearch && (
                    <FieldsSetting
                      value={filterFormProps.fields}
                      title="设置搜索选项"
                      storageKey={isString(innerTools.advancedSearch) ? innerTools.advancedSearch : `${restful}-filter`}
                      onChange={onToolsFilterChange}
                    >
                      <Button icon={<SecurityScanOutlined />} />
                    </FieldsSetting>
                  )}
                  {innerTools.settings && (
                    <FieldsSetting
                      value={columns}
                      title="设置列显示"
                      storageKey={isString(innerTools.settings) ? innerTools.settings : `${restful}-settings`}
                      onChange={onToolsSettingsChange}
                    >
                      <Button icon={<SettingOutlined />} />
                    </FieldsSetting>
                  )}
                </Space>
              </div>
            )}
          </div>
        )}
        {headerTags.length > 0 && (
          <div className="cls-resttable-header-tags">
            {headerTags.map((item) => {
              return (
                <Tag
                  key={item.key}
                  closable={true}
                  closeIcon={<CloseOutlined />}
                  onClose={() => {
                    setHeaderFilters((oldV) => {
                      return { ...oldV, [item.key]: null };
                    });
                  }}
                >
                  <span style={{ color: "#8c8c8c" }} className="cls-resttable-header-tag-label">
                    {item.label}:{" "}
                  </span>
                  <span
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
                    className="cls-resttable-header-tag-value"
                  >
                    {item.value}
                  </span>
                </Tag>
              );
            })}
            <Button
              type="link"
              size="small"
              style={{ fontSize: 12 }}
              onClick={() => {
                setHeaderFilters((oldV) => {
                  const newV = { ...oldV };
                  headerTags.forEach((item) => {
                    newV[item.key] = null;
                  });
                  return newV;
                });
              }}
            >
              清除
            </Button>
          </div>
        )}
        <Table
          style={style}
          className={className}
          {...antdTableProps}
          loading={loading}
          rowKey={rowKey}
          columns={memColumns}
          dataSource={innerData.dataSource}
          pagination={{
            size: "small",
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => {
              return <span>总计：{total} 条</span>;
            },
            pageSizeOptions,
            ...antdTableProps?.pagination,
            current: innerFilters[fieldPage],
            pageSize: innerFilters[fieldPageSize],
            // 若未开启restful，则不设置总计，否则开启了本地筛选无法正确展示showTotal
            total: restful ? innerData.total : undefined,
          }}
          onChange={(pagination, filters, sorter, extra) => {
            onTableChange(pagination, filters, sorter);
            if (isFunction(antdTableProps?.onChange)) {
              antdTableProps.onChange(pagination, filters, sorter, extra);
            }
          }}
          expandable={expandableProps}
        />
      </Space>
    );
  }
);

RestTable.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,

  restful: PropTypes.string,
  reqConfig: PropTypes.object,
  // 处理query参数的选项, query-string 的配置项
  parseOptions: PropTypes.object,
  urlDetailTemplate: PropTypes.string,
  baseParams: PropTypes.object,
  // 有了baseParams，还需要routeParams，是为了处理默认参数(baseParams)不显示在地址栏的问题
  // routeParams与地址栏query参数对应，在使用该组件赋值时需要去掉与baseParams重复的参数
  routeParams: PropTypes.object,
  // 无论路由参数、表单参数是否变化，都会被改值覆盖
  forceParams: PropTypes.object,
  fieldPage: PropTypes.string,
  fieldPageSize: PropTypes.string,
  defaultPageSize: PropTypes.number,
  fieldOrdering: PropTypes.string,
  parseRowsPath: PropTypes.string,
  parseTotalPath: PropTypes.string,
  // 是否展示表头上的筛选条件
  showHeaderTags: PropTypes.bool,
  // 是否激活，如果为false，则不更新数据; 主要在Tab组件中使用
  isActive: PropTypes.bool,
  // 工具栏的配置
  tools: PropTypes.oneOfType([
    PropTypes.shape({
      // 开启高级搜索，默认会开启
      advancedSearch: PropTypes.bool,
      // 下载的key，如果为true，则使用默认的 _download
      downloadKey: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      // 刷新数据的间隔，单位 ms，小于0时隐藏刷新按钮，等于0时手动刷新，大于0时自动刷新
      refreshInterval: PropTypes.number,
      // 默认开启列显示隐藏设置, 配置存储localStorage的key, 如果为true，则使用restful的值作为key; 当clumns配置列的key发生改动时，之前的设置会失效
      settings: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
      expandedAllRows: PropTypes.bool,
    }),
    PropTypes.bool,
  ]),
  // 其他工具
  extraTools: PropTypes.node,

  onFiltersChange: PropTypes.func,
  onDataSourceChange: PropTypes.func,

  rowKey: PropTypes.string,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      // 若是某列是字典，可以用此模板格式化显示
      labelTemplate: PropTypes.string,
      // 用于配置字段展示，可配合labelTemplate使用
      fieldName: PropTypes.string,
      // 开启复制功能
      copyProps: PropTypes.object,
      // 如果某列根据dataIndex获取到的是字典，则需要指定字段中某个字段值用于copy
      copyField: PropTypes.string,
      // 是否按照Tag展示，数据是数组时有用
      showTag: PropTypes.bool,
      // 下来筛选自定义view的设置
      filterDropdownConfig: PropTypes.shape({
        style: PropTypes.object,
        // 可以控制输入组件和按钮的排列位置
        antdSpaceProps: PropTypes.object,
        type: PropTypes.oneOf(FieldType.map((o) => o.value)),
        dropdownProps: PropTypes.object,
      }),
      // 标记字段开启了多值筛选，处理query参数转化成数组
      filterMultiple: PropTypes.bool,
      // 禁用restful下，开启下拉选择的配置; 非restful情况下会覆盖 filterDropdownConfig
      dropdownLocalConfig: PropTypes.shape({
        // 配置本地筛选字段，比外层配置优先级高
        fieldName: PropTypes.string,
        filterType: PropTypes.oneOf(FilterType.map((o) => o.value)),
      }),
      // 是否默认显示
      hidden: PropTypes.bool,
      // 是否开启排序，得配置 dataIndex 字段
      sorter: PropTypes.bool,
      // 是否开启展开功能
      expandable: PropTypes.bool,
      expandableItemProps: PropTypes.object,
    })
  ).isRequired,
  // 设置是否开启展开功能的字段
  expandFieldPath: PropTypes.string,
  expandAntdProps: PropTypes.object,
  // 未启用tools时也可以配置展开所有行
  expandedAllRows: PropTypes.bool,
  dataSource: PropTypes.array,
  // 筛选表单的配置
  filterFormProps: PropTypes.object,

  antdTableProps: PropTypes.object,
  antdSpaceProps: PropTypes.object,
};
RestTable.displayName = "RestTable";

export default RestTable;

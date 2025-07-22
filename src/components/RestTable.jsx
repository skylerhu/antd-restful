import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Button, Checkbox, Col, Dropdown, Input, Row, Space, Spin, Table, Tooltip } from "antd";
import {
  DownloadOutlined,
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
  tableSorterToApiSorter,
  transformFilters,
} from "src/common/parser";
import { commonFilter, commonSorter } from "src/common/sorter";
import { isArray, isBlank, isDict, isEmpty, isFunction, isString } from "src/common/typeTools";
import CopyView from "src/components/CopyView";
import RestSelect from "src/components/formitems/RestSelect";
import GridForm from "src/components/GridForm";
import globalConfig from "src/config";
import { useDeepCompareMemoize, useInterval, useLocalStorage } from "src/hooks/index";
import { useSafeRequest } from "src/requests";

const RestTable = forwardRef(
  (
    {
      style,
      className,

      restful,
      reqConfig,
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
      onDataSourceChange,
      onFiltersChange,

      rowKey = "id",
      columns,
      dataSource,
      antdTableProps,
      filterFormProps,
      antdSpaceProps,
    },
    ref
  ) => {
    const [makeRequest] = useSafeRequest();
    const reqConfigRef = useRef(reqConfig);

    const [loading, setLoading] = useState(false);
    // table数据源
    const [innerData, setInnerData] = useState({
      total: 0,
      dataSource: [],
    });

    // table内置header上的筛选条件
    const [headerFilters, setHeaderFilters] = useState({});
    // 表单筛选条件
    const filterFormRef = useRef();
    const [formFilters, setFormFilters] = useState({});
    // 基础参数
    const memBaseParams = useDeepCompareMemoize(baseParams);
    // 路由参数
    const memRouteParams = useDeepCompareMemoize(routeParams);
    // 强制参数
    const memForceParams = useDeepCompareMemoize(forceParams);
    // 标记字段 是否开启了 多选，用于处理query参数转化成数组
    const [multipleMap, setMultipleMap] = useState({});

    // 真实用于请求的筛选条件
    const [innerFilters, setInnerFilters] = useState({});
    // 默认开启高级搜索和列显示隐藏设置
    const innerTools = useDeepCompareMemoize(
      tools ? Object.assign({ advancedSearch: true, refreshInterval: 0, settings: true }, tools) : {}
    );
    const [enableAdvancedSearch, setEnableAdvancedSearch] = useState(false);
    const [enableRefresh, setEnableRefresh] = useState(innerTools.refreshInterval > 0);
    const [runInterval] = useInterval(() => fetchData(), innerTools.refreshInterval, innerTools.refreshInterval > 0);
    const storageKey = useMemo(() => {
      if (isString(innerTools.settings)) {
        return innerTools.settings;
      }
      return restful;
    }, [innerTools.settings, restful]);
    // {allKeys: [], keys: []}, keys 是实际显示的列； allKeys 是所有列, 用标记cloumns是否发生过变动，如果发生过变动，则keys失效
    const [showColumns, setShowColumns] = useLocalStorage(storageKey, {});

    // 暴露给ref调用的方法
    useImperativeHandle(
      ref,
      () => ({
        refreshList: fetchData,
        deleteRow,
      }),
      [fetchData, deleteRow]
    );

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

    // 更新筛选表单的值
    useEffect(() => {
      if (filterFormRef.current) {
        const values = { ...memRouteParams };
        delete values[fieldPage];
        delete values[fieldPageSize];

        if (innerTools.advancedSearch) {
          const noEmptyKeys = Object.keys(values).filter((key) => !isBlank(values[key]));
          if (noEmptyKeys.length > 1) {
            // 如果多个表单有值，则开启高级搜索
            setEnableAdvancedSearch(true);
          }
        }

        filterFormProps?.fields?.forEach((field) => {
          if (values[field.key] === undefined) {
            // 需要重置表单的值
            values[field.key] = null;
          }
          if (field.type && [FieldType.CHECKBOX, FieldType.RADIO].includes(field.type) && isBlank(values[field.key])) {
            // 为了能够正确显示“全部”选项
            values[field.key] = "";
          }
        });
        if (isEmpty(values)) {
          filterFormRef.current.getFormInstance().resetFields();
        } else {
          filterFormRef.current.getFormInstance().setFieldsValue(values);
        }
        setFormFilters(values);
      }
    }, [memRouteParams, filterFormProps?.fields, fieldPage, fieldPageSize, innerTools.advancedSearch]);

    useEffect(() => {
      const fields = filterFormProps?.fields;
      if (isEmpty(fields) || isEmpty(memBaseParams)) {
        return;
      }
      const keys = fields.map((item) => item.key);
      Object.keys(memBaseParams).forEach((key) => {
        if (keys.includes(key)) {
          // eslint-disable-next-line no-console
          console.warn(
            `baseParams 与 filterFormProps.fields 两个配置的key重复了：[${key}]，配置冲突会导致筛选结果不符合预期`
          );
        }
      });
    }, [memBaseParams, filterFormProps?.fields]);

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
        onFiltersChange(filters);
      }
    }, [fieldPage, fieldPageSize, defaultPageSize, memBaseParams, innerFilters, onFiltersChange]);

    useEffect(() => {
      if (!innerFilters[fieldPage]) {
        // 因为page_size一定会赋予默认值，避免首次会多请求一次
        return;
      }
      fetchData();
    }, [innerFilters, fetchData, fieldPage]);

    // 请求远端数据
    const fetchData = useCallback(() => {
      if (!isActive || !restful) {
        return;
      }
      setLoading(true);
      makeRequest({ delay: 200, key: `resttable` })
        .get(restful, { params: innerFilters, ...reqConfigRef.current })
        .then((response) => {
          const data = findDataByPath(response.data, parseRowsPath);
          const _total = findDataByPath(response.data, parseTotalPath);
          setInnerData({ dataSource: data, total: _total || 0 });
        })
        .finally(() => {
          setLoading(false);
        });
    }, [isActive, makeRequest, restful, parseRowsPath, parseTotalPath, innerFilters]);

    // 删除行
    const deleteRow = useCallback(
      (row) => {
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

    const columnSearchViewRef = useRef(null);
    // 处理table表头中列的筛选
    const getColumnSearchProps = useCallback((dataIndex, column) => {
      const { filterDropdownConfig: config, dropdownLocalConfig } = column;
      const _props = {
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
          let searchItem = null;
          switch (config.type) {
            case FieldType.INPUT: {
              searchItem = (
                <Input
                  allowClear={true}
                  {...config.dropdownProps}
                  placeholder={
                    (restful ? config.dropdownProps?.placeholder : dropdownLocalConfig?.placeholder) || "输入搜索"
                  }
                  ref={(node) => (columnSearchViewRef.current = node)}
                  value={selectedKeys}
                  onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                  onPressEnter={() => confirm()}
                />
              );
              break;
            }
            case FieldType.SELECT: {
              searchItem = (
                <RestSelect
                  style={{ width: "100%" }}
                  {...config.dropdownProps}
                  value={selectedKeys}
                  onChange={(value) => {
                    const keys = isBlank(value) ? [] : isArray(value) ? value : [value];
                    const isMultiple = config.dropdownProps?.mode === "multiple";
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
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined, padding: "0 5px" }} />
        ),
        filterDropdownProps: {
          onOpenChange: (visible) => {
            if (config.type === FieldType.INPUT && visible) {
              // 让输入框聚焦
              setTimeout(() => {
                if (columnSearchViewRef.current) {
                  columnSearchViewRef.current.select();
                }
              }, 100);
            }
          },
        },
      };
      return _props;
    }, [restful]);

    const genColumnKey = useCallback((column) => {
      let key = column.key || column.dataIndex;
      if (isArray(key)) {
        key = key.join("__");
      }
      return key;
    }, []);

    // 所有列的选项, 用于列显示设置
    const allColumnOptions = useMemo(() => {
      return columns.map((column) => {
        const key = genColumnKey(column);
        return {
          label: column.title || key,
          value: key,
        };
      });
    }, [columns, genColumnKey]);

    const allColumnKeys = useMemo(() => {
      return allColumnOptions.map((item) => item.value);
    }, [allColumnOptions]);

    const defaultShowColumnKeys = useMemo(() => {
      if (!innerTools.settings) {
        return [];
      }
      return columns.filter((column) => !column.hidden).map((column) => genColumnKey(column));
    }, [columns, innerTools.settings, genColumnKey]);

    // 实际显示的列，处理没有本地设置时需要有默认值
    const realCheckKeys = useMemo(() => {
      if (!innerTools.settings) {
        return [];
      }
      if (showColumns.keys) {
        if (deepEqual(showColumns.allKeys, allColumnKeys)) {
          // 仅当当时设置时的 allKeys 与 当前配置一直，设置的值才有效
          return showColumns.keys;
        }
      }
      return defaultShowColumnKeys;
    }, [showColumns, defaultShowColumnKeys, innerTools.settings, allColumnKeys]);

    const checkColumnAll = useMemo(() => columns.length === realCheckKeys.length, [columns, realCheckKeys]);
    const checkColumnIndeterminate = useMemo(
      () => realCheckKeys.length > 0 && realCheckKeys.length < columns.length,
      [columns, realCheckKeys]
    );

    // 处理table的cloumns
    const memColumns = useMemo(() => {
      const sorterDict = apiSorterToTableSorterDict(innerFilters[fieldOrdering]);
      const arr = columns.map((column) => {
        // 获取唯一字段; antd默认dataIndex优先，但其取值可能是数组，不能作为key使用
        const field = genColumnKey(column);
        let newCloumn = { ...column };
        if (innerTools.settings && realCheckKeys?.length > 0) {
          // 设置了显示，则不隐藏
          newCloumn.hidden = !realCheckKeys.includes(field);
        }
        if (newCloumn.hidden) {
          // 隐藏的字段后续无需处理
          return newCloumn;
        }
        if (!newCloumn.render && (column.labelTemplate || !isEmpty(column.copyProps) || column.fieldName)) {
          // 转换为render函数，处理显示的值
          newCloumn.render = (value, record) => {
            let label;
            if (column.fieldName) {
              // 用真实字段值
              label = findDataByPath(record, column.fieldName);
            } else {
              label = value;
            }
            if (isEmpty(label)) {
              return label;
            }
            let data = label;
            if (!isArray(label)) {
              data = [label];
            }
            return data.map((d, i) => {
              const _label = commonFormat(column.labelTemplate, d);
              if (column.copyProps) {
                const v = column.fieldValue && isDict(d) ? d[column.fieldValue] : d;
                return (
                  <CopyView key={i} value={v} {...column.copyProps}>
                    {_label}
                  </CopyView>
                );
              }
              return _label;
            });
          };
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
            newCloumn = {
              ...newCloumn,
              ...getColumnSearchProps(field, column),
            };
            delete newCloumn.filterDropdownConfig;
          }
        } else {
          if (!newCloumn.onFilter && (newCloumn.filters || column.fieldName)) {
            if (column.fieldName) {
              newCloumn = {
                ...newCloumn,
                ...getColumnSearchProps(field, { ...column, filterDropdownConfig: { type: FieldType.INPUT } }),
              };
              // 支持本地筛选
              newCloumn.onFilter = (input, record) => {
                const v = findDataByPath(record, column.fieldName);
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
    }, [
      columns,
      innerFilters,
      fieldOrdering,
      getColumnSearchProps,
      restful,
      realCheckKeys,
      innerTools.settings,
      genColumnKey,
    ]);

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

    return (
      <Space direction="vertical" gap={10} {...antdSpaceProps} style={{ width: "100%", ...antdSpaceProps?.style }}>
        <div style={{ position: "relative" }}>
          {restful && filterFormProps && (
            <Spin spinning={loading}>
              <GridForm
                key="filterForm"
                {...filterFormProps}
                advancedSearch={enableAdvancedSearch}
                ref={filterFormRef}
                onSubmit={(values) => {
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
          {!isEmpty(innerTools) && (
            <div style={{ position: "absolute", right: 10, bottom: enableAdvancedSearch ? 10 : 0 }}>
              <Space key="tools">
                {restful && filterFormProps && innerTools.advancedSearch && (
                  <Tooltip title="高级搜索">
                    <Button
                      icon={<SecurityScanOutlined />}
                      type={enableAdvancedSearch ? "primary" : undefined}
                      onClick={() => setEnableAdvancedSearch((oldV) => !oldV)}
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
                {innerTools.settings && (
                  <Tooltip
                    trigger="click"
                    color="white"
                    title={
                      <Space direction="vertical" gap={10}>
                        <div style={{ color: "black" }}>设置列显示</div>
                        <Checkbox
                          indeterminate={checkColumnIndeterminate}
                          checked={checkColumnAll}
                          onChange={(e) => {
                            setShowColumns({
                              allKeys: allColumnKeys,
                              keys: e.target.checked ? allColumnKeys : [],
                            });
                          }}
                        >
                          全选
                        </Checkbox>
                        <Checkbox.Group
                          value={realCheckKeys}
                          options={allColumnOptions}
                          onChange={(value) => {
                            setShowColumns({
                              allKeys: allColumnKeys,
                              keys: value,
                            });
                          }}
                        />
                      </Space>
                    }
                  >
                    <Button icon={<SettingOutlined />} />
                  </Tooltip>
                )}
              </Space>
            </div>
          )}
        </div>
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
  urlDetailTemplate: PropTypes.string,
  baseParams: PropTypes.object,
  routeParams: PropTypes.object,
  // 无论路由参数、表单参数是否变化，都会被改值覆盖
  forceParams: PropTypes.object,
  fieldPage: PropTypes.string,
  fieldPageSize: PropTypes.string,
  defaultPageSize: PropTypes.number,
  fieldOrdering: PropTypes.string,
  parseRowsPath: PropTypes.string,
  parseTotalPath: PropTypes.string,
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
    }),
    PropTypes.bool,
  ]),

  onFiltersChange: PropTypes.func,
  onDataSourceChange: PropTypes.func,

  rowKey: PropTypes.string,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      // 若是某列是字典，可以用此模板格式化显示
      labelTemplate: PropTypes.string,
      // 开启复制功能
      copyProps: PropTypes.object,
      // 如果某列是字典，则需要指定字段值用于copy
      fieldValue: PropTypes.string,
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
      // 在禁用restful时，是否开启本地搜索/筛选，设置真实存在的字段
      fieldName: PropTypes.string,
      // 禁用restful下，开启下拉选择的配置
      dropdownLocalConfig: PropTypes.shape({
        filterType: PropTypes.oneOf(FilterType.map((o) => o.value)),
        placeholder: PropTypes.string,
      }),
      range: PropTypes.string,
      // 是否默认显示
      hidden: PropTypes.bool,
      // 是否开启排序，得配置 dataIndex 字段
      sorter: PropTypes.bool,
    })
  ),
  dataSource: PropTypes.array,
  // 筛选表单的配置
  filterFormProps: PropTypes.object,

  antdTableProps: PropTypes.object,
  antdSpaceProps: PropTypes.object,
};
RestTable.displayName = "RestTable";

export default RestTable;

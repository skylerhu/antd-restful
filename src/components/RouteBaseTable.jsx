import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { dequal as deepEqual } from "dequal";
import { parseQueryTypes, queryString } from "src/common/parser";
import { isEmpty, isFunction } from "src/common/typeTools";
import RestTable from "src/components/RestTable";
import { useDeepCompareMemoize } from "src/hooks";

// 因为兼容不了react-router v5和v6 版本，所以传递 location 进来，然后父类组件实现路由的变更
const RouteBaseTable = forwardRef(({ location, onSearchChange, restProps }, ref) => {
  const { baseParams, parseOptions, parseTypes, onFiltersChange } = restProps;
  const searchRef = useRef(location.search);

  const memParseTypes = useDeepCompareMemoize(parseTypes);
  const memParseOptions = useDeepCompareMemoize(parseOptions);
  const memBaseParams = useDeepCompareMemoize(baseParams);

  const [params, setParams] = useState();

  useEffect(() => {
    let query = queryString.parse(location.search, memParseOptions);
    if (memParseTypes) {
      // query-string > 9 支持直接 parasOptions 配置字段类型，但这个低版本node又不能使用
      // 主要是为了解决低版本 query参数中 超大int溢出 和 普通 int存在的场景，需要额外指定参数类型
      query = parseQueryTypes(query, memParseTypes);
    }
    setParams((oldV) => {
      const newV = { ...query };
      if (deepEqual(newV, oldV)) {
        return oldV;
      }
      return newV;
    });
  }, [location.search, memBaseParams, memParseOptions, memParseTypes]);

  const onChange = useCallback(
    (values) => {
      const filters = { ...values };
      // 过滤掉与默认参数相同的参数
      Object.keys(filters).forEach((key) => {
        const v = filters[key];
        if (memBaseParams && deepEqual(v, memBaseParams[key])) {
          delete filters[key];
        }
      });
      setParams(filters);
      let changedSearch = queryString.stringify(filters, memParseOptions);
      if (isEmpty(changedSearch)) {
        changedSearch = "";
      } else {
        changedSearch = `?${changedSearch}`;
      }
      if (searchRef.current !== changedSearch && isFunction(onSearchChange)) {
        searchRef.current = changedSearch;
        onSearchChange(changedSearch);
      }
      if (isFunction(onFiltersChange)) {
        onFiltersChange(values);
      }
    },
    [memBaseParams, onFiltersChange, onSearchChange, memParseOptions]
  );

  if (params === undefined || params === null) {
    // 等待params根据search初始化完成
    return null;
  }

  return <RestTable ref={ref} {...restProps} routeParams={params} onFiltersChange={onChange} />;
});

RouteBaseTable.propTypes = {
  location: PropTypes.object,
  onSearchChange: PropTypes.func,
  restProps: PropTypes.object,
};

RouteBaseTable.displayName = "RouteBaseTable";

export default RouteBaseTable;

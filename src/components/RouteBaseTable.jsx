import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { dequal as deepEqual } from "dequal";
import { queryString } from "src/common/parser";
import { isEmpty, isFunction } from "src/common/typeTools";
import RestTable from "src/components/RestTable";
import { useDeepCompareMemoize } from "src/hooks";

// 因为兼容不了react-router v5和v6 版本，所以传递 location 进来，然后父类组件实现路由的变更
const RouteBaseTable = forwardRef(({ location, onSearchChange, parseOptions, restProps }, ref) => {
  const { baseParams, onFiltersChange } = restProps;
  const searchRef = useRef(location.search);

  const memParseOptions = useDeepCompareMemoize(parseOptions);
  const memBaseParams = useDeepCompareMemoize(baseParams);

  const [params, setParams] = useState();

  useEffect(() => {
    const query = queryString.parse(location.search, memParseOptions);
    setParams((oldV) => {
      const newV = { ...query };
      if (deepEqual(newV, oldV)) {
        return oldV;
      }
      return newV;
    });
  }, [location.search, memBaseParams, memParseOptions]);

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
  // 解析路由参数的选项, query-string 的配置项
  parseOptions: PropTypes.object,
  restProps: PropTypes.object,
};

RouteBaseTable.displayName = "RouteBaseTable";

export default RouteBaseTable;

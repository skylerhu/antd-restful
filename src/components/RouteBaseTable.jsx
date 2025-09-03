import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { dequal as deepEqual } from "dequal";
import { queryString } from "src/common/parser";
import { isEmpty, isFunction } from "src/common/typeTools";
import RestTable from "src/components/RestTable";
import { useDeepCompareMemoize } from "src/hooks";

// 因为兼容不了react-router v5和v6 版本，所以传递 location 进来，然后父类组件实现路由的变更
const RouteBaseTable = ({ location, onSearchChange, restProps }) => {
  const { baseParams, onFiltersChange } = restProps;
  const searchRef = useRef(location.search);

  const memBaseParams = useDeepCompareMemoize(baseParams);

  const [params, setParams] = useState();

  useEffect(() => {
    const query = queryString.parse(location.search);
    setParams((oldV) => {
      const newV = { ...query };
      if (deepEqual(newV, oldV)) {
        return oldV;
      }
      return newV;
    });
  }, [location.search, memBaseParams]);

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
      let changedSearch = queryString.stringify(filters);
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
    [memBaseParams, onFiltersChange, onSearchChange]
  );

  if (params === undefined || params === null) {
    // 等待params根据search初始化完成
    return null;
  }

  return <RestTable {...restProps} routeParams={params} onFiltersChange={onChange} />;
};

RouteBaseTable.propTypes = {
  location: PropTypes.object,
  onSearchChange: PropTypes.func,
  restProps: PropTypes.object,
};
export default RouteBaseTable;

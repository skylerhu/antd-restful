import React, { useCallback, useEffect, useState } from "react";
import { dequal as deepEqual } from "dequal";
import { useLocation, useNavigate } from "react-router";
// import { queryString } from "src/common/parser";
// import { isEmpty, isFunction } from "src/common/typeTools";
// import RestTable from "src/components/RestTable";
// import { useDeepCompareMemoize } from "src/hooks";
import libs from "demo/libs";

const {
  RestTable,
  hooks: { useDeepCompareMemoize },
  typeTools: { isEmpty, isFunction },
  parser: { queryString },
} = libs;

const RouteTable = (restProps) => {
  const { baseParams, onFiltersChange } = restProps;
  const location = useLocation();
  const navigate = useNavigate();

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
      let search = queryString.stringify(filters);
      if (isEmpty(search)) {
        search = "";
      } else {
        search = `?${search}`;
      }
      navigate(`${location.pathname}${search}`);
      if (isFunction(onFiltersChange)) {
        onFiltersChange(values);
      }
    },
    [location.pathname, memBaseParams, navigate, onFiltersChange]
  );

  if (!params) {
    // 等待params根据search初始化完成
    return null;
  }

  return <RestTable {...restProps} routeParams={params} onFiltersChange={onChange} />;
};

export default RouteTable;

import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { dequal as deepEqual } from "dequal";
import { ViewType } from "src/common/constants";
import { guessQueryTypes, parseQueryTypes } from "src/common/parser";
import { isEmpty, isFunction } from "src/common/typeTools";
import RestList from "src/components/RestList";
import RestTable from "src/components/RestTable";
import globalConfig from "src/config";
import { useDeepCompareMemoize } from "src/hooks";

// 因为兼容不了react-router v5和v6 版本，所以传递 location 进来，然后父类组件实现路由的变更
// viewType="list" 一般与 pagination 配合使用；loadMore 模式数据追加累积，不适合通过 URL 参数还原状态
const VIEW_TYPE_MAP = {
  [ViewType.LIST]: RestList,
  [ViewType.TABLE]: RestTable,
};

const RouteBaseTable = forwardRef(({ location, onSearchChange, viewType = ViewType.TABLE, restProps }, ref) => {
  const {
    parseOptions,
    parseTypes,
    onFiltersChange,
    columns,
    filterFormProps,
  } = restProps;
  const ViewComponent = VIEW_TYPE_MAP[viewType] || RestTable;
  const searchRef = useRef(location.search);

  const memParseOptions = useDeepCompareMemoize(parseOptions);
  // 后续可以废弃
  const memParseTypes = useDeepCompareMemoize(parseTypes);
  // 猜测的类型
  const [guessTypes, setGuessTypes] = useState(null);

  const [params, setParams] = useState();

  useEffect(() => {
    setGuessTypes((oldV) => {
      const newV = { ...guessQueryTypes(columns), ...guessQueryTypes(filterFormProps?.fields) };
      if (deepEqual(newV, oldV)) {
        return oldV;
      }
      return newV;
    });
  }, [columns, filterFormProps?.fields]);

  useEffect(() => {
    if (guessTypes === null) {
      // 猜测类型未完成，不进行初始化
      return;
    }
    // 合并猜测的类型和配置的类型
    const options = {
      ...memParseOptions,
      types: {
        ...guessTypes,
        ...memParseOptions?.types,
      },
    };
    let query = globalConfig.queryParse(location.search, options);
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
  }, [location.search, memParseOptions, memParseTypes, guessTypes]);

  const onChange = useCallback(
    (values) => {
      const filters = { ...values };
      let changedSearch = globalConfig.queryStringify(filters, memParseOptions);
      if (isEmpty(changedSearch)) {
        changedSearch = "";
      } else {
        changedSearch = `?${changedSearch}`;
      }
      if (searchRef.current !== changedSearch) {
        searchRef.current = changedSearch;
        setParams(filters);
        if (isFunction(onSearchChange)) {
          onSearchChange(changedSearch);
        }
        if (isFunction(onFiltersChange)) {
          onFiltersChange(values);
        }
      }
    },
    [onFiltersChange, onSearchChange, memParseOptions]
  );

  if (params === undefined || params === null || guessTypes === null) {
    return null;
  }

  return <ViewComponent ref={ref} {...restProps} routeParams={params} onFiltersChange={onChange} />;
});

RouteBaseTable.propTypes = {
  location: PropTypes.object,
  onSearchChange: PropTypes.func,
  viewType: PropTypes.oneOf(ViewType.map((o) => o.value)),
  restProps: PropTypes.object,
};

RouteBaseTable.displayName = "RouteBaseTable";

export default RouteBaseTable;

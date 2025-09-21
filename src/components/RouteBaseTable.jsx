import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { dequal as deepEqual } from "dequal";
import { guessQueryTypes, parseQueryTypes, clearEmptyValue } from "src/common/parser";
import { isEmpty, isFunction } from "src/common/typeTools";
import RestTable from "src/components/RestTable";
import globalConfig from "src/config";
import { useDeepCompareMemoize } from "src/hooks";

// 因为兼容不了react-router v5和v6 版本，所以传递 location 进来，然后父类组件实现路由的变更
const RouteBaseTable = forwardRef(({ location, onSearchChange, restProps }, ref) => {
  const {
    parseOptions,
    parseTypes,
    onFiltersChange,
    columns,
    filterFormProps: { fields },
  } = restProps;
  const searchRef = useRef(location.search);
  // 后续可以废弃
  const memParseTypes = useDeepCompareMemoize(parseTypes);

  const [params, setParams] = useState();
  // 猜测的类型
  const [guessTypes, setGuessTypes] = useState({});
  // 合并猜测的类型和配置的类型
  const memParseOptions = useDeepCompareMemoize({
    ...parseOptions,
    types: {
      ...guessTypes,
      ...parseOptions.types,
    },
  });

  useEffect(() => {
    setGuessTypes((oldV) => {
      const newV = { ...guessQueryTypes(columns), ...guessQueryTypes(fields) };
      if (deepEqual(newV, oldV)) {
        return oldV;
      }
      return newV;
    });
  }, [columns, fields]);

  useEffect(() => {
    let query = globalConfig.queryParse(location.search, memParseOptions);
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
  }, [location.search, memParseOptions, memParseTypes]);

  const onChange = useCallback(
    (values) => {
      const filters = clearEmptyValue(values);
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

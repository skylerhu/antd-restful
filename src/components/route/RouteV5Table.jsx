import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import RouteBaseTable from "src/components/route/base";

const RouteTable = (restProps) => {
  const location = useLocation();
  const history = useHistory();

  return (
    <RouteBaseTable
      restProps={restProps}
      search={location.search}
      onSearchChange={(search) => {
        history.push(`${location.pathname}${search}`);
      }}
    />
  );
};

export default RouteTable;

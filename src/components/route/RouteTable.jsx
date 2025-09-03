import React from "react";
import { useLocation, useNavigate } from "react-router";
import RouteBaseTable from "src/components/route/base";

const RouteTable = (restProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <RouteBaseTable
      restProps={restProps}
      search={location.search}
      onSearchChange={(search) => {
        navigate(`${location.pathname}${search}`);
      }}
    />
  );
};

export default RouteTable;

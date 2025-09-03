import React from "react";
import { useLocation, useNavigate } from "react-router";
import libs from "demo/libs";

const {
  RouteBaseTable,
} = libs;


const RouteTable = (restProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <RouteBaseTable
      restProps={restProps}
      location={location}
      onSearchChange={(search) => {
        navigate(`${location.pathname}${search}`);
      }}
    />
  );
};
export default RouteTable;

import React from "react";
import PropTypes from "prop-types";
import { useLocation, useNavigate } from "react-router";
import libs from "demo/libs";

const {
  RouteBaseTable,
} = libs;


const RouteTable = ({ parseOptions, ...restProps }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <RouteBaseTable
      restProps={restProps}
      location={location}
      parseOptions={parseOptions}
      onSearchChange={(search) => {
        navigate(`${location.pathname}${search}`);
      }}
    />
  );
};

RouteTable.propTypes = {
  parseOptions: PropTypes.object,
};

export default RouteTable;

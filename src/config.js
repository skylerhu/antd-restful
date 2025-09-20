import { queryString } from "src/common/parser";

const globalConfig = {
  queryStringify: (params, options) => queryString.stringify(params, options),
  queryParse: (params, options) => queryString.parse(params, options),
};

export const setGlobalConfig = (config) => {
  Object.assign(globalConfig, config);
};

export default globalConfig;
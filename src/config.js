import { queryString } from "src/common/parser";

const globalConfig = {
  queryStringify: (params) => queryString.stringify(params),
  queryParse: (params) => queryString.parse(params),
};

export const setGlobalConfig = (config) => {
  Object.assign(globalConfig, config);
};

export default globalConfig;
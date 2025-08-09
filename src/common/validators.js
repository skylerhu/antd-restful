import { isDict, isEmpty, isNumber } from "src/common/typeTools";
import { formatRequestError, makeSafeRequest } from "src/requests";

/**
 * 扩展 ExpansionView 组件的校验
 * @param {*} value - 要校验的值，通常是一个包含 output 和 error 属性的对象
 * @param {Object} rule - 校验规则对象
 * @param {boolean|Object} rule.expansionValidator - 扩展校验配置
 * @param {number} [rule.expansionValidator.required] - value.output不为空
 * @param {number} [rule.expansionValidator.min] - 最小长度限制
 * @param {number} [rule.expansionValidator.max] - 最大长度限制
 * @param {string} [rule.message] - 校验失败时的错误提示信息
 * @returns {Promise} 校验结果，成功返回 resolved promise，失败返回 rejected promise
 * @example rule的配置示例
      {
        required: true,  // 若是必填字段，可以配合该rule使用
        expansionValidator: true,
        message: "请按照要求输入数据",
      }
 * @example
      {
        expansionValidator: {
          min: 1,
          max: 10,
        },
        message: "请按照要求输入数据",
      }
 */
export const expansionValidator = (value, rule) => {
  const config = rule?.expansionValidator;
  if (!config || isEmpty(config) || isEmpty(value)) {
    return Promise.resolve();
  }
  let errMsg = value.error;
  if (!errMsg && isDict(config)) {
    const { max, min, required } = config;
    if (required && isEmpty(value.output)) {
      errMsg = "请按照要求输入数据";
    }
    if (!errMsg) {
      const len = value.output?.length || 0;
      if (isNumber(max) && len > max) {
        errMsg = `最大长度为 ${max}`;
      } else if (isNumber(min) && len < min) {
        errMsg = `最小长度为 ${min}`;
      }
    }
  }
  if (!errMsg) {
    return Promise.resolve();
  }
  return Promise.reject(value.error || rule.message || errMsg);
};

const makeValidateRequest = makeSafeRequest();

/**
 * 扩展 ExpansionView 组件的远程校验
 * @param {*} value - 要校验的值
 * @param {Object} rule - 校验规则对象
 * @param {Object} rule.remoteValidator - 远程校验配置
 * @param {boolean} [rule.remoteValidator.withForm] - 是否带上表单所有数据，默认为 false
 * @param {Object} [rule.remoteValidator.extraParams] - 额外的请求参数
 * @param {string} rule.remoteValidator.restful - 远程校验的 API 接口地址
 * @param {Object} [rule.remoteValidator.reqConfig] - 请求配置，会合并到请求选项中
 * @param {Object} [rule.remoteValidator.makeRequestOptions] - makeRequest 的配置选项
 * @param {number} [rule.remoteValidator.makeRequestOptions.delay] - 防抖延迟时间，默认 200ms
 * @param {string} [rule.remoteValidator.makeRequestOptions.key] - 防抖标识键，要全局唯一，否则校验器之间会相互影响
 * @param {string} [rule.message] - 校验失败时的错误提示信息
* @example rule的配置示例
   {
     remoteValidator: {
       withForm: true,  // 是否带上表单所有数据
       extraParams: {},  // 请求参数
       restful: "api/validate/remote/",
       reqConfig: {},  // 请求配置
       makeRequestOptions: { delay: 200, key: "remote-validator" },  // 防抖相关配置
     }
   }
 * @param {Object} ctx - 上下文对象，配合 formily 使用
 * @returns {Promise} 校验结果，成功返回 resolved promise，失败返回 rejected promise
 */
export const remoteValidator = (value, rule, ctx) => {
  // const { field, form } = ctx;
  const config = rule?.remoteValidator;
  if (isEmpty(value) || isEmpty(config) || !config?.restful) {
    return Promise.resolve();
  }
  const { withForm, restful, reqConfig, extraParams, makeRequestOptions } = config;
  // value 和 表单的key
  const fieldName = ctx?.field?.path?.entire;
  const data = { value, field: fieldName, extraParams };
  if (withForm) {
    // 带上表单值
    data.form = ctx?.form?.values;
  }
  const client = makeValidateRequest({ key: `${fieldName}-${restful}`, delay: 200, ...makeRequestOptions });
  return client.post(restful, data, { disableNotiError: true, ...reqConfig }).then(
    (res) => {
      // 校验成功/失败都返回200，避免http接口4xx过多； validated=True表示成功
      if (res.status === 200 && res.data.validated) {
        return Promise.resolve();
      }
      return Promise.reject(res.data.message || rule.message || "请按照要求输入数据");
    },
    (error) => {
      const { message, description } = formatRequestError(error);
      return Promise.reject(`${message}: ${description}`);
    }
  );
};

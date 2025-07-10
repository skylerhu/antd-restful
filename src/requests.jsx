import React, { useEffect, useRef } from "react";
import { notification } from "antd";
import axios from "axios";
import { isNumber } from "src/common/typeTools";
import globalConfig from "src/config";

/**
 * 格式化请求错误信息
 * @param {Error} error - Axios错误对象
 * @returns {{message: string, description: string|React.ReactNode}} 格式化后的错误信息
 *   - message: 错误标题
 *   - description: 错误详细信息,支持React节点
 */
function formatRequestError(error) {
  let message = "未知错误";
  let description = error.message;
  if (error.response) {
    message = `HttpError(${error.response.status})`;
    description = `${error.config.method.toUpperCase()} ${error.config.url}\n${JSON.stringify(error.response.data)}`;
  }
  return { message, description };
}

/**
 * 获取cookie
 * @param {string} name
 * @returns {string}
 */
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// 创建axios实例
const instance = axios.create({
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  // 显示声明处理方式；axios原生的处理方式取决于是否安装了qs库，避免冲突，所以显示声明
  paramsSerializer: (params) => globalConfig.queryStringify(params),
});

instance.interceptors.request.use((config) => {
  const headers = { ...config.headers };

  if (["POST", "PUT", "PATCH", "DELETE"].includes(config.method.toUpperCase())) {
    // 支持 Django的CSRFToken
    let csrftoken = document.querySelector("[name=csrfmiddlewaretoken]")?.value;
    if (!csrftoken) {
      csrftoken = getCookie("csrftoken");
    }
    headers["X-CSRFToken"] = csrftoken;
  }

  config.headers = headers;

  return config;
});
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.config?.disableNotiError) {
      // 显示通知
      const { message, description } = formatRequestError(error);
      const config = {
        message,
        description: <p style={{ whiteSpace: "pre-wrap" }}>{description}</p>,
      };
      // 401 和 403 避免多次提示，所以设置key
      if (["401", "403", "404"].includes(error?.response?.status)) {
        config.key = error.response.status;
      }
      notification.error(config);
    }
    return Promise.reject(error);
  }
);

const emptyFn = () => {};

// 为了解决组件销毁后还更新state的问题，需要使用 AbortablePromise
class AbortablePromise extends Promise {
  constructor(executor) {
    let isAborted = false;

    super((resolve, reject) => {
      executor(
        (value) => {
          if (!isAborted) {
            resolve(value);
          }
        },
        (reason) => {
          if (!isAborted) {
            reject(reason);
          }
        }
      );
    });

    this.isAborted = false;
    this.abort = () => {
      isAborted = true;
      this.isAborted = true;
    };
  }

  then(onFulfilled, onRejected) {
    if (this.isAborted) {
      // 返回一个解决状态的 Promise，保持链式调用
      return super.then(emptyFn, emptyFn);
    } else {
      // 调用父类的 then 方法，保持正常的 Promise 行为
      return super.then(onFulfilled, onRejected);
    }
  }

  catch(onRejected) {
    if (this.isAborted) {
      // 返回一个解决状态的 Promise，保持链式调用
      return super.catch(emptyFn);
    } else {
      // 调用父类的 catch 方法
      return super.catch(onRejected);
    }
  }

  finally(onFinally) {
    if (this.isAborted) {
      // 返回一个解决状态的 Promise，保持链式调用
      return super.finally(emptyFn);
    } else {
      return super.finally(onFinally);
    }
  }
}

function makeSafeRequest() {
  let count = 0;
  let reqMapRef = {};

  const doRequest = (resolve, reject, { key }, { method, config, args }) => {
    // 添加信号
    const { controller } = reqMapRef[key];
    const newConfig = { ...config, signal: controller?.signal };
    // 发起请求
    instance[method](...args, newConfig)
      .then((resp) => {
        resolve(resp);
      })
      .catch((error) => {
        // 如果是取消请求的错误，不触发 reject
        if (error.name === "AbortError" || axios.isCancel(error)) {
          // eslint-disable-next-line no-console
          // console.warn(error);
          return;
        }
        reject(error);
      })
      .finally(() => {
        if (isNumber(key)) {
          // 如果不是单例请求，则删除请求相关信息
          delete reqMapRef[key];
        }
      });
  };

  const wrapAxios = (options, reqConfig) => {
    let { delay = 0, key } = options || {};
    // 默认每次自增1
    if (!key) {
      count++;
      key = count;
    } else if (isNumber(key)) {
      // 不允许指定key为数字，因为数字会被认为是reqId
      key = `key-${key}`;
    }
    // 清除之前的定时器和请求
    if (reqMapRef[key]) {
      reqMapRef[key].promise?.abort();
      reqMapRef[key].controller?.abort();
      clearTimeout(reqMapRef[key].timer);
      delete reqMapRef[key];
    }

    // 创建新的 AbortController
    const controller = new AbortController();
    reqMapRef[key] = { controller };

    if (delay <= 0) {
      const promise = new AbortablePromise((resolve, reject) => doRequest(resolve, reject, { key }, reqConfig));
      reqMapRef[key].promise = promise;
      return promise;
    }

    const promise = new AbortablePromise((resolve, reject) => {
      const timer = setTimeout(() => {
        doRequest(resolve, reject, { key }, reqConfig);
      }, delay);
      reqMapRef[key].timer = timer;
    });
    reqMapRef[key].promise = promise;
    return promise;
  };

  const makeRequest = (options) => ({
    request: (config) => wrapAxios(options, { config }),
    get: (url, config) => wrapAxios(options, { config, method: "get", args: [url] }),
    head: (url, config) => wrapAxios(options, { config, method: "head", args: [url] }),
    options: (url, config) => wrapAxios(options, { config, method: "options", args: [url] }),
    post: (url, data, config) => wrapAxios(options, { config, method: "post", args: [url, data] }),
    patch: (url, data, config) => wrapAxios(options, { config, method: "patch", args: [url, data] }),
    put: (url, data, config) => wrapAxios(options, { config, method: "put", args: [url, data] }),
    delete: (url, data, config) => wrapAxios(options, { config, method: "delete", args: [url, data] }),
  });

  makeRequest.unmount = () => {
    // 终止请求
    for (const _key in reqMapRef) {
      reqMapRef[_key].promise?.abort();
      reqMapRef[_key].controller?.abort();
      clearTimeout(reqMapRef[_key].timer);
    }
    // 清除请求相关信息
    reqMapRef = {};
  };

  return makeRequest;
}

function useSafeRequest() {
  const makeRequestRef = useRef(makeSafeRequest());

  useEffect(() => {
    makeRequestRef.current = makeSafeRequest();
    return () => {
      makeRequestRef.current && makeRequestRef.current.unmount();
    };
  }, []);

  return [makeRequestRef.current];
}

export { makeSafeRequest, formatRequestError, getCookie, AbortablePromise, useSafeRequest };
export default instance;

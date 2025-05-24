import React from "react";
import { notification } from "antd";
import axios from "axios";

/**
 * 格式化请求错误信息
 * @param {Error} error - Axios错误对象
 * @returns {{message: string, description: string|React.ReactNode}} 格式化后的错误信息
 *   - message: 错误标题
 *   - description: 错误详细信息,支持React节点
 */
export function formatRequestError(error) {
  let description = error.message;
  let message = "未知错误";
  if (error.response) {
    const status = error.response.status;
    message = `HttpError(${status})`;
    description = (
      <div>
        <div>
          {error.config.method.toUpperCase()} {error.config.url}
        </div>
        <div>{JSON.stringify(error.response.data)}</div>
      </div>
    );
  }
  return { message, description };
}

/**
 * 获取cookie
 * @param {string} name
 * @returns {string}
 */
export function getCookie(name) {
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
    const { message, description } = formatRequestError(error);
    const config = {
      message,
      description,
    };
    // 401 和 403 避免多次提示，所以设置key
    if (error?.response?.status === 401) {
      config.key = "401";
    } else if (error?.response?.status === 403) {
      config.key = "403";
    }
    notification.error(config);
    return Promise.reject(error);
  }
);

export default instance;

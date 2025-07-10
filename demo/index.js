import React from "react";
import { ConfigProvider } from "antd";
import locale from "antd/locale/zh_CN";
import dayjs from "dayjs";
import ReactDOM from "react-dom/client";

import "dayjs/locale/zh-cn";

import App from "./App";

dayjs.locale("zh-cn");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ConfigProvider locale={locale}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);

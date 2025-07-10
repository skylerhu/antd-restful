import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Alert, Input, Space, Spin } from "antd";
import braceExpansion from "brace-expansion";
import { dequal as deepEqual } from "dequal";
import { READ_ONLY_CLASS } from "src/common/constants";
import { commonFormat } from "src/common/parser";
import { isArray, isBlank, isFunction } from "src/common/typeTools";
import LongText from "src/components/LongText";
import { useDeepCompareMemoize } from "src/hooks";
import { formatRequestError, useSafeRequest } from "src/requests";

/**
 * 在表单中需要配合特定的 validator: 需要校验 !isBlank(input) && !loading && !error 才算是预期的结果
 */
const ExpansionView = ({
  style,
  className,
  value,
  onChange,

  enableBraceExpansion = false,

  restful,
  reqConfig,
  inputKey = "input",
  baseParams,
  inputMinEnter = 1,
  valueTemplate,
  disabled = false,
  readOnly = false,
  longTextProps,
  longErrorProps,
  antdSpaceProps,
  antdInputProps,
  antdAlertProps,
}) => {
  const [makeRequest] = useSafeRequest();
  const reqConfigRef = useRef(reqConfig);

  const [inputValue, setInputValue] = useState();
  const [outputData, setOutputData] = useState({ output: value?.output, error: value?.error });
  const [loading, setLoading] = useState(false);

  const currentValueRef = useRef();

  useEffect(() => {
    setInputValue((oldV) => (oldV === value?.input ? oldV : value?.input));
  }, [value]);

  useEffect(() => {
    const newV = { input: inputValue, ...outputData, loading };
    if (isFunction(onChange) && !deepEqual(currentValueRef.current, newV)) {
      currentValueRef.current = newV;
      onChange(newV);
    }
  }, [outputData, onChange, inputValue, loading]);

  const memBaseParams = useDeepCompareMemoize(baseParams);

  useEffect(() => {
    // 搜索值变化时
    if (disabled || readOnly || (!restful && !enableBraceExpansion)) {
      return;
    }
    if (isBlank(inputValue)) {
      // 清空输出和错误
      setOutputData({ output: null, error: null });
      return;
    }

    if (restful && inputValue.length < inputMinEnter) {
      return;
    }

    let reqV = enableBraceExpansion ? braceExpansion(inputValue) : inputValue;
    if (valueTemplate) {
      if (isArray(reqV)) {
        reqV = reqV.map((v) => commonFormat(valueTemplate, { ...memBaseParams, value: v }));
      } else {
        reqV = commonFormat(valueTemplate, { ...memBaseParams, value: reqV });
      }
    }
    if (!restful) {
      // 无需远程请求，直接设置输出
      setOutputData({ output: reqV, error: null });
      return;
    }

    makeRequest({ delay: 200, key: "expansion" })
      .post(restful, { ...memBaseParams, [inputKey]: reqV }, { disableNotiError: true, ...reqConfigRef.current })
      .then((response) => {
        const { output, error } = response.data;
        setOutputData({ output, error });
      })
      .catch((error) => {
        const { message, description } = formatRequestError(error);
        const errorText = `${message}\n${description}`;
        const outputData = { output: null, error: errorText };
        setOutputData({ ...outputData });
      })
      .finally(() => setLoading(false));
  }, [
    restful,
    disabled,
    inputValue,
    inputKey,
    memBaseParams,
    readOnly,
    enableBraceExpansion,
    makeRequest,
    inputMinEnter,
    valueTemplate,
  ]);

  return (
    <Space
      direction="vertical"
      style={{ width: "100%", ...style }}
      className={readOnly ? (className ? `${className} ${READ_ONLY_CLASS}` : READ_ONLY_CLASS) : className}
      {...antdSpaceProps}
    >
      {!readOnly ? (
        <Input
          value={inputValue}
          disabled={disabled}
          readOnly={readOnly}
          {...antdInputProps}
          onChange={(e) => setInputValue(e.target.value)}
        />
      ) : (
        inputValue
      )}
      <Spin spinning={loading}>
        {outputData?.error && (
          <Alert
            message={<LongText value={outputData.error} {...longTextProps} {...longErrorProps} />}
            type="error"
            closable={false}
            {...antdAlertProps}
          />
        )}
        {outputData?.output && !outputData?.error && (
          <Alert
            message={<LongText value={outputData.output} {...longTextProps} />}
            type="success"
            closable={false}
            {...antdAlertProps}
          />
        )}
      </Spin>
    </Space>
  );
};

ExpansionView.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,

  value: PropTypes.shape({
    input: PropTypes.string,
    output: PropTypes.any,
    error: PropTypes.string,
  }),
  onChange: PropTypes.func,

  // 开启后，支持 brace-expansion 的语法输入, as known from sh/bash, in JavaScript.
  // https://www.gnu.org/software/bash/manual/html_node/Brace-Expansion.html
  enableBraceExpansion: PropTypes.bool,

  restful: PropTypes.string,
  // axios的配置
  reqConfig: PropTypes.object,
  // 输入的值作为value，inputKey 是请求的key，请求到后端
  inputKey: PropTypes.string,
  // 输入最小长度; 仅在 restful 有值时有效；有些场景下输入字符较少请求后端无意义
  inputMinEnter: PropTypes.number,
  // 请求的额外参数
  baseParams: PropTypes.object,
  // 输出值的模板，{value}则是输入的值，其余key值从 baseParams 中获取；
  valueTemplate: PropTypes.string,

  longTextProps: PropTypes.object,
  longErrorProps: PropTypes.object,
  // 原生组件属性
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  antdSpaceProps: PropTypes.object,
  antdInputProps: PropTypes.object,
  antdAlertProps: PropTypes.object,
};

export default ExpansionView;

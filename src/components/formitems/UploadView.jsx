import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Button, Image, message, Space, Tooltip, Upload } from "antd";
import { InboxOutlined, PaperClipOutlined, UploadOutlined } from "@ant-design/icons";
import { dequal as deepEqual } from "dequal";
import Enum from "js-enumerate";
import { READ_ONLY_CLASS } from "src/common/constants";
import { formatByte } from "src/common/formatter";
import { isArray, isDict, isEmpty, isFunction } from "src/common/typeTools";
import { useDeepCompareMemoize } from "src/hooks";
import { useSafeRequest } from "src/requests";

export const UploadStatus = new Enum([
  { key: "UPLOADING", label: "上传中", value: "uploading" },
  { key: "ERROR", label: "失败", value: "error" },
  { key: "DONE", label: "成功", value: "done" },
  { key: "REMOVED", label: "删除", value: "removed" },
]);

const UploadView = ({
  style,
  className,
  children,
  value,
  onChange,

  method = "post",
  uploadUrl,
  timeout = 10000, // 10s
  name = "file",
  reqConfig,
  baseParams,
  listType = "picture",
  maxSize = 100 * 1024 * 1024, // 100MB
  maxCount = 1,

  disabled = false,
  readOnly = false,
  enableDragger = false,
  antdButtonConfig,
  antdUploadProps,
  antdSpaceProps,
  antdReadonlyItemProps,
}) => {
  const [makeRequest] = useSafeRequest();
  const reqConfigRef = useRef(reqConfig);

  const [isMultiple, setIsMultiple] = useState(maxCount !== 1);
  const [fileList, setFileList] = useState([]);
  // 主要是为了记录 contorller 用于取消上传
  const fileMapRef = useRef({});

  useEffect(() => {
    setIsMultiple(maxCount !== 1);
  }, [maxCount]);

  const initFilesValue = useCallback(
    (files, isArr = false) => {
      let succList = [];
      if (!isEmpty(files)) {
        succList = files;
        if (!isArray(files)) {
          succList = [files];
        }
        // 没有状态字段，或者状态为成功时才是表单需要的值
        // succList = succList.filter((item) => !item.status || item.status === UploadStatus.DONE);
      }
      // 只保留必要的字段
      succList = succList.map((item) => ({
        uid: item.uid,
        status: item.status,
        type: item.type,
        size: item.size,
        name: item.name,
        url: item.url || item.response?.url,
        thumbUrl: item.thumbUrl || item.response?.thumbUrl,
      }));

      if (isArr) {
        return succList;
      }
      if (isMultiple) {
        return succList;
      } else {
        return succList.length > 0 ? succList[0] : null;
      }
    },
    [isMultiple]
  );

  const onValueChange = useCallback(
    (files) => {
      if (isFunction(onChange)) {
        const formValue = initFilesValue(files);
        onChange(formValue);
      }
    },
    [onChange, initFilesValue]
  );

  useEffect(() => {
    setFileList((oldV) => {
      if (oldV == value) {
        return oldV;
      }
      let oldFiles = initFilesValue(oldV, true);
      let newFiles = initFilesValue(value, true);
      if (deepEqual(oldFiles, newFiles)) {
        return oldFiles;
      }
      return newFiles;
    });
  }, [value, initFilesValue]);

  const updateFileInfo = useCallback((fileUid, updates) => {
    setFileList((oldV) => oldV.map((item) => (item.uid === fileUid ? { ...item, ...updates } : item)));
  }, []);

  const memBaseParams = useDeepCompareMemoize(baseParams);

  // https://github.com/react-component/upload#customrequest
  const customRequest = useCallback(
    ({ file, onProgress, onError, onSuccess }) => {
      const formData = new FormData();
      // 添加额外参数
      if (isDict(memBaseParams)) {
        Object.entries(memBaseParams).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }
      formData.append(name, file);

      const fileUid = file.uid;
      const fileInfo = { uid: file.uid, name: file.name, size: file.size, type: file.type };
      const newFileItem = {
        ...fileInfo,
        status: UploadStatus.UPLOADING,
      };
      // 标记文件上传中
      if (isMultiple) {
        setFileList((oldV) => oldV.concat([newFileItem]));
      } else {
        setFileList([newFileItem]);
      }
      // 记录文件信息
      const controller = new AbortController();
      fileMapRef.current[fileUid] = {
        controller,
      };
      // 发送请求
      const req = makeRequest()[method];
      req(uploadUrl, formData, {
        params: memBaseParams,
        headers: {
          "Content-Type": "multipart/form-data",
          ...reqConfigRef.current?.headers,
        },
        ...reqConfigRef.current,
        signal: controller.signal,
        onUploadProgress: (e) => {
          // 更新进度条
          const percent = Math.floor((e.loaded / e.total) * 100);
          updateFileInfo(fileUid, { percent });
          onProgress({ percent });
        },
        timeout,
      })
        .then((resp) => {
          // {"thumbUrl": "", "url": ""}
          onSuccess(resp.data);
          updateFileInfo(fileUid, { ...resp.data, status: UploadStatus.DONE });
          message.success(`文件 ${file.name} 上传成功`);
        })
        .catch((err) => {
          const tmpInfo = fileMapRef.current[fileUid];
          if (tmpInfo && tmpInfo.controller) {
            tmpInfo.controller.abort();
          }
          onError(err);
          updateFileInfo(fileUid, { status: UploadStatus.ERROR });
          message.error(`文件 ${file.name} 上传失败`);
        })
        .finally(() => {
          delete fileMapRef.current[fileUid];
        });
    },
    [uploadUrl, name, updateFileInfo, timeout, method, isMultiple, memBaseParams, makeRequest]
  );

  if (readOnly) {
    return (
      <Space
        style={style}
        className={className ? `${className} ${READ_ONLY_CLASS}` : READ_ONLY_CLASS}
        direction="horizontal"
        wrap={true}
        {...antdSpaceProps}
      >
        {fileList.map((item) => {
          let v =
            listType === "picture" ? (
              <Image alt={item.url} height={128} {...antdReadonlyItemProps} key={item.uid} src={item.url} />
            ) : (
              <Button icon={<PaperClipOutlined />} target="_blank" {...antdReadonlyItemProps} key={item.uid} href={item.url} type="link">
                {item.name || item.url}
              </Button>
            );
          return v;
        })}
      </Space>
    );
  }

  const uploadProps = {
    style,
    className,
    ...antdUploadProps,
    listType,
    name,
    maxCount: maxCount > 0 ? maxCount : undefined,
    fileList,
    disabled: disabled || readOnly,
    beforeUpload: (file) => {
      // 第2个参数 files 是队列中的文件
      if (maxSize > 0 && file.size > maxSize) {
        const show = formatByte(maxSize);
        message.error(`文件最大不能超过 ${show}`);
        return false;
      }
      if (maxCount > 1 && fileList.length >= maxCount) {
        message.error(`最多上传${maxCount}个文件`);
        return false;
      }
      return true;
    },
    customRequest: ({ file, onProgress, onError, onSuccess }) => {
      if (disabled) {
        onError(new Error("上传已禁用"));
        return;
      }
      customRequest({ file, onProgress, onError, onSuccess });
    },
    onRemove: (file) => {
      const tmpFile = fileMapRef.current[file.uid];
      delete fileMapRef.current[file.uid];
      setFileList((oldV) =>
        oldV.filter((item) => {
          const isDel = item.uid === file.uid;
          if (isDel) {
            const singal = tmpFile?.singal;
            if (singal && item.status === UploadStatus.UPLOADING) {
              singal.abort();
            }
          }
          return !isDel;
        })
      );
    },
    onChange: ({ fileList: files }) => {
      onValueChange(files);
    },
  };

  const warnText = (
    <p className="ant-upload-hint">
      {maxCount > 0 ? `限制文件个数${maxCount}个` : "不限制个数"}，
      {maxSize > 0 ? `文件大小不能超过 ${formatByte(maxSize)}` : "不限制大小"}
    </p>
  );
  return enableDragger && !readOnly ? (
    <Upload.Dragger {...uploadProps}>
      {children || (
        <>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          {warnText}
        </>
      )}
    </Upload.Dragger>
  ) : (
    <Upload {...uploadProps}>
      {children || (
        <Tooltip title={warnText}>
          <Button icon={<UploadOutlined />} {...antdButtonConfig}>
            上传
          </Button>
        </Tooltip>
      )}
    </Upload>
  );
};

const filePropType = PropTypes.shape({
  uid: PropTypes.string.isRequired,
  // 文件名
  name: PropTypes.string,
  // 文件url
  url: PropTypes.string,
  // 文件缩略图url
  thumbUrl: PropTypes.string,
  // 文件大小
  size: PropTypes.number,
  // 文件类型, eg: image/png
  type: PropTypes.string,
  // 上传状态, antd 的 Upload 组件的 status 字段
  status: PropTypes.string,
});

UploadView.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.node,

  value: PropTypes.oneOfType([filePropType, PropTypes.arrayOf(filePropType)]),
  onChange: PropTypes.func,

  method: PropTypes.string, // 上传请求方法
  uploadUrl: PropTypes.string.isRequired,
  timeout: PropTypes.number, // 上传超时时间，单位毫秒
  reqConfig: PropTypes.object, // axios的配置
  baseParams: PropTypes.object, // 上传请求的额外参数
  enableDragger: PropTypes.bool, // 是否支持拖拽文件
  maxSize: PropTypes.number, // 限制文件大小
  // 原生组件支持的配置
  name: PropTypes.string, // 表单中文件字段名
  listType: PropTypes.string, // 文件列表类型
  maxCount: PropTypes.number, // 限制文件个数；0 表示不限制
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  antdUploadProps: PropTypes.object,
  antdButtonConfig: PropTypes.object,
  antdSpaceProps: PropTypes.object,
  antdReadonlyItemProps: PropTypes.object,
};

export default UploadView;

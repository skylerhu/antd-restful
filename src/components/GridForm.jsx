import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Button, Checkbox, Form, Input, InputNumber, List, message, Radio, Select, Space } from "antd";
import { FieldType } from "src/common/constants";
import { isEmpty, isFunction } from "src/common/typeTools";
import FormItems from "src/components/formitems";
import { useDeepCompareMemoize } from "src/hooks";

const GridForm = forwardRef(
  (
    {
      style,
      className,
      advancedSearch = true,
      fields,
      onSubmit,
      onValuesChange,
      onReset,
      submitTitle = "提交",
      resetTitle = "重置",
      initialValues,
      antdFormProps,
      antdListProps,
    },
    ref
  ) => {
    const [form] = Form.useForm();

    // 单项模式下，当前激活的表单项的key
    const [activeFieldKey, setActiveFieldKey] = useState();
    // 单项模式下，表单项的选项
    const options = useMemo(() => {
      return fields
        ?.filter((item) => !item.antdFormItemProps?.hidden)
        .map((item) => ({
          label: item.label || item.key,
          value: item.key,
        }));
    }, [fields]);

    const fieldKeys = useDeepCompareMemoize(options.map((item) => item.value));

    const initKeyRef = useRef();
    // 初始化激活的表单项的key
    const initActiveKey = useCallback(
      (values) => {
        if (!fieldKeys?.length) {
          return;
        }
        // console.log("fieldKeys", fieldKeys);
        const changedKeys = Object.keys(values).filter((key) => !isEmpty(values[key]) && fieldKeys.includes(key));
        // console.log("changedKeys", changedKeys, values);
        if (changedKeys.length >= 1) {
          // 单项模式下，只有一个字段被修改，则激活该字段
          initKeyRef.current = changedKeys[0];
          setActiveFieldKey((oldV) => (oldV === changedKeys[0] ? oldV : changedKeys[0]));
        } else {
          // 单项模式下，没有字段被修改，则激活第一个字段
          initKeyRef.current = fieldKeys[0];
          setActiveFieldKey(fieldKeys[0]);
        }
      },
      [fieldKeys]
    );

    const activeItem = useMemo(() => {
      return fields?.find((item) => item.key === activeFieldKey);
    }, [fields, activeFieldKey]);

    const setFieldsValue = useCallback(
      (values) => {
        form.setFieldsValue(values);
        initActiveKey(values);
      },
      [form, initActiveKey]
    );

    // 暴露给ref调用的方法
    useImperativeHandle(
      ref,
      () => ({
        getFormInstance: () => ({ ...form, setFieldsValue }),
      }),
      [form, setFieldsValue]
    );

    const handleValues = useCallback(
      (values) => {
        if (!fields?.length) {
          return values;
        }
        // 保证设置的值都有key
        const data = { ...values };
        fields.forEach((item) => {
          if (data[item.key] === undefined) {
            data[item.key] = null;
          }
        });
        return data;
      },
      [fields]
    );

    const handleFinish = useCallback(
      (values) => {
        // 执行 form.validateFields 会触发 form的 onFinish 事件
        if (isFunction(onSubmit)) {
          onSubmit(handleValues(values));
        }
      },
      [onSubmit, handleValues]
    );

    const handleReset = useCallback(() => {
      form.resetFields();
      if (isFunction(onReset)) {
        const values = form.getFieldsValue();
        onReset(handleValues(values));
      }
    }, [form, onReset, handleValues]);

    const renderItem = useCallback(
      (item) => {
        let view;
        if (isFunction(item.render)) {
          view = item.render(item);
        } else {
          const fieldProps = { ...item.antdFieldProps, ...item.antdSingleProps };
          switch (item.type) {
            case FieldType.SELECT: {
              view = <FormItems.RestSelect {...fieldProps} />;
              break;
            }
            case FieldType.RADIO: {
              view = <Radio.Group {...fieldProps} />;
              break;
            }
            case FieldType.CHECKBOX: {
              view = <Checkbox.Group {...fieldProps} />;
              break;
            }
            case FieldType.NUMBER: {
              view = <InputNumber {...fieldProps} />;
              break;
            }
            case FieldType.DATE_PICKER: {
              view = <FormItems.DateStrPicker {...fieldProps} />;
              break;
            }
            case FieldType.DATE_RANGE_PICKER: {
              view = <FormItems.RangeStrPicker {...fieldProps} />;
              break;
            }
            case FieldType.NUMBER_RANGE: {
              view = <FormItems.NumberRange {...fieldProps} />;
              break;
            }
            case FieldType.AUTO_COMPLETE: {
              view = <FormItems.RestAutoComplete {...fieldProps} />;
              break;
            }
            case FieldType.UPLOAD: {
              view = <FormItems.UploadView {...fieldProps} />;
              break;
            }
            case FieldType.CASCADER: {
              view = <FormItems.RestCascader {...fieldProps} />;
              break;
            }
            case FieldType.TREE_SELECT: {
              view = <FormItems.RestTreeSelect {...fieldProps} />;
              break;
            }
            default: {
              view = <Input {...fieldProps} onPressEnter={() => form.validateFields()} />;
              break;
            }
          }
        }
        return view;
      },
      [form]
    );

    const labelFlex = useMemo(() => {
      return antdFormProps?.labelCol?.flex || "80px";
    }, [antdFormProps?.labelCol]);


    if (!fields || fields.length === 0) {
      // 没有配置字段，不显示
      return null;
    }

    return (
      <Form
        style={style}
        className={className}
        labelCol={{ flex: labelFlex, ...antdFormProps?.labelCol }}
        {...antdFormProps}
        form={form}
        initialValues={initialValues}
        onFinish={handleFinish}
        onFinishFailed={() => message.error("请检查输入内容")}
        onValuesChange={(changedValues, allValues) => {
          if (isFunction(onValuesChange)) {
            onValuesChange(changedValues, allValues);
          }
        }}
      >
        {!advancedSearch ? (
          <Space>
            <Select
              style={{ minWidth: 100 }}
              value={activeItem?.key}
              options={options}
              onChange={(v) => setActiveFieldKey(v)}
            />
            {activeItem && (
              <Form.Item
                noStyle
                {...activeItem.antdFormItemProps}
                name={activeItem.key}
                label={activeItem.label || activeItem.key}
              >
                {renderItem(activeItem)}
              </Form.Item>
            )}
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
          </Space>
        ) : (
          <List
            grid={{
              gutter: 10,
              xs: 1,
              sm: 2,
              md: 4,
            }}
            {...antdListProps}
            dataSource={fields.concat([
              {
                key: "__submit",
              },
            ])}
            renderItem={(item) => (
              <List.Item key={item.key}>
                {item.key === "__submit" ? (
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Space style={{ marginLeft: labelFlex }}>
                      <Button type="primary" htmlType="submit">
                        {submitTitle}
                      </Button>
                      <Button htmlType="reset" onClick={() => handleReset()}>
                        {resetTitle}
                      </Button>
                    </Space>
                  </Form.Item>
                ) : (
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    {...item.antdFormItemProps}
                    name={item.key}
                    label={item.label || item.key}
                  >
                    {renderItem(item)}
                  </Form.Item>
                )}
              </List.Item>
            )}
          />
        )}
      </Form>
    );
  }
);
GridForm.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,

  // 表单项配置
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string,
      antdFormItemProps: PropTypes.object,
      type: PropTypes.oneOf(FieldType.map((o) => o.value)),
      antdFieldProps: PropTypes.object,
      render: PropTypes.func,
      // 单项模式下字段组件的特殊属性; 高级模式不生效
      antdSingleProps: PropTypes.object,
    })
  ),

  onSubmit: PropTypes.func,
  onReset: PropTypes.func,
  submitTitle: PropTypes.node,
  resetTitle: PropTypes.node,

  initialValues: PropTypes.object,
  onValuesChange: PropTypes.func,

  // 开启高级搜索
  advancedSearch: PropTypes.bool,

  antdFormProps: PropTypes.object,
  antdListProps: PropTypes.object,
};
GridForm.displayName = "GridForm";

export default GridForm;

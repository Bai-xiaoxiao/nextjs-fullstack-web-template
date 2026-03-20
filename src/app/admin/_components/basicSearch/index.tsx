"use client";
import { Form, Button, Card, Tooltip } from "antd";
import { useState } from "react";

interface BasicSearchProps {
  onSearch?: (values: any) => Promise<void>;
  onReset?: () => void;
  children?: React.ReactNode;
}

const BasicSearch: React.FC<BasicSearchProps> = (props) => {
  const [form] = Form.useForm();
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const { onSearch, onReset, children, ...rest } = props;

  const handleSubmit = async (values: any) => {
    if (typeof onSearch === "function") {
      setIsSearchLoading(true);
      await onSearch?.(values);
      setIsSearchLoading(false);
    }
  };

  const handleReset = async () => {
    form.resetFields();
    onReset?.();
    await handleSubmit(form.getFieldsValue());
  };

  return (
    <Card>
      <Form form={form} layout="inline" onFinish={handleSubmit} {...rest}>
        {children}
        <Form.Item>
          <Button loading={isSearchLoading} type="primary" htmlType="submit">
            搜索
          </Button>
        </Form.Item>
        <Form.Item>
          <Tooltip title="重置所有搜索条件">
            <Button type="link" onClick={handleReset}>
              重置
            </Button>
          </Tooltip>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default BasicSearch;

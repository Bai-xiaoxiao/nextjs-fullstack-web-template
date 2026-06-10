"use client";

import { useState, useEffect } from "react";
import { Form, Input, Modal, Button } from "antd";
import { api } from "@/trpc/react";

interface EditUserFormProps {
  /** 是否显示表单 */
  visible: boolean;
  /** 关闭表单的回调 */
  onClose: () => void;
  /** 编辑的用户数据，如果为空则为新建用户 */
  userData?: {
    id: string;
    name: string;
    email: string;
  } | null;
  /** 提交成功的回调 */
  onSubmitSuccess?: () => void;
}

export default function EditUserForm({
  visible,
  onClose,
  userData,
  onSubmitSuccess,
}: EditUserFormProps) {
  const [form] = Form.useForm();
  const { mutate: signInByBetterAuth, isPending: isPendingSignIn } = api.user.signInByBetterAuth.useMutation();
  const { mutate: resetPassword, isPending: isPendingResetPassword } = api.user.resetPassword.useMutation();

  const isPending = isPendingSignIn || isPendingResetPassword;

  // 清空表单
  const resetForm = () => {
    form.resetFields();
  };

  // 当 visible 变化时重置表单
  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  // 当 userData 变化时设置表单值
  useEffect(() => {
    if (userData && visible) {
      form.setFieldsValue({
        name: userData.name,
        email: userData.email,
      });
    }
  }, [userData, visible, form]);

  // 提交表单
  const handleSubmit = async (values: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      if (userData) {
        // 编辑用户
        resetPassword({
          password: values.password,
        });
      } else {
        // 新建用户
         signInByBetterAuth(values);
      }

      onSubmitSuccess?.();
      resetForm();
      onClose();
    } catch (error) {
      console.error("提交失败:", error);
    }
  };

  return (
    <Modal
      title={userData ? "编辑用户" : "新建用户"}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        {/* 用户名字段 - 编辑和新建都支持 */}
        <Form.Item
          name="name"
          label="用户名"
          rules={[
            {
              required: true,
              message: "请输入用户名",
            },
            {
              min: 1,
              message: "用户名至少1个字符",
            },
            {
              max: 20,
              message: "用户名最多20个字符",
            },
          ]}
        >
          <Input
            placeholder={userData ? "请输入用户名" : "请输入用户名"}
            disabled={!!userData} // 编辑时禁用用户名修改
          />
        </Form.Item>



        <Form.Item className="mb-0 text-right">
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
          >
            {userData ? "保存修改" : "创建用户"}
          </Button>
          <Button
            className="ml-2"
            onClick={onClose}
            disabled={isPending}
          >
            取消
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

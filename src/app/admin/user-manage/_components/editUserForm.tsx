"use client";

import { useState, useEffect } from "react";
import { Form, Input, Modal, Button, Upload } from "antd";
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
  const { mutate: uploadFile, isPending: isPendingUploadFile } = api.upload.create.useMutation();
  

  const isPending = isPendingSignIn || isPendingResetPassword;

  // 清空表单
  const resetForm = () => {
    form.resetFields();
  };

  const handleImageChange = (info: any) => {
    console.log("Upload event:", info);
    const file = info.file.originFileObj as File;
    const fd = new FormData();
    fd.append("file", file);
    uploadFile(fd, {
      onSuccess: (data) => {
        console.log("Upload success:", data);
      },
      onError: (error) => {
        console.error("Upload error:", error);
      },
    });
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

        {/* 邮箱字段 - 新建时需要，编辑时只读 */}
        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            {
              required: !userData,
              message: "请输入邮箱",
            },
            {
              type: "email",
              message: "请输入有效的邮箱地址",
            },
          ]}
        >
          <Input
            placeholder={userData ? "邮箱（编辑时不可修改）" : "请输入邮箱"}
            disabled={!!userData} // 编辑时禁用邮箱修改
          />
        </Form.Item>

        {/* 密码字段 - 只在新建时显示 */}
          <Form.Item
            name="password"
            label="密码"
            rules={[
              {
                required: true,
                message: "请输入密码",
              },
              {
                min: 6,
                message: "密码至少6位",
              },
              {
                max: 20,
                message: "密码最多20位",
              },
            ]}
          >
            <Input.Password
              placeholder="请输入密码（至少6位）"
            />
          </Form.Item>

        {/* 确认密码字段 - 只在新建时显示 */}
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={["password"]}
            rules={[
              {
                required: true,
                message: "请确认密码",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="请再次输入密码"
            />
          </Form.Item>

          <Form.Item
            name="image"
            label="头像"
          >
            <Upload
              maxCount={1}
              showUploadList={false}
              action="/api/upload"
              listType="picture-card"
              onChange={handleImageChange}
            >
              <Button>上传头像</Button>
            </Upload>
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

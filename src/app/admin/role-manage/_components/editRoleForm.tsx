"use client";

import { useState, useEffect } from "react";
import { Form, Input, Modal, Button, Select } from "antd";
import { api } from "@/trpc/react";

interface EditRoleFormProps {
  /** 是否显示表单 */
  visible: boolean;
  /** 关闭表单的回调 */
  onClose: () => void;
  /** 编辑的角色数据，如果为空则为新建角色 */
  roleData?: {
    id: string;
    name: string;
    users?: { id: string; name: string }[];
  } | null;
  /** 提交成功的回调 */
  onSubmitSuccess?: () => void;
}

export default function EditRoleForm({
  visible,
  onClose,
  roleData,
  onSubmitSuccess,
}: EditRoleFormProps) {
  const [form] = Form.useForm();
  
  // 获取所有用户列表
  const { data: users } = api.user.getList.useQuery(
    {
      page: 1,
      pageSize: 1000,
    },
    {
      enabled: visible,
    }
  );

  // 创建或更新角色
  const { mutate: createRole, isPending: isPendingCreate } = api.role.create.useMutation();
  // 更新角色
  const { mutate: updateRole, isPending: isPendingUpdate } = api.role.update.useMutation();
  const isPending = isPendingCreate || isPendingUpdate;

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

  // 当 roleData 变化时设置表单值
  useEffect(() => {
    if (roleData && visible) {
      form.setFieldsValue({
        name: roleData.name,
        userIds: roleData.users?.map((user) => user.id) ?? [],
      });
    }
  }, [roleData, visible, form]);

  // 提交表单
  const handleSubmit = async (values: {
    name: string;
    userIds: string[];
  }) => {
    try {
      if (roleData) {
        // TODO: 编辑角色 - 需要添加 update mutation
        console.log("编辑角色", values);
        updateRole({
          id: roleData.id,
          name: values.name,
          userIds: values.userIds,
        }, {
          onSuccess: () => {
            onSubmitSuccess?.();
            resetForm();
      onClose();
          },
        })
      } else {
        // 新建角色
        createRole({
          name: values.name,
          userIds: values.userIds,
        }, {
          onSuccess: () => {
            onSubmitSuccess?.();
            resetForm();
            onClose();
          },
        });
      }

      
    } catch (error) {
      console.error("提交失败:", error);
    }
  };

  return (
    <Modal
      title={roleData ? "编辑角色" : "新建角色"}
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
        {/* 角色名称字段 */}
        <Form.Item
          name="name"
          label="角色名称"
          rules={[
            {
              required: true,
              message: "请输入角色名称",
            },
            {
              min: 1,
              message: "角色名称至少1个字符",
            },
            {
              max: 50,
              message: "角色名称最多50个字符",
            },
          ]}
        >
          <Input placeholder="请输入角色名称" />
        </Form.Item>

        {/* 绑定用户字段 - 多选 */}
        <Form.Item
          name="userIds"
          label="绑定用户"
          rules={[
            {
              required: false,
            },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="请选择要绑定的用户"
            options={users?.map((user) => ({
              label: `${user.name} (${user.email})`,
              value: user.id,
            }))}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            maxTagCount="responsive"
          />
        </Form.Item>

        <Form.Item className="mb-0 text-right">
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
          >
            {roleData ? "保存修改" : "创建角色"}
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
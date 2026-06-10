---
name: "ui-component"
description: "创建和管理基于Ant Design的UI组件，包括表单、表格、布局等常用组件。Invoke when user asks to create UI components with Ant Design, modify existing components, or need Ant Design implementation."
---

# Ant Design UI 组件管理器

## 功能说明

这个技能帮助你创建和管理基于 Ant Design 的 UI 组件，包括：

1. **表单组件** - 创建复杂的表单验证和提交逻辑
2. **表格组件** - 实现数据展示和操作功能
3. **布局组件** - 构建响应式页面布局
4. **交互组件** - 实现用户交互和反馈

## 使用场景

当用户提出以下需求时调用此技能：
- 创建 Ant Design 表单
- 实现数据表格
- 构建页面布局
- 添加用户交互组件

## 项目依赖

```json
{
  "dependencies": {
    "@ant-design/icons": "~6.1.0",
    "antd": "^6.3.3"
  }
}
```

## 表单组件规范

### 基础表单

```typescript
"use client";

import { Form, Input, Button, message } from "antd";
import { api } from "@/trpc/react";

interface FormValues {
  name: string;
  email: string;
}

export function BasicForm() {
  const [form] = Form.useForm();
  const mutation = api.user.create.useMutation({
    onSuccess: () => {
      message.success("创建成功");
      form.resetFields();
    },
    onError: (error) => {
      message.error(error.message || "创建失败");
    },
  });

  const onFinish = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
      style={{ maxWidth: 600 }}
    >
      <Form.Item
        label="姓名"
        name="name"
        rules={[{ required: true, message: "请输入姓名" }]}
      >
        <Input placeholder="请输入姓名" />
      </Form.Item>

      <Form.Item
        label="邮箱"
        name="email"
        rules={[
          { required: true, message: "请输入邮箱" },
          { type: "email", message: "请输入有效的邮箱地址" },
        ]}
      >
        <Input placeholder="请输入邮箱" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={mutation.isPending}>
          提交
        </Button>
      </Form.Item>
    </Form>
  );
}
```

### 复杂表单

```typescript
"use client";

import { Form, Input, Select, DatePicker, Button, Space, message } from "antd";
import { api } from "@/trpc/react";
import dayjs from "dayjs";

interface ComplexFormValues {
  title: string;
  category: string;
  publishDate: dayjs.Dayjs;
  description?: string;
}

export function ComplexForm() {
  const [form] = Form.useForm();
  const mutation = api.post.create.useMutation({
    onSuccess: () => {
      message.success("发布成功");
      form.resetFields();
    },
    onError: (error) => {
      message.error(error.message || "发布失败");
    },
  });

  const onFinish = (values: ComplexFormValues) => {
    mutation.mutate({
      ...values,
      publishDate: values.publishDate.toISOString(),
    });
  };

  return (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
      initialValues={{
        publishDate: dayjs(),
      }}
    >
      <Form.Item
        label="标题"
        name="title"
        rules={[{ required: true, message: "请输入标题" }]}
      >
        <Input placeholder="请输入标题" />
      </Form.Item>

      <Form.Item
        label="分类"
        name="category"
        rules={[{ required: true, message: "请选择分类" }]}
      >
        <Select placeholder="请选择分类">
          <Select.Option value="tech">技术</Select.Option>
          <Select.Option value="life">生活</Select.Option>
          <Select.Option value="work">工作</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="发布日期"
        name="publishDate"
        rules={[{ required: true, message: "请选择发布日期" }]}
      >
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item label="描述" name="description">
        <Input.TextArea rows={4} placeholder="请输入描述" />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={mutation.isPending}>
            发布
          </Button>
          <Button onClick={() => form.resetFields()}>重置</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
```

## 表格组件规范

### 基础表格

```typescript
"use client";

import { Table, Button, Space, message, Popconfirm } from "antd";
import type { ColumnsType } from "antd/es/table";
import { api } from "@/trpc/react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

interface DataType {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export function UserTable() {
  const utils = api.useUtils();
  
  const { data, isLoading } = api.user.getAll.useQuery();
  
  const deleteMutation = api.user.delete.useMutation({
    onSuccess: () => {
      message.success("删除成功");
      utils.user.invalidate();
    },
    onError: (error) => {
      message.error(error.message || "删除失败");
    },
  });

  const columns: ColumnsType<DataType> = [
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => deleteMutation.mutate({ id: record.id })}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              icon={<DeleteOutlined />} 
              danger 
              size="small"
              loading={deleteMutation.isPending}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (record: DataType) => {
    // 处理编辑逻辑
    console.log("编辑:", record);
  };

  return (
    <Table
      columns={columns}
      dataSource={data?.users || []}
      rowKey="id"
      loading={isLoading}
      pagination={{ pageSize: 10 }}
    />
  );
}
```

### 带搜索的表格

```typescript
"use client";

import { Table, Input, Button, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import { useState } from "react";

interface DataType {
  id: string;
  name: string;
  email: string;
}

export function SearchableTable() {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  const handleSearch = (selectedKeys: string[], confirm: any, dataIndex: string) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const getColumnSearchProps = (dataIndex: string) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`搜索 ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            搜索
          </Button>
          <Button
            onClick={() => clearFilters && clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            重置
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value: string, record: DataType) =>
      record[dataIndex as keyof DataType]
        ?.toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
  });

  const columns: ColumnsType<DataType> = [
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email"),
    },
  ];

  return <Table columns={columns} dataSource={[]} rowKey="id" />;
}
```

## 布局组件规范

### 管理后台布局

```typescript
"use client";

import { Layout, Menu, Breadcrumb } from "antd";
import {
  UserOutlined,
  DashboardOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

const { Header, Content, Footer, Sider } = Layout;

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: <Link href="/admin">仪表板</Link>,
    },
    {
      key: "/admin/user-manage",
      icon: <UserOutlined />,
      label: <Link href="/admin/user-manage">用户管理</Link>,
    },
    {
      key: "/admin/info-manage",
      icon: <SettingOutlined />,
      label: <Link href="/admin/info-manage">信息管理</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible>
        <div className="logo" style={{ height: 32, margin: 16, background: "rgba(255, 255, 255, 0.2)" }} />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: "#fff" }}>
          <div style={{ paddingLeft: 24 }}>管理后台</div>
        </Header>
        <Content style={{ margin: "0 16px" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>首页</Breadcrumb.Item>
            <Breadcrumb.Item>管理</Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ padding: 24, minHeight: 360, background: "#fff" }}>
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          © 2024 管理后台
        </Footer>
      </Layout>
    </Layout>
  );
}
```

## 交互组件规范

### 模态框表单

```typescript
"use client";

import { Modal, Form, Input, Button, message } from "antd";
import { api } from "@/trpc/react";

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  initialData?: {
    name: string;
    email: string;
  };
}

export function EditUserModal({ open, onClose, userId, initialData }: EditUserModalProps) {
  const [form] = Form.useForm();
  const utils = api.useUtils();
  
  const mutation = api.user.update.useMutation({
    onSuccess: () => {
      message.success("更新成功");
      utils.user.invalidate();
      onClose();
    },
    onError: (error) => {
      message.error(error.message || "更新失败");
    },
  });

  const onFinish = (values: any) => {
    mutation.mutate({ id: userId, ...values });
  };

  return (
    <Modal
      title="编辑用户"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        initialValues={initialData}
      >
        <Form.Item
          label="姓名"
          name="name"
          rules={[{ required: true, message: "请输入姓名" }]}
        >
          <Input placeholder="请输入姓名" />
        </Form.Item>

        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            { required: true, message: "请输入邮箱" },
            { type: "email", message: "请输入有效的邮箱地址" },
          ]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={mutation.isPending}>
              保存
            </Button>
            <Button onClick={onClose}>取消</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
```

## 最佳实践

### 1. 表单验证

```typescript
// 自定义验证规则
const validatePassword = (_: any, value: string) => {
  if (value && value.length < 6) {
    return Promise.reject(new Error("密码长度不能少于6位"));
  }
  return Promise.resolve();
};

<Form.Item
  name="password"
  rules={[
    { required: true, message: "请输入密码" },
    { validator: validatePassword },
  ]}
>
  <Input.Password />
</Form.Item>
```

### 2. 错误处理

```typescript
const mutation = api.user.create.useMutation({
  onSuccess: () => {
    message.success("操作成功");
  },
  onError: (error) => {
    if (error.code === "UNAUTHORIZED") {
      message.error("请先登录");
    } else {
      message.error(error.message || "操作失败");
    }
  },
});
```

### 3. 加载状态

```typescript
<Button 
  type="primary" 
  htmlType="submit" 
  loading={mutation.isPending}
  disabled={mutation.isPending}
>
  {mutation.isPending ? "提交中..." : "提交"}
</Button>
```

### 4. 数据刷新

```typescript
const utils = api.useUtils();

const mutation = api.user.create.useMutation({
  onSuccess: () => {
    utils.user.invalidate(); // 刷新用户数据
  },
});
```

## 常用组件模式

### 1. 搜索表单

```typescript
"use client";

import { Form, Input, Button, Space } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";

export function SearchForm({ onSearch }: { onSearch: (values: any) => void }) {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    onSearch(values);
  };

  const onReset = () => {
    form.resetFields();
    onSearch({});
  };

  return (
    <Form form={form} onFinish={onFinish} layout="inline">
      <Form.Item name="keyword" label="关键词">
        <Input placeholder="请输入关键词" />
      </Form.Item>
      
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
            搜索
          </Button>
          <Button onClick={onReset} icon={<ReloadOutlined />}>
            重置
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
```

### 2. 确认对话框

```typescript
"use client";

import { Popconfirm, Button, message } from "antd";
import { api } from "@/trpc/react";

export function DeleteButton({ id }: { id: string }) {
  const utils = api.useUtils();
  
  const mutation = api.user.delete.useMutation({
    onSuccess: () => {
      message.success("删除成功");
      utils.user.invalidate();
    },
    onError: (error) => {
      message.error(error.message || "删除失败");
    },
  });

  return (
    <Popconfirm
      title="确定要删除吗？"
      description="删除后无法恢复"
      onConfirm={() => mutation.mutate({ id })}
      okText="确定"
      cancelText="取消"
    >
      <Button danger loading={mutation.isPending}>
        删除
      </Button>
    </Popconfirm>
  );
}
```

## 注意事项

1. **始终使用 Ant Design 的 Form 组件进行表单管理**
2. **合理使用消息提示（message）给用户反馈**
3. **正确处理加载状态和禁用状态**
4. **使用 TypeScript 类型确保类型安全**
5. **合理组织组件结构和样式**

## 相关技能

- [Next.js Component](skill://nextjs-component) - Next.js 组件开发
- [tRPC Router](skill://trpc-router) - API 路由管理
- [Auth Manager](skill://auth-manager) - 认证管理

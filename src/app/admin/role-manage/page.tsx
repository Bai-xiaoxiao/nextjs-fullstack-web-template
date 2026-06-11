"use client";
import BasicSearch from "@/app/admin/_components/basicSearch";
import { Button, Card, Form, Input, Table, Modal } from "antd";
import { api } from "@/trpc/react";
import { useState } from "react";
import EditRoleForm from "@/app/admin/role-manage/_components/editRoleForm";
interface UserSearchQuery {
  keyword?: string;
}

const UserManage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<UserSearchQuery>({
    keyword: "",
  });
  const [pagenation, setPagenation] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
  });
  const { data, isLoading, error, refetch } = api.role.getList.useQuery(
    {
      ...searchQuery,
      page: pagenation.page,
      pageSize: pagenation.pageSize,
    },
    {
      enabled: true,
    },
  );
  const [visible, setVisible] = useState(false);
  const [userData, setUserData] = useState<{
    id: string;
    name: string;
    email: string;
  }>();

  const onSearch = async (values: UserSearchQuery) => {
    setSearchQuery(values);
  };

  const addUser = () => {
    setVisible(true);
    setUserData(undefined);
  };

  const editUser = (record: typeof data[0]) => {
    console.log(record, 2);
    setVisible(true);
    setUserData(record as typeof userData);
  };

  return (
    <Card
      title="角色管理"
      extra={<Button type="primary" onClick={addUser}>
        添加角色
      </Button>}
    >
      <EditRoleForm visible={visible} roleData={userData} onClose={() => setVisible(false)} onSubmitSuccess={refetch} />
      <BasicSearch onSearch={onSearch}>
        <Form.Item name="keyword" label="用户名">
          <Input />
        </Form.Item>
      </BasicSearch>
      <div>
        {isLoading ? (
          <div>加载中...</div>
        ) : (
          <div>
            {data?.length === 0 && <div>暂无数据</div>}
            {data && data.length > 0 && (
              <Table
                columns={[
                  {
                    title: "id",
                    dataIndex: "id",
                    key: "id",
                  },
                  {
                    title: "角色名",
                    dataIndex: "name",
                    key: "name",
                  },
                  {
                    title: "绑定人员",
                    dataIndex: "userIds",
                    key: "userIds",
                    render: (text, record) => (
                      <div>
                        {record.users.map((user) => (
                          <div key={user.id}>{user.name}</div>
                        ))}
                      </div>
                    ),
                  },
                  {
                    title: "操作",
                    dataIndex: "action",
                    key: "action",
                    render: (text, record) => (
                      <div>
                        <Button type="primary" onClick={() => editUser(record)}>
                          编辑
                        </Button>
                      </div>
                    ),
                  }
                ]}
                dataSource={data}
              />
            )}
          </div>
        )}
      </div>

      <Card>这是角色管理模块，包含了搜索、api请求方式以及数据展示功能，每一个角色可以关联多个用户。可以根据role和user的关联关系查到每个role的user。搜索支持关键词，用户名，用户邮箱搜索</Card>
    </Card>
  );
};

export default UserManage;

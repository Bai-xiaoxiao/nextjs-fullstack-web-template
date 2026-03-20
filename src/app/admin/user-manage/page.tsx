"use client";
import BasicSearch from "@/app/admin/_components/basicSearch";
import { Card, Form, Input } from "antd";
import { api } from "@/trpc/react";
import { useState } from "react";

interface UserSearchQuery {
  username?: string;
}

const UserManage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<UserSearchQuery>({
    username: "",
  });
  const [pagenation, setPagenation] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
  })
  const { data, isLoading, error } = api.user.getList.useQuery({
    ...searchQuery,
    page: pagenation.page,
    pageSize: pagenation.pageSize,
  }, {
    enabled: true,
  });

  const onSearch = async (values: UserSearchQuery) => {
    setSearchQuery(values)
  };

  return (
    <Card title="用户管理">
      <BasicSearch
        onSearch={onSearch}
      >
        <Form.Item name="username" label="用户名">
          <Input />
        </Form.Item>
      </BasicSearch>
      <div>
        {isLoading ? (
          <div>加载中...</div>
        ) : (
          <div>
            {
              data?.length === 0 && <div>暂无数据</div>
            }
            {data?.map((item) => (
              <div key={item.id}>
               id：{item.id} 用户名：{item.name} 邮箱：{item.email}
              </div>
            ))}
          </div>
        )}
      </div>

      <Card>
        这是用户管理模块，包含了搜索、api请求方式以及数据展示功能。
      </Card>
    </Card>
  );
};


export default UserManage;

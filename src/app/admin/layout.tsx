"use client";
import React from "react";
import Breadcrumb from "@/app/admin/_components/breadcrumb";
import { Layout, theme } from "antd";
import Menu from "@/app/admin/_components/menu";

const { Header, Content, Sider, Footer } = Layout;

const App: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout className="min-h-screen!">
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="flex h-12 w-32 items-center justify-center rounded-2xl bg-blue-300 text-white">
          Logo
        </div>
        <div className="text-white">用户信息模块</div>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: colorBgContainer }}>
          <Menu />
        </Sider>
        <Layout style={{ padding: "0 24px 24px" }}>
          <Breadcrumb />
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </Content>
          <Footer style={{ textAlign: "center" }}>
            Powered by BXD whith ❤
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;

import React from 'react';
import { Menu as AntdMenu } from 'antd';
import type { MenuProps } from 'antd';
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const items2: MenuProps['items'] = [UserOutlined, LaptopOutlined, NotificationOutlined].map(
  (icon, index) => {
    const key = String(index + 1);

    return {
      key: `sub${key}`,
      icon: React.createElement(icon),
      label: `subnav ${key}`,
      children: Array.from({ length: 4 }).map((_, j) => {
        const subKey = index * 4 + j + 1;
        return {
          key: subKey,
          label: `option${subKey}`,
        };
      }),
    };
  },
);

const ADMIN_PATH = '/admin';

const DEFAULT_MENUS = [
  {
    key: 'user-manage',
    icon: <UserOutlined />,
    label: '用户管理',
    path: '/user-manage',
  },
  {
    key: 'info-manage',
    icon: <LaptopOutlined />,
    label: '信息管理',
    path: '/info-manage',
  },
   {
    key: 'role-manage',
    icon: <LaptopOutlined />,
    label: '权限管理',
    path: '/role-manage',
  }
]

/**
 * 菜单组件
 */
const Menu: React.FC = () => {
  const router = useRouter();
  const handleclickmenu = (key: string, keyPath: string[], selectedKeys: string[]) => {
    const menu = DEFAULT_MENUS.find((item) => item.key === key);
    if (menu) {
      // 跳转路由
      router.push(`${ADMIN_PATH}${menu.path}`);
    }
  }

  return (
    <AntdMenu
      mode="inline"
      defaultOpenKeys={[]}
      style={{ height: '100%', borderInlineEnd: 0 }}
      items={DEFAULT_MENUS}
      onSelect={({ key, keyPath, selectedKeys }) => handleclickmenu(key, keyPath, selectedKeys)}
    />
  );
};

export default Menu;

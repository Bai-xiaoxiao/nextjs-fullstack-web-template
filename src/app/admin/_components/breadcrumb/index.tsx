import React from 'react';
import { Breadcrumb as AntdBreadcrumb } from 'antd';

/**
 * 面包屑组件
 */
const Breadcrumb: React.FC = () => {
  return (
    <AntdBreadcrumb
      items={[{ title: 'Home' }, { title: 'List' }, { title: 'App' }]}
      style={{ margin: '16px 0' }}
    />
  );
};

export default Breadcrumb;

import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  WalletOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGlobalStore } from '@/store';
import type { MenuProps } from 'antd';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed } = useGlobalStore();

  const menuItems: MenuItem[] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('menu.dashboard'),
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: t('menu.products'),
      onClick: () => navigate('/products'),
    },
    {
      key: '/orders',
      icon: <ShoppingCartOutlined />,
      label: t('menu.orders'),
      onClick: () => navigate('/orders'),
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: t('menu.users'),
      onClick: () => navigate('/users'),
    },
    {
      key: '/wallets',
      icon: <WalletOutlined />,
      label: t('menu.wallets'),
      onClick: () => navigate('/wallets'),
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: t('menu.reports'),
      onClick: () => navigate('/reports'),
    },
  ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '18px',
          fontWeight: 'bold',
        }}
      >
        {collapsed ? 'topupforme' : 'topupforme Admin'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar;

import React from 'react';
import { Layout, Button, Dropdown, Avatar, Space, Select } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useGlobalStore } from '@/store';
import { useAuth } from '@/hooks';
import type { MenuProps } from 'antd';

const { Header: AntHeader } = Layout;
const { Option } = Select;

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { collapsed, toggleCollapsed } = useGlobalStore();
  const { user, logout } = useAuth();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('menu.profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('menu.settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('auth.logout'),
      onClick: logout,
    },
  ];

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={toggleCollapsed}
        style={{
          fontSize: '16px',
          width: 64,
          height: 64,
        }}
      />

      <Space size="large">
        <Select
          value={i18n.language}
          style={{ width: 120 }}
          onChange={handleLanguageChange}
        >
          <Option value="en">English</Option>
          <Option value="zh">中文</Option>
          <Option value="th">ไทย</Option>
        </Select>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} src={user?.avatar} />
            <div>{user?.name || user?.email}</div>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;

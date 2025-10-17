import React from 'react';
import { Table, Tag, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services';
import { useTable } from '@/hooks';
import { formatDate } from '@/utils';
import type { User } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const UserList: React.FC = () => {
  const { t } = useTranslation();
  const { params, handleTableChange, handleSearch } = useTable();

  const { data, isLoading } = useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getUsers(params),
  });

  const columns: ColumnsType<User> = [
    {
      title: t('user.name'),
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: t('user.email'),
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: t('user.role'),
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : role === 'manager' ? 'blue' : 'default'}>
          {t(`user.${role}`)}
        </Tag>
      ),
    },
    {
      title: t('user.status'),
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Tag color={record.isActive ? 'success' : 'default'}>
          {record.isActive ? t('common.active') : t('common.inactive')}
        </Tag>
      ),
    },
    {
      title: t('user.verified'),
      dataIndex: 'isVerified',
      key: 'isVerified',
      width: 100,
      render: (verified: boolean) => (
        <Tag color={verified ? 'success' : 'warning'}>
          {verified ? t('user.verified') : t('user.unverified')}
        </Tag>
      ),
    },
    {
      title: t('user.registeredDate'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => formatDate(date),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>{t('user.title')}</h1>
        <Input
          placeholder={t('common.search')}
          prefix={<SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 200 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: params.page,
          pageSize: params.pageSize,
          total: data?.pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `${t('common.total')} ${total} ${t('common.entries')}`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default UserList;

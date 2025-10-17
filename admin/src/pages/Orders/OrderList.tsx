import React from 'react';
import { Table, Tag, Button, Space, Input } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services';
import { useTable } from '@/hooks';
import { formatDate, formatCurrency } from '@/utils';
import type { Order } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const OrderList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { params, handleTableChange, handleSearch } = useTable();

  const { data, isLoading } = useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderService.getOrders(params),
  });

  const getStatusColor = (status: Order['status']) => {
    const colors: Record<Order['status'], string> = {
      pending: 'warning',
      paid: 'processing',
      processing: 'processing',
      delivered: 'success',
      completed: 'success',
      cancelled: 'default',
      refunded: 'error',
    };
    return colors[status];
  };

  const columns: ColumnsType<Order> = [
    {
      title: t('order.orderNumber'),
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 150,
    },
    {
      title: t('order.customer'),
      dataIndex: 'userEmail',
      key: 'userEmail',
      width: 200,
    },
    {
      title: t('order.amount'),
      key: 'amount',
      width: 120,
      render: (_, record) => formatCurrency(record.payment.amount, record.payment.currency),
    },
    {
      title: t('order.paymentMethod'),
      dataIndex: ['payment', 'method'],
      key: 'paymentMethod',
      width: 120,
      render: (method: string) => method.toUpperCase(),
    },
    {
      title: t('order.orderStatus'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: Order['status']) => (
        <Tag color={getStatusColor(status)}>
          {t(`order.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('order.orderDate'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => formatDate(date),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/orders/${record._id}`)}
        >
          {t('common.view')}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>{t('order.title')}</h1>
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
        rowKey="_id"
        pagination={{
          current: params.page,
          pageSize: params.pageSize,
          total: data?.pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `${t('common.total')} ${total} ${t('common.entries')}`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default OrderList;

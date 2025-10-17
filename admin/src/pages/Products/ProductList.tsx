import React from 'react';
import { Table, Button, Space, Tag, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services';
import { useTable } from '@/hooks';
import type { Product } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const ProductList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { params, handleTableChange, handleSearch } = useTable();

  const { data, isLoading } = useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
  });

  const columns: ColumnsType<Product> = [
    {
      title: t('product.productName'),
      dataIndex: ['name', 'en'],
      key: 'name',
      width: 200,
    },
    {
      title: t('product.sku'),
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
    },
    {
      title: t('product.category'),
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: t('product.type'),
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <Tag color={type === 'game_card' ? 'blue' : type === 'gift_card' ? 'green' : 'orange'}>
          {t(`product.${type === 'game_card' ? 'gameCard' : type === 'gift_card' ? 'giftCard' : 'digitalCode'}`)}
        </Tag>
      ),
    },
    {
      title: t('product.regionalPricing'),
      key: 'pricing',
      width: 150,
      render: (_, record) => (
        <span>{record.regionalPricing.length} regions</span>
      ),
    },
    {
      title: t('product.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? t('common.active') : t('common.inactive')}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/${record._id}/edit`)}
          >
            {t('common.edit')}
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
          >
            {t('common.delete')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>{t('product.title')}</h1>
        <Space>
          <Input
            placeholder={t('common.search')}
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/products/new')}
          >
            {t('product.addProduct')}
          </Button>
        </Space>
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

export default ProductList;

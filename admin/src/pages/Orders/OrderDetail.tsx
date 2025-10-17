import React from 'react';
import { Card, Descriptions, Table, Tag, Button, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services';
import { formatDate, formatCurrency } from '@/utils';

const OrderDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrder(id!),
    enabled: !!id,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!order) return <div>Order not found</div>;

  const itemColumns = [
    {
      title: t('product.productName'),
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: t('order.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: t('order.unitPrice'),
      dataIndex: 'price',
      key: 'price',
      render: (price: number, record: any) => formatCurrency(price, record.currency),
    },
    {
      title: t('order.subtotal'),
      key: 'subtotal',
      render: (_: any, record: any) =>
        formatCurrency(record.price * record.quantity, record.currency),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{t('menu.orderDetails')}</h1>
        <Button onClick={() => navigate('/orders')}>Back to List</Button>
      </div>

      <Card title={t('order.title')} style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label={t('order.orderNumber')}>
            {order.orderNumber}
          </Descriptions.Item>
          <Descriptions.Item label={t('order.orderStatus')}>
            <Tag>{t(`order.${order.status}`)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('order.customer')}>
            {order.userEmail}
          </Descriptions.Item>
          <Descriptions.Item label={t('order.orderDate')}>
            {formatDate(order.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label={t('order.paymentMethod')}>
            {order.payment.method.toUpperCase()}
          </Descriptions.Item>
          <Descriptions.Item label={t('order.amount')}>
            {formatCurrency(order.payment.amount, order.payment.currency)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={t('order.orderItems')} style={{ marginBottom: 16 }}>
        <Table
          columns={itemColumns}
          dataSource={order.items}
          rowKey="productId"
          pagination={false}
        />
      </Card>

      {order.delivery?.codes && (
        <Card title={t('order.deliveryCodes')}>
          <Space direction="vertical">
            {order.delivery.codes.map((code, index) => (
              <Tag key={index} color="blue">{code}</Tag>
            ))}
          </Space>
        </Card>
      )}
    </div>
  );
};

export default OrderDetail;

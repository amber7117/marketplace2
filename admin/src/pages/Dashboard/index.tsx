import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => reportService.getSummary(),
  });

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>{t('dashboard.title')}</h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={isLoading}>
            <Statistic
              title={t('dashboard.totalSales')}
              value={summary?.totalSales || 0}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={isLoading}>
            <Statistic
              title={t('dashboard.totalOrders')}
              value={summary?.totalOrders || 0}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={isLoading}>
            <Statistic
              title={t('dashboard.activeUsers')}
              value={summary?.activeUsers || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={isLoading}>
            <Statistic
              title={t('dashboard.pendingOrders')}
              value={summary?.pendingOrders || 0}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title={t('dashboard.salesChart')} loading={isLoading}>
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Chart will be implemented here
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={t('dashboard.currencyDistribution')} loading={isLoading}>
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Chart will be implemented here
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

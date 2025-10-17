import React from 'react';
import { Form, Input, Button, Card, Select, Switch, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ProductFormData } from '@/types';

const { Option } = Select;

const ProductForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();

  const onFinish = (values: ProductFormData) => {
    console.log('Form values:', values);
    // TODO: Implement create/update logic
  };

  return (
    <div>
      <h1>{id ? t('product.editProduct') : t('product.addProduct')}</h1>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            isActive: true,
            isFeatured: false,
          }}
        >
          <Form.Item
            label={t('product.productName') + ' (EN)'}
            name={['name', 'en']}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={t('product.productName') + ' (中文)'}
            name={['name', 'zh']}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={t('product.productName') + ' (ไทย)'}
            name={['name', 'th']}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={t('product.sku')}
            name="sku"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={t('product.category')}
            name="category"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="gaming">Gaming</Option>
              <Option value="gift">Gift Cards</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={t('product.type')}
            name="type"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="game_card">{t('product.gameCard')}</Option>
              <Option value="gift_card">{t('product.giftCard')}</Option>
              <Option value="digital_code">{t('product.digitalCode')}</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={t('product.featured')}
            name="isFeatured"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label={t('product.status')}
            name="isActive"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {t('common.save')}
              </Button>
              <Button onClick={() => navigate('/products')}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProductForm;

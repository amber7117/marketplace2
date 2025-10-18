'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { Order } from '@/lib/schemas';

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
  const t = useTranslations('OrderDetail');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${params.orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrder(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <p className="text-gray-600 mb-4">{t('notFound')}</p>
          <Link href="/orders" className="text-blue-600 hover:underline">
            {t('backToOrders')}
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      case 'cancelled':
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/orders" className="text-blue-600 hover:underline mb-4 inline-block">
          ← {t('backToOrders')}
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
            <p className="text-gray-600">{t('orderNumber')}: {order.orderNumber}</p>
          </div>
          <span className={`px-4 py-2 rounded-full font-medium ${getStatusColor(order.status)}`}>
            {t(`status.${order.status}`)}
          </span>
        </div>
      </div>

      {/* Order Info */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">{t('orderInfo')}</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">{t('orderDate')}:</span>
              <span className="ml-2">{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            {order.paidAt && (
              <div>
                <span className="text-gray-500">{t('paidAt')}:</span>
                <span className="ml-2">{new Date(order.paidAt).toLocaleString()}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500">{t('paymentMethod')}:</span>
              <span className="ml-2">{order.paymentMethod || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">{t('contactInfo')}</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">{t('email')}:</span>
              <span className="ml-2">{order.contactInfo.email}</span>
            </div>
            {order.contactInfo.phone && (
              <div>
                <span className="text-gray-500">{t('phone')}:</span>
                <span className="ml-2">{order.contactInfo.phone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">{t('billingInfo')}</h2>
          <div className="text-sm">
            <p>{order.billingInfo.firstName} {order.billingInfo.lastName}</p>
            <p className="text-gray-600 mt-1">
              {order.billingInfo.address}<br />
              {order.billingInfo.city}, {order.billingInfo.postalCode}<br />
              {order.billingInfo.country}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="font-semibold mb-4">{t('items')}</h2>
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center border-b pb-4 last:border-0">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-gray-600">
                  {t('denomination')}: {item.denomination} {item.currency} × {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{item.currency} {(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('subtotal')}</span>
            <span>{order.currency} {order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{t('tax')}</span>
            <span>{order.currency} {order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>{t('total')}</span>
            <span>{order.currency} {order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="font-semibold mb-2">{t('notes')}</h2>
          <p className="text-sm text-gray-700">{order.notes}</p>
        </div>
      )}
    </div>
  );
}

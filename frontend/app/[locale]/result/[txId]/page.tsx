'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart-store';

export default function ResultPage({ params }: { params: { txId: string } }) {
  const t = useTranslations('Result');
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const { clearCart } = useCartStore();
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // 如果支付成功，清空购物车
    if (status === 'success') {
      clearCart();
      
      // 获取订单详情
      fetch(`/api/orders/${params.txId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrderDetails(data.data);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [status, params.txId, clearCart]);

  if (status === 'success') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">{t('success.title')}</h1>
            <p className="text-gray-600">{t('success.message')}</p>
          </div>

          {/* Order Details */}
          {orderDetails && (
            <div className="border-t border-b py-6 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">{t('orderNumber')}</p>
                  <p className="font-semibold">{orderDetails.orderNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('transactionId')}</p>
                  <p className="font-semibold">{params.txId}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('total')}</p>
                  <p className="font-semibold">
                    {orderDetails.currency} {orderDetails.total.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">{t('email')}</p>
                  <p className="font-semibold">{orderDetails.contactInfo.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Link
              href={`/orders/${params.txId}`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              {t('viewOrder')}
            </Link>
            <Link
              href="/products"
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
            >
              {t('continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed' || status === 'timeout') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          {/* Error Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-red-600 mb-2">
              {status === 'timeout' ? t('timeout.title') : t('failed.title')}
            </h1>
            <p className="text-gray-600">
              {status === 'timeout' ? t('timeout.message') : t('failed.message')}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Link
              href="/checkout"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              {t('tryAgain')}
            </Link>
            <Link
              href="/cart"
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
            >
              {t('backToCart')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <p className="text-gray-600">{t('loading')}</p>
      </div>
    </div>
  );
}

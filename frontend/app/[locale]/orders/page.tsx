'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { orderAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/currencies';
import { formatDate } from '@/lib/utils';
import { useCartStore } from '@/store';
import type { Order } from '@/types';

const skeletonKeys = ['orders-skeleton-1', 'orders-skeleton-2', 'orders-skeleton-3'];

export default function OrdersPage() {
  const t = useTranslations('order');
  const tCommon = useTranslations('common');
  const { currency } = useCartStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrders({
        page: 1,
        limit: 20,
      });
      // Filter orders client-side since status filter is not in PaginationParams
      const allOrders = response.data.data || [];
      const filteredOrders = filter === 'all' 
        ? allOrders 
        : allOrders.filter(order => order.status === filter);
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Package className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    return t(`status.${status}` as unknown) || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {skeletonKeys.map((key) => (
            <div key={key} className="h-40 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            {t('all')}
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            {t('status.pending')}
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            {t('status.completed')}
          </Button>
          <Button
            variant={filter === 'cancelled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('cancelled')}
          >
            {t('status.cancelled')}
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Package className="h-24 w-24 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t('noOrders')}</h2>
          <p className="text-muted-foreground mb-6">{t('noOrdersDescription')}</p>
          <Link href="/products">
            <Button size="lg">{tCommon('startShopping')}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">
                        {t('orderNumber')}: #{order.orderNumber || order._id.slice(0, 8)}
                      </h3>
                      <div
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <div className="ml-1">{getStatusText(order.status)}</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(order.payment?.amount || 0, currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.items?.length || 0} {t('items')}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div className="space-y-2 border-t pt-4">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={`${order._id}-${item.productId}-${item.sku}`} className="flex items-center gap-3 text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{item.productId}</p>
                          <p className="text-muted-foreground">
                            {t('qty')}: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatCurrency(item.price * item.quantity, currency)}
                        </p>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        {t('andMore', { count: order.items.length - 3 })}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4 border-t pt-4">
                  <Link href={`/orders/${order._id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      {t('viewDetails')}
                    </Button>
                  </Link>
                  {order.status === 'completed' && (
                    <Button variant="outline">{t('reorder')}</Button>
                  )}
                  {order.status === 'pending' && (
                    <Button variant="destructive" onClick={() => {}}>
                      {t('cancel')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

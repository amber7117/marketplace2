import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, CartItem, Order } from '@/lib/schemas';
import { v4 as uuidv4 } from 'uuid';

// Mock 订单存储（生产环境应使用数据库）
const ordersStore = new Map<string, Order>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, contactInfo, billingInfo, paymentMethod, currency = 'MYR' } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Cart is empty',
          },
        } as ApiResponse,
        { status: 400 }
      );
    }

    // 计算订单金额
    const subtotal = items.reduce((sum: number, item: CartItem & { price: number }) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const taxRate = 0.06; // 6% GST/SST
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = subtotal + tax;

    // 创建订单
    const orderId = uuidv4();
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const orderNumber = `ORD-${Date.now()}`;

    const order: Order = {
      id: orderId,
      orderNumber,
      items: items.map((item: any) => ({
        slug: item.slug,
        offerId: item.offerId,
        productName: item.productName || item.slug,
        denomination: item.denomination || 0,
        quantity: item.quantity,
        price: item.price,
        currency,
      })),
      subtotal,
      tax,
      total,
      currency,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod,
      transactionId,
      contactInfo,
      billingInfo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 存储订单
    ordersStore.set(orderId, order);
    ordersStore.set(transactionId, order); // 同时用 txId 作为键

    const response: ApiResponse = {
      success: true,
      data: {
        orderId,
        orderNumber,
        transactionId,
        total,
        currency,
        paymentUrl: `/payment/${transactionId}`, // Mock 支付 URL
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Checkout error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to create order',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// 导出订单存储供其他 API 使用
export { ordersStore };

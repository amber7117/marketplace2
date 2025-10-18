import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/lib/schemas';

// Mock 支付存储
const paymentStore = new Map<string, {
  transactionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, amount, currency, paymentMethod } = body;

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Transaction ID is required',
          },
        } as ApiResponse,
        { status: 400 }
      );
    }

    // 创建支付记录
    const payment = {
      transactionId,
      status: 'pending' as const,
      amount,
      currency,
      paymentMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    paymentStore.set(transactionId, payment);

    // Mock: 2-5 秒后自动完成支付
    setTimeout(() => {
      const existingPayment = paymentStore.get(transactionId);
      if (existingPayment && existingPayment.status === 'pending') {
        paymentStore.set(transactionId, {
          ...existingPayment,
          status: 'completed',
          updatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        });
      }
    }, Math.random() * 3000 + 2000); // 2-5 秒

    const response: ApiResponse = {
      success: true,
      data: {
        transactionId,
        status: 'pending',
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Payment error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to create payment',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export { paymentStore };

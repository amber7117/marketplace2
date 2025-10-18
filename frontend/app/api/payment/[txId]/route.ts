import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/lib/schemas';
import { paymentStore } from '../route';

export async function GET(
  request: NextRequest,
  { params }: { params: { txId: string } }
) {
  try {
    const { txId } = params;

    const payment = paymentStore.get(txId);

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Payment not found',
          },
        } as ApiResponse,
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      data: {
        transactionId: payment.transactionId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        updatedAt: payment.updatedAt,
        completedAt: payment.completedAt,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Payment status error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to get payment status',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}

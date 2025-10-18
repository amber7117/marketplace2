'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function PaymentPage({ params }: { params: { txId: string } }) {
  const t = useTranslations('Payment');
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'completed' | 'failed'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let pollCount = 0;
    const maxPolls = 30; // 最多轮询 30 次（30秒）

    const pollPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payment/${params.txId}`);
        const data = await response.json();

        if (data.success) {
          const paymentStatus = data.data.status;

          if (paymentStatus === 'completed') {
            setStatus('completed');
            setTimeout(() => {
              router.push(`/result/${params.txId}?status=success`);
            }, 1500);
            return true;
          } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
            setStatus('failed');
            setError(data.data.error || 'Payment failed');
            setTimeout(() => {
              router.push(`/result/${params.txId}?status=failed`);
            }, 2000);
            return true;
          }
        }

        return false;
      } catch (err: any) {
        console.error('Poll error:', err);
        return false;
      }
    };

    const interval = setInterval(async () => {
      pollCount++;

      const shouldStop = await pollPaymentStatus();

      if (shouldStop || pollCount >= maxPolls) {
        clearInterval(interval);
        if (pollCount >= maxPolls && status === 'processing') {
          setStatus('failed');
          setError('Payment timeout');
          setTimeout(() => {
            router.push(`/result/${params.txId}?status=timeout`);
          }, 2000);
        }
      }
    }, 1000);

    // 初始查询
    pollPaymentStatus();

    return () => clearInterval(interval);
  }, [params.txId, router, status]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">{t('processing')}</h1>
            <p className="text-gray-600">{t('pleaseWait')}</p>
          </>
        )}

        {status === 'completed' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">{t('success')}</h1>
            <p className="text-gray-600">{t('redirecting')}</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">{t('failed')}</h1>
            <p className="text-gray-600">{error || t('errorMessage')}</p>
          </>
        )}
      </div>
    </div>
  );
}

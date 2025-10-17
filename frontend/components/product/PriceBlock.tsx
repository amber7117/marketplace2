'use client';

import type { Currency } from '@/types';

interface PriceBlockProps {
  price: number;
  currency: Currency;
  originalPrice?: number;
  locale: string;
  className?: string;
}

export function PriceBlock({ 
  price, 
  currency, 
  originalPrice, 
  locale, 
  className = '' 
}: PriceBlockProps) {
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const formatPrice = (amount: number, currency: Currency) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 当前价格 */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl lg:text-4xl font-bold text-gray-900">
          {formatPrice(price, currency)}
        </span>
        
        {/* 折扣标签 */}
        {hasDiscount && (
          <span className="px-2 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
            -{discountPercentage}%
          </span>
        )}
      </div>

      {/* 原价 */}
      {hasDiscount && (
        <div className="flex items-center gap-2">
          <span className="text-lg text-gray-500 line-through">
            {formatPrice(originalPrice, currency)}
          </span>
          <span className="text-sm text-gray-600">
            节省 {formatPrice(originalPrice - price, currency)}
          </span>
        </div>
      )}

      {/* 货币信息 */}
      <div className="text-sm text-gray-500">
        价格以 {currency} 显示
        {hasDiscount && (
          <span className="ml-2 text-red-500 font-medium">
            • 限时优惠
          </span>
        )}
      </div>

      {/* 价格趋势指示器 */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${
          hasDiscount ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
        }`} />
        <span className={hasDiscount ? 'text-green-600 font-medium' : 'text-gray-600'}>
          {hasDiscount ? '特惠价格' : '常规价格'}
        </span>
      </div>
    </div>
  );
}

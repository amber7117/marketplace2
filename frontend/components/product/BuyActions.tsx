'use client';

import { useState } from 'react';
import type { Currency } from '@/types';

interface BuyActionsProps {
  price: number;
  currency: Currency;
  isInStock: boolean;
  maxQuantity?: number;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  className?: string;
}

export function BuyActions({
  price,
  currency,
  isInStock,
  maxQuantity = 10,
  onAddToCart,
  onBuyNow,
  className = ''
}: BuyActionsProps) {
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalPrice = price * quantity;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 数量选择器 */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-gray-900">数量</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="减少数量"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <span className="text-xl font-bold text-gray-900 min-w-8 text-center">
            {quantity}
          </span>
          
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= maxQuantity}
            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="增加数量"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* 总价显示 */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">总计</span>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(totalPrice)}
            </div>
            <div className="text-sm text-gray-600">
              {quantity} × {formatPrice(price)}
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="space-y-3">
        <button
          onClick={onBuyNow}
          disabled={!isInStock}
          className="w-full py-4 px-6 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
          aria-label="立即购买"
        >
          {isInStock ? '立即购买' : '缺货中'}
        </button>

        <button
          onClick={onAddToCart}
          disabled={!isInStock}
          className="w-full py-4 px-6 border-2 border-blue-600 text-blue-600 text-lg font-semibold rounded-xl hover:bg-blue-50 disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          aria-label="加入购物车"
        >
          {isInStock ? '加入购物车' : '无法购买'}
        </button>
      </div>

      {/* 库存信息 */}
      <div className="text-center space-y-2">
        {isInStock ? (
          <>
            <div className="flex items-center justify-center gap-2 text-green-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">有现货</span>
            </div>
            {maxQuantity < 10 && (
              <div className="text-sm text-orange-600">
                仅剩 {maxQuantity} 件
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center gap-2 text-red-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">暂时缺货</span>
          </div>
        )}
      </div>

      {/* 配送信息 */}
      <div className="text-center text-sm text-gray-600 space-y-1">
        <div>✓ 免费配送</div>
        <div>✓ 30天退货保证</div>
        <div>✓ 安全支付</div>
      </div>
    </div>
  );
}

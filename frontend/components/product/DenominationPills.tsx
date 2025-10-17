'use client';

import type { Currency, Denomination } from '@/types';

interface DenominationPillsProps {
  denominations: Denomination[];
  selectedDenomination?: Denomination | null;
  onSelect: (denomination: Denomination) => void;
  locale: string;
}

export function DenominationPills({ 
  denominations, 
  selectedDenomination, 
  onSelect,
  locale 
}: DenominationPillsProps) {
  const formatPrice = (amount: number, currency: Currency) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDiscountPercentage = (original: number, discounted: number) => {
    return Math.round(((original - discounted) / original) * 100);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">选择面额</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {denominations.map((denomination) => {
          const hasDiscount = denomination.discountPrice && denomination.discountPrice < denomination.value;
          const finalPrice = hasDiscount ? denomination.discountPrice! : denomination.value;
          const discountPercentage = hasDiscount 
            ? getDiscountPercentage(denomination.value, denomination.discountPrice!)
            : 0;

          return (
            <button
              key={denomination.id}
              onClick={() => denomination.isAvailable && onSelect(denomination)}
              disabled={!denomination.isAvailable}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                selectedDenomination?.id === denomination.id
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/20'
                  : denomination.isAvailable
                  ? 'border-gray-200 bg-white hover:border-blue-400 hover:shadow-md'
                  : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
              }`}
              aria-label={`选择 ${formatPrice(denomination.value, denomination.currency)} 面额`}
              aria-pressed={selectedDenomination?.id === denomination.id}
            >
              {/* 折扣标签 */}
              {hasDiscount && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  -{discountPercentage}%
                </div>
              )}

              {/* 主要内容 */}
              <div className="space-y-1">
                <div className="text-lg font-bold text-gray-900">
                  {formatPrice(finalPrice, denomination.currency)}
                </div>
                
                {hasDiscount && (
                  <div className="text-sm text-gray-500 line-through">
                    {formatPrice(denomination.value, denomination.currency)}
                  </div>
                )}

                {/* 库存状态 */}
                {!denomination.isAvailable && (
                  <div className="text-xs text-red-600 font-medium">
                    缺货
                  </div>
                )}
              </div>

              {/* 悬停效果 */}
              <div className={`absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-200 transition-colors ${
                selectedDenomination?.id === denomination.id ? 'border-blue-600' : ''
              }`} />
            </button>
          );
        })}
      </div>

      {/* 选中的面额详情 */}
      {selectedDenomination && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-green-800 font-medium">
              已选择: {formatPrice(
                selectedDenomination.discountPrice || selectedDenomination.value, 
                selectedDenomination.currency
              )}
            </span>
            {selectedDenomination.discountPrice && (
              <span className="text-green-600 text-sm">
                节省 {formatPrice(
                  selectedDenomination.value - selectedDenomination.discountPrice, 
                  selectedDenomination.currency
                )}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

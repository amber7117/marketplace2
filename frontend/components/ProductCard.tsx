'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { PricingService } from '@/lib/pricing';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('Product');
  const [currentCurrency, setCurrentCurrency] = useState('MYR');
  const [displayPrice, setDisplayPrice] = useState<{
    price: string;
    originalPrice?: string;
    discount?: number;
  }>({ price: '' });

  useEffect(() => {
    // Get currency from cookie
    const cookieCurrency = document.cookie
      .split('; ')
      .find(row => row.startsWith('currency='))
      ?.split('=')[1] || 'MYR';
    
    setCurrentCurrency(cookieCurrency);
    
    // Calculate display price
    const calculatePrice = async () => {
      const priceInfo = await PricingService.getDisplayPrice(product, cookieCurrency as any);
      setDisplayPrice(priceInfo);
    };
    
    calculatePrice();
  }, [product]);

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/products/${product.slug}`}>
        {/* Product Image */}
        <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-t-lg overflow-hidden">
          <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🎮</span>
              </div>
              <span className="text-sm text-gray-600">Product Image</span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
            {product.featured && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                Featured
              </span>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.shortDescription || product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex text-yellow-400">
              {'★'.repeat(Math.floor(product.rating))}
              {'☆'.repeat(5 - Math.floor(product.rating))}
            </div>
            <span className="text-sm text-gray-500 ml-2">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {displayPrice.price}
              </span>
              {displayPrice.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {displayPrice.originalPrice}
                </span>
              )}
            </div>
            {displayPrice.discount && (
              <span className="text-sm text-green-600 font-semibold">
                {displayPrice.discount}% off
              </span>
            )}
          </div>

          {/* Regions */}
          <div className="flex flex-wrap gap-1 mb-3">
            {product.regions.map(region => (
              <span 
                key={region}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {region}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              onClick={(e) => {
                e.preventDefault();
                // Add to cart logic here
                console.log('Add to cart:', product.slug);
              }}
            >
              {t('addToCart')}
            </button>
            <button 
              className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
              onClick={(e) => {
                e.preventDefault();
                // Buy now logic here
                console.log('Buy now:', product.slug);
              }}
            >
              {t('buyNow')}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

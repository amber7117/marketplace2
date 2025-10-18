'use client';

import { useTranslations } from 'next-intl';
import { Product, Currency } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { useState, useEffect, useMemo } from 'react';
import { PricingService } from '@/lib/pricing';
import { useCurrency } from '@/hooks/useCurrency';

// Mock product data - in real app, this would come from API
const mockProducts: Product[] = [
  {
    id: '1',
    slug: 'playstation-network-card',
    name: 'PlayStation Network Card',
    description: 'Top up your PlayStation Network wallet',
    shortDescription: 'PSN credit for games and subscriptions',
    category: 'gaming',
    brand: 'Sony',
    images: ['/products/playstation-network-card/cover.jpg'],
    offers: [
      {
        id: 'offer-1',
        denomination: 50,
        currency: 'MYR' as const,
        price: 45,
        originalPrice: 50,
        discount: 10,
        stock: 100,
        region: 'Malaysia'
      },
      {
        id: 'offer-2',
        denomination: 100,
        currency: 'MYR' as const,
        price: 90,
        originalPrice: 100,
        discount: 10,
        stock: 50,
        region: 'Malaysia'
      }
    ],
    regions: ['Malaysia'],
    tags: ['gaming', 'psn', 'sony'],
    rating: 4.5,
    reviewCount: 128,
    featured: true,
    supportedGames: ['All PlayStation games'],
    usageGuide: 'Redeem code in PlayStation Store'
  },
  {
    id: '2',
    slug: 'razer-gold',
    name: 'Razer Gold',
    description: 'Universal gaming credits',
    shortDescription: 'Universal gaming currency',
    category: 'gaming',
    brand: 'Razer',
    images: ['/products/razer-gold/cover.jpg'],
    offers: [
      {
        id: 'offer-3',
        denomination: 20,
        currency: 'MYR' as const,
        price: 18,
        originalPrice: 20,
        discount: 10,
        stock: 200,
        region: 'Global'
      },
      {
        id: 'offer-4',
        denomination: 50,
        currency: 'MYR' as const,
        price: 45,
        originalPrice: 50,
        discount: 10,
        stock: 100,
        region: 'Global'
      }
    ],
    regions: ['Global'],
    tags: ['gaming', 'razer', 'universal'],
    rating: 4.3,
    reviewCount: 89,
    featured: false,
    supportedGames: ['Mobile games', 'PC games'],
    usageGuide: 'Use in supported games and apps'
  }
];

export default function ProductsPage() {
  const t = useTranslations('Product');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">Browse our collection of virtual products</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder={t('search')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-4">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">All Regions</option>
                <option value="malaysia">Malaysia</option>
                <option value="global">Global</option>
              </select>
              
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">All Categories</option>
                <option value="gaming">Gaming</option>
                <option value="entertainment">Entertainment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
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
                    {product.shortDescription}
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
                        MYR {Math.min(...product.offers.map(o => o.price))}
                      </span>
                      {product.offers[0].originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          MYR {product.offers[0].originalPrice}
                        </span>
                      )}
                    </div>
                    {product.offers[0].discount && (
                      <span className="text-sm text-green-600 font-semibold">
                        {product.offers[0].discount}% off
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
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      {t('addToCart')}
                    </button>
                    <button className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                      {t('buyNow')}
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {mockProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

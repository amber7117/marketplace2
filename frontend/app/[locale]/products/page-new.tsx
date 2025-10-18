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

type SortOption = 'price-asc' | 'price-desc' | 'rating' | 'popular';

interface ProductWithPrice extends Product {
  minPrice: number;
}

export default function ProductsPage() {
  const t = useTranslations('Product');
  const { currency } = useCurrency();
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  
  // Products with calculated prices
  const [productsWithPrices, setProductsWithPrices] = useState<ProductWithPrice[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate prices in current currency
  useEffect(() => {
    const calculatePrices = async () => {
      setLoading(true);
      const productsWithMinPrices = await Promise.all(
        mockProducts.map(async (product) => {
          const minPrice = await PricingService.getLowestPrice(product, currency);
          return { ...product, minPrice };
        })
      );
      setProductsWithPrices(productsWithMinPrices);
      setLoading(false);
    };
    
    calculatePrices();
  }, [currency]);

  // Extract unique values for filters
  const regions = useMemo(() => {
    const allRegions = new Set<string>();
    mockProducts.forEach(p => p.regions.forEach(r => allRegions.add(r)));
    return Array.from(allRegions);
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(mockProducts.map(p => p.category)));
  }, []);

  const brands = useMemo(() => {
    return Array.from(new Set(mockProducts.map(p => p.brand)));
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = productsWithPrices;

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Region filter
    if (selectedRegion) {
      filtered = filtered.filter(p => p.regions.includes(selectedRegion));
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Brand filter
    if (selectedBrand) {
      filtered = filtered.filter(p => p.brand === selectedBrand);
    }

    // Price range filter
    filtered = filtered.filter(p => 
      p.minPrice >= priceRange[0] && p.minPrice <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.minPrice - b.minPrice);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.minPrice - a.minPrice);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return filtered;
  }, [productsWithPrices, searchQuery, selectedRegion, selectedCategory, selectedBrand, priceRange, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRegion('');
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange([0, 1000]);
    setSortBy('popular');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('filters')}
          </h1>
          <p className="text-gray-600">
            {filteredProducts.length} products found
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="space-y-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Region Filter */}
              <select 
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('allRegions')}</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              
              {/* Category Filter */}
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('allCategories')}</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>

              {/* Brand Filter */}
              <select 
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('allBrands')}</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>

              {/* Sort */}
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="popular">{t('sortPopular')}</option>
                <option value="price-asc">{t('sortPriceAsc')}</option>
                <option value="price-desc">{t('sortPriceDesc')}</option>
                <option value="rating">{t('sortRating')}</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                {t('priceRange')}:
              </label>
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="px-3 py-1 border border-gray-300 rounded w-24"
                placeholder="Min"
              />
              <span>-</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="px-3 py-1 border border-gray-300 rounded w-24"
                placeholder="Max"
              />
              <button
                onClick={clearFilters}
                className="ml-auto text-sm text-blue-600 hover:text-blue-700"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('noProducts')}
            </h3>
            <p className="text-gray-600 mb-4">{t('noProductsDesc')}</p>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

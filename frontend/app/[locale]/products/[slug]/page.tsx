'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { productAPI } from '@/lib/api';
import type { Product, Currency, Region, Denomination } from '@/types';
import { Gallery } from '@/components/product/Gallery';
import { DenominationPills } from '@/components/product/DenominationPills';
import { PriceBlock } from '@/components/product/PriceBlock';
import { BuyActions } from '@/components/product/BuyActions';
import { TrustBadges } from '@/components/product/TrustBadges';
import { Tabs } from '@/components/product/Tabs';

// 辅助函数
function getProductName(product: Product, locale: string): string {
  if (typeof product.name === 'string') {
    return product.name;
  }
  return product.name[locale as keyof typeof product.name] || 
         product.name.en || 
         'Unknown Product';
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getProductDescription(product: Product, locale: string): string {
  if (typeof product.description === 'string') {
    return product.description;
  }
  return product.description[locale as keyof typeof product.description] || 
         product.description.en || 
         'No description available';
}

function getAvailableRegions(product: Product): Region[] {
  if (!product.regionalPricing) return [];
  return product.regionalPricing
    .filter(rp => rp.isAvailable && rp.stock > 0)
    .map(rp => rp.region);
}

function getProductCurrency(product: Product, region: Region): Currency {
  const regionPrice = product.regionalPricing?.find(rp => rp.region === region);
  return regionPrice?.currency || 'USD';
}

function getProductPrice(product: Product, region: Region): number {
  const regionPrice = product.regionalPricing?.find(rp => rp.region === region);
  return regionPrice?.discountPrice || regionPrice?.price || product.pricing || 0;
}

function getProductOriginalPrice(product: Product, region: Region): number | undefined {
  const regionPrice = product.regionalPricing?.find(rp => rp.region === region);
  return regionPrice?.discountPrice && regionPrice?.price ? regionPrice.price : undefined;
}

function isProductInStock(product: Product, region: Region): boolean {
  const regionPrice = product.regionalPricing?.find(rp => rp.region === region);
  return !!(regionPrice && regionPrice.isAvailable && regionPrice.stock > 0);
}

function getProductStock(product: Product, region: Region): number {
  const regionPrice = product.regionalPricing?.find(rp => rp.region === region);
  return regionPrice?.stock || 0;
}

export default function ProductPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('product');
  
  const slug = params.slug as string;
  const locale = params.locale as string;
  const region = searchParams.get('region') as Region | undefined;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDenomination, setSelectedDenomination] = useState<Denomination | null>(null);

  // 获取产品数据 - 对应新的 D1 数据库结构
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getProduct(slug);
        
        // 对应新的 D1 数据库 API 返回结构: { success: true, data: product }
        if (response.data?.success && response.data.data) {
          const productData = response.data.data;
          
          // 如果 API 返回的是新的 D1 数据库结构，需要转换为前端期望的结构
          // 检查是否有需要转换的字段
          if (productData.regionalPricing && Array.isArray(productData.regionalPricing)) {
            // 确保 regionalPricing 中的字段类型正确
            const processedProduct = {
              ...productData,
              regionalPricing: productData.regionalPricing.map(rp => ({
                ...rp,
                isAvailable: Boolean(rp.isAvailable),
                isInstantDelivery: Boolean(rp.isInstantDelivery),
                stock: Number(rp.stock || 0),
                price: Number(rp.price || 0),
                discountPrice: rp.discountPrice ? Number(rp.discountPrice) : undefined
              }))
            };
            setProduct(processedProduct);
          } else {
            setProduct(productData);
          }
        } else {
          console.error('Product not found or API error:', response.data);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">产品未找到</h1>
          <button
            onClick={() => router.push('/products')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回产品列表
          </button>
        </div>
      </div>
    );
  }

  // 处理区域和货币数据
  const availableRegions = getAvailableRegions(product);
  const currentRegion = region && availableRegions.includes(region) ? region : availableRegions[0];

  // 准备面额数据 - 匹配 product-service API 结构
  const denominations = (product.regionalPricing || []).map(rp => ({
    id: `${rp.region}-${rp.price}`,
    value: rp.discountPrice || rp.price,
    currency: rp.currency,
    isAvailable: rp.isAvailable && rp.stock > 0,
    discountPrice: rp.discountPrice,
    originalPrice: rp.price,
    region: rp.region,
    denomination: rp.denomination || `${rp.discountPrice || rp.price} ${rp.currency}`,
    stock: rp.stock,
    isInstantDelivery: rp.isInstantDelivery || true,
  }));

  const productName = getProductName(product, locale);
  const currentPrice = getProductPrice(product, currentRegion);
  const originalPrice = getProductOriginalPrice(product, currentRegion);
  const isInStock = isProductInStock(product, currentRegion);
  const stock = getProductStock(product, currentRegion);
  const currency = getProductCurrency(product, currentRegion);

  // 处理面额选择
  const handleDenominationSelect = (denomination: Denomination) => {
    setSelectedDenomination(denomination);
    // 更新URL参数以反映选中的区域
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('region', denomination.region);
    router.push(`?${newSearchParams.toString()}`, { scroll: false });
  };

  // 处理购买操作
  const handleAddToCart = () => {
    console.log('Add to cart:', { 
      product, 
      region: currentRegion,
      denomination: selectedDenomination 
    });
    // 这里可以添加实际的购物车逻辑
  };

  const handleBuyNow = () => {
    console.log('Buy now:', { 
      product, 
      region: currentRegion,
      denomination: selectedDenomination 
    });
    // 这里可以添加实际的购买逻辑
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 移动端粘性底部栏 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="text-lg font-bold text-gray-900">
              {new Intl.NumberFormat(locale, {
                style: 'currency',
                currency,
                minimumFractionDigits: 0,
              }).format(currentPrice)}
            </div>
            {originalPrice && originalPrice > currentPrice && (
              <div className="text-sm text-gray-500 line-through">
                {new Intl.NumberFormat(locale, {
                  style: 'currency',
                  currency,
                  minimumFractionDigits: 0,
                }).format(originalPrice)}
              </div>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!isInStock}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isInStock ? t('addToCart') : t('outOfStock')}
          </button>
        </div>
      </div>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 lg:pb-8">
        {/* 产品主区域 */}
        <section className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
          {/* 图片区域 */}
          <div className="lg:sticky lg:top-8">
            <Gallery 
              images={product.images?.length ? product.images : ['/images/placeholder-card.png']}
              productName={productName}
            />
          </div>

          {/* 信息区域 */}
          <div className="mt-8 lg:mt-0 space-y-8">
            {/* 产品标题和价格 */}
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {productName}
              </h1>
              
              <PriceBlock
                price={currentPrice}
                currency={currency}
                originalPrice={originalPrice}
                locale={locale}
              />

              {/* 库存状态 */}
              <div className="flex items-center gap-4 text-sm">
                <span className={`px-3 py-1 rounded-full font-medium ${
                  isInStock 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isInStock ? t('inStock') : t('outOfStock')}
                </span>
                {isInStock && (
                  <span className="text-gray-600">
                    {stock} {t('available')}
                  </span>
                )}
              </div>
            </div>

            {/* 面额选择 */}
            {denominations.length > 0 && (
              <DenominationPills
                denominations={denominations}
                selectedDenomination={selectedDenomination}
                onSelect={handleDenominationSelect}
                locale={locale}
              />
            )}

            {/* 购买操作 */}
            <BuyActions
              price={currentPrice}
              currency={currency}
              isInStock={isInStock}
              maxQuantity={Math.min(stock, 10)}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />

            {/* 信任徽章 */}
            <TrustBadges />
          </div>
        </section>

        {/* Tab 内容区域 */}
        <Tabs product={product} locale={locale} />
      </main>
    </div>
  );
}

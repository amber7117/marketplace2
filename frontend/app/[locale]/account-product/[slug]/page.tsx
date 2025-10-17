'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ProductCard';
import ProductGallery from '@/components/product/ProductGallery';
import { Package, ChevronLeft } from 'lucide-react';
import { productAPI } from '@/lib/api';
import { useCartStore } from '@/store';
import { getProductName } from '@/lib/product';
import type { Product, ProductRegionPrice } from '@/types';

export default function ProductDetailPage() {
  const t = useTranslations('product');
  const tCommon = useTranslations('common');
  const params = useParams();
  const locale = useLocale();
  const _router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductRegionPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const { addItem, currency, setCurrency } = useCartStore();

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProduct(slug);
      const productData = response.data?.data;
      if (!productData) throw new Error('Product not found');

      setProduct(productData);

      // auto-select first available variant
      if (productData.regionalPricing?.length > 0) {
        const firstAvailable = productData.regionalPricing.find((r) => r.isAvailable) || productData.regionalPricing[0];
        setSelectedVariant(firstAvailable);
        setCurrency(firstAvailable.currency);
      }

      // load related products
      if (productData.category) {
        const relatedResponse = await productAPI.getProducts({
          category: productData.category,
          limit: 4,
        });
        const relatedItems: Product[] = relatedResponse.data?.data || [];
        setRelatedProducts(relatedItems.filter((p) => p.slug !== slug));
      } else {
        setRelatedProducts([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  }, [slug, setCurrency]);

  /** 🔹 Fetch product detail */
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  /** 🔹 Add to cart */
  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    addItem({
      productId: product.slug,
      productName: getProductName(product, locale),
      productSlug: product.slug,
      image: product.images[0],
      sku: product.sku,
      quantity,
      price: selectedVariant.discountPrice ?? selectedVariant.price,
      currency: selectedVariant.currency,
      region: selectedVariant.region,
    });

    alert(`${getProductName(product, locale)} ${t('addedToCart')}`);
  };

  const handleQuantityChange = (newQuantity: number) => setQuantity(newQuantity);

  /** 🔹 Loading skeleton */
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
          <div className="space-y-4">
            <div className="h-8 animate-pulse rounded bg-muted" />
            <div className="h-4 animate-pulse rounded bg-muted" />
            <div className="h-12 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  /** 🔹 Product not found */
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Package className="h-24 w-24 text-muted-foreground" />
          <h2 className="text-2xl font-bold">{t('productNotFound')}</h2>
          <Link href="/products">
            <Button>{tCommon('backToProducts')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  /** 🔹 Stock from selected variant */
  const stock = selectedVariant?.stock ?? 0;
  const isInStock = stock > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link 
          href="/products"
          className="inline-flex items-center text-gray-600 hover:text-orange-500 transition"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {tCommon('backToProducts')}
        </Link>
      </div>

      {/* Product Detail */}
      <div className="grid gap-8 lg:grid-cols-2 mb-16">
        {/* Left: Gallery */}
        <div>
          <ProductGallery product={product} />
        </div>

        {/* Right: Info + Variant Selector */}
        <div className="space-y-6">
    

          {product.regionalPricing?.length > 1 && (
            <div>
              <h4 className="text-sm font-medium mb-3">{t('selectDenomination') || 'Select Denomination'}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-3">
                {product.regionalPricing.map((variant) => {
                  const isActive =
                    selectedVariant?.region === variant.region &&
                    selectedVariant?.price === variant.price;
                  const finalPrice =
                    variant.discountPrice && variant.discountPrice < variant.price
                      ? variant.discountPrice
                      : variant.price;

                  return (
                    <div
                      key={`${variant.region}-${variant.price}`}
                      onClick={() => {
                        setSelectedVariant(variant);
                        setCurrency(variant.currency);
                      }}
                      className={`cursor-pointer border rounded-xl p-4 flex justify-between items-center transition-all ${
                        isActive
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <span
                        className={`font-medium ${
                          isActive ? 'text-orange-600' : 'text-gray-800'
                        }`}
                      >
                        {`${getProductName(product, locale)} ${variant.region}`}
                      </span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-600">
                          {variant.currency} {finalPrice.toFixed(2)}
                        </div>
                        {variant.discountPrice &&
                          variant.discountPrice < variant.price && (
                            <div className="text-sm text-gray-400 line-through">
                              {variant.currency} {variant.price.toFixed(2)}
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

     
         
        </div>
      </div>

      {/* 🔹 Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">{t('relatedProducts')}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.slug} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

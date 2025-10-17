// hooks/useProduct.ts
import { useState, useEffect, useCallback } from 'react';
import type { Product, ProductRegionPrice } from '@/types';
import { productAPI } from '@/lib/api';

export const useProduct = (slug: string) => {
  const [state, setState] = useState<{
    product: Product | null;
    relatedProducts: Product[];
    selectedVariant: ProductRegionPrice | null;
    loading: boolean;
    error: string | null;
  }>({
    product: null,
    relatedProducts: [],
    selectedVariant: null,
    loading: true,
    error: null,
  });

  const fetchProduct = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const [productResponse, relatedResponse] = await Promise.all([
        productAPI.getProduct(slug),
        productAPI.getProducts({ limit: 4 })
      ]);

      const product = (productResponse?.data?.data ?? null);
      
      if (!product) {
        throw new Error('Product not found');
      }

      // Auto-select first available variant
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const selectedVariant = product.regionalPricing?.find((r: any) => r.isAvailable) 
        || product.regionalPricing?.[0] 
        || null;

      const normalizeProduct = (item: unknown): Product | null => {
        if (!item || typeof item !== 'object') return null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const candidate = item as any;
        if (typeof candidate.slug !== 'string') return null;
        return {
          ...candidate,
          id: candidate._id ?? candidate.id ?? '',
          features: candidate.features ?? [],
        } as Product;
      };

      const rawRelatedData = Array.isArray(relatedResponse?.data?.data)
        ? (relatedResponse.data.data as unknown[])
        : [];
      const relatedProducts = rawRelatedData
        .map(normalizeProduct)
        .filter((p): p is Product => Boolean(p))
        .filter(p => p.slug !== slug && p.category === product.category)
        .slice(0, 4);

      setState({
        product: normalizeProduct(product),
        relatedProducts,
        selectedVariant: selectedVariant ? {
          region: selectedVariant.region || 'GLOBAL',
          currency: selectedVariant.currency,
          price: selectedVariant.price,
          discountPrice: selectedVariant.discountPrice,
          stock: selectedVariant.stock,
          isAvailable: selectedVariant.isAvailable,
        } as ProductRegionPrice : null,
        loading: false,
        error: null,
      });

      return selectedVariant;
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch product'
      }));
      return null;
    }
  }, [slug]);

  const selectVariant = useCallback((variant: ProductRegionPrice) => {
    setState(prev => ({ ...prev, selectedVariant: variant }));
  }, []);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    ...state,
    selectVariant,
    refetch: fetchProduct,
  };
};

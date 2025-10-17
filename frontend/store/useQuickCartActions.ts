// hooks/useQuickCartActions.ts
import { useCallback } from 'react';
import { useCartActions } from './useCartActions';
import { Product, ProductRegionPrice } from '@/types';

export const useQuickCartActions = () => {
  const { addToCart } = useCartActions();

  const quickAddToCart = useCallback((
    product: Product,
    variant: ProductRegionPrice
  ): boolean => {
    return addToCart(product, variant, 1);
  }, [addToCart]);

  const quickAddMultiple = useCallback((
    items: Array<{ product: Product; variant: ProductRegionPrice }>
  ): number => {
    let successCount = 0;
    
    items.forEach(({ product, variant }) => {
      if (addToCart(product, variant, 1)) {
        successCount++;
      }
    });
    
    return successCount;
  }, [addToCart]);

  return { quickAddToCart, quickAddMultiple };
};
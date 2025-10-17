// hooks/useCartActions.ts
import { useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useCartStore } from '@/store';
import { Product, ProductRegionPrice, CartItem } from '@/types';
import { getProductName } from '@/lib/product';
import { toast } from 'sonner';

export const useCartActions = () => {
  const t = useTranslations('product');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { addItem, setCurrency } = useCartStore();

  const addToCart = useCallback((
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    product: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variant: any,
    quantity: number
  ): boolean => {
    try {
      // 输入验证
      if (!product || !variant) {
        toast.error(tCommon('errorOccurred') || 'Invalid product or variant');
        return false;
      }

      if (quantity <= 0) {
        toast.error(t('invalidQuantity') || 'Invalid quantity');
        return false;
      }

      // 检查库存
      if (variant.stock < quantity) {
        toast.error(t('outOfStock') || 'Insufficient stock');
        return false;
      }

      // 获取本地化产品名称 - 修复：使用 product 而不是 ProductCard
      const productName = getProductName(product, locale);
      
      // 构建购物车项
      const cartItem: CartItem = {
        productId: product.slug,
        productName,
        productSlug: product.slug,
        image: product.images?.[0] || '/images/placeholder-product.png',
        sku: product.sku || 'N/A',
        quantity,
        price: variant.discountPrice ?? variant.price,
        currency: variant.currency,
        region: variant.region,
        variantId: String(variant.region || 'default'), // 使用 region 作为 variant 标识
      };

      // 添加到购物车
      addItem(cartItem);
      setCurrency(variant.currency);
      
      // 显示成功提示
      toast.success(t('addedToCart'), {
        description: `${productName} × ${quantity}`,
        action: {
          label: tCommon('viewCart'),
          onClick: () => {
            window.location.href = '/cart';
          },
        },
        duration: 3000,
      });

      return true;
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      toast.error(tCommon('errorOccurred') || 'Failed to add item to cart');
      return false;
    }
  }, [addItem, setCurrency, locale, t, tCommon]);

  // 快速添加功能（数量为1）
  const quickAddToCart = useCallback((
    product: Product,
    variant: ProductRegionPrice
  ): boolean => {
    return addToCart(product, variant, 1);
  }, [addToCart]);

  return { 
    addToCart, 
    quickAddToCart 
  };
};
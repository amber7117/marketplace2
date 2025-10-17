'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, Star } from 'lucide-react';
import { formatPrice } from '@/lib/money';
import { useCartActions } from '@/store/useCartActions';
import type { Product, Currency } from '@/types/index';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { 
  getProductName, 
  getProductDescription, 
  getProductPrice, 
  getProductImage,
  hasProductDiscount,
  getDiscountPercentage,
  isProductInStock
} from '@/lib/product';

interface ProductCardProps {
  readonly product: Product;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly showRating?: boolean;
  readonly showQuickAdd?: boolean;
}

export function ProductCard({ 
  product, 
  size = 'md',
  showRating = true,
  showQuickAdd = true
}: ProductCardProps) {
  const t = useTranslations('product');
  const locale = useLocale();
  const { quickAddToCart } = useCartActions();

  const productName = getProductName(product, locale);
  const productDescription = getProductDescription(product, locale);
  const productImage = getProductImage(product);
  const price = getProductPrice(product);
  const hasDiscount = hasProductDiscount(product);
  const discountPercent = getDiscountPercentage(product);
  const inStock = isProductInStock(product);

  // Size configurations
  const sizeConfig = {
    sm: {
      image: 'h-32',
      content: 'p-3',
      title: 'text-sm',
      price: 'text-lg',
      description: 'text-xs line-clamp-1'
    },
    md: {
      image: 'h-40 sm:h-48',
      content: 'p-4',
      title: 'text-base',
      price: 'text-xl',
      description: 'text-sm line-clamp-2'
    },
    lg: {
      image: 'h-48 sm:h-56',
      content: 'p-5',
      title: 'text-lg',
      price: 'text-2xl',
      description: 'text-base line-clamp-3'
    }
  };

  const config = sizeConfig[size];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!inStock) return;

    // For quick add, we need to select the first available variant
    const firstAvailableVariant = product.regionalPricing?.find(v => v.isAvailable);
    if (firstAvailableVariant) {
      quickAddToCart(product, firstAvailableVariant);
    }
  };

  return (
    <Card className={cn(
      "group overflow-hidden transition-all duration-300 bg-card border-border",
      "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
      "cursor-pointer select-none"
    )}>
      <Link href={`/products/${product.slug}`} className="block h-full">
        {/* Image Container */}
        <div className={cn(
          "relative w-full overflow-hidden bg-muted",
          config.image
        )}>
          <Image
            src={productImage}
            alt={productName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            priority={size === 'lg'}
          />
          
          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              -{discountPercent}%
            </div>
          )}

          {/* Stock Status */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white/90 text-destructive px-3 py-1 rounded-full text-sm font-medium">
                {t('outOfStock')}
              </div>
            </div>
          )}

          {/* Quick Add Button - Desktop */}
          {showQuickAdd && inStock && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-lg"
                onClick={handleQuickAdd}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Quick Add Button - Mobile */}
          {showQuickAdd && inStock && (
            <div className="absolute bottom-2 right-2 lg:hidden">
              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-sm"
                onClick={handleQuickAdd}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <CardContent className={cn(
          "space-y-2 h-full flex flex-col",
          config.content
        )}>
          {/* Product Info */}
          <div className="flex-1 space-y-2">
            {/* Title and Rating */}
            <div className="space-y-1">
              <h3 className={cn(
                "font-semibold text-foreground leading-tight",
                config.title
              )}>
                {productName}
              </h3>
              
              {showRating && (
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-xs font-medium text-foreground">4.8</span>
                  </div>
                  <span className="text-xs text-muted-foreground">(128)</span>
                </div>
              )}
            </div>

            {/* Description */}
            {size !== 'sm' && productDescription && (
              <p className={cn(
                "text-muted-foreground leading-relaxed",
                config.description
              )}>
                {productDescription}
              </p>
            )}
          </div>

          {/* Price and Actions */}
          <div className="space-y-2">
            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <div className={cn(
                  "font-bold text-primary",
                  config.price
                )}>
                  {formatPrice(price, product.regionalPricing?.[0]?.currency as Currency || 'USD', locale)}
                </div>
                
                {hasDiscount && size !== 'sm' && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(getProductPrice(product), product.regionalPricing?.[0]?.currency as Currency || 'USD', locale)}
                  </span>
                )}
              </div>

            </div>

            {/* Stock Indicator */}
            {size !== 'sm' && (
              <div className={cn(
                "text-xs font-medium",
                inStock ? 'text-green-600' : 'text-destructive'
              )}>
                {inStock ? t('inStock') : t('outOfStock')}
              </div>
            )}

            {/* Quick Add Button - Mobile Bottom */}
            {showQuickAdd && inStock && size === 'sm' && (
              <Button
                size="sm"
                className="w-full mt-2"
                onClick={handleQuickAdd}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                {t('addToCart')}
              </Button>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

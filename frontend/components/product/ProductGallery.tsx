// components/product/ProductGallery.tsx
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import type { Product } from '@/types';

type Props = {
  product: Product;
  title?: string;
  className?: string;
  onImageChange?: (index: number) => void;
};

export default function ProductGallery({ product, title, className, onImageChange }: Props) {
  const images = useMemo(
    () => (product.images?.length ? product.images : ['/images/placeholder-card.png']),
    [product.images]
  );

  const [active, setActive] = useState(0);

  const handleSetActive = useCallback(
    (i: number) => {
      setActive(i);
      onImageChange?.(i);
    },
    [onImageChange]
  );

  // 键盘左右切换主图（无障碍 & 快捷）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleSetActive((active + 1) % images.length);
      if (e.key === 'ArrowLeft') handleSetActive((active - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, images.length, handleSetActive]);

  const current = images[active]!;
  const productTitle =
    title ??
    (typeof product.name === 'string' ? product.name : product.name?.en ?? 'Product');

  return (
    <section className={['space-y-3', className].filter(Boolean).join(' ')}>
      {/* 主图：银行卡比例 85.6:54 ≈ 1.586:1 */}
      <div
        className="relative w-full aspect-[1586/1000] overflow-hidden rounded-[14px] bg-muted/30"
        aria-label={`${productTitle} preview`}
      >
        <Image
          key={current}
          src={current}
          alt={`${productTitle} image ${active + 1} of ${images.length}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 560px"
          className="object-cover"
          priority
        />

        {/* 轻微渐变遮罩，提升图像层次（可删） */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
      </div>

      {/* Thumbs */}
      <div className="grid grid-cols-4 gap-2">
        {images.map((img, i) => (
          <button
            key={img + i}
            type="button"
            onClick={() => handleSetActive(i)}
            className={[
              'relative aspect-square rounded-md overflow-hidden border transition',
              i === active ? 'ring-2 ring-primary border-transparent' : 'hover:border-foreground/30'
            ].join(' ')}
            aria-label={`Preview ${i + 1}`}
            aria-current={i === active ? 'true' : undefined}
          >
            <Image
              src={img}
              alt={`${productTitle} thumbnail ${i + 1}`}
              fill
              sizes="120px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </section>
  );
}

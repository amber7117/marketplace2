import type { Metadata } from 'next';
import type { Product, Locale } from './schemas';

interface SeoConfig {
  title: string;
  description: string;
  image?: string;
  url: string;
  locale: Locale;
  alternateLocales?: Locale[];
}

export function generateProductMetadata(
  product: Product,
  locale: Locale,
  baseUrl: string
): Metadata {
  const title = product.name[locale];
  const description = product.shortDescription?.[locale] || product.description[locale].substring(0, 160);
  const image = product.images[0] ? `${baseUrl}${product.images[0]}` : undefined;
  const url = `${baseUrl}/${locale}/products/${product.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : [],
      url,
      type: 'website',
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
    alternates: {
      canonical: url,
      languages: {
        en: `${baseUrl}/en/products/${product.slug}`,
        zh: `${baseUrl}/zh/products/${product.slug}`,
      },
    },
  };
}

export function generateJsonLd(product: Product, locale: Locale, baseUrl: string) {
  const lowestPrice = Math.min(...product.offers.map((o) => o.price));
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name[locale],
    description: product.shortDescription?.[locale] || product.description[locale],
    image: product.images.map((img) => `${baseUrl}${img}`),
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: lowestPrice,
      priceCurrency: 'MYR',
      availability: 'https://schema.org/InStock',
      offerCount: product.offers.length,
    },
    aggregateRating: product.rating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    } : undefined,
  };
}

export function generatePageMetadata(config: SeoConfig): Metadata {
  return {
    title: config.title,
    description: config.description,
    openGraph: {
      title: config.title,
      description: config.description,
      images: config.image ? [{ url: config.image }] : [],
      url: config.url,
      type: 'website',
      locale: config.locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: config.image ? [config.image] : [],
    },
    alternates: {
      canonical: config.url,
    },
  };
}

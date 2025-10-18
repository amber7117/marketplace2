import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Product } from '@/lib/types';
import ProductDetailClient from './ProductDetailClient';

// Mock product data - in real app, fetch from API
const mockProducts: Product[] = [
  {
    id: '1',
    slug: 'playstation-network-card',
    name: 'PlayStation Network Card',
    description: `<h2>About PlayStation Network Card</h2>
      <p>Top up your PlayStation Network wallet instantly with digital codes. Perfect for purchasing games, DLC, and subscriptions on the PlayStation Store.</p>
      <h3>Features:</h3>
      <ul>
        <li>Instant delivery</li>
        <li>No expiration date</li>
        <li>Compatible with PS4 and PS5</li>
        <li>Works with all PSN accounts in Malaysia</li>
      </ul>`,
    shortDescription: 'PSN credit for games and subscriptions',
    category: 'gaming',
    brand: 'Sony',
    images: [
      '/products/playstation-network-card/cover.jpg',
      '/products/playstation-network-card/detail1.jpg',
      '/products/playstation-network-card/detail2.jpg',
    ],
    offers: [
      {
        id: 'offer-1',
        denomination: 50,
        currency: 'MYR',
        price: 45,
        originalPrice: 50,
        discount: 10,
        stock: 100,
        region: 'Malaysia'
      },
      {
        id: 'offer-2',
        denomination: 100,
        currency: 'MYR',
        price: 90,
        originalPrice: 100,
        discount: 10,
        stock: 50,
        region: 'Malaysia'
      },
      {
        id: 'offer-3',
        denomination: 150,
        currency: 'MYR',
        price: 135,
        originalPrice: 150,
        discount: 10,
        stock: 75,
        region: 'Malaysia'
      }
    ],
    regions: ['Malaysia'],
    tags: ['gaming', 'psn', 'sony', 'playstation'],
    rating: 4.5,
    reviewCount: 128,
    featured: true,
    supportedGames: ['All PlayStation games', 'PS Plus subscriptions', 'PlayStation Store content'],
    usageGuide: `<h3>How to Redeem:</h3>
      <ol>
        <li>Go to PlayStation Store on your console or web browser</li>
        <li>Select your account and click "Redeem Codes"</li>
        <li>Enter the 12-digit code you received</li>
        <li>Your wallet will be credited instantly</li>
      </ol>
      <p><strong>Important:</strong> Make sure your PSN account region matches the card region.</p>`
  }
];

async function getProduct(slug: string): Promise<Product | undefined> {
  // In real app, fetch from API
  return mockProducts.find(p => p.slug === slug);
}

export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string; locale: string } 
}): Promise<Metadata> {
  const product = await getProduct(params.slug);
  
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const minPrice = Math.min(...product.offers.map(o => o.price));
  const maxPrice = Math.max(...product.offers.map(o => o.price));

  return {
    title: `${product.name} - Buy Digital Gift Cards`,
    description: product.shortDescription || product.description.substring(0, 160),
    keywords: product.tags.join(', '),
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images.map(img => ({
        url: img,
        alt: product.name,
      })),
      type: 'website',
    },
    alternates: {
      canonical: `https://marketplace.example.com/${params.locale}/products/${params.slug}`,
      languages: {
        'en': `/en/products/${params.slug}`,
        'zh': `/zh/products/${params.slug}`,
      },
    },
    other: {
      'product:price:amount': minPrice.toString(),
      'product:price:currency': 'MYR',
    },
  };
}

// Generate JSON-LD structured data
function generateProductSchema(product: Product, locale: string) {
  const minPrice = Math.min(...product.offers.map(o => o.price));
  const maxPrice = Math.max(...product.offers.map(o => o.price));

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    image: product.images,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'MYR',
      lowPrice: minPrice,
      highPrice: maxPrice,
      offerCount: product.offers.length,
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };
}

export default async function ProductDetailPage({ 
  params 
}: { 
  params: { slug: string; locale: string } 
}) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  const schema = generateProductSchema(product, params.locale);

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      {/* Client Component */}
      <ProductDetailClient product={product} locale={params.locale} />
    </>
  );
}

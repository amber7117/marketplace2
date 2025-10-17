'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectCoverflow } from 'swiper/modules';
import { ShoppingCart, Shield, Zap, HeadphonesIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { Product } from '@/types';

import 'swiper/css';

// ✅ Backend base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function HomePage() {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero banners
  const banners = [
    {
      id: 1,
      title: 'Welcome to topupforme',
      description: 'Your trusted virtual products marketplace',
      image: 'https://placehold.co/1200x400/8b5cf6/ffffff?text=Banner+1',
      link: '/products',
    },
    {
      id: 2,
      title: 'Special Offers',
      description: 'Up to 50% off on selected items',
      image: 'https://placehold.co/1200x400/6366f1/ffffff?text=Banner+2',
      link: '/products',
    },
    {
      id: 3,
      title: 'New Arrivals',
      description: 'Check out our latest products',
      image: 'https://placehold.co/1200x400/8b5cf6/ffffff?text=Banner+3',
      link: '/products',
    },
  ];

  // ✅ Fetch featured products from backend
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_BASE_URL}/products?limit=8&isFeatured=true`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();

        if (Array.isArray(data.data)) {
          setFeaturedProducts(data.data.slice(0, 4));
        } else {
          console.error('Invalid API response:', data);
          setFeaturedProducts([]);
        }
      } catch (error) {
        console.error('❌ Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const features = [
    {
      id: 'secure',
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: t('whyChooseUs.secure'),
      description: 'Bank-level security for all transactions',
    },
    {
      id: 'fast',
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: t('whyChooseUs.fast'),
      description: 'Instant delivery of digital products',
    },
    {
      id: 'support',
      icon: <HeadphonesIcon className="h-10 w-10 text-primary" />,
      title: t('whyChooseUs.support'),
      description: '24/7 customer support available',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <section className="w-full bg-muted py-8">
        <div className="container mx-auto px-4">
          <Swiper
            modules={[Autoplay, Pagination, EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 2.5,
              slideShadows: false,
            }}
            autoplay={{ delay: 5000 }}
            pagination={{ clickable: true }}
            className="rounded-lg"
          >
            {banners.map((banner) => (
              <SwiperSlide key={banner.id} className="!w-4/5 md:!w-2/3 lg:!w-1/2">
                <Link href={banner.link}>
                  <div className="relative h-[250px] md:h-[350px] rounded-lg overflow-hidden">
                    <Image
                      src={banner.image}
                      alt={banner.title}
                      fill
                      className="object-cover transition-all duration-300"
                      priority={banner.id === 1}
                      unoptimized
                    />
                    {/* Blur overlay for non-center slides */}
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300 swiper-slide-active:backdrop-blur-0 swiper-slide-active:bg-black/30" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white rounded-lg">
                      <h2 className="text-2xl md:text-4xl font-bold mb-3 text-center px-4">
                        {banner.title}
                      </h2>
                      <p className="text-base md:text-lg mb-4 text-center px-4">{banner.description}</p>
                      <Button size="lg" className="z-10">{tCommon('shopNow')}</Button>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">{t('featuredProducts')}</h2>
            <Link href="/products">
              <Button variant="outline">{tCommon('viewAll')}</Button>
            </Link>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">{tCommon('loading')}</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => {
                const productName =
                  typeof product.name === 'string'
                    ? product.name
                    : product.name?.en || 'Unnamed Product';
                const productImage =
                  product.images?.[0] ||
                  'https://placehold.co/300x300/8b5cf6/ffffff?text=Product';
                const productPrice =
                  product.regionalPricing?.[0]?.price || product.pricing || 0;

                return (
                  <Card
                    key={product._id}
                    className="overflow-hidden transition-shadow hover:shadow-lg"
                  >
                    <Link href={`/products/${product.slug}`}>
                      <div className="relative h-48 w-full">
                        <Image
                          src={productImage}
                          alt={productName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="mb-2 font-semibold line-clamp-2">{productName}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">
                            ${productPrice.toFixed(2)}
                          </span>
                          <Button size="icon" variant="outline">
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">{t('whyChooseUs.title')}</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.id}>
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

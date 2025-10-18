import React from 'react';
import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';

// Mock product data - in real app, this would come from API
const mockProduct = {
  id: '1',
  slug: 'playstation-network-card',
  name: 'PlayStation Network Card',
  description: 'Top up your PlayStation Network wallet with credit that can be used to purchase games, add-ons, subscriptions, and more from the PlayStation Store.',
  shortDescription: 'PSN credit for games and subscriptions',
  category: 'gaming',
  brand: 'Sony',
  images: ['/products/playstation-network-card/cover.jpg'],
  offers: [
    {
      id: 'offer-1',
      denomination: 50,
      currency: 'MYR' as const,
      price: 45,
      originalPrice: 50,
      discount: 10,
      stock: 100,
      region: 'Malaysia'
    },
    {
      id: 'offer-2',
      denomination: 100,
      currency: 'MYR' as const,
      price: 90,
      originalPrice: 100,
      discount: 10,
      stock: 50,
      region: 'Malaysia'
    },
    {
      id: 'offer-3',
      denomination: 200,
      currency: 'MYR' as const,
      price: 180,
      originalPrice: 200,
      discount: 10,
      stock: 25,
      region: 'Malaysia'
    }
  ],
  regions: ['Malaysia'],
  tags: ['gaming', 'psn', 'sony', 'playstation'],
  rating: 4.5,
  reviewCount: 128,
  featured: true,
  supportedGames: [
    'All PlayStation 4 games',
    'All PlayStation 5 games', 
    'PlayStation Plus subscriptions',
    'PlayStation Store content'
  ],
  usageGuide: `1. Go to PlayStation Store on your console or web browser
2. Select "Redeem Codes" from the menu
3. Enter the 12-digit code
4. Confirm and the amount will be added to your wallet
5. Use the credit to purchase games, DLC, or subscriptions`
};

interface ProductPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const t = useTranslations('Product');

  // In real app, fetch product by slug
  if (params.slug !== mockProduct.slug) {
    notFound();
  }

  const [selectedOffer, setSelectedOffer] = React.useState(mockProduct.offers[0]);
  const [quantity, setQuantity] = React.useState(1);

  const totalPrice = selectedOffer.price * quantity;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <a href="/" className="hover:text-blue-600">Home</a>
            </li>
            <li>→</li>
            <li>
              <a href="/products" className="hover:text-blue-600">Products</a>
            </li>
            <li>→</li>
            <li className="text-gray-900">{mockProduct.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden mb-4">
              <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-6xl">🎮</span>
                  </div>
                  <span className="text-lg text-gray-600">Product Image Gallery</span>
                </div>
              </div>
            </div>
            
            {/* Thumbnail images would go here */}
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-20 h-20 bg-gray-300 rounded cursor-pointer hover:opacity-75"></div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{mockProduct.name}</h1>
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-lg">
                  {'★'.repeat(Math.floor(mockProduct.rating))}
                  {'☆'.repeat(5 - Math.floor(mockProduct.rating))}
                </div>
                <span className="text-gray-600 ml-2">
                  {mockProduct.rating} ({mockProduct.reviewCount} {t('reviews')})
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {mockProduct.regions.map(region => (
                  <span 
                    key={region}
                    className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    {region}
                  </span>
                ))}
              </div>
            </div>

            {/* Price Matrix */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">{t('denomination')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {mockProduct.offers.map((offer) => (
                  <button
                    key={offer.id}
                    onClick={() => setSelectedOffer(offer)}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      selectedOffer.id === offer.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <div className="font-semibold text-lg">MYR {offer.denomination}</div>
                    <div className="text-gray-600 text-sm">MYR {offer.price}</div>
                    {offer.discount && (
                      <div className="text-green-600 text-sm font-semibold">
                        {offer.discount}% off
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Total */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="font-semibold">{t('quantity')}</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{t('total')}</span>
                  <span className="text-2xl font-bold text-gray-900">
                    MYR {totalPrice}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg">
                {t('addToCart')}
              </button>
              <button className="flex-1 border-2 border-blue-600 text-blue-600 py-4 px-6 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-lg">
                {t('buyNow')}
              </button>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-8 bg-white rounded-lg shadow-sm">
          <div className="border-b">
            <nav className="flex">
              <button className="px-6 py-4 border-b-2 border-blue-600 text-blue-600 font-semibold">
                {t('description')}
              </button>
              <button className="px-6 py-4 text-gray-600 hover:text-blue-600 font-semibold">
                {t('guide')}
              </button>
              <button className="px-6 py-4 text-gray-600 hover:text-blue-600 font-semibold">
                {t('reviews')}
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{mockProduct.description}</p>
              
              <h3 className="text-lg font-semibold mt-6 mb-3">Supported Games & Content</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {mockProduct.supportedGames.map((game, index) => (
                  <li key={index}>{game}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

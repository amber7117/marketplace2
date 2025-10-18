import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function CartPage() {
  const t = useTranslations('Cart');

  // Mock cart data
  const cartItems = [
    {
      lineId: '1',
      slug: 'playstation-network-card',
      offerId: 'offer-1',
      quantity: 2,
      product: {
        id: '1',
        slug: 'playstation-network-card',
        name: 'PlayStation Network Card',
        description: 'Top up your PlayStation Network wallet',
        shortDescription: 'PSN credit for games and subscriptions',
        category: 'gaming',
        brand: 'Sony',
        images: ['/products/playstation-network-card/cover.jpg'],
        regions: ['Malaysia'],
        tags: ['gaming', 'psn', 'sony'],
        rating: 4.5,
        reviewCount: 128,
        featured: true,
        supportedGames: ['All PlayStation games'],
        usageGuide: 'Redeem code in PlayStation Store'
      },
      offer: {
        id: 'offer-1',
        denomination: 50,
        currency: 'MYR' as const,
        price: 45,
        originalPrice: 50,
        discount: 10,
        stock: 100,
        region: 'Malaysia'
      }
    },
    {
      lineId: '2',
      slug: 'razer-gold',
      offerId: 'offer-3',
      quantity: 1,
      product: {
        id: '2',
        slug: 'razer-gold',
        name: 'Razer Gold',
        description: 'Universal gaming credits',
        shortDescription: 'Universal gaming currency',
        category: 'gaming',
        brand: 'Razer',
        images: ['/products/razer-gold/cover.jpg'],
        regions: ['Global'],
        tags: ['gaming', 'razer', 'universal'],
        rating: 4.3,
        reviewCount: 89,
        featured: false,
        supportedGames: ['Mobile games', 'PC games'],
        usageGuide: 'Use in supported games and apps'
      },
      offer: {
        id: 'offer-3',
        denomination: 20,
        currency: 'MYR' as const,
        price: 18,
        originalPrice: 20,
        discount: 10,
        stock: 200,
        region: 'Global'
      }
    }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.offer.price * item.quantity), 0);
  const tax = subtotal * 0.06; // 6% tax
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-gray-600">Review your items and proceed to checkout</p>
          </div>

          {cartItems.length === 0 ? (
            // Empty Cart
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🛒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('empty')}</h3>
              <p className="text-gray-600 mb-6">Add some products to get started</p>
              <Link 
                href="/products"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                {t('continueShopping')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm">
                  {cartItems.map((item) => (
                    <div key={item.lineId} className="p-6 border-b last:border-b-0">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">🎮</span>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                              <p className="text-sm text-gray-600">
                                MYR {item.offer.denomination} - {item.offer.region}
                              </p>
                            </div>
                            <button className="text-red-600 hover:text-red-700 text-sm">
                              {t('remove')}
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button className="px-3 py-1 hover:bg-gray-100">-</button>
                              <span className="px-4 py-1">{item.quantity}</span>
                              <button className="px-3 py-1 hover:bg-gray-100">+</button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                MYR {(item.offer.price * item.quantity).toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-600">
                                MYR {item.offer.price} each
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                  <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('subtotal')}</span>
                      <span className="font-semibold">MYR {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('tax')}</span>
                      <span className="font-semibold">MYR {tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg">
                      <span className="font-semibold">{t('total')}</span>
                      <span className="font-bold text-gray-900">MYR {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Link 
                    href="/checkout"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center block"
                  >
                    {t('checkout')}
                  </Link>

                  <Link 
                    href="/products"
                    className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors text-center block mt-3"
                  >
                    {t('continueShopping')}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

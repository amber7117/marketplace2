'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Product, Offer } from '@/lib/types';
import { PricingService } from '@/lib/pricing';
import { useCurrency } from '@/hooks/useCurrency';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import Price from '@/components/Price';
import sanitizeHtml from 'sanitize-html';

interface ProductDetailClientProps {
  product: Product;
  locale: string;
}

type TabType = 'description' | 'guide' | 'specs';

export default function ProductDetailClient({ product, locale }: ProductDetailClientProps) {
  const t = useTranslations('Product');
  const { currency } = useCurrency();
  const { addToCart } = useCart();
  const router = useRouter();

  const [selectedOffer, setSelectedOffer] = useState<Offer>(product.offers[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>('description');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [convertedPrice, setConvertedPrice] = useState<number>(0);
  const [convertedOriginalPrice, setConvertedOriginalPrice] = useState<number | null>(null);

  // Calculate converted prices
  useEffect(() => {
    const calculatePrices = async () => {
      const price = await PricingService.convertOfferPrice(selectedOffer, currency);
      setConvertedPrice(price);

      if (selectedOffer.originalPrice) {
        const original = await PricingService.convertOfferPrice(
          { ...selectedOffer, price: selectedOffer.originalPrice },
          currency
        );
        setConvertedOriginalPrice(original);
      } else {
        setConvertedOriginalPrice(null);
      }
    };

    calculatePrices();
  }, [selectedOffer, currency]);

  const totalPrice = convertedPrice * quantity;

  const handleAddToCart = () => {
    addToCart({
      product,
      offer: selectedOffer,
      quantity,
    });
    
    // Show success message (you can use a toast library)
    alert(t('addedToCart'));
  };

  const handleBuyNow = () => {
    addToCart({
      product,
      offer: selectedOffer,
      quantity,
    });
    
    router.push(`/${locale}/checkout`);
  };

  const sanitizedDescription = sanitizeHtml(product.description, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h2', 'h3']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class'],
    },
  });

  const sanitizedGuide = product.usageGuide ? sanitizeHtml(product.usageGuide, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h2', 'h3']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class'],
    },
  }) : '';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href={`/${locale}`} className="hover:text-blue-600">
            Home
          </Link>
          {' / '}
          <Link href={`/${locale}/products`} className="hover:text-blue-600">
            Products
          </Link>
          {' / '}
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Image Gallery */}
          <div>
            {/* Main Image */}
            <div 
              className="bg-white rounded-lg overflow-hidden mb-4 cursor-pointer"
              onClick={() => setIsImageModalOpen(true)}
            >
              <div className="aspect-w-16 aspect-h-9 relative h-96">
                <img
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback image
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EProduct Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="bg-white rounded-lg p-6">
            <div className="mb-4">
              {product.featured && (
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full mb-2">
                  {t('featured')}
                </span>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600 mb-4">{product.shortDescription}</p>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-lg">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>
                      {i < Math.floor(product.rating) ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  {product.rating} ({product.reviewCount} {t('reviews')})
                </span>
              </div>

              {/* Brand and Region */}
              <div className="flex gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-500">{t('brand')}: </span>
                  <span className="text-sm font-medium">{product.brand}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">{t('region')}: </span>
                  {product.regions.map(region => (
                    <span 
                      key={region}
                      className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-1"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Denomination Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('selectDenomination')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {product.offers.map((offer) => (
                  <button
                    key={offer.id}
                    onClick={() => setSelectedOffer(offer)}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      selectedOffer.id === offer.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    disabled={offer.stock === 0}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {offer.denomination}
                      </div>
                      <div className="text-xs text-gray-500">
                        {offer.stock > 0 ? (
                          <span className="text-green-600">
                            {offer.stock} {t('stockLeft')}
                          </span>
                        ) : (
                          <span className="text-red-600">{t('outOfStock')}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Display */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-baseline gap-3 mb-2">
                <Price 
                  amount={convertedPrice}
                  currency={currency}
                  className="text-3xl font-bold text-gray-900"
                />
                {convertedOriginalPrice && (
                  <Price 
                    amount={convertedOriginalPrice}
                    currency={currency}
                    className="text-lg text-gray-500 line-through"
                  />
                )}
                {selectedOffer.discount && (
                  <span className="text-lg text-green-600 font-semibold">
                    -{selectedOffer.discount}%
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {t('denomination')}: {selectedOffer.denomination} {selectedOffer.currency}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('quantity')}
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 h-10 text-center border border-gray-300 rounded-lg"
                  min="1"
                  max={selectedOffer.stock}
                />
                <button
                  onClick={() => setQuantity(Math.min(selectedOffer.stock, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={quantity >= selectedOffer.stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-700">{t('total')}:</span>
                <Price 
                  amount={totalPrice}
                  currency={currency}
                  className="text-2xl font-bold text-blue-600"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={selectedOffer.stock === 0}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t('addToCart')}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={selectedOffer.stock === 0}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t('buyNow')}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-lg p-6">
          {/* Tab Headers */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'description'
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('description')}
              </button>
              {product.usageGuide && (
                <button
                  onClick={() => setActiveTab('guide')}
                  className={`pb-3 px-1 border-b-2 transition-colors ${
                    activeTab === 'guide'
                      ? 'border-blue-600 text-blue-600 font-medium'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('howToUse')}
                </button>
              )}
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'specs'
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('specifications')}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="prose max-w-none">
            {activeTab === 'description' && (
              <div dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
            )}

            {activeTab === 'guide' && product.usageGuide && (
              <div dangerouslySetInnerHTML={{ __html: sanitizedGuide }} />
            )}

            {activeTab === 'specs' && (
              <div>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 font-medium text-gray-700">{t('brand')}</td>
                      <td className="py-3 text-gray-900">{product.brand}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-medium text-gray-700">{t('region')}</td>
                      <td className="py-3 text-gray-900">{product.regions.join(', ')}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-medium text-gray-700">Category</td>
                      <td className="py-3 text-gray-900 capitalize">{product.category}</td>
                    </tr>
                    {product.supportedGames && product.supportedGames.length > 0 && (
                      <tr className="border-b">
                        <td className="py-3 font-medium text-gray-700">{t('supportedGames')}</td>
                        <td className="py-3 text-gray-900">
                          <ul className="list-disc list-inside">
                            {product.supportedGames.map((game, index) => (
                              <li key={index}>{game}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                    <tr className="border-b">
                      <td className="py-3 font-medium text-gray-700">Available Denominations</td>
                      <td className="py-3 text-gray-900">
                        {product.offers.map(o => o.denomination).join(', ')} {product.offers[0].currency}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
          >
            ×
          </button>
          <img
            src={product.images[currentImageIndex]}
            alt={product.name}
            className="max-w-full max-h-full object-contain"
          />
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-3 h-3 rounded-full ${
                    currentImageIndex === index ? 'bg-white' : 'bg-gray-500'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

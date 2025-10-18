'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Menu, X, Globe, CreditCard, Search } from 'lucide-react';

export default function Navbar() {
  const t = useTranslations('Navigation');
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCurrency, setCurrentCurrency] = useState('MYR');
  const [cartCount, setCartCount] = useState(0);

  // Initialize currency from cookie
  useEffect(() => {
    const cookieCurrency = document.cookie
      .split('; ')
      .find(row => row.startsWith('currency='))
      ?.split('=')[1];
    
    if (cookieCurrency && ['MYR', 'USD', 'SGD'].includes(cookieCurrency)) {
      setCurrentCurrency(cookieCurrency);
    }
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    // Update the locale in the URL
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
    setIsMenuOpen(false);
  };

  const handleCurrencyChange = (currency: string) => {
    // Set currency cookie and refresh
    document.cookie = `currency=${currency}; path=/; max-age=31536000; samesite=lax`;
    setCurrentCurrency(currency);
    router.refresh();
    setIsMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">Marketplace</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Search Box - Center */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label={t('search')}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </form>

            {/* Language Selector */}
            <div className="relative group">
              <button 
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={t('language')}
                aria-haspopup="true"
              >
                <Globe className="w-4 h-4" />
                <span>{locale.toUpperCase()}</span>
              </button>
              <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button 
                  onClick={() => handleLanguageChange('en')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-t-lg focus:outline-none focus:bg-gray-50"
                  aria-label="Switch to English"
                >
                  English
                </button>
                <button 
                  onClick={() => handleLanguageChange('zh')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-b-lg focus:outline-none focus:bg-gray-50"
                  aria-label="切换到中文"
                >
                  中文
                </button>
              </div>
            </div>

            {/* Currency Selector */}
            <div className="relative group">
              <button 
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={t('currency')}
                aria-haspopup="true"
              >
                <span>{currentCurrency}</span>
              </button>
              <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button 
                  onClick={() => handleCurrencyChange('MYR')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-t-lg focus:outline-none focus:bg-gray-50"
                  aria-label="Switch to Malaysian Ringgit"
                >
                  MYR
                </button>
                <button 
                  onClick={() => handleCurrencyChange('USD')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                  aria-label="Switch to US Dollar"
                >
                  USD
                </button>
                <button 
                  onClick={() => handleCurrencyChange('SGD')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-b-lg focus:outline-none focus:bg-gray-50"
                  aria-label="Switch to Singapore Dollar"
                >
                  SGD
                </button>
              </div>
            </div>

            {/* Cart */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
              aria-label={t('cart')}
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                {t('login')}
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('register')}
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/products" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('products')}
              </Link>
              <Link 
                href="/orders" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('orders')}
              </Link>
              
              <div className="flex space-x-4">
                <button 
                  onClick={() => handleLanguageChange('en')}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  EN
                </button>
                <button 
                  onClick={() => handleLanguageChange('zh')}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  中文
                </button>
              </div>

              <div className="flex space-x-4">
                <button 
                  onClick={() => handleCurrencyChange('MYR')}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  MYR
                </button>
                <button 
                  onClick={() => handleCurrencyChange('USD')}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  USD
                </button>
                <button 
                  onClick={() => handleCurrencyChange('SGD')}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  SGD
                </button>
              </div>

              <button 
                onClick={() => setIsCartOpen(true)}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{t('cart')} (0)</span>
              </button>

              <div className="flex space-x-4 pt-4 border-t">
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('login')}
                </Link>
                <Link 
                  href="/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('register')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cart Drawer (placeholder) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsCartOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{t('cart')}</h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-500 text-center">Your cart is empty</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

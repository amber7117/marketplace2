'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useState } from 'react';
import {
  ShoppingCart,
  User,
  Menu,
  Globe,
  DollarSign,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useCartStore, useUserStore } from '@/store';
import type { Currency } from '@/types';

/* =========================================================
   🌍 Multi-language & Currency configuration
========================================================= */
const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'ms', name: 'Bahasa Malaysia', flag: '🇲🇾' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  ];

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', flag: '🇲🇾' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: '🇹🇭' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', flag: '🇻🇳' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', flag: '🇮🇩' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', flag: '🇵🇭' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: '🇰🇷' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: '🇸🇦' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', flag: '🇷🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' }
];

/* =========================================================
   🌐 Language Selector Component
========================================================= */
const LanguageSelector = () => {
  const router = useRouter();
  const pathname = usePathname();
  const currentLang = useLocale();

  const handleLanguageChange = (langCode: string) => {
    router.push(pathname, { locale: langCode });
  };

  const currentLanguage =
    languages.find((lang) => lang.code === currentLang) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="min-w-[80px] justify-between gap-1">
          <div className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            {currentLanguage.code.toUpperCase()}
          </div>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="cursor-pointer"
          >
            <div className="mr-2">{lang.flag}</div>
            <div>{lang.name}</div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/* =========================================================
   💰 Currency Selector Component
========================================================= */
const CurrencySelector = () => {
  const { currency, setCurrency } = useCartStore();
  const router = useRouter();

  const handleCurrencyChange = (currencyCode: string) => {
    // Type assertion to ensure currencyCode matches Currency type
    setCurrency(currencyCode as Currency);
    // Force a re-render of the page to update prices with new currency
    router.refresh();
  };

  const currencyObj =
    currencies.find((c) => c.code === currency) || currencies[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="min-w-[80px] justify-between gap-1">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            {currencyObj.code}
          </div>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {currencies.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => handleCurrencyChange(curr.code)}
            className="cursor-pointer"
          >
            <div className="mr-2">{curr.flag}</div>
            <div className="flex-1">{curr.name}</div>
            <div className="text-muted-foreground">{curr.symbol}</div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/* =========================================================
   🧭 Navbar Component
========================================================= */
export function Navbar() {
  const t = useTranslations('common');
  const { getItemCount } = useCartStore();
  const { isAuthenticated } = useUserStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = getItemCount();

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <div className="text-xl font-bold">{t('appName1')}</div>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden flex-1 max-w-xl mx-8 md:flex">
        
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center gap-1">
              <LanguageSelector />
              <CurrencySelector />
            </div>

            {/* 🛒 Cart Button */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {cartCount}
                  </div>
                )}
              </Button>
            </Link>

            {/* 👤 User Menu */}
            {isAuthenticated ? (
              <Link href="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm">
                  {t('login')}
                </Button>
              </Link>
            )}

            {/* 📱 Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* 🔍 Mobile Search */}
        <div className="pb-4 md:hidden">
         
        </div>

        {/* 📋 Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t pb-4 pt-4 md:hidden">
            <div className="flex flex-col space-y-3">
              <div className="flex gap-2">
                <LanguageSelector />
                <CurrencySelector />
              </div>
              <Link href="/products">
                <Button variant="ghost" className="w-full justify-start">
                  {t('products')}
                </Button>
              </Link>
              {isAuthenticated && (
                <>
                  <Link href="/orders">
                    <Button variant="ghost" className="w-full justify-start">
                      {t('orders')}
                    </Button>
                  </Link>
                  <Link href="/wallet">
                    <Button variant="ghost" className="w-full justify-start">
                      {t('wallet')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

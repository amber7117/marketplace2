'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePreferencesStore } from '@/lib/store/preferences-store';
import { SUPPORTED_LOCALES, SUPPORTED_CURRENCIES } from '@/lib/schemas';

export default function ProfilePage() {
  const t = useTranslations('Profile');
  const { locale, currency, setLocale, setCurrency } = usePreferencesStore();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="max-w-2xl">
        {/* Preferences */}
        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t('preferences')}</h2>
          
          <div className="space-y-4">
            {/* Language */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('language')}
              </label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {SUPPORTED_LOCALES.map((loc) => (
                  <option key={loc} value={loc}>
                    {t(`languages.${loc}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('currency')}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            {t('save')}
          </button>

          {saved && (
            <p className="mt-4 text-green-600 text-sm">{t('saved')}</p>
          )}
        </section>

        {/* Account Info (Mock) */}
        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t('accountInfo')}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('email')}
              </label>
              <input
                type="email"
                defaultValue="user@example.com"
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('name')}
              </label>
              <input
                type="text"
                defaultValue="Guest User"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            {t('mockMessage')}
          </p>
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{t('notifications')}</h2>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm">{t('emailNotifications')}</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm">{t('smsNotifications')}</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm">{t('marketingEmails')}</span>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}

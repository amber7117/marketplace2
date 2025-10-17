import { Suspense, use } from 'react';
import { useTranslations } from 'next-intl';
import { SearchResults } from './SearchResults';

interface SearchPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    q?: string;
  }>;
}

export default function SearchPage({ params, searchParams }: SearchPageProps) {
  const t = useTranslations('common');
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const query = resolvedSearchParams.q || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {query ? t('searchResults') : t('search')}
        </h1>
        {query && (
          <p className="text-muted-foreground">
            {`${t('search')}: "${query}"`}
          </p>
        )}
      </div>

      <Suspense fallback={<div className="text-center py-8">{t('loading')}</div>}>
        <SearchResults query={query} locale={resolvedParams.locale} />
      </Suspense>
    </div>
  );
}

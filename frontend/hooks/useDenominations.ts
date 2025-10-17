import { useState, useEffect, useCallback } from 'react';
import { productAPI } from '@/lib/api';

export interface DenominationData {
  region: string;
  currency: string;
  denomination: string;
  price: number;
  discountPrice?: number;
  stock: number;
  isAvailable: boolean;
  isInstantDelivery?: boolean;
  platformLogo?: string;
  displayOrder?: number;
}

export interface DenominationResponse {
  product: {
    id: string;
    name: string;
    slug: string;
    category: string;
    images?: string[];
  };
  denominations: DenominationData[];
  availableRegions: Record<string, {
    currency: string;
    count: number;
    totalStock: number;
  }>;
  priceStats: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    totalStock: number;
  };
  totalDenominations: number;
  activeDenominations: number;
}

export interface UseDenominationsOptions {
  region?: string;
  currency?: string;
  inStockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface UseDenominationsResult {
  data: DenominationResponse | null;
  denominations: DenominationData[];
  availableRegions: Record<string, { currency: string; count: number; totalStock: number }>;
  priceStats: DenominationResponse['priceStats'] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDenominations(
  productSlug: string,
  options: UseDenominationsOptions = {}
): UseDenominationsResult {
  const [data, setData] = useState<DenominationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDenominations = useCallback(async () => {
    if (!productSlug) return;

    setLoading(true);
    setError(null);

    try {
      const response = await productAPI.getDenominations(productSlug, options);
      if (response.data?.data) {
        setData(response.data.data);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to fetch denominations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [productSlug, options]);

  useEffect(() => {
    fetchDenominations();
  }, [fetchDenominations]);

  return {
    data,
    denominations: data?.denominations || [],
    availableRegions: data?.availableRegions || {},
    priceStats: data?.priceStats || null,
    loading,
    error,
    refetch: () => {
      fetchDenominations();
    },
  };
}
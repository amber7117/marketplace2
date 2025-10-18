import type { Product } from './schemas';

// Mock 产品数据加载
export async function loadProducts(): Promise<Product[]> {
  // 在实际实现中，这会从 manifest.json 加载所有产品
  // 这里返回空数组，实际数据由 API 路由提供
  return [];
}

export async function loadProduct(slug: string): Promise<Product | null> {
  // 在实际实现中，从 data/products/{slug}/{slug}.json 加载
  // 这里返回 null，实际数据由 API 路由提供
  return null;
}

// 辅助函数：从 API 获取产品
export async function fetchProducts(params?: Record<string, string>): Promise<{
  products: Product[];
  total: number;
}> {
  const searchParams = new URLSearchParams(params);
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/catalog?${searchParams}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  
  const data = await response.json();
  return {
    products: data.data || [],
    total: data.meta?.total || 0,
  };
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/catalog/${slug}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch product');
  }
  
  const data = await response.json();
  return data.data || null;
}

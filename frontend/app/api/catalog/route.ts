import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ProductSchema, ProductFiltersSchema, type ApiResponse, type Product } from '@/lib/schemas';

const DATA_DIR = path.resolve(process.cwd(), 'data/products');
const MANIFEST_PATH = path.resolve(process.cwd(), 'data/manifest.json');

// 缓存产品数据
let productsCache: Product[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1分钟

async function loadAllProducts(): Promise<Product[]> {
  const now = Date.now();
  
  // 检查缓存
  if (productsCache && now - cacheTimestamp < CACHE_TTL) {
    return productsCache;
  }
  
  const products: Product[] = [];
  
  try {
    // 读取 manifest
    const manifestContent = await fs.promises.readFile(MANIFEST_PATH, 'utf-8');
    const manifest = JSON.parse(manifestContent);
    
    // 加载所有产品
    for (const entry of manifest.products) {
      try {
        const productFile = path.join(DATA_DIR, entry.slug, `${entry.slug}.json`);
        const content = await fs.promises.readFile(productFile, 'utf-8');
        const data = JSON.parse(content);
        const product = ProductSchema.parse(data);
        products.push(product);
      } catch (err) {
        console.error(`Failed to load product ${entry.slug}:`, err);
      }
    }
    
    productsCache = products;
    cacheTimestamp = now;
    
    return products;
  } catch (err) {
    console.error('Failed to load products:', err);
    return [];
  }
}

function filterProducts(products: Product[], filters: any) {
  let filtered = [...products];
  
  // 搜索
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.en.toLowerCase().includes(searchLower) ||
        p.name.zh.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower)
    );
  }
  
  // 分类
  if (filters.category) {
    filtered = filtered.filter((p) => p.category === filters.category);
  }
  
  // 品牌
  if (filters.brand) {
    filtered = filtered.filter((p) => p.brand === filters.brand);
  }
  
  // 区域
  if (filters.region) {
    filtered = filtered.filter((p) => p.regions.includes(filters.region));
  }
  
  // 价格范围
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    filtered = filtered.filter((p) => {
      const lowestPrice = Math.min(...p.offers.map((o) => o.price));
      if (filters.minPrice !== undefined && lowestPrice < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && lowestPrice > filters.maxPrice) return false;
      return true;
    });
  }
  
  // 标签
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter((p) => filters.tags.some((tag: string) => p.tags.includes(tag)));
  }
  
  // 特色
  if (filters.featured === true) {
    filtered = filtered.filter((p) => p.featured);
  }
  
  return filtered;
}

function sortProducts(products: Product[], sortBy: string) {
  const sorted = [...products];
  
  switch (sortBy) {
    case 'price-asc':
      sorted.sort((a, b) => {
        const priceA = Math.min(...a.offers.map((o) => o.price));
        const priceB = Math.min(...b.offers.map((o) => o.price));
        return priceA - priceB;
      });
      break;
    case 'price-desc':
      sorted.sort((a, b) => {
        const priceA = Math.min(...a.offers.map((o) => o.price));
        const priceB = Math.min(...b.offers.map((o) => o.price));
        return priceB - priceA;
      });
      break;
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case 'popular':
      sorted.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case 'newest':
      sorted.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      break;
  }
  
  return sorted;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 解析查询参数
    const filters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      brand: searchParams.get('brand') || undefined,
      region: searchParams.get('region') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      tags: searchParams.get('tags') ? searchParams.get('tags')?.split(',') : undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      sortBy: searchParams.get('sortBy') || 'popular',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
    };
    
    // 验证参数
    const validatedFilters = ProductFiltersSchema.parse(filters);
    
    // 加载产品
    const allProducts = await loadAllProducts();
    
    // 筛选
    let filtered = filterProducts(allProducts, validatedFilters);
    
    // 排序
    filtered = sortProducts(filtered, validatedFilters.sortBy || 'popular');
    
    // 分页
    const total = filtered.length;
    const start = (validatedFilters.page - 1) * validatedFilters.limit;
    const end = start + validatedFilters.limit;
    const paginated = filtered.slice(start, end);
    
    const response: ApiResponse<Product[]> = {
      success: true,
      data: paginated,
      meta: {
        page: validatedFilters.page,
        limit: validatedFilters.limit,
        total,
      },
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Catalog API error:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to fetch products',
      },
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ProductSchema, type ApiResponse, type Product } from '@/lib/schemas';

const DATA_DIR = path.resolve(process.cwd(), 'data/products');

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    const productFile = path.join(DATA_DIR, slug, `${slug}.json`);
    
    // 检查文件是否存在
    if (!fs.existsSync(productFile)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Product with slug "${slug}" not found`,
        },
      };
      return NextResponse.json(response, { status: 404 });
    }
    
    const content = await fs.promises.readFile(productFile, 'utf-8');
    const data = JSON.parse(content);
    const product = ProductSchema.parse(data);
    
    const response: ApiResponse<Product> = {
      success: true,
      data: product,
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Product API error:', error);
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to fetch product',
      },
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

#!/usr/bin/env tsx

import * as fs from 'node:fs';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { ProductSchema } from '../lib/schemas.js';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const copyFile = promisify(fs.copyFile);
const stat = promisify(fs.stat);

// 路径配置
const DATA_DIR = path.resolve(process.cwd(), 'data/products');
const PUBLIC_DIR = path.resolve(process.cwd(), 'public/products');
const MANIFEST_PATH = path.resolve(process.cwd(), 'data/manifest.json');

interface ProductManifest {
  products: Array<{
    slug: string;
    id: string;
    name: { en: string; zh: string };
    category: string;
    brand: string;
    featured: boolean;
    imageCount: number;
  }>;
  totalProducts: number;
  categories: string[];
  brands: string[];
  lastUpdated: string;
}

async function ensureDir(dir: string): Promise<void> {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err: any) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copyImagesForProduct(slug: string, images: string[]): Promise<number> {
  const sourceDir = path.join(DATA_DIR, slug, 'images');
  const destDir = path.join(PUBLIC_DIR, slug);
  
  await ensureDir(destDir);
  
  let copiedCount = 0;
  
  for (const imagePath of images) {
    const fileName = path.basename(imagePath);
    const sourceFile = path.join(sourceDir, fileName);
    const destFile = path.join(destDir, fileName);
    
    if (await fileExists(sourceFile)) {
      try {
        await copyFile(sourceFile, destFile);
        copiedCount++;
        console.log(`  ✓ Copied: ${fileName}`);
      } catch (err) {
        console.error(`  ✗ Failed to copy ${fileName}:`, err);
      }
    } else {
      console.warn(`  ⚠ Missing source image: ${fileName}`);
    }
  }
  
  return copiedCount;
}

async function loadProduct(slug: string) {
  const productFile = path.join(DATA_DIR, slug, `${slug}.json`);
  
  try {
    const content = await readFile(productFile, 'utf-8');
    const data = JSON.parse(content);
    const product = ProductSchema.parse(data);
    return product;
  } catch (err: any) {
    console.error(`Failed to load product ${slug}:`, err.message);
    return null;
  }
}

async function syncImages(): Promise<void> {
  console.log('🚀 Starting image synchronization...\n');
  
  await ensureDir(PUBLIC_DIR);
  
  const entries = await readdir(DATA_DIR, { withFileTypes: true });
  const productDirs = entries.filter((entry) => entry.isDirectory());
  
  console.log(`Found ${productDirs.length} product directories\n`);
  
  const manifest: ProductManifest = {
    products: [],
    totalProducts: 0,
    categories: [],
    brands: [],
    lastUpdated: new Date().toISOString(),
  };
  
  const categorySet = new Set<string>();
  const brandSet = new Set<string>();
  
  for (const dir of productDirs) {
    const slug = dir.name;
    console.log(`Processing: ${slug}`);
    
    const product = await loadProduct(slug);
    
    if (!product) {
      console.log(`  ✗ Skipped (invalid product data)\n`);
      continue;
    }
    
    const imageCount = await copyImagesForProduct(slug, product.images);
    
    manifest.products.push({
      slug: product.slug,
      id: product.id,
      name: product.name,
      category: product.category,
      brand: product.brand,
      featured: product.featured,
      imageCount,
    });
    
    categorySet.add(product.category);
    brandSet.add(product.brand);
    
    console.log(`  ✓ Synced ${imageCount}/${product.images.length} images\n`);
  }
  
  manifest.totalProducts = manifest.products.length;
  manifest.categories = Array.from(categorySet).sort();
  manifest.brands = Array.from(brandSet).sort();
  
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  
  console.log('✅ Image synchronization complete!');
  console.log(`   Total products: ${manifest.totalProducts}`);
  console.log(`   Total images copied: ${manifest.products.reduce((sum, p) => sum + p.imageCount, 0)}`);
  console.log(`   Manifest saved to: ${MANIFEST_PATH}`);
}

// 执行
await syncImages().catch((err) => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});

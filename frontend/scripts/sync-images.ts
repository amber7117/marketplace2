#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { ProductSchema, type Product } from '../lib/schemas';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const copyFile = promisify(fs.copyFile);
const stat = promisify(fs.stat);

// 路径配置
const PRODUCTS_DIR = path.resolve(process.cwd(), 'data/products');
const PUBLIC_PRODUCTS_DIR = path.resolve(process.cwd(), 'public/products');
const MANIFEST_FILE = path.resolve(process.cwd(), 'data/manifest.json');

interface ProductManifest {
  products: Array<{
    slug: string;
    images: string[];
    lastSynced: string;
  }>;
  lastSync: string;
}

async function syncImages() {
  console.log('🔄 Starting image synchronization...');
  
  // Ensure public products directory exists
  if (!fs.existsSync(PUBLIC_PRODUCTS_DIR)) {
    fs.mkdirSync(PUBLIC_PRODUCTS_DIR, { recursive: true });
    console.log('📁 Created public/products directory');
  }

  const manifest: ProductManifest = {
    products: [],
    lastSync: new Date().toISOString()
  };

  try {
    // Read product directories
    const items = fs.readdirSync(PRODUCTS_DIR);
    const productDirs = items.filter(item => {
      const itemPath = path.join(PRODUCTS_DIR, item);
      return fs.statSync(itemPath).isDirectory() && 
             fs.existsSync(path.join(itemPath, 'images'));
    });

    console.log(`📦 Found ${productDirs.length} product directories`);

    for (const productDir of productDirs) {
      const productPath = path.join(PRODUCTS_DIR, productDir);
      const imagesPath = path.join(productPath, 'images');
      const publicProductPath = path.join(PUBLIC_PRODUCTS_DIR, productDir);
      
      // Create product directory in public
      if (!fs.existsSync(publicProductPath)) {
        fs.mkdirSync(publicProductPath, { recursive: true });
      }

      // Copy images
      const imageFiles = fs.readdirSync(imagesPath).filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );

      const copiedImages: string[] = [];

      for (const imageFile of imageFiles) {
        const sourcePath = path.join(imagesPath, imageFile);
        const destPath = path.join(publicProductPath, imageFile);
        
        try {
          fs.copyFileSync(sourcePath, destPath);
          copiedImages.push(`/products/${productDir}/${imageFile}`);
          console.log(`  ✅ Copied ${imageFile}`);
        } catch (error) {
          console.log(`  ❌ Failed to copy ${imageFile}:`, error);
        }
      }

      // Add to manifest
      if (copiedImages.length > 0) {
        manifest.products.push({
          slug: productDir,
          images: copiedImages,
          lastSynced: new Date().toISOString()
        });
      }
    }

    // Write manifest
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
    console.log('📄 Product manifest generated');

    console.log('✅ Image synchronization completed!');
    console.log(`📊 Synced ${manifest.products.length} products with images`);
    
  } catch (error) {
    console.error('❌ Error during synchronization:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncImages();
}

export { syncImages };

/**
 * MongoDB to Cloudflare D1 数据导入脚本
 * 将现有的 MongoDB 产品数据导入到 Cloudflare D1 数据库
 */

const fs = require( 'fs' );
const path = require( 'path' );

// 模拟的 MongoDB 产品数据（基于我们之前的迁移结果）
const mongoProducts = [
    {
        _id: "68f154790a5e81b08d3731b6",
        name: "PlayStation Store Gift Card",
        slug: "playstation-store-gift-card",
        description: "PlayStation Store 官方礼品卡，可用于购买游戏、DLC、订阅服务等。支持多个地区和面额，即时发货到邮箱。",
        category: "PlayStation",
        type: "digital_code",
        isActive: true,
        isFeatured: true,
        images: [
            "/images/products/psn-card-1.jpg",
            "/images/products/psn-card-2.jpg",
            "/images/products/psn-card-gallery.jpg"
        ],
        tags: [ "PlayStation", "PSN", "Gift Card", "Gaming", "Digital" ],
        regionalPricing: [
            {
                region: "US",
                currency: "USD",
                denomination: "$10 USD",
                price: 10.99,
                discountPrice: 9.99,
                stock: 500,
                isAvailable: true,
                isInstantDelivery: true,
                platformLogo: "/images/platforms/playstation.png",
                displayOrder: 1
            },
            {
                region: "US",
                currency: "USD",
                denomination: "$20 USD",
                price: 21.99,
                discountPrice: 19.49,
                stock: 300,
                isAvailable: true,
                isInstantDelivery: true,
                platformLogo: "/images/platforms/playstation.png",
                displayOrder: 2
            },
            {
                region: "US",
                currency: "USD",
                denomination: "$50 USD",
                price: 52.99,
                discountPrice: 47.99,
                stock: 200,
                isAvailable: true,
                isInstantDelivery: true,
                platformLogo: "/images/platforms/playstation.png",
                displayOrder: 3
            },
            {
                region: "US",
                currency: "USD",
                denomination: "$100 USD",
                price: 104.99,
                discountPrice: 94.99,
                stock: 100,
                isAvailable: true,
                isInstantDelivery: true,
                platformLogo: "/images/platforms/playstation.png",
                displayOrder: 4
            },
            {
                region: "MY",
                currency: "MYR",
                denomination: "RM 50",
                price: 52.00,
                discountPrice: 48.50,
                stock: 150,
                isAvailable: true,
                isInstantDelivery: true,
                platformLogo: "/images/platforms/playstation.png",
                displayOrder: 5
            },
            {
                region: "MY",
                currency: "MYR",
                denomination: "RM 100",
                price: 105.00,
                discountPrice: 96.00,
                stock: 80,
                isAvailable: true,
                isInstantDelivery: true,
                platformLogo: "/images/platforms/playstation.png",
                displayOrder: 6
            },
            {
                region: "SG",
                currency: "SGD",
                denomination: "$15 SGD",
                price: 15.90,
                discountPrice: 14.25,
                stock: 120,
                isAvailable: true,
                isInstantDelivery: true,
                platformLogo: "/images/platforms/playstation.png",
                displayOrder: 7
            },
            {
                region: "SG",
                currency: "SGD",
                denomination: "$30 SGD",
                price: 31.50,
                discountPrice: 28.50,
                stock: 90,
                isAvailable: true,
                isInstantDelivery: true,
                platformLogo: "/images/platforms/playstation.png",
                displayOrder: 8
            },
            {
                region: "TH",
                currency: "THB",
                denomination: "฿500 THB",
                price: 520.00,
                discountPrice: 475.00,
                stock: 0,
                isAvailable: false,
                isInstantDelivery: false,
                platformLogo: "/images/platforms/playstation.png",
                displayOrder: 9
            }
        ]
    },
    {
        _id: "68f154790a5e81b08d3731c0",
        name: "Xbox Gift Card",
        slug: "xbox-gift-card",
        description: "Xbox 官方礼品卡，可用于购买游戏、应用、电影等。支持 Xbox One 和 Xbox Series X|S。",
        category: "Xbox",
        type: "digital_code",
        isActive: true,
        isFeatured: true,
        images: [
            "/images/products/xbox-card-1.jpg",
            "/images/products/xbox-card-2.jpg"
        ],
        tags: [ "Xbox", "Microsoft", "Gift Card", "Gaming", "Digital" ],
        regionalPricing: [
            {
                region: "US",
                currency: "USD",
                denomination: "$10 USD",
                price: 10.99,
                discountPrice: 9.49,
                stock: 250,
                isAvailable: true,
                isInstantDelivery: true,
                platformLogo: "/images/platforms/xbox.png",
                displayOrder: 1
            },
            {
                region: "US",
                currency: "USD",
                denomination: "$25 USD",
                price: 25.99,
                discountPrice: 23.99,
                stock: 180,
                isAvailable: true,
                isInstantDelivery: true,
                platformLogo: "/images/platforms/xbox.png",
                displayOrder: 2
            }
        ]
    },
    {
        _id: "malaysia-topup-30",
        name: {
            en: "Malaysia Mobile Top-up (RM30)",
            zh: "马来西亚手机充值 (RM30)",
            th: "เติมเงินมือถือมาเลเซีย (RM30)",
            vi: "Nạp tiền điện thoại Malaysia (RM30)"
        },
        slug: "malaysia-topup-rm30",
        description: {
            en: "Mobile top-up for Malaysian networks including Maxis, Celcom, Digi, and U Mobile.",
            zh: "马来西亚手机充值服务，支持 Maxis、Celcom、Digi 和 U Mobile 等网络。"
        },
        category: "Mobile Top-up",
        type: "mobile_topup",
        isActive: true,
        isFeatured: false,
        images: [ "/images/products/malaysia-topup.jpg" ],
        tags: [ "Malaysia", "Mobile", "Top-up", "Telecom" ],
        regionalPricing: [
            {
                region: "MY",
                currency: "MYR",
                denomination: "RM 30",
                price: 32.00,
                stock: 1000,
                isAvailable: true,
                isInstantDelivery: true,
                displayOrder: 1
            }
        ]
    },
    {
        _id: "google-play-25",
        name: {
            en: "Google Play Gift Card $25",
            zh: "Google Play 礼品卡 $25",
            th: "บัตรของขวัญ Google Play $25",
            vi: "Thẻ quà tặng Google Play $25"
        },
        slug: "google-play-gift-card-25",
        description: {
            en: "Google Play Gift Card for purchasing apps, games, movies, and more from the Google Play Store.",
            zh: "Google Play 礼品卡，可用于在 Google Play 商店购买应用、游戏、电影等。"
        },
        category: "Google Play",
        type: "digital_code",
        isActive: true,
        isFeatured: true,
        images: [ "/images/products/google-play-card.jpg" ],
        tags: [ "Google Play", "Android", "Gift Card", "Apps", "Games" ],
        regionalPricing: [
            {
                region: "US",
                currency: "USD",
                denomination: "$25 USD",
                price: 25.99,
                discountPrice: 24.49,
                stock: 300,
                isAvailable: true,
                isInstantDelivery: true,
                platformLogo: "/images/platforms/google-play.png",
                displayOrder: 1
            }
        ]
    },
    {
        _id: "steam-10-usd",
        name: {
            en: "Steam Gift Card $10 (US)",
            zh: "Steam 礼品卡 $10 (美国)",
            th: "บัตรของขวัญ Steam $10 (สหรัฐอเมริกา)",
            vi: "Thẻ quà tặng Steam $10 (Mỹ)"
        },
        slug: "steam-gift-card-10-usd",
        description: {
            en: "Steam Gift Card for purchasing games, software, and in-game content on the Steam platform.",
            zh: "Steam 礼品卡，可用于在 Steam 平台购买游戏、软件和游戏内容。"
        },
        category: "Steam",
        type: "digital_code",
        isActive: true,
        isFeatured: true,
        images: [ "/images/products/steam-card.jpg" ],
        tags: [ "Steam", "PC Gaming", "Gift Card", "Valve" ],
        regionalPricing: [
            {
                region: "US",
                currency: "USD",
                denomination: "$10 USD",
                price: 10.99,
                discountPrice: 9.99,
                stock: 500,
                isAvailable: true,
                isInstantDelivery: true,
                platformLogo: "/images/platforms/steam.png",
                displayOrder: 1
            }
        ]
    }
];

// 生成 SQL 插入语句
function generateSQLInserts() {
    const insertStatements = [];

    mongoProducts.forEach( ( product, index ) => {
        // 处理多语言字段
        const name = typeof product.name === 'string' ? product.name : product.name.en;
        const description = typeof product.description === 'string' ? product.description : product.description.en;

        // 转换数据
        const sqlData = {
            id: index + 1, // 使用自增 ID
            name: name,
            slug: product.slug,
            description: description,
            category: product.category,
            type: product.type || 'digital_code',
            is_active: product.isActive ? 1 : 0,
            is_featured: product.isFeatured ? 1 : 0,
            images: JSON.stringify( product.images || [] ),
            tags: JSON.stringify( product.tags || [] ),
            regional_pricing: JSON.stringify( product.regionalPricing || [] )
        };

        // 生成 INSERT 语句
        const sql = `INSERT INTO products (
      name, slug, description, category, type, is_active, is_featured, 
      images, tags, regional_pricing, created_at, updated_at
    ) VALUES (
      ${ JSON.stringify( sqlData.name ) },
      ${ JSON.stringify( sqlData.slug ) },
      ${ JSON.stringify( sqlData.description ) },
      ${ JSON.stringify( sqlData.category ) },
      ${ JSON.stringify( sqlData.type ) },
      ${ sqlData.is_active },
      ${ sqlData.is_featured },
      ${ JSON.stringify( sqlData.images ) },
      ${ JSON.stringify( sqlData.tags ) },
      ${ JSON.stringify( sqlData.regional_pricing ) },
      datetime('now'),
      datetime('now')
    );`;

        insertStatements.push( sql );
    } );

    return insertStatements;
}

// 生成完整的 SQL 文件
function generateSQLFile() {
    const createTableSQL = `-- Cloudflare D1 Products Table Schema
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  type TEXT DEFAULT 'digital_code',
  is_active INTEGER DEFAULT 1,
  is_featured INTEGER DEFAULT 0,
  images TEXT,
  tags TEXT,
  regional_pricing TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);

-- Clear existing data (optional)
-- DELETE FROM products;

-- Insert product data
`;

    const insertStatements = generateSQLInserts();

    return createTableSQL + insertStatements.join( '\n\n' ) + '\n\n-- Data import completed';
}

// 生成 wrangler 配置示例
function generateWranglerConfig() {
    return `# Cloudflare D1 Database Configuration
# Add this to your wrangler.toml file

[[d1_databases]]
binding = "DB" # Should match binding used in Worker
database_name = "marketplace-products"
database_id = "your-d1-database-id" # Replace with your actual D1 database ID

# Migration commands:
# npx wrangler d1 create marketplace-products
# npx wrangler d1 execute marketplace-products --file=./d1-import.sql
# npx wrangler d1 execute marketplace-products --command="SELECT COUNT(*) FROM products"
`;
}

// 生成部署指南
function generateDeploymentGuide() {
    return `# Cloudflare D1 部署指南

## 1. 创建 D1 数据库
\`\`\`bash
npx wrangler d1 create marketplace-products
\`\`\`

## 2. 更新 wrangler.toml
将生成的数据库配置添加到 wrangler.toml 文件中。

## 3. 导入数据
\`\`\`bash
npx wrangler d1 execute marketplace-products --file=./d1-import.sql
\`\`\`

## 4. 验证数据
\`\`\`bash
# 检查产品总数
npx wrangler d1 execute marketplace-products --command="SELECT COUNT(*) FROM products"

# 查看前几个产品
npx wrangler d1 execute marketplace-products --command="SELECT id, name, slug, category FROM products LIMIT 3"

# 检查面额数据
npx wrangler d1 execute marketplace-products --command="SELECT name, json_array_length(regional_pricing) as denominations FROM products WHERE json_array_length(regional_pricing) > 0"
\`\`\`

## 5. 部署 Worker
\`\`\`bash
npx wrangler deploy
\`\`\`

## 6. 测试 API
\`\`\`bash
# 健康检查
curl https://your-worker.your-subdomain.workers.dev/health

# 获取所有产品
curl https://your-worker.your-subdomain.workers.dev/products

# 获取特定产品的面额
curl https://your-worker.your-subdomain.workers.dev/products/playstation-store-gift-card/denominations?region=US
\`\`\`

## API 端点

- \`GET /health\` - 健康检查
- \`GET /products\` - 获取所有产品（支持分页和过滤）
- \`GET /products/featured\` - 获取推荐产品
- \`GET /products/{identifier}\` - 获取单个产品
- \`GET /products/{identifier}/denominations\` - 获取产品面额数据
- \`POST /products\` - 创建产品（需要管理员权限）
- \`PUT /products/{id}\` - 更新产品
- \`DELETE /products/{id}\` - 删除产品
- \`PATCH /products/{id}/stock\` - 更新库存

## 面额数据查询参数

- \`region\` - 按地区过滤
- \`currency\` - 按货币过滤
- \`inStockOnly\` - 仅显示有库存的面额
- \`minPrice\` - 最低价格过滤
- \`maxPrice\` - 最高价格过滤

## 注意事项

1. 确保在 Cloudflare Dashboard 中正确配置 D1 数据库
2. Worker 的环境变量中需要绑定 D1 数据库
3. 生产环境中建议启用 Cloudflare 的缓存和安全功能
4. 考虑为管理员操作添加身份验证中间件
`;
}

// 写入文件
console.log( '🚀 正在生成 Cloudflare D1 数据导入文件...' );

const outputDir = './cloudflare-d1-import';
if ( !fs.existsSync( outputDir ) ) {
    fs.mkdirSync( outputDir, { recursive: true } );
}

// 生成 SQL 导入文件
const sqlContent = generateSQLFile();
fs.writeFileSync( path.join( outputDir, 'd1-import.sql' ), sqlContent );
console.log( '✅ SQL 导入文件已生成: d1-import.sql' );

// 生成 wrangler 配置
const wranglerConfig = generateWranglerConfig();
fs.writeFileSync( path.join( outputDir, 'wrangler-config-example.toml' ), wranglerConfig );
console.log( '✅ Wrangler 配置示例已生成: wrangler-config-example.toml' );

// 生成部署指南
const deploymentGuide = generateDeploymentGuide();
fs.writeFileSync( path.join( outputDir, 'DEPLOYMENT_GUIDE.md' ), deploymentGuide );
console.log( '✅ 部署指南已生成: DEPLOYMENT_GUIDE.md' );

// 生成数据统计
console.log( '\n📊 数据统计:' );
console.log( `- 总产品数: ${ mongoProducts.length }` );
console.log( `- 总面额数: ${ mongoProducts.reduce( ( total, product ) => total + ( product.regionalPricing?.length || 0 ), 0 ) }` );
console.log( `- 支持地区: ${ [ ...new Set( mongoProducts.flatMap( p => p.regionalPricing?.map( rp => rp.region ) || [] ) ) ].join( ', ' ) }` );
console.log( `- 支持货币: ${ [ ...new Set( mongoProducts.flatMap( p => p.regionalPricing?.map( rp => rp.currency ) || [] ) ) ].join( ', ' ) }` );

console.log( '\n🎉 Cloudflare D1 导入文件生成完成！' );
console.log( '📁 输出目录: ./cloudflare-d1-import/' );
console.log( '📖 请查看 DEPLOYMENT_GUIDE.md 获取详细的部署步骤' );
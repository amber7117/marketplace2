#!/bin/bash

# Cloudflare D1 快速导入脚本
# 用于将产品数据导入到 Cloudflare D1 数据库

set -e

echo "🚀 开始 Cloudflare D1 数据导入..."

# 检查是否在正确的目录
if [ ! -f "wrangler.toml" ]; then
    echo "❌ 错误: 请在包含 wrangler.toml 的目录中运行此脚本"
    exit 1
fi

# 检查 wrangler CLI 是否安装
if ! command -v npx &> /dev/null; then
    echo "❌ 错误: 需要安装 npm 和 npx"
    exit 1
fi

# 数据库名称
DB_NAME="marketplace-products"

echo "📊 正在导入数据到数据库: $DB_NAME"

# 导入数据
if [ -f "../cloudflare-d1-import/d1-import.sql" ]; then
    echo "📂 找到导入文件，开始执行..."
    npx wrangler d1 execute $DB_NAME --file=../cloudflare-d1-import/d1-import.sql
    
    echo "✅ 数据导入完成"
    
    # 验证数据
    echo "🔍 验证导入的数据..."
    echo "📈 产品总数:"
    npx wrangler d1 execute $DB_NAME --command="SELECT COUNT(*) as total_products FROM products"
    
    echo "📝 前 3 个产品:"
    npx wrangler d1 execute $DB_NAME --command="SELECT id, name, slug, category FROM products LIMIT 3"
    
    echo "🎯 面额数据统计:"
    npx wrangler d1 execute $DB_NAME --command="SELECT name, json_array_length(regional_pricing) as denominations FROM products WHERE json_array_length(regional_pricing) > 0"
    
else
    echo "❌ 错误: 找不到导入文件 ../cloudflare-d1-import/d1-import.sql"
    echo "请先运行 'node scripts/generate-d1-import.js' 生成导入文件"
    exit 1
fi

echo ""
echo "🎉 导入完成！"
echo "💡 下一步:"
echo "   1. 运行 'npx wrangler deploy' 部署 Worker"
echo "   2. 测试 API 端点:"
echo "      curl https://your-worker.your-subdomain.workers.dev/health"
echo "      curl https://your-worker.your-subdomain.workers.dev/products"
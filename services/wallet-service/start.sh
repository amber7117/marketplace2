#!/bin/bash

# 🚀 Wallet Service 快速启动脚本

echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║   💰 Wallet Service - Quick Start                    ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 切换到 wallet-service 目录
cd services/wallet-service || {
  echo -e "${RED}❌ 错误: 找不到 services/wallet-service 目录${NC}"
  exit 1
}

echo -e "${BLUE}📦 步骤 1: 检查依赖...${NC}"
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}⚠️  未找到 node_modules，开始安装依赖...${NC}"
  npm install
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 依赖安装成功${NC}"
  else
    echo -e "${RED}❌ 依赖安装失败${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✅ 依赖已存在${NC}"
fi

echo ""
echo -e "${BLUE}⚙️  步骤 2: 检查环境配置...${NC}"
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}⚠️  未找到 .env 文件，从 .env.example 复制...${NC}"
  cp .env.example .env
  echo -e "${GREEN}✅ .env 文件已创建${NC}"
  echo -e "${YELLOW}⚠️  请编辑 .env 文件配置 MongoDB 连接${NC}"
else
  echo -e "${GREEN}✅ .env 文件已存在${NC}"
fi

echo ""
echo -e "${BLUE}🗄️  步骤 3: 检查 MongoDB 连接...${NC}"
# 检查 MongoDB 是否运行（可选）
if command -v mongosh &> /dev/null || command -v mongo &> /dev/null; then
  echo -e "${GREEN}✅ MongoDB 客户端已安装${NC}"
else
  echo -e "${YELLOW}⚠️  未检测到 MongoDB 客户端，请确保 MongoDB 正在运行${NC}"
fi

echo ""
echo -e "${BLUE}🌱 步骤 4: 导入测试数据（可选）${NC}"
read -p "是否导入测试数据？(y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}🌱 开始导入测试数据...${NC}"
  npm run seed
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 测试数据导入成功${NC}"
    echo -e "${GREEN}   - 创建了 3 个测试钱包${NC}"
    echo -e "${GREEN}   - 创建了 27 条测试交易${NC}"
  else
    echo -e "${RED}❌ 测试数据导入失败${NC}"
  fi
else
  echo -e "${YELLOW}⏭️  跳过测试数据导入${NC}"
fi

echo ""
echo -e "${BLUE}🚀 步骤 5: 启动服务...${NC}"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}║                                                     ║${NC}"
echo -e "${GREEN}║   💰 Wallet Service 正在启动...                    ║${NC}"
echo -e "${GREEN}║                                                     ║${NC}"
echo -e "${GREEN}║   端口: 3004                                        ║${NC}"
echo -e "${GREEN}║   健康检查: http://localhost:3004/health           ║${NC}"
echo -e "${GREEN}║   API 文档: README.md                              ║${NC}"
echo -e "${GREEN}║   测试指南: TESTING.md                             ║${NC}"
echo -e "${GREEN}║                                                     ║${NC}"
echo -e "${GREEN}║   按 Ctrl+C 停止服务                               ║${NC}"
echo -e "${GREEN}║                                                     ║${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""

# 启动服务
npm run dev

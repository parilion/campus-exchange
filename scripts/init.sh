#!/bin/bash
# Campus Exchange - 环境初始化脚本
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "=== Campus Exchange 环境初始化 ==="
echo "项目根目录: $PROJECT_ROOT"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

success() { echo -e "${GREEN}✓ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
fail() { echo -e "${RED}✗ $1${NC}"; exit 1; }

# 1. 检查 Node.js
echo ""
echo "--- 检查前端环境 ---"
if command -v node &> /dev/null; then
    success "Node.js $(node -v)"
else
    fail "Node.js 未安装"
fi

# 2. 安装前端依赖
if [ -d "$PROJECT_ROOT/frontend" ]; then
    cd "$PROJECT_ROOT/frontend"
    if [ ! -d "node_modules" ]; then
        echo "安装前端依赖..."
        npm install
        success "前端依赖安装完成"
    else
        success "前端依赖已存在"
    fi
else
    warn "frontend 目录不存在，跳过"
fi

# 3. 检查 Java
echo ""
echo "--- 检查后端环境 ---"
if command -v java &> /dev/null; then
    success "Java $(java -version 2>&1 | head -1)"
else
    warn "Java 未安装"
fi

# 4. 检查 Maven
if command -v mvn &> /dev/null; then
    success "Maven $(mvn -version 2>&1 | head -1)"
elif [ -f "$PROJECT_ROOT/backend/mvnw" ]; then
    success "Maven Wrapper 可用"
else
    warn "Maven 未安装"
fi

# 5. 检查后端编译
if [ -d "$PROJECT_ROOT/backend" ]; then
    cd "$PROJECT_ROOT/backend"
    if [ -f "mvnw" ]; then
        echo "编译后端项目..."
        ./mvnw compile -q 2>/dev/null && success "后端编译成功" || warn "后端编译失败（可能缺少数据库）"
    elif command -v mvn &> /dev/null; then
        echo "编译后端项目..."
        mvn compile -q 2>/dev/null && success "后端编译成功" || warn "后端编译失败（可能缺少数据库）"
    fi
else
    warn "backend 目录不存在，跳过"
fi

# 6. 检查 MySQL
echo ""
echo "--- 检查数据库 ---"
if command -v mysql &> /dev/null; then
    success "MySQL 客户端可用"
    mysql -u root -e "SELECT 1" &>/dev/null && success "MySQL 连接正常" || warn "MySQL 连接失败，请检查服务是否启动"
else
    warn "MySQL 客户端未安装"
fi

echo ""
echo "=== 初始化检查完成 ==="

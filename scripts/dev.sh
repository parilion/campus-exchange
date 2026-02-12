#!/bin/bash
# Campus Exchange - 开发服务器启动脚本
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "=== 启动开发服务器 ==="

# 启动后端
if [ -d "$PROJECT_ROOT/backend" ]; then
    echo "启动后端服务 (port 8080)..."
    cd "$PROJECT_ROOT/backend"
    if [ -f "mvnw" ]; then
        ./mvnw spring-boot:run &
    else
        mvn spring-boot:run &
    fi
    BACKEND_PID=$!
    echo "后端 PID: $BACKEND_PID"
fi

# 启动前端
if [ -d "$PROJECT_ROOT/frontend" ]; then
    echo "启动前端服务 (port 5173)..."
    cd "$PROJECT_ROOT/frontend"
    npm run dev &
    FRONTEND_PID=$!
    echo "前端 PID: $FRONTEND_PID"
fi

echo ""
echo "=== 服务已启动 ==="
echo "前端: http://localhost:5173"
echo "后端: http://localhost:8080"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待并清理
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait

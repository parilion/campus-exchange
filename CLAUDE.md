# Campus Exchange - Agent 开发指令

## 会话启动检查清单

每次新会话开始时，**必须**按顺序执行：

1. **读取进度文件**: `cat claude-progress.md` - 了解当前开发状态
2. **查看最近提交**: `git log --oneline -10` - 了解最近变更
3. **环境检查**: `bash scripts/init.sh` - 确保开发环境可用
4. **选择任务**: 读取 `features.json`，选择最高优先级 (P0 > P1 > P2) 的未完成项

## 编码规范

### 后端 (Java / Spring Boot)
- Java 8，使用 Spring Boot 2.7.x
- 包路径: `com.campus.exchange`
- 分层架构: Controller → Service → Mapper → Model
- RESTful API 设计，统一响应格式 `Result<T>`
- 使用 MyBatis-Plus 进行数据库操作
- JWT Token 认证，Spring Security 鉴权
- 所有接口需要参数校验 (`@Valid`)
- 异常统一处理 (`@RestControllerAdvice`)

### 前端 (React / TypeScript)
- React 18 + TypeScript strict 模式
- Vite 构建，Ant Design 组件库
- 状态管理: Zustand (轻量级 store)
- 路由: React Router v6
- HTTP 请求: Axios，统一拦截器处理 token 和错误
- 文件组织: pages/ (页面), components/ (通用组件), services/ (API), stores/ (状态), hooks/ (自定义hook), types/ (类型), utils/ (工具)

### 通用规范
- 使用中文注释
- Git 提交信息使用英文，遵循 Conventional Commits
- 每次只实现一个功能，原子性提交
- 提交前确保代码可编译、测试通过

## Git 仓库

- **远程仓库**: https://github.com/parilion/campus-exchange
- **主分支**: `main`
- 每次 commit 后必须 `git push origin main` 推送到远程
- 推送前先 `git pull origin main --rebase` 确保无冲突

## 工作流程

```
1. 从 features.json 选择一个未完成的最高优先级功能
2. 实现该功能（后端 API + 前端页面）
3. 运行测试验证
4. git add + git commit（原子性提交）
5. git push origin main（推送到远程仓库）
6. 更新 features.json 中该功能的 passes 为 true
7. 更新 claude-progress.md 的进度信息
```

## features.json 规则

- 只允许修改 `passes` 字段（从 `false` 改为 `true`）
- 不得删除、添加或修改其他字段
- 一次只标记一个功能为完成

## 数据库

- MySQL 5.7，数据库名: `campus_exchange`
- 端口:3307
- 用户:root
- 密码:123456
- 字符集: utf8mb4
- Schema 文件: `sql/schema.sql`
- 使用 MyBatis-Plus 自动填充 createTime/updateTime

## API 约定

- 基础路径: `/api`
- 认证接口: `/api/auth/**`
- 商品接口: `/api/products/**`
- 用户接口: `/api/users/**`
- 订单接口: `/api/orders/**`
- 消息接口: `/api/messages/**`
- 管理接口: `/api/admin/**`
- 统一响应格式:
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

## 常见问题排查

- **前端启动失败**: 检查 `frontend/node_modules` 是否存在，运行 `npm install`
- **后端启动失败**: 检查 MySQL 是否运行，数据库是否创建
- **端口冲突**: 前端默认 5173，后端默认 8080
- **跨域问题**: 后端已配置 CORS，允许 `localhost:5173`

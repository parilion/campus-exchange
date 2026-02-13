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
2. 记录开始时间（startTime=$(date "+%Y-%m-%d %H:%M:%S")）
3. 实现该功能（后端 API + 前端页面）
4. 运行测试验证（见下方测试验证规范）
5. 记录结束时间（endTime=$(date "+%Y-%m-%d %H:%M:%S")）
6. git add + git commit（原子性提交）
7. git push origin main（推送到远程仓库）
8. 更新 features.json 中该功能的 passes 为 true
9. 更新 claude-progress.md（见下方进度记录规范）
```

## 测试验证规范

每次功能实现完成后，必须按以下步骤进行测试验证，形成闭环。

### 步骤 1: 后端代码验证

```bash
# 进入后端目录
cd backend

# 编译检查（确保无语法错误）
mvn compile -q

# 运行单元测试（可选，如有测试类）
mvn test -Dtest=*Test
```

### 步骤 2: 前端代码验证

```bash
# 进入前端目录
cd frontend

# TypeScript 类型检查
npm run build

# 或只检查类型（更快）
npx tsc --noEmit
```

### 步骤 3: 后端服务启动测试

确保后端服务可以正常启动：

```bash
cd backend
mvn spring-boot:run
# 验证启动成功：访问 http://localhost:8080/api/auth/test
```

### 步骤 4: 前端服务启动测试

```bash
cd frontend
npm run dev
# 验证启动成功：访问 http://localhost:5173
```

### 步骤 5: API 集成测试（使用 MySQL MCP）

使用 `mcp__mysql__mysql_query` 工具验证数据库操作：

```sql
-- 示例：验证用户注册功能
-- 1. 插入测试用户
INSERT INTO user (username, email, password, create_time)
VALUES ('testuser', 'test@example.com', '$2a$10$xxx', NOW());

-- 2. 验证插入成功
SELECT * FROM user WHERE username = 'testuser';

-- 3. 清理测试数据
DELETE FROM user WHERE username = 'testuser';
```

### 步骤 6: E2E 端到端测试（使用 Playwright MCP）

使用 Playwright MCP 工具进行浏览器自动化测试：

```javascript
// 1. 启动后端服务（后台运行）
// 2. 启动前端服务（后台运行）

// 3. 使用 Playwright MCP 进行测试
// 导航到页面
mcp__playwright__browser_navigate({ url: "http://localhost:5173/login" })

// 4. 填写登录表单
mcp__playwright__browser_fill_form({
  fields: [
    { name: "username", type: "textbox", ref: "...", value: "testuser" },
    { name: "password", type: "textbox", ref: "...", value: "password123" }
  ]
})

// 5. 点击登录按钮
mcp__playwright__browser_click({ ref: "登录按钮ref" })

// 6. 验证登录成功
mcp__playwright__browser_wait_for({ text: "首页" })

// 7. 截图保存
mcp__playwright__browser_take_screenshot({ type: "png", filename: "test-result.png" })
```

### 步骤 7: 验证检查清单

完成所有测试后，确认以下事项：

- [ ] 后端 `mvn compile` 编译通过
- [ ] 前端 `npm run build` 构建成功
- [ ] 后端服务可以正常启动
- [ ] 前端页面可以正常访问
- [ ] API 接口返回正确的数据格式
- [ ] 数据库操作正常（插入/查询/更新/删除）
- [ ] 页面交互符合预期（按钮点击、表单提交等）
- [ ] 无控制台报错

### MCP 工具使用说明

#### MySQL MCP (mcp__mysql__mysql_query)
- 用于执行 SQL 查询验证数据
- 连接信息已在系统配置中
- 返回查询结果用于验证

#### Playwright MCP (mcp__playwright__*)
- `browser_navigate` - 导航到指定 URL
- `browser_snapshot` - 获取页面快照（用于定位元素）
- `browser_click` - 点击元素
- `browser_fill_form` - 填写表单
- `browser_type` - 输入文本
- `browser_evaluate` - 执行 JS 代码
- `browser_take_screenshot` - 截图保存
- `browser_network_requests` - 获取网络请求

### 测试失败处理

若测试失败，按以下流程处理：

1. **分析错误信息**：查看控制台/终端的错误输出
2. **定位问题**：根据错误定位到具体文件和行
3. **修复代码**：修改代码解决 bug
4. **重新测试**：重复验证步骤直到通过
5. **记录问题**：如果暂时无法解决，记录到 claude-progress.md 的「技术债务」或「阻塞项」

## 进度记录规范 (claude-progress.md)

每次功能完成后，必须更新 `claude-progress.md`，按以下步骤操作：

### 步骤 1: 更新开发日志
在「开发日志」章节的**顶部**插入新条目，格式如下：
```markdown
### YYYY-MM-DD HH:mm:ss | 完成: 功能名称 (#功能ID)
- **开始时间**: YYYY-MM-DD HH:mm:ss
- **结束时间**: YYYY-MM-DD HH:mm:ss
- **Commit**: `提交信息（英文，Conventional Commits 格式）`
- **涉及文件**:
  - 后端文件路径
  - 前端文件路径
- **备注**: 简短描述实现要点
```

### 步骤 2: 更新已完成功能列表
在对应模块的「已完成功能」列表中，将 `[ ]` 改为 `[x]`，并添加完成日期：
```markdown
- [x] #ID 功能描述 (YYYY-MM-DD)
```

### 步骤 3: 更新进度百分比
- 计算新进度: `已完成数/190 * 100%`
- 更新「当前状态」中的进度显示

### 进度文件结构参考
```
# Campus Exchange - 开发进度

## 当前状态
- 开发中模块: [模块名]
- 当前功能: ID#[ID] - [功能名]
- 进度: X/190 (X.X%)

## 开发日志 (按时间倒序)
[每次完成的功能记录]

## 已完成功能 (按模块)
[按模块分组的已完成功能列表]

## 技术债务
[待处理的技术问题]

## 阻塞项
[当前无法解决的问题]
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

## 测试账号

测试 E2E 时使用以下账号登录：

| 账号 | 密码 | 角色 | 说明 |
|------|------|------|------|
| admin | admin123 | ADMIN | 管理员账号 |
| testuser | test123 | USER | 普通测试用户 |

> **注意**：如果登录失败，可通过注册新用户获取正确的密码哈希，或使用 MySQL MCP 执行：
> ```sql
> DELETE FROM user;
> -- 然后通过 POST /api/auth/register 注册新用户
> ```

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

## 回顾与改进

每次功能完成后，必须执行回顾与改进：

1. **思考本轮问题**：本轮开发中遇到的问题/坑（如登录失败、配置错误等）
2. **识别可复用信息**：哪些信息如果提前记录可以帮助下一轮 AI
3. **更新文档**：
   - 将改进建议更新到 CLAUDE.md 中,注意:保持claude.md的简洁性,辨别是否有必要修改claude.md
   - 将新经验教训写入 REPLAY.md（踩坑记录）
4. **提交改进**：将文档更新作为一次提交

### REPLAY.md 格式

```markdown
# 开发经验记录

## 踩坑记录

### YYYY-MM-DD | 问题描述
- **问题**：具体问题描述
- **原因**：问题根因
- **解决**：解决方案
- **预防**：预防措施
```

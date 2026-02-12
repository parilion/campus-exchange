# Campus Exchange - 开发进度

## 当前状态: 用户认证模块完成

## 已完成
- [x] 项目骨架搭建（前端 React + 后端 Spring Boot）
- [x] Harness 框架文件创建（CLAUDE.md, features.json, scripts/）
- [x] 数据库 Schema 设计
- [x] Git 仓库初始化
- [x] 用户注册 API（#1）- 邮箱注册，用户名/邮箱唯一性校验
- [x] 用户登录 API（#2）- 账号密码登录
- [x] JWT Token 生成与验证（#3）- JwtTokenProvider + JwtAuthenticationFilter
- [x] Token 刷新机制（#4）- /api/auth/refresh 接口
- [x] 退出登录（#5）- /api/auth/logout 接口
- [x] 密码加密存储 BCrypt（#6）
- [x] 登录页面 UI（#7）- Ant Design 表单
- [x] 注册页面 UI（#8）- 含密码确认
- [x] 前端 Token 存储与自动携带（#9）- Zustand + localStorage + Axios 拦截器
- [x] 路由守卫（#10）- AuthRoute 组件
- [x] Spring Security 安全配置（#166）
- [x] CORS 跨域配置（#167）
- [x] 接口参数校验（#173）- @Valid + DTO
- [x] 统一异常处理（#174）- GlobalExceptionHandler
- [x] 统一响应格式封装（#175）- Result<T>
- [x] 数据库连接池配置（#177）- HikariCP
- [x] Axios 请求/响应拦截器（#179）

## 进行中
- [ ] 无

## 下一步工作
- [ ] P0: 商品发布 API（#16）
- [ ] P0: 商品列表分页查询（#18）
- [ ] P0: 商品详情 API（#19）
- [ ] P0: 商品分类体系（#23）
- [ ] P0: 商品相关前端页面

## 已知问题
- 数据库端口已从 3306 改为 3307（与 CLAUDE.md 一致）

## 技术债务
- 无

## Git 仓库
- 远程: https://github.com/parilion/campus-exchange
- 分支: main
- 每次 commit 后需 push 到远程

## 最近变更
- 实现完整用户认证模块（后端 API + 前端页面）
- 集成 JWT Token 认证（生成、验证、刷新）
- 实现登录/注册页面 UI（Ant Design）
- 实现前端路由守卫和 Token 管理

# Campus Exchange - 开发进度

## 当前状态
- 开发中模块: 用户认证
- 当前功能: ID#12 - 修改密码
- 进度: 39/190 (20.5%)

## 开发日志 (按时间倒序)

### 2026-02-18 12:30:00 | 完成: 修改密码 (#12)
- **开始时间**: 2026-02-18 12:20:00
- **结束时间**: 2026-02-18 12:35:00
- **Commit**: `feat: add change password functionality`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/dto/ChangePasswordRequest.java
  - backend/src/main/java/com/campus/exchange/service/AuthService.java
  - backend/src/main/java/com/campus/exchange/controller/AuthController.java
  - frontend/src/services/auth.ts
  - frontend/src/pages/ChangePasswordPage.tsx
  - frontend/src/components/AppHeader.tsx
  - frontend/src/App.tsx
- **备注**: 修改密码功能：验证旧密码 + 新密码不能与旧密码相同 + 修改成功后跳转登录页 + 用户菜单入口

### 2026-02-18 10:00:00 | 完成: 忘记密码 - 邮箱重置 (#11)
- **开始时间**: 2026-02-18 09:30:00
- **结束时间**: 2026-02-18 10:00:00
- **Commit**: `feat: add password reset functionality with email verification`
- **涉及文件**:
  - sql/add_password_reset_code.sql
  - backend/src/main/java/com/campus/exchange/config/SecurityConfig.java
  - backend/src/main/java/com/campus/exchange/controller/AuthController.java
  - backend/src/main/java/com/campus/exchange/service/AuthService.java
  - backend/src/main/java/com/campus/exchange/dto/SendResetCodeRequest.java
  - backend/src/main/java/com/campus/exchange/dto/ResetPasswordRequest.java
  - backend/src/main/java/com/campus/exchange/mapper/PasswordResetCodeMapper.java
  - backend/src/main/java/com/campus/exchange/model/PasswordResetCode.java
  - frontend/src/pages/ForgotPasswordPage.tsx
  - frontend/src/pages/LoginPage.tsx
  - frontend/src/services/auth.ts
  - frontend/src/App.tsx
- **备注**: 密码重置功能完整实现：验证码发送/验证 + 密码重置 + 前端分步UI + Security白名单

### 2026-02-17 18:58:00 | 完成: 商品收藏 API + 页面 UI (#24)
- **开始时间**: 2026-02-17 17:50:00
- **结束时间**: 2026-02-17 18:58:00
- **Commit**: `feat: add product favorite functionality with UI`
- **涉及文件**:
  - sql/add_product_favorite.sql
  - backend/src/main/java/com/campus/exchange/controller/ProductFavoriteController.java
  - backend/src/main/java/com/campus/exchange/mapper/ProductFavoriteMapper.java
  - backend/src/main/java/com/campus/exchange/model/ProductFavorite.java
  - backend/src/main/java/com/campus/exchange/service/ProductFavoriteService.java
  - backend/src/main/java/com/campus/exchange/dto/ProductVO.java
  - backend/src/main/java/com/campus/exchange/service/ProductService.java
  - frontend/src/services/favorite.ts
  - frontend/src/pages/FavoritesPage.tsx
  - frontend/src/components/AppHeader.tsx
  - frontend/src/pages/ProductDetailPage.tsx
  - frontend/src/App.tsx
  - frontend/src/types/index.ts
- **备注**: 收藏表 + 后端CRUD API + 收藏页面UI + 商品详情页收藏按钮 + 全局头部导航(用户菜单)

### 2026-02-17 17:49:00 | 完成: 商品置顶推荐/浏览量统计/标签/草稿箱 (#23)
- **开始时间**: 2026-02-17 17:43:05
- **结束时间**: 2026-02-17 17:49:11
- **Commit**: `feat: add product top/draft/tags functionality`
- **涉及文件**:
  - sql/add_product_top_draft.sql
  - backend/src/main/java/com/campus/exchange/model/Product.java
  - backend/src/main/java/com/campus/exchange/dto/CreateProductRequest.java
  - backend/src/main/java/com/campus/exchange/dto/UpdateProductRequest.java
  - backend/src/main/java/com/campus/exchange/dto/ProductVO.java
  - backend/src/main/java/com/campus/exchange/dto/ProductPageRequest.java
  - backend/src/main/java/com/campus/exchange/service/ProductService.java
  - backend/src/main/java/com/campus/exchange/controller/ProductController.java
  - frontend/src/services/product.ts
  - frontend/src/types/index.ts
  - frontend/src/pages/MyProductsPage.tsx
  - frontend/src/pages/PublishPage.tsx
- **备注**: 添加is_top/top_expire_at/tags/is_draft字段 + 置顶API/草稿箱API + 发布页标签输入/草稿保存 + 我的发布页标签展示/置顶功能/草稿箱Tab

### 2026-02-17 17:15:00 | 完成: WebSocket 实时消息 + 消息通知提醒/快捷回复/聊天记录搜索/屏蔽用户 (#36)
- **开始时间**: 2026-02-17 16:30:00
- **结束时间**: 2026-02-17 17:15:00
- **Commit**: `feat: implement WebSocket real-time messaging and chat UI enhancements`
- **涉及文件**:
  - backend/pom.xml
  - backend/src/main/java/com/campus/exchange/config/MessageWebSocketHandler.java
  - backend/src/main/java/com/campus/exchange/config/WebSocketConfig.java
  - backend/src/main/java/com/campus/exchange/mapper/UserBlockMapper.java
  - backend/src/main/java/com/campus/exchange/model/UserBlock.java
  - backend/src/main/java/com/campus/exchange/controller/MessageController.java
  - backend/src/main/java/com/campus/exchange/service/MessageService.java
  - frontend/src/components/MessageNotification.tsx
  - frontend/src/utils/websocket.ts
  - frontend/src/pages/ChatPage.tsx
  - frontend/src/pages/ChatPage.css
  - frontend/src/services/messages.ts
  - sql/add_user_block_table.sql
- **备注**: WebSocket实时消息推送 + 消息通知组件(未读计数/通知提醒) + 快捷回复面板 + 聊天记录搜索弹窗 + 屏蔽用户功能 + user_block表

### 2026-02-17 15:28:00 | 完成: 聊天详情页面 UI + 未读计数/已读标记/商品卡片消息 (#35)
- **开始时间**: 2026-02-17 15:13:28
- **结束时间**: 2026-02-17 15:28:00
- **Commit**: `feat: add product card message in chat UI`
- **涉及文件**:
  - sql/add_message_product_id.sql
  - backend/src/main/java/com/campus/exchange/model/Message.java
  - backend/src/main/java/com/campus/exchange/service/MessageService.java
  - frontend/src/pages/ProductDetailPage.tsx
  - frontend/src/pages/ChatPage.tsx
  - frontend/src/pages/ChatPage.css
- **备注**: 商品卡片消息功能：数据库添加productId字段 + 后端API支持 + 商品详情页"联系卖家"按钮发送商品卡片 + 聊天页面显示商品卡片样式 + 未读计数/已读标记API已存在

### 2026-02-17 15:05:00 | 完成: 私信发送/接收/列表 API + 会话列表页面 UI (#34)
- **开始时间**: 2026-02-17 14:46:54
- **结束时间**: 2026-02-17 15:05:00
- **Commit**: `feat: add private message API and UI pages`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/controller/MessageController.java
  - backend/src/main/java/com/campus/exchange/service/MessageService.java
  - backend/src/main/java/com/campus/exchange/mapper/MessageMapper.java
  - backend/src/main/java/com/campus/exchange/dto/MessageVO.java
  - backend/src/main/java/com/campus/exchange/dto/ConversationVO.java
  - backend/src/main/java/com/campus/exchange/dto/SendMessageRequest.java
  - frontend/src/pages/MessagesPage.tsx
  - frontend/src/pages/MessagesPage.css
  - frontend/src/pages/ChatPage.tsx
  - frontend/src/pages/ChatPage.css
  - frontend/src/services/messages.ts
  - frontend/src/App.tsx
- **备注**: 私信功能完整实现：发送/接收/列表API + 会话列表页面 + 聊天详情页面 + E2E测试验证

### 2026-02-16 14:00:00 | 完成: 线下交易/议价功能 (#32)
- **开始时间**: 2026-02-16 13:30:00
- **结束时间**: 2026-02-16 14:00:00
- **Commit**: `feat: add bargain functionality with UI` + `feat: add bargain API and database schema`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/controller/BargainController.java
  - backend/src/main/java/com/campus/exchange/service/BargainService.java
  - backend/src/main/java/com/campus/exchange/mapper/BargainMapper.java
  - backend/src/main/java/com/campus/exchange/model/Bargain.java
  - backend/src/main/java/com/campus/exchange/dto/BargainRequest.java
  - backend/src/main/java/com/campus/exchange/dto/BargainVO.java
  - frontend/src/pages/BargainsPage.tsx
  - frontend/src/pages/BargainsPage.css
  - frontend/src/pages/ProductDetailPage.tsx
  - frontend/src/services/bargain.ts
  - frontend/src/App.tsx
  - sql/add_bargain_table.sql
- **备注**: 议价功能完整实现：发起议价/接受/拒绝/取消 + 议价列表页面 + 商品详情页议价按钮

### 2026-02-15 13:00:00 | 完成: 订单列表/详情 API + 买家/卖家订单页面 UI (#31)
- **开始时间**: 2026-02-15 12:50:00
- **结束时间**: 2026-02-15 13:00:00
- **Commit**: `feat: add order list and detail pages with UI`
- **涉及文件**:
  - frontend/src/services/order.ts
  - frontend/src/pages/OrdersPage.tsx
  - frontend/src/pages/OrderDetailPage.tsx
  - frontend/src/pages/OrdersPage.css
  - frontend/src/pages/OrderDetailPage.css
  - frontend/src/App.tsx
- **备注**: 订单列表页面（状态筛选/操作按钮）+ 订单详情页面（时间线）+ 支付/发货/确认收货/取消功能 + E2E测试验证

### 2026-02-15 12:50:00 | 完成: 订单状态流转 + 订单编号生成 + 自动取消 (#30)
- **开始时间**: 2026-02-15 12:40:00
- **结束时间**: 2026-02-15 12:50:00
- **Commit**: `feat: add order auto-cancel scheduled task`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/task/OrderTask.java
  - backend/src/main/java/com/campus/exchange/service/OrderService.java
  - backend/src/main/java/com/campus/exchange/CampusExchangeApplication.java
- **备注**: 定时任务每小时检查并取消24小时未支付订单 + 自动恢复商品状态

### 2026-02-15 12:40:00 | 完成: 下单/购买 + 取消订单 + 确认收货 + 发货 API (#29)
- **开始时间**: 2026-02-15 12:25:00
- **结束时间**: 2026-02-15 12:40:00
- **Commit**: `feat: implement order API with full transaction flow`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/controller/OrderController.java
  - backend/src/main/java/com/campus/exchange/service/OrderService.java
  - backend/src/main/java/com/campus/exchange/mapper/OrderMapper.java
  - backend/src/main/java/com/campus/exchange/dto/CreateOrderRequest.java
  - backend/src/main/java/com/campus/exchange/dto/OrderVO.java
  - backend/src/main/java/com/campus/exchange/dto/OrderPageRequest.java
  - backend/src/main/java/com/campus/exchange/dto/OrderPageResponse.java
- **备注**: 订单API完整实现：创建/取消/支付/发货/确认收货 + 订单列表查询 + 商品状态自动更新 + API测试验证

### 2026-02-15 12:25:00 | 完成: 搜索结果页面 UI + 自动补全/历史记录/热门推荐 (#28)
- **开始时间**: 2026-02-15 12:05:00
- **结束时间**: 2026-02-15 12:25:00
- **Commit**: `feat: implement search UI with autocomplete and history`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/controller/ProductController.java
  - backend/src/main/java/com/campus/exchange/service/ProductService.java
  - frontend/src/components/SearchBox.tsx
  - frontend/src/components/SearchBox.css
  - frontend/src/pages/ProductListPage.tsx
  - frontend/src/services/product.ts
  - backend/src/main/java/com/campus/exchange/config/SecurityConfig.java
- **备注**: 搜索自动补全 + 热门搜索推荐 + 搜索历史记录(localStorage) + 删除/清空历史 + E2E测试验证

### 2026-02-15 12:05:00 | 完成: 高级筛选 + 新旧程度筛选 (#27)
- **开始时间**: 2026-02-15 11:22:13
- **结束时间**: 2026-02-15 11:34:10
- **Commit**: `feat: implement product search API with keyword and price range filter`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/dto/ProductPageRequest.java
  - backend/src/main/java/com/campus/exchange/service/ProductService.java
  - frontend/src/pages/ProductListPage.tsx
  - frontend/src/services/product.ts
  - frontend/src/types/index.ts
- **备注**: 关键词搜索（标题/描述模糊匹配）+ 价格区间筛选 + 前端搜索框和价格输入框

### 2026-02-14 00:15:00 | 完成: 我的发布列表页面 + 商品举报功能 (#25)
- **开始时间**: 2026-02-13 23:50:00
- **结束时间**: 2026-02-14 00:15:00
- **Commit**: `feat: implement my products page and API`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/controller/ProductController.java
  - backend/src/main/java/com/campus/exchange/service/ProductService.java
  - frontend/src/pages/MyProductsPage.tsx
  - frontend/src/pages/MyProductsPage.css
  - frontend/src/services/product.ts
  - frontend/src/App.tsx
- **备注**: 我的发布列表页面（含状态筛选/编辑/删除/上下架功能）+ 后端API

### 2026-02-13 23:45:00 | 完成: 商品列表/详情页面 UI + 图片预览轮播 (#22)
- **开始时间**: 2026-02-13 23:42:00
- **结束时间**: 2026-02-13 23:45:00
- **Commit**: `feat: implement product list and detail page UI with image preview`
- **涉及文件**:
  - frontend/src/pages/ProductListPage.tsx
  - frontend/src/pages/ProductDetailPage.tsx
- **备注**: 商品列表页面（分类筛选/排序/分页/卡片）+ 商品详情页面（图片轮播预览）

### 2026-02-13 23:40:00 | 完成: 发布/编辑商品页面 UI + 新旧程度/多图上传 (#21)
- **开始时间**: 2026-02-13 23:35:00
- **结束时间**: 2026-02-13 23:40:00
- **Commit**: `fix: resolve TypeScript unused import error`
- **涉及文件**:
  - frontend/src/pages/EditProductPage.tsx
- **备注**: 修复EditProductPage.tsx未使用import错误，验证前后端编译通过

### 2026-02-13 23:22:43 | 完成: 删除商品 API (#20)
- **开始时间**: 2026-02-13 23:22:43
- **结束时间**: 2026-02-13 23:30:00
- **Commit**: `feat: implement product delete API and UI`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/controller/ProductController.java
  - backend/src/main/java/com/campus/exchange/service/ProductService.java
  - frontend/src/pages/ProductDetailPage.tsx
  - frontend/src/services/product.ts
- **备注**: 删除商品 API（软删除）+ 前端删除按钮及确认弹窗

### 2026-02-13 11:15:00 | 完成: 商品详情 API (#19)
- **开始时间**: 2026-02-13 11:09:12
- **结束时间**: 2026-02-13 11:15:00
- **Commit**: `feat: implement product detail API and UI`
- **涉及文件**:
  - frontend/src/pages/ProductDetailPage.tsx
  - frontend/src/pages/ProductDetailPage.css
  - frontend/src/App.tsx
  - frontend/src/pages/ProductListPage.tsx
  - frontend/src/types/index.ts
- **备注**: 商品详情页面，包含图片轮播、商品信息、卖家信息、联系卖家按钮

### 2026-02-13 18:50:00 | 完成: 商品列表 API - 分页查询 (#18)
- **开始时间**: 2026-02-13 18:30:00
- **结束时间**: 2026-02-13 18:50:00
- **Commit**: `feat: implement product list API with pagination`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/controller/ProductController.java
  - backend/src/main/java/com/campus/exchange/service/ProductService.java
  - backend/src/main/java/com/campus/exchange/dto/ProductPageRequest.java
  - backend/src/main/java/com/campus/exchange/dto/ProductPageResponse.java
  - backend/src/main/java/com/campus/exchange/config/SecurityConfig.java
  - frontend/src/pages/ProductListPage.tsx
  - frontend/src/pages/ProductListPage.css
  - frontend/src/services/product.ts
  - frontend/src/types/index.ts
  - frontend/src/App.tsx
- **备注**: 商品分页列表 API + 前端页面，支持分类筛选、排序、分页展示

### 2026-02-13 18:23:03 | 完成: 发布商品 API - 图片上传 (#17)
- **Commit**: `feat: implement product image upload API`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/controller/ImageController.java
  - backend/src/main/java/com/campus/exchange/config/WebMvcConfig.java
  - backend/src/main/java/com/campus/exchange/config/SecurityConfig.java
  - backend/src/main/resources/application.yml
  - frontend/src/pages/PublishPage.tsx
  - frontend/src/services/image.ts
- **备注**: 图片上传 API + 前端组件，支持单图/多图上传、格式/大小校验、静态资源映射

### 2026-02-13 | 完成: 发布商品 API - 基本信息 (#16)
- **Commit**: `feat: implement product publishing API and UI`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/controller/ProductController.java
  - backend/src/main/java/com/campus/exchange/dto/CreateProductRequest.java
  - backend/src/main/java/com/campus/exchange/dto/ProductVO.java
  - backend/src/main/java/com/campus/exchange/service/ProductService.java
  - backend/src/main/java/com/campus/exchange/mapper/ProductMapper.java
  - backend/src/main/java/com/campus/exchange/config/SecurityConfig.java
  - frontend/src/pages/PublishPage.tsx
  - frontend/src/services/product.ts
  - frontend/src/App.tsx
- **备注**: 发布商品 API + 前端页面，含分类、新旧程度、交易方式等字段

### 2026-02-13 | 完成: Axios 请求/响应拦截器 (#179)
- **Commit**: `feat: add axios interceptors for token and error handling`
- **涉及文件**:
  - frontend/src/utils/request.ts
- **备注**: Token 自动携带、401 自动跳转登录、错误统一提示

### 2026-02-13 | 完成: 数据库连接池配置 (#177)
- **Commit**: `feat: configure hikariCP database connection pool`
- **涉及文件**:
  - backend/src/main/resources/application.yml
- **备注**: HikariCP 连接池配置，优化数据库连接性能

### 2026-02-13 | 完成: 统一响应格式封装 (#175)
- **Commit**: `feat: add unified response wrapper Result<T>`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/common/Result.java
- **备注**: 统一 API 响应格式 {code, message, data}

### 2026-02-13 | 完成: 统一异常处理 (#174)
- **Commit**: `feat: add global exception handler`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/config/GlobalExceptionHandler.java
- **备注**: @RestControllerAdvice 统一处理所有异常

### 2026-02-13 | 完成: 接口参数校验 (#173)
- **Commit**: `feat: add parameter validation with @Valid`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/dto/*.java
- **备注**: 使用 Hibernate Validator 进行参数校验

### 2026-02-13 | 完成: CORS 跨域配置 (#167)
- **Commit**: `feat: configure CORS for frontend-backend communication`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/config/CorsConfig.java
- **备注**: 允许 localhost:5173 跨域访问

### 2026-02-13 | 完成: Spring Security 安全配置 (#166)
- **Commit**: `feat: configure spring security with JWT`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/config/SecurityConfig.java
  - backend/src/main/java/com/campus/exchange/config/JwtAuthenticationFilter.java
- **备注**: JWT Token 认证、URL 权限配置

### 2026-02-13 | 完成: 路由守卫 - 未登录跳转 (#10)
- **Commit**: `feat: add auth route guard component`
- **涉及文件**:
  - frontend/src/components/AuthRoute.tsx
  - frontend/src/App.tsx
- **备注**: 未登录用户自动跳转到登录页

### 2026-02-13 | 完成: 前端 Token 存储与自动携带 (#9)
- **Commit**: `feat: add token storage and axios interceptor`
- **涉及文件**:
  - frontend/src/stores/authStore.ts
  - frontend/src/utils/request.ts
- **备注**: Zustand 状态管理 + localStorage 持久化 + Axios 请求拦截

### 2026-02-13 | 完成: 注册页面 UI (#8)
- **Commit**: `feat: add user registration page UI`
- **涉及文件**:
  - frontend/src/pages/Register.tsx
- **备注**: Ant Design 表单，含密码确认、邮箱输入

### 2026-02-13 | 完成: 登录页面 UI (#7)
- **Commit**: `feat: add user login page UI`
- **涉及文件**:
  - frontend/src/pages/Login.tsx
- **备注**: Ant Design 表单，美观简洁

### 2026-02-13 | 完成: 密码加密存储 BCrypt (#6)
- **Commit**: `feat: add BCrypt password encoding`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/service/AuthService.java
- **备注**: 使用 BCryptPasswordEncoder 进行密码加密

### 2026-02-13 | 完成: 退出登录 (#5)
- **Commit**: `feat: add logout API endpoint`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/controller/AuthController.java
  - backend/src/main/java/com/campus/exchange/service/AuthService.java
- **备注**: /api/auth/logout 接口，Token 失效处理

### 2026-02-13 | 完成: Token 刷新机制 (#4)
- **Commit**: `feat: add token refresh mechanism`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/controller/AuthController.java
  - backend/src/main/java/com/campus/exchange/service/AuthService.java
- **备注**: /api/auth/refresh 接口，支持 Token 续期

### 2026-02-13 | 完成: JWT Token 生成与验证 (#3)
- **Commit**: `feat: add JWT token generation and validation`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/security/JwtTokenProvider.java
  - backend/src/main/java/com/campus/exchange/config/JwtAuthenticationFilter.java
- **备注**: JJWT 库实现 Token 生成、解析、验证

### 2026-02-13 | 完成: 用户登录 API (#2)
- **Commit**: `feat: add user login API`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/controller/AuthController.java
  - backend/src/main/java/com/campus/exchange/service/AuthService.java
  - backend/src/main/java/com/campus/exchange/mapper/UserMapper.java
- **备注**: 账号密码登录，BCrypt 密码校验，JWT Token 返回

### 2026-02-13 | 完成: 用户注册 API (#1)
- **Commit**: `feat: add user registration API`
- **涉及文件**:
  - backend/src/main/java/com/campus/exchange/controller/AuthController.java
  - backend/src/main/java/com/campus/exchange/service/AuthService.java
  - backend/src/main/java/com/campus/exchange/mapper/UserMapper.java
- **备注**: 邮箱注册，用户名/邮箱唯一性校验

## 已完成功能 (按模块)

### 用户认证 (P0) ✓
- [x] #1 用户注册 - 邮箱注册 (2026-02-13)
- [x] #2 用户登录 - 账号密码登录 (2026-02-13)
- [x] #3 JWT Token 生成与验证 (2026-02-13)
- [x] #4 Token 刷新机制 (2026-02-13)
- [x] #5 退出登录 (2026-02-13)
- [x] #6 密码加密存储 BCrypt (2026-02-13)
- [x] #7 登录页面 UI (2026-02-13)
- [x] #8 注册页面 UI (2026-02-13)
- [x] #9 前端 Token 存储与自动携带 (2026-02-13)
- [x] #10 路由守卫 - 未登录跳转 (2026-02-13)

### 用户认证 (P1)
- [x] #11 忘记密码 - 邮箱重置 (2026-02-18)
- [x] #12 修改密码 (2026-02-18)

### 安全与性能 (P0) ✓
- [x] #166 Spring Security 安全配置 (2026-02-13)
- [x] #167 CORS 跨域配置 (2026-02-13)
- [x] #173 接口参数校验 (2026-02-13)
- [x] #174 统一异常处理 (2026-02-13)
- [x] #175 统一响应格式封装 (2026-02-13)
- [x] #177 数据库连接池配置 (2026-02-13)
- [x] #179 Axios 请求/响应拦截器 (2026-02-13)

### 商品管理 (P0)
- [x] #16 发布商品 API - 基本信息 (2026-02-13)
- [x] #17 发布商品 API - 图片上传 (2026-02-13)
- [x] #18 商品列表 API - 分页查询 (2026-02-13)
- [x] #19 商品详情 API (2026-02-13)
- [x] #20 编辑商品/删除商品/状态管理/分类体系 API (2026-02-13)
- [x] #21 发布商品/编辑商品页面 UI + 新旧程度/多图上传 (2026-02-13)
- [x] #22 商品列表/详情页面 UI + 图片预览轮播 (2026-02-13)
- [x] #25 我的发布列表页面 + 商品举报功能 (2026-02-14)
- [x] #23 商品置顶推荐/浏览量统计/标签/草稿箱 (2026-02-17)
- [x] #24 商品收藏 API + 页面 UI (2026-02-17)

### 搜索与筛选 (P1)
- [x] #26 关键词搜索/分类/价格区间/状态/排序 API (2026-02-15)
- [x] #27 高级筛选 + 新旧程度筛选 + 结果高亮/统计 (2026-02-15)
- [x] #28 搜索结果页面 UI + 自动补全/历史记录/热门推荐 (2026-02-15)

### 交易流程 (P0)
- [x] #29 下单/购买 + 取消订单 + 确认收货 + 发货 API (2026-02-15)
- [x] #30 订单状态流转 + 订单编号生成 + 自动取消 (2026-02-15)
- [x] #31 订单列表/详情 API + 买家/卖家订单页面 UI (2026-02-15)
- [x] #32 线下交易/交易方式/议价/交易安全提示 (2026-02-16)

### 消息系统 (P1)
- [x] #34 私信发送/接收/列表 API + 会话列表页面 UI (2026-02-17)
- [x] #35 聊天详情页面 UI + 未读计数/已读标记/商品卡片消息 (2026-02-17)
- [x] #36 WebSocket 实时消息 + 消息通知提醒/快捷回复/聊天记录搜索/屏蔽用户 (2026-02-17)

## 技术债务
- 无

## 阻塞项
- 无

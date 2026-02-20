# 邮件通知功能设计

## 概述
实现邮件通知功能，包括密码重置邮件、系统公告邮件推送和用户偏好设置。

## 1. 依赖配置

### pom.xml
添加 Spring Boot Mail 依赖：
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

### application.yml
配置 SMTP：
```yaml
spring:
  mail:
    host: smtp.xxx.com
    port: 587
    username: xxx@xxx.com
    password: xxx
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

## 2. 后端实现

### 2.1 EmailService
- `sendEmail(to, subject, content)` - 通用发送方法
- `sendPasswordResetEmail(to, code)` - 发送密码重置邮件
- `sendAnnouncementEmail(to, title, content)` - 发送系统公告邮件

### 2.2 用户偏好设置
- User 模型添加 `emailNotificationEnabled` 字段
- UserController 添加 `PUT /api/users/email-notification` 开关 API
- 修改 AuthService 密码重置时检查用户偏好设置

### 2.3 管理员公告推送
- AdminController 公告发布接口添加可选参数 `notifyByEmail`
- 选择发邮件时调用 EmailService 批量发送

## 3. 前端实现

### 3.1 用户设置页面
- 在 AccountSecurityPage 或 ProfilePage 添加邮件通知开关

### 3.2 API
- `PUT /api/users/email-notification` - 更新邮件通知偏好

## 4. 测试验证
- 后端编译通过
- 前端构建成功
- 手动测试邮件发送

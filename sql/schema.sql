-- Campus Exchange 数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS campus_exchange
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE campus_exchange;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(100) NOT NULL COMMENT '密码(BCrypt加密)',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `nickname` VARCHAR(50) NOT NULL COMMENT '昵称',
    `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `student_id` VARCHAR(30) DEFAULT NULL COMMENT '学号',
    `verified` TINYINT(1) DEFAULT 0 COMMENT '是否已认证',
    `role` VARCHAR(20) DEFAULT 'USER' COMMENT '角色: USER, ADMIN',
    `enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 分类表
CREATE TABLE IF NOT EXISTS `category` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
    `icon` VARCHAR(100) DEFAULT NULL COMMENT '图标',
    `parent_id` BIGINT DEFAULT NULL COMMENT '父分类ID',
    `sort` INT DEFAULT 0 COMMENT '排序',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

-- 商品表
CREATE TABLE IF NOT EXISTS `product` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL COMMENT '商品标题',
    `description` TEXT COMMENT '商品描述',
    `price` DECIMAL(10, 2) NOT NULL COMMENT '售价',
    `original_price` DECIMAL(10, 2) DEFAULT NULL COMMENT '原价',
    `category_id` BIGINT DEFAULT NULL COMMENT '分类ID',
    `condition` VARCHAR(20) NOT NULL COMMENT '新旧程度: NEW, LIKE_NEW, GOOD, FAIR, POOR',
    `status` VARCHAR(20) DEFAULT 'ON_SALE' COMMENT '状态: ON_SALE, SOLD, OFF_SHELF',
    `images` TEXT COMMENT '图片JSON数组',
    `seller_id` BIGINT NOT NULL COMMENT '卖家ID',
    `view_count` INT DEFAULT 0 COMMENT '浏览量',
    `favorite_count` INT DEFAULT 0 COMMENT '收藏数',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_seller_id` (`seller_id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_status` (`status`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- 订单表
CREATE TABLE IF NOT EXISTS `order` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_no` VARCHAR(32) NOT NULL COMMENT '订单编号',
    `product_id` BIGINT NOT NULL COMMENT '商品ID',
    `price` DECIMAL(10, 2) NOT NULL COMMENT '成交价',
    `buyer_id` BIGINT NOT NULL COMMENT '买家ID',
    `seller_id` BIGINT NOT NULL COMMENT '卖家ID',
    `status` VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态: PENDING, PAID, SHIPPED, COMPLETED, CANCELLED',
    `trade_type` VARCHAR(20) DEFAULT 'OFFLINE' COMMENT '交易方式: ONLINE, OFFLINE',
    `trade_location` VARCHAR(200) DEFAULT NULL COMMENT '交易地点',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_no` (`order_no`),
    KEY `idx_buyer_id` (`buyer_id`),
    KEY `idx_seller_id` (`seller_id`),
    KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 收藏表
CREATE TABLE IF NOT EXISTS `favorite` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `product_id` BIGINT NOT NULL COMMENT '商品ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_product` (`user_id`, `product_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- 消息表
CREATE TABLE IF NOT EXISTS `message` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `sender_id` BIGINT NOT NULL COMMENT '发送者ID',
    `receiver_id` BIGINT NOT NULL COMMENT '接收者ID',
    `content` TEXT NOT NULL COMMENT '消息内容',
    `type` VARCHAR(20) DEFAULT 'TEXT' COMMENT '消息类型: TEXT, IMAGE, PRODUCT_CARD',
    `read` TINYINT(1) DEFAULT 0 COMMENT '是否已读',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_sender_id` (`sender_id`),
    KEY `idx_receiver_id` (`receiver_id`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息表';

-- 评价表
CREATE TABLE IF NOT EXISTS `review` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL COMMENT '订单ID',
    `reviewer_id` BIGINT NOT NULL COMMENT '评价者ID',
    `target_user_id` BIGINT NOT NULL COMMENT '被评价者ID',
    `rating` INT NOT NULL COMMENT '评分(1-5)',
    `content` TEXT COMMENT '评价内容',
    `images` TEXT COMMENT '评价图片JSON数组',
    `anonymous` TINYINT(1) DEFAULT 0 COMMENT '是否匿名',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_target_user_id` (`target_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价表';

-- 通知表
CREATE TABLE IF NOT EXISTS `notification` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL COMMENT '接收用户ID',
    `title` VARCHAR(100) NOT NULL COMMENT '通知标题',
    `content` TEXT COMMENT '通知内容',
    `type` VARCHAR(30) DEFAULT 'SYSTEM' COMMENT '通知类型: SYSTEM, ORDER, MESSAGE, PRODUCT',
    `read` TINYINT(1) DEFAULT 0 COMMENT '是否已读',
    `related_id` BIGINT DEFAULT NULL COMMENT '关联ID（订单/商品等）',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_read` (`read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- 初始分类数据
INSERT INTO `category` (`name`, `icon`, `sort`) VALUES
('教材书籍', 'book', 1),
('电子产品', 'laptop', 2),
('生活用品', 'home', 3),
('服饰鞋帽', 'skin', 4),
('运动户外', 'trophy', 5),
('美妆护肤', 'smile', 6),
('食品饮料', 'coffee', 7),
('其他', 'appstore', 8);

-- 管理员账号（密码: admin123, BCrypt加密）
INSERT INTO `user` (`username`, `password`, `email`, `nickname`, `role`, `verified`) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKTlSByA4pN9XALqQQA4FeGIvYSm', 'admin@campus.edu', '管理员', 'ADMIN', 1);

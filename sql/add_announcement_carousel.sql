-- 公告表和轮播图表
-- 执行方式: source sql/add_announcement_carousel.sql

-- 公告表
CREATE TABLE IF NOT EXISTS `announcement` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL COMMENT '公告标题',
    `content` TEXT NOT NULL COMMENT '公告内容',
    `type` VARCHAR(20) DEFAULT 'NOTICE' COMMENT '公告类型: NOTICE-通知, ACTIVITY-活动, SYSTEM-系统',
    `priority` INT DEFAULT 0 COMMENT '优先级，数字越大越靠前',
    `status` VARCHAR(20) DEFAULT 'DRAFT' COMMENT '状态: DRAFT-草稿, PUBLISHED-已发布, ARCHIVED-已归档',
    `start_time` DATETIME DEFAULT NULL COMMENT '生效开始时间',
    `end_time` DATETIME DEFAULT NULL COMMENT '生效结束时间',
    `created_by` BIGINT DEFAULT NULL COMMENT '创建人ID',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`),
    KEY `idx_priority` (`priority`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统公告表';

-- 轮播图表
CREATE TABLE IF NOT EXISTS `carousel` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL COMMENT '轮播图标题',
    `image_url` VARCHAR(255) NOT NULL COMMENT '图片URL',
    `link_url` VARCHAR(255) DEFAULT NULL COMMENT '跳转链接',
    `link_type` VARCHAR(20) DEFAULT NULL COMMENT '跳转类型: PRODUCT-商品, CATEGORY-分类, URL-外部链接, NONE-不跳转',
    `target_id` BIGINT DEFAULT NULL COMMENT '关联目标ID（商品ID或分类ID）',
    `position` VARCHAR(20) DEFAULT 'HOME' COMMENT '展示位置: HOME-首页, PRODUCT_LIST-商品列表, ALL-全局',
    `sort` INT DEFAULT 0 COMMENT '排序，数字越大越靠前',
    `status` VARCHAR(20) DEFAULT 'DRAFT' COMMENT '状态: DRAFT-草稿, PUBLISHED-已发布, DISABLED-已禁用',
    `start_time` DATETIME DEFAULT NULL COMMENT '生效开始时间',
    `end_time` DATETIME DEFAULT NULL COMMENT '生效结束时间',
    `click_count` INT DEFAULT 0 COMMENT '点击次数',
    `created_by` BIGINT DEFAULT NULL COMMENT '创建人ID',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`),
    KEY `idx_sort` (`sort`),
    KEY `idx_position` (`position`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='轮播图表';

-- 初始化默认分类数据
INSERT INTO `category` (`name`, `icon`, `parent_id`, `sort`) VALUES
('电子产品', 'laptop', NULL, 1),
('图书教材', 'book', NULL, 2),
('生活用品', 'coffee', NULL, 3),
('服装鞋包', 'skin', NULL, 4),
('运动健身', 'run', NULL, 5),
('其他', 'appstore', NULL, 6)
ON DUPLICATE KEY UPDATE `sort` = VALUES(`sort`);

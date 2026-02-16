-- 议价表
CREATE TABLE IF NOT EXISTS `bargain` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT NOT NULL COMMENT '商品ID',
    `order_id` BIGINT DEFAULT NULL COMMENT '订单ID',
    `bargainer_id` BIGINT NOT NULL COMMENT '议价者ID',
    `target_user_id` BIGINT NOT NULL COMMENT '目标用户ID（卖家或买家）',
    `original_price` DECIMAL(10, 2) NOT NULL COMMENT '原价格',
    `proposed_price` DECIMAL(10, 2) NOT NULL COMMENT '提议价格',
    `status` VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态: PENDING, ACCEPTED, REJECTED, CANCELLED',
    `message` VARCHAR(500) DEFAULT NULL COMMENT '议价留言',
    `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_product_id` (`product_id`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_bargainer_id` (`bargainer_id`),
    KEY `idx_target_user_id` (`target_user_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='议价表';

-- 为 order 表添加交易时间字段（线下交易时使用）
ALTER TABLE `order` ADD COLUMN `trade_time` DATETIME DEFAULT NULL COMMENT '交易时间' AFTER `trade_location`;

-- 为 product 表添加是否支持议价字段
ALTER TABLE `product` ADD COLUMN `bargain_enabled` TINYINT(1) DEFAULT 1 COMMENT '是否支持议价' AFTER `trade_location`;

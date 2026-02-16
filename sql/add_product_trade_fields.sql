-- 为商品表添加交易方式字段
-- 执行时间: 2026-02-13
-- 说明: 添加 trade_type 和 trade_location 字段用于支持商品编辑功能

ALTER TABLE `product` ADD COLUMN `trade_type` VARCHAR(20) DEFAULT 'OFFLINE' COMMENT '交易方式: ONLINE, OFFLINE' AFTER `status`;

ALTER TABLE `product` ADD COLUMN `trade_location` VARCHAR(200) DEFAULT NULL COMMENT '交易地点' AFTER `trade_type`;

-- 验证字段添加成功
SHOW COLUMNS FROM `product` LIKE 'trade_type';
SHOW COLUMNS FROM `product` LIKE 'trade_location';

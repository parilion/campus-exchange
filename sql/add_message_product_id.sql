-- 为消息表添加商品ID字段，支持商品卡片消息
ALTER TABLE message ADD COLUMN product_id BIGINT NULL COMMENT '商品ID，商品卡片消息时使用' AFTER type;
ALTER TABLE message ADD INDEX idx_product_id (product_id);

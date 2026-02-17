-- 商品表扩展：置顶/标签/草稿箱
ALTER TABLE `product`
ADD COLUMN `is_top` TINYINT(1) DEFAULT 0 COMMENT '是否置顶',
ADD COLUMN `top_expire_at` DATETIME DEFAULT NULL COMMENT '置顶过期时间',
ADD COLUMN `tags` TEXT COMMENT '标签JSON数组',
ADD COLUMN `is_draft` TINYINT(1) DEFAULT 0 COMMENT '是否草稿';

-- 更新商品状态说明
-- status: ON_SALE, SOLD, OFF_SHELF, DELETED
-- is_draft: 0-已发布, 1-草稿

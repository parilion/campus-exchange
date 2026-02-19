-- =============================================
-- 评价功能扩展：回复、标签、举报
-- 执行前请确保数据库已创建
-- =============================================

-- 检查并添加 reply 字段
-- 注意：MySQL 不支持 ALTER TABLE ADD COLUMN IF NOT EXISTS
-- 请先检查字段是否存在，如不存在再执行以下语句：
-- ALTER TABLE review ADD COLUMN reply TEXT COMMENT '卖家回复';
-- ALTER TABLE review ADD COLUMN reply_at DATETIME COMMENT '回复时间';
-- ALTER TABLE review ADD COLUMN tags VARCHAR(500) COMMENT '评价标签，JSON格式';

-- 安全的字段添加脚本（兼容MySQL）
-- 如果字段已存在会报错，请忽略错误或删除字段后重新执行

-- 方式1：逐个添加字段（如遇报错请确认字段是否已存在）
ALTER TABLE review ADD COLUMN reply TEXT COMMENT '卖家回复';
ALTER TABLE review ADD COLUMN reply_at DATETIME COMMENT '回复时间';
ALTER TABLE review ADD COLUMN tags VARCHAR(500) COMMENT '评价标签，JSON格式';

-- 创建评价举报表
CREATE TABLE IF NOT EXISTS review_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT NOT NULL COMMENT '被举报的评价ID',
    reporter_id BIGINT NOT NULL COMMENT '举报人ID',
    reason VARCHAR(500) NOT NULL COMMENT '举报原因',
    status INT DEFAULT 0 COMMENT '处理状态：0-待处理，1-已处理，2-已忽略',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    handle_time DATETIME COMMENT '处理时间',
    handle_result VARCHAR(500) COMMENT '处理结果',
    INDEX idx_review_id (review_id),
    INDEX idx_reporter_id (reporter_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评价举报表';

-- 商品审核和举报功能数据库迁移
-- 功能：#46 商品审核列表/操作 + 强制下架 + 举报处理

-- 1. product表添加审核状态字段
ALTER TABLE campus_exchange.product
  ADD COLUMN audit_status VARCHAR(20) DEFAULT 'APPROVED' COMMENT '审核状态：PENDING/APPROVED/REJECTED',
  ADD COLUMN reject_reason VARCHAR(500) DEFAULT NULL COMMENT '拒绝原因',
  ADD COLUMN force_offline_reason VARCHAR(500) DEFAULT NULL COMMENT '强制下架原因';

-- 2. 创建商品举报表
CREATE TABLE IF NOT EXISTS campus_exchange.product_report (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL COMMENT '被举报商品ID',
  reporter_id BIGINT NOT NULL COMMENT '举报者ID',
  reason VARCHAR(50) NOT NULL COMMENT '举报原因：FAKE/PROHIBITED/PRICE_FRAUD/SPAM/OTHER',
  description VARCHAR(500) DEFAULT NULL COMMENT '举报描述',
  status VARCHAR(20) DEFAULT 'PENDING' COMMENT '处理状态：PENDING/RESOLVED/IGNORED',
  handle_result VARCHAR(500) DEFAULT NULL COMMENT '处理结果',
  handled_at DATETIME DEFAULT NULL COMMENT '处理时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product_id (product_id),
  INDEX idx_reporter_id (reporter_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品举报表';

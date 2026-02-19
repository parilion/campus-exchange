-- 系统消息表
CREATE TABLE IF NOT EXISTS `system_message` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL COMMENT '接收用户ID',
  `title` VARCHAR(100) NOT NULL COMMENT '消息标题',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `type` VARCHAR(50) NOT NULL COMMENT '消息类型: ORDER_NOTIFY-订单通知, SYSTEM_NOTIFY-系统通知, ACTIVITY_NOTIFY-活动通知',
  `related_id` BIGINT COMMENT '关联ID，如订单ID',
  `read` TINYINT(1) DEFAULT 0 COMMENT '是否已读',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `read_time` DATETIME NULL COMMENT '阅读时间',
  INDEX idx_user_id (`user_id`),
  INDEX idx_create_time (`create_time`),
  INDEX idx_read (`read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统消息表';

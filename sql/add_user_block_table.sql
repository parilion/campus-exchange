-- 用户屏蔽表
CREATE TABLE IF NOT EXISTS user_block (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '屏蔽者用户ID',
    blocked_user_id BIGINT NOT NULL COMMENT '被屏蔽用户ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '屏蔽时间',
    UNIQUE KEY uk_user_block (user_id, blocked_user_id),
    KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户屏蔽表';

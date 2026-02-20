-- 管理员功能：数据统计面板 + 系统配置/敏感词/操作日志管理

-- 1. 系统配置表
CREATE TABLE IF NOT EXISTS system_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) NOT NULL UNIQUE COMMENT 'config key',
    config_value TEXT COMMENT 'config value',
    config_type VARCHAR(50) DEFAULT 'STRING' COMMENT 'STRING/NUMBER/BOOLEAN/JSON',
    config_name VARCHAR(100) NOT NULL COMMENT 'config name',
    description VARCHAR(500) COMMENT 'description',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='system config table';

-- 2. 敏感词表
CREATE TABLE IF NOT EXISTS sensitive_word (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    word VARCHAR(100) NOT NULL UNIQUE COMMENT 'sensitive word',
    category VARCHAR(50) DEFAULT 'GENERAL' COMMENT 'GENERAL/AD/POLITICS/PORN/CUSTOM',
    level INT DEFAULT 1 COMMENT '1-low, 2-mid, 3-high',
    replace_word VARCHAR(50) DEFAULT '***' COMMENT 'replacement word',
    is_enabled TINYINT DEFAULT 1 COMMENT 'enabled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_word (word),
    INDEX idx_category (category),
    INDEX idx_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='sensitive word table';

-- 3. 操作日志表
CREATE TABLE IF NOT EXISTS operation_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT COMMENT 'user id',
    username VARCHAR(100) COMMENT 'username',
    operation VARCHAR(100) NOT NULL COMMENT 'operation type',
    module VARCHAR(50) COMMENT 'module',
    method VARCHAR(200) COMMENT 'request method',
    request_url VARCHAR(500) COMMENT 'request URL',
    request_method VARCHAR(10) COMMENT 'request method',
    request_params TEXT COMMENT 'request params',
    request_ip VARCHAR(50) COMMENT 'request IP',
    response_status INT COMMENT 'response status',
    response_time BIGINT COMMENT 'response time(ms)',
    error_message TEXT COMMENT 'error message',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_operation (operation),
    INDEX idx_module (module),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='operation log table';

-- 初始化默认系统配置
INSERT INTO system_config (config_key, config_value, config_type, config_name, description) VALUES
('site_name', 'Campus Exchange', 'STRING', 'site name', 'site display name'),
('site_description', 'Campus second-hand trading platform', 'STRING', 'site description', 'site meta description'),
('site_logo', '/logo.png', 'STRING', 'site logo', 'site logo path'),
('maintenance_mode', 'false', 'BOOLEAN', 'maintenance mode', 'enable maintenance mode'),
('user_max_products', '10', 'NUMBER', 'max products per user', 'max products a user can publish'),
('product_image_limit', '5', 'NUMBER', 'product image limit', 'max images per product'),
('review_max_length', '500', 'NUMBER', 'review max length', 'max characters for review'),
('bargain_enabled', 'true', 'BOOLEAN', 'bargain enabled', 'enable bargain feature');

-- 初始化默认敏感词
INSERT INTO sensitive_word (word, category, level, replace_word) VALUES
('cheat', 'ACADEMIC', 3, '***'),
('proxyexam', 'ACADEMIC', 3, '***'),
('paperwrite', 'ACADEMIC', 3, '***'),
('weapon', 'WEAPON', 3, '***'),
('drugs', 'WEAPON', 3, '***'),
('fakeid', 'WEAPON', 3, '***');

-- Add email notification preference field to user table
ALTER TABLE user ADD COLUMN email_notification_enabled TINYINT(1) DEFAULT 1 COMMENT '是否启用邮件通知';

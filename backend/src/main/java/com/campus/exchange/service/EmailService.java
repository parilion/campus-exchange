package com.campus.exchange.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:campus-exchange@example.com}")
    private String fromEmail;

    /**
     * 发送简单邮件
     */
    public void sendEmail(String to, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
            log.info("邮件发送成功: {}", to);
        } catch (Exception e) {
            log.error("邮件发送失败: {}, error: {}", to, e.getMessage());
        }
    }

    /**
     * 发送密码重置邮件
     */
    public void sendPasswordResetEmail(String to, String code) {
        String subject = "校园二手交易平台 - 密码重置";
        String content = "您好，您正在进行密码重置操作。\n\n" +
                "您的验证码为: " + code + "\n\n" +
                "验证码有效期为 10 分钟，请尽快完成操作。\n\n" +
                "如果不是您本人操作，请忽略此邮件。";
        sendEmail(to, subject, content);
    }

    /**
     * 发送系统公告邮件
     */
    public void sendAnnouncementEmail(String to, String title, String content) {
        String subject = "校园二手交易平台 - 系统公告: " + title;
        String emailContent = "您好，您收到一条系统公告。\n\n" +
                "【公告标题】" + title + "\n\n" +
                "【公告内容】\n" + content + "\n\n" +
                "感谢您使用校园二手交易平台！";
        sendEmail(to, subject, emailContent);
    }
}

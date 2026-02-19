package com.campus.exchange.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户公开主页信息
 */
@Data
public class UserPublicProfileVO {

    /**
     * 用户ID
     */
    private Long id;

    /**
     * 用户名
     */
    private String username;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 头像
     */
    private String avatar;

    /**
     * 是否实名认证
     */
    private Boolean verified;

    /**
     * 学号（脱敏显示）
     */
    private String studentId;

    /**
     * 注册时间
     */
    private LocalDateTime createdAt;

    /**
     * 发布商品数
     */
    private Integer productCount;

    /**
     * 已售商品数
     */
    private Integer soldCount;

    /**
     * 好评率 (0-100)
     */
    private Integer positiveRate;

    /**
     * 信用等级 (1-5)
     */
    private Integer creditLevel;
}

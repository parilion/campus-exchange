package com.campus.exchange.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 商品响应 DTO
 */
@Data
public class ProductVO {

    private Long id;

    private String title;

    private String description;

    private BigDecimal price;

    private BigDecimal originalPrice;

    private Long categoryId;

    private String categoryName;

    /**
     * NEW, LIKE_NEW, GOOD, FAIR, POOR
     */
    private String condition;

    /**
     * ON_SALE, SOLD, OFF_SHELF
     */
    private String status;

    /**
     * 交易方式：ONLINE, OFFLINE
     */
    private String tradeType;

    /**
     * 交易地点（线下交易时使用）
     */
    private String tradeLocation;

    /**
     * 图片URL列表
     */
    private List<String> images;

    private Long sellerId;

    private String sellerNickname;

    private String sellerAvatar;

    private Integer viewCount;

    private Integer favoriteCount;

    /** 是否置顶 */
    private Boolean isTop;

    /** 置顶过期时间 */
    private LocalDateTime topExpireAt;

    /** 标签列表 */
    private List<String> tags;

    /** 是否草稿：0-已发布，1-草稿 */
    private Boolean isDraft;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

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
     * 图片URL列表
     */
    private List<String> images;

    private Long sellerId;

    private String sellerNickname;

    private String sellerAvatar;

    private Integer viewCount;

    private Integer favoriteCount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

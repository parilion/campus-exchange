package com.campus.exchange.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单 VO
 */
@Data
public class OrderVO {

    private Long id;

    private String orderNo;

    private Long productId;

    private String productTitle;

    private String productImage;

    private BigDecimal price;

    private Long buyerId;

    private String buyerNickname;

    private Long sellerId;

    private String sellerNickname;

    /** PENDING, PAID, SHIPPED, COMPLETED, CANCELLED */
    private String status;

    /** ONLINE, OFFLINE */
    private String tradeType;

    private String tradeLocation;

    private String remark;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

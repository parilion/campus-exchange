package com.campus.exchange.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BargainVO {

    private Long id;

    private Long productId;

    private String productTitle;

    private String productImage;

    private Long orderId;

    private Long bargainerId;

    private String bargainerNickname;

    private Long targetUserId;

    private String targetUserNickname;

    private BigDecimal originalPrice;

    private BigDecimal proposedPrice;

    private String status;

    private String message;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

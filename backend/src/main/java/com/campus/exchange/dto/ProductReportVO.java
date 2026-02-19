package com.campus.exchange.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProductReportVO {
    private Long id;
    private Long productId;
    private String productTitle;
    private String productImages;
    private Long reporterId;
    private String reporterUsername;
    private String reason;
    private String description;
    private String status;
    private String handleResult;
    private LocalDateTime handledAt;
    private LocalDateTime createdAt;
}

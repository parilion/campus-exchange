package com.campus.exchange.dto;

import lombok.Data;

@Data
public class RecentOrderVO {
    private Long id;
    private String orderNo;
    private String productName;
    private Long amount;
    private String status;
    private String createdAt;
}

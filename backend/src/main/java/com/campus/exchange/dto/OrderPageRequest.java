package com.campus.exchange.dto;

import lombok.Data;

/**
 * 订单分页请求
 */
@Data
public class OrderPageRequest {

    private Integer page = 1;

    private Integer pageSize = 10;

    /** 订单状态筛选 */
    private String status;

    /** 买家ID */
    private Long buyerId;

    /** 卖家ID */
    private Long sellerId;
}

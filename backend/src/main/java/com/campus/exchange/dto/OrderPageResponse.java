package com.campus.exchange.dto;

import lombok.Data;

import java.util.List;

/**
 * 订单分页响应
 */
@Data
public class OrderPageResponse {

    private List<OrderVO> list;

    private Integer page;

    private Integer pageSize;

    private Long total;

    private Integer totalPages;
}

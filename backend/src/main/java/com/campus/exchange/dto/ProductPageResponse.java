package com.campus.exchange.dto;

import lombok.Data;

import java.util.List;

/**
 * 商品分页响应
 */
@Data
public class ProductPageResponse {

    /**
     * 商品列表
     */
    private List<ProductVO> list;

    /**
     * 当前页码
     */
    private Integer page;

    /**
     * 每页数量
     */
    private Integer pageSize;

    /**
     * 总记录数
     */
    private Long total;

    /**
     * 总页数
     */
    private Integer totalPages;
}

package com.campus.exchange.dto;

import lombok.Data;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;

/**
 * 商品分页查询请求
 */
@Data
public class ProductPageRequest {

    /**
     * 页码，从1开始
     */
    @Min(1)
    private Integer page = 1;

    /**
     * 每页数量
     */
    @Min(1)
    @Max(50)
    private Integer pageSize = 10;

    /**
     * 分类ID筛选
     */
    private Long categoryId;

    /**
     * 状态筛选：ON_SALE, SOLD, OFF_SHELF
     */
    private String status = "ON_SALE";

    /**
     * 排序字段：createdAt, price, viewCount
     */
    private String sortBy = "createdAt";

    /**
     * 排序方向：asc, desc
     */
    private String sortOrder = "desc";

    /**
     * 关键词搜索（标题/描述）
     */
    private String keyword;

    /**
     * 最低价格
     */
    private Double minPrice;

    /**
     * 最高价格
     */
    private Double maxPrice;
}

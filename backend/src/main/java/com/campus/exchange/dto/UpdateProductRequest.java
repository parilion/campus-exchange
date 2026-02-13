package com.campus.exchange.dto;

import lombok.Data;

import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

/**
 * 更新商品请求 DTO
 */
@Data
public class UpdateProductRequest {

    @Size(max = 100, message = "商品标题不能超过100个字符")
    private String title;

    @Size(max = 2000, message = "商品描述不能超过2000个字符")
    private String description;

    @DecimalMin(value = "0.01", message = "商品价格必须大于0")
    @Digits(integer = 8, fraction = 2, message = "商品价格格式不正确")
    private BigDecimal price;

    @DecimalMin(value = "0.01", message = "原价必须大于0")
    @Digits(integer = 8, fraction = 2, message = "原价格式不正确")
    private BigDecimal originalPrice;

    private Long categoryId;

    /**
     * NEW, LIKE_NEW, GOOD, FAIR, POOR
     */
    private String condition;

    /**
     * 图片URL列表
     */
    private List<String> images;

    /**
     * 交易方式：ONLINE, OFFLINE
     */
    private String tradeType;

    /**
     * 交易地点（线下交易时使用）
     */
    private String tradeLocation;

    /**
     * 商品状态：ON_SALE, SOLD, OFF_SHELF
     */
    private String status;
}

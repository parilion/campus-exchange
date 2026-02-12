package com.campus.exchange.dto;

import lombok.Data;

import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

/**
 * 发布商品请求 DTO
 */
@Data
public class CreateProductRequest {

    @NotBlank(message = "商品标题不能为空")
    @Size(max = 100, message = "商品标题不能超过100个字符")
    private String title;

    @Size(max = 2000, message = "商品描述不能超过2000个字符")
    private String description;

    @NotNull(message = "商品价格不能为空")
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
    @NotBlank(message = "请选择商品新旧程度")
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
}

package com.campus.exchange.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

/**
 * 创建订单请求
 */
@Data
public class CreateOrderRequest {

    @NotNull(message = "商品ID不能为空")
    private Long productId;

    /** 交易方式: ONLINE, OFFLINE */
    private String tradeType;

    /** 交易地点 */
    private String tradeLocation;

    /** 备注 */
    private String remark;
}

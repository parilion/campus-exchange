package com.campus.exchange.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;

/**
 * 退款请求
 */
@Data
public class RefundRequest {

    @NotNull(message = "订单ID不能为空")
    private Long orderId;

    /** 退款原因 */
    private String reason;
}

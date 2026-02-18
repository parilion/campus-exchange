package com.campus.exchange.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;

/**
 * 纠纷申诉请求
 */
@Data
public class DisputeRequest {

    @NotNull(message = "订单ID不能为空")
    private Long orderId;

    /** 纠纷原因 */
    private String reason;

    /** 纠纷证据描述 */
    private String evidence;
}

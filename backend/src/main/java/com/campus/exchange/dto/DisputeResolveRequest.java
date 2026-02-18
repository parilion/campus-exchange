package com.campus.exchange.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;

/**
 * 纠纷处理请求
 */
@Data
public class DisputeResolveRequest {

    @NotNull(message = "订单ID不能为空")
    private Long orderId;

    /** 处理结果 */
    @NotNull(message = "处理结果不能为空")
    private String result;
}

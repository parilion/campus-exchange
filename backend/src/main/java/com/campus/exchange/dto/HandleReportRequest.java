package com.campus.exchange.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class HandleReportRequest {

    /** 处理操作：RESOLVE / IGNORE */
    @NotBlank(message = "处理操作不能为空")
    private String action;

    /** 处理结果描述 */
    private String handleResult;

    /** 是否同时下架该商品 */
    private Boolean offlineProduct;
}

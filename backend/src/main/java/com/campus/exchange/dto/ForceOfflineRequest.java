package com.campus.exchange.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class ForceOfflineRequest {

    /** 强制下架原因 */
    @NotBlank(message = "下架原因不能为空")
    private String reason;
}

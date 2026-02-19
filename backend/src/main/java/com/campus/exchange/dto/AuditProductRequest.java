package com.campus.exchange.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class AuditProductRequest {

    /** 审核操作：APPROVE / REJECT */
    @NotBlank(message = "审核操作不能为空")
    private String action;

    /** 拒绝原因（action=REJECT 时必填） */
    private String rejectReason;
}

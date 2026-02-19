package com.campus.exchange.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * 创建评价举报请求
 */
public class CreateReviewReportRequest {

    @NotNull(message = "评价ID不能为空")
    private Long reviewId;

    @NotBlank(message = "举报原因不能为空")
    private String reason;

    public Long getReviewId() {
        return reviewId;
    }

    public void setReviewId(Long reviewId) {
        this.reviewId = reviewId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}

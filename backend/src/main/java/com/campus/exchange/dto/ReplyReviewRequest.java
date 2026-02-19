package com.campus.exchange.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * 评价回复请求
 */
public class ReplyReviewRequest {

    @NotNull(message = "评价ID不能为空")
    private Long reviewId;

    @NotBlank(message = "回复内容不能为空")
    @Size(min = 1, max = 500, message = "回复内容长度为1-500字符")
    private String reply;

    public Long getReviewId() {
        return reviewId;
    }

    public void setReviewId(Long reviewId) {
        this.reviewId = reviewId;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }
}

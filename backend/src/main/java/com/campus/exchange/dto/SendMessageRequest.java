package com.campus.exchange.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class SendMessageRequest {

    @NotNull(message = "接收者ID不能为空")
    private Long receiverId;

    @NotNull(message = "消息内容不能为空")
    private String content;

    /** TEXT, IMAGE, PRODUCT_CARD */
    private String type = "TEXT";

    private Long productId;
}

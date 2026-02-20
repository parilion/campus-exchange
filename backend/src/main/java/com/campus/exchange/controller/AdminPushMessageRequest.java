package com.campus.exchange.controller;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class AdminPushMessageRequest {

    private Long userId;  // 为空时表示群发

    @NotBlank(message = "标题不能为空")
    private String title;

    @NotBlank(message = "内容不能为空")
    private String content;
}

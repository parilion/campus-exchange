package com.campus.exchange.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageVO {
    private Long id;
    private Long senderId;
    private String senderNickname;
    private String senderAvatar;
    private Long receiverId;
    private String receiverNickname;
    private String receiverAvatar;
    private String content;
    private String type;
    private Boolean read;
    private LocalDateTime createdAt;
    private Long productId;
    private String productTitle;
    private String productImage;
}

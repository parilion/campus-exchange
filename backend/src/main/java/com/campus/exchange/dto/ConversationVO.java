package com.campus.exchange.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ConversationVO {
    private Long partnerId;
    private String partnerNickname;
    private String partnerAvatar;
    private String lastMessage;
    private String lastMessageType;
    private LocalDateTime lastMessageTime;
    private Integer unreadCount;
}

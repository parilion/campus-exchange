package com.campus.exchange.dto;

import lombok.Data;

@Data
public class LoginResponse {
    private String token;
    private Long userId;
    private String username;
    private String nickname;
    private String avatar;
    private String role;

    public LoginResponse(String token, Long userId, String username, String nickname, String avatar, String role) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.nickname = nickname;
        this.avatar = avatar;
        this.role = role;
    }
}

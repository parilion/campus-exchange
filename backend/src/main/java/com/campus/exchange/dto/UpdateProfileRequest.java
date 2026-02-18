package com.campus.exchange.dto;

import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.Size;

@Data
public class UpdateProfileRequest {

    @Size(min = 2, max = 20, message = "昵称长度必须在2-20个字符之间")
    private String nickname;

    @Size(min = 0, max = 11, message = "手机号格式不正确")
    private String phone;

    @Email(message = "邮箱格式不正确")
    private String email;

    private String avatar;
}

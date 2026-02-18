package com.campus.exchange.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("password_reset_code")
public class PasswordResetCode {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String email;

    private String code;

    private LocalDateTime expireTime;

    private Boolean used;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}

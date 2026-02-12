package com.campus.exchange.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("message")
public class Message {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long senderId;

    private Long receiverId;

    private String content;

    /** TEXT, IMAGE, PRODUCT_CARD */
    private String type;

    @TableField("`read`")
    private Boolean read;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}

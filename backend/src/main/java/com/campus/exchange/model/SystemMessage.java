package com.campus.exchange.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("system_message")
public class SystemMessage {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String title;

    private String content;

    /** ORDER_NOTIFY-订单通知, SYSTEM_NOTIFY-系统通知, ACTIVITY_NOTIFY-活动通知 */
    private String type;

    /** 关联ID，如订单ID */
    private Long relatedId;

    @TableField("`read`")
    private Boolean read;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    private LocalDateTime readTime;
}

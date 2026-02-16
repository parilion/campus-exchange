package com.campus.exchange.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("bargain")
public class Bargain {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long productId;

    private Long orderId;

    private Long bargainerId;

    private Long targetUserId;

    private BigDecimal originalPrice;

    private BigDecimal proposedPrice;

    /** PENDING, ACCEPTED, REJECTED, CANCELLED */
    private String status;

    private String message;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}

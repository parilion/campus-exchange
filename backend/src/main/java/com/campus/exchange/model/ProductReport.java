package com.campus.exchange.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("product_report")
public class ProductReport {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 被举报商品ID */
    private Long productId;

    /** 举报者ID */
    private Long reporterId;

    /** 举报原因：FAKE/PROHIBITED/PRICE_FRAUD/SPAM/OTHER */
    private String reason;

    /** 举报描述 */
    private String description;

    /** 处理状态：PENDING/RESOLVED/IGNORED */
    private String status;

    /** 处理结果 */
    private String handleResult;

    /** 处理时间 */
    private LocalDateTime handledAt;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}

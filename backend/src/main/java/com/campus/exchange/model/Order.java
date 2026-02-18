package com.campus.exchange.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("`order`")
public class Order {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;

    private Long productId;

    private BigDecimal price;

    private Long buyerId;

    private Long sellerId;

    /** PENDING, PAID, SHIPPED, COMPLETED, CANCELLED */
    private String status;

    /** ONLINE, OFFLINE */
    private String tradeType;

    private String tradeLocation;

    private String remark;

    @TableLogic
    private Integer deleted;

    /** 退款状态: NONE, APPLYING, APPROVED, REJECTED */
    private String refundStatus;

    /** 退款原因 */
    private String refundReason;

    /** 退款时间 */
    private LocalDateTime refundTime;

    /** 纠纷状态: NONE, APPLYING, PROCESSING, RESOLVED */
    private String disputeStatus;

    /** 纠纷原因 */
    private String disputeReason;

    /** 纠纷证据 */
    private String disputeEvidence;

    /** 纠纷处理结果 */
    private String disputeResult;

    /** 申诉时间 */
    private LocalDateTime disputeTime;

    /** 解决时间 */
    private LocalDateTime resolveTime;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}

package com.campus.exchange.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单 VO
 */
@Data
public class OrderVO {

    private Long id;

    private String orderNo;

    private Long productId;

    private String productTitle;

    private String productImage;

    private BigDecimal price;

    private Long buyerId;

    private String buyerNickname;

    private Long sellerId;

    private String sellerNickname;

    /** PENDING, PAID, SHIPPED, COMPLETED, CANCELLED */
    private String status;

    /** ONLINE, OFFLINE */
    private String tradeType;

    private String tradeLocation;

    private String remark;

    /* 退款/纠纷字段需在执行 sql/add_order_refund_dispute.sql 后启用
    /** 退款状态: NONE, APPLYING, APPROVED, REJECTED */
    // private String refundStatus;

    /** 退款原因 */
    // private String refundReason;

    /** 退款时间 */
    // private LocalDateTime refundTime;

    /** 纠纷状态: NONE, APPLYING, PROCESSING, RESOLVED */
    // private String disputeStatus;

    /** 纠纷原因 */
    // private String disputeReason;

    /** 纠纷证据 */
    // private String disputeEvidence;

    /** 纠纷处理结果 */
    // private String disputeResult;

    /** 申诉时间 */
    // private LocalDateTime disputeTime;

    /** 解决时间 */
    // private LocalDateTime resolveTime;
    */

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

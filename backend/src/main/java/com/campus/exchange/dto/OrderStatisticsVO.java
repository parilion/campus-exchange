package com.campus.exchange.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 订单统计 VO
 */
@Data
public class OrderStatisticsVO {

    /** 总订单数 */
    private Long totalCount;

    /** 待支付订单数 */
    private Long pendingCount;

    /** 待发货订单数 */
    private Long paidCount;

    /** 待收货订单数 */
    private Long shippedCount;

    /** 已完成订单数 */
    private Long completedCount;

    /** 已取消订单数 */
    private Long cancelledCount;

    /** 退款中订单数 */
    private Long refundingCount;

    /** 纠纷中订单数 */
    private Long disputingCount;

    /** 总成交金额 */
    private BigDecimal totalAmount;

    /** 买家订单数 */
    private Long buyerCount;

    /** 卖家订单数 */
    private Long sellerCount;
}

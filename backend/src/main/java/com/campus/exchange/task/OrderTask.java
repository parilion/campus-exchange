package com.campus.exchange.task;

import com.campus.exchange.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 订单定时任务
 */
@Component
public class OrderTask {

    private static final Logger logger = LoggerFactory.getLogger(OrderTask.class);

    private final OrderService orderService;

    public OrderTask(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * 每小时检查并取消超时未支付的订单
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void autoCancelExpiredOrders() {
        logger.info("开始检查超时未支付的订单...");
        try {
            int count = orderService.autoCancelExpiredOrders();
            if (count > 0) {
                logger.info("自动取消了 {} 个超时未支付的订单", count);
            }
        } catch (Exception e) {
            logger.error("自动取消超时订单失败", e);
        }
    }
}

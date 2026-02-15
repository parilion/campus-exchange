package com.campus.exchange.controller;

import com.campus.exchange.dto.*;
import com.campus.exchange.service.OrderService;
import com.campus.exchange.util.Result;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/**
 * 订单控制器
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * 创建订单（下单）
     */
    @PostMapping
    public Result<OrderVO> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        Long userId = getCurrentUserId();
        OrderVO order = orderService.createOrder(userId, request);
        return Result.success(order);
    }

    /**
     * 获取订单详情
     */
    @GetMapping("/{id}")
    public Result<OrderVO> getOrder(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        OrderVO order = orderService.getOrderById(id, userId);
        return Result.success(order);
    }

    /**
     * 获取当前用户的订单列表
     */
    @GetMapping
    public Result<OrderPageResponse> getOrderList(@ModelAttribute OrderPageRequest request) {
        Long userId = getCurrentUserId();
        OrderPageResponse response = orderService.getOrderList(userId, request);
        return Result.success(response);
    }

    /**
     * 获取买家订单列表
     */
    @GetMapping("/buyer")
    public Result<OrderPageResponse> getBuyerOrders(@ModelAttribute OrderPageRequest request) {
        Long userId = getCurrentUserId();
        OrderPageResponse response = orderService.getBuyerOrders(userId, request);
        return Result.success(response);
    }

    /**
     * 获取卖家订单列表
     */
    @GetMapping("/seller")
    public Result<OrderPageResponse> getSellerOrders(@ModelAttribute OrderPageRequest request) {
        Long userId = getCurrentUserId();
        OrderPageResponse response = orderService.getSellerOrders(userId, request);
        return Result.success(response);
    }

    /**
     * 取消订单
     */
    @PostMapping("/{id}/cancel")
    public Result<OrderVO> cancelOrder(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        OrderVO order = orderService.cancelOrder(id, userId);
        return Result.success(order);
    }

    /**
     * 支付订单
     */
    @PostMapping("/{id}/pay")
    public Result<OrderVO> payOrder(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        OrderVO order = orderService.payOrder(id, userId);
        return Result.success(order);
    }

    /**
     * 发货
     */
    @PostMapping("/{id}/ship")
    public Result<OrderVO> shipOrder(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        OrderVO order = orderService.shipOrder(id, userId);
        return Result.success(order);
    }

    /**
     * 确认收货
     */
    @PostMapping("/{id}/confirm")
    public Result<OrderVO> confirmReceipt(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        OrderVO order = orderService.confirmReceipt(id, userId);
        return Result.success(order);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (Long) authentication.getPrincipal();
    }
}

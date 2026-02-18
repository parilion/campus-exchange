package com.campus.exchange.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.exchange.dto.*;
import com.campus.exchange.dto.OrderVO;
import com.campus.exchange.mapper.OrderMapper;
import com.campus.exchange.mapper.ProductMapper;
import com.campus.exchange.mapper.UserMapper;
import com.campus.exchange.model.Order;
import com.campus.exchange.model.Product;
import com.campus.exchange.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 订单服务层
 */
@Service
public class OrderService {

    private final OrderMapper orderMapper;
    private final ProductMapper productMapper;
    private final UserMapper userMapper;

    public OrderService(OrderMapper orderMapper, ProductMapper productMapper, UserMapper userMapper) {
        this.orderMapper = orderMapper;
        this.productMapper = productMapper;
        this.userMapper = userMapper;
    }

    /**
     * 创建订单（下单）
     */
    @Transactional
    public OrderVO createOrder(Long buyerId, CreateOrderRequest request) {
        // 查询商品
        Product product = productMapper.selectById(request.getProductId());
        if (product == null) {
            throw new IllegalArgumentException("商品不存在");
        }

        // 检查商品状态
        if (!"ON_SALE".equals(product.getStatus())) {
            throw new IllegalArgumentException("商品已下架或已售出");
        }

        // 不能购买自己的商品
        if (product.getSellerId().equals(buyerId)) {
            throw new IllegalArgumentException("不能购买自己的商品");
        }

        // 创建订单
        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setProductId(product.getId());
        order.setPrice(product.getPrice());
        order.setBuyerId(buyerId);
        order.setSellerId(product.getSellerId());
        order.setStatus("PENDING");
        order.setTradeType(request.getTradeType() != null ? request.getTradeType() : product.getTradeType());
        order.setTradeLocation(request.getTradeLocation() != null ? request.getTradeLocation() : product.getTradeLocation());
        order.setRemark(request.getRemark());

        orderMapper.insert(order);

        // 更新商品状态为已售出
        product.setStatus("SOLD");
        productMapper.updateById(product);

        return getOrderVO(order);
    }

    /**
     * 取消订单
     */
    @Transactional
    public OrderVO cancelOrder(Long orderId, Long userId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new IllegalArgumentException("订单不存在");
        }

        // 校验权限（买家或卖家可以取消）
        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new IllegalArgumentException("无权限操作此订单");
        }

        // 只有 PENDING 状态可以取消
        if (!"PENDING".equals(order.getStatus())) {
            throw new IllegalArgumentException("只有待支付的订单可以取消");
        }

        order.setStatus("CANCELLED");
        orderMapper.updateById(order);

        // 恢复商品状态
        Product product = productMapper.selectById(order.getProductId());
        if (product != null) {
            product.setStatus("ON_SALE");
            productMapper.updateById(product);
        }

        return getOrderVO(order);
    }

    /**
     * 支付订单
     */
    @Transactional
    public OrderVO payOrder(Long orderId, Long userId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new IllegalArgumentException("订单不存在");
        }

        // 只有买家可以支付
        if (!order.getBuyerId().equals(userId)) {
            throw new IllegalArgumentException("无权限操作此订单");
        }

        // 只有 PENDING 状态可以支付
        if (!"PENDING".equals(order.getStatus())) {
            throw new IllegalArgumentException("订单状态不正确");
        }

        order.setStatus("PAID");
        orderMapper.updateById(order);

        return getOrderVO(order);
    }

    /**
     * 发货
     */
    @Transactional
    public OrderVO shipOrder(Long orderId, Long userId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new IllegalArgumentException("订单不存在");
        }

        // 只有卖家可以发货
        if (!order.getSellerId().equals(userId)) {
            throw new IllegalArgumentException("无权限操作此订单");
        }

        // 只有 PAID 状态可以发货
        if (!"PAID".equals(order.getStatus())) {
            throw new IllegalArgumentException("订单状态不正确");
        }

        order.setStatus("SHIPPED");
        orderMapper.updateById(order);

        return getOrderVO(order);
    }

    /**
     * 确认收货
     */
    @Transactional
    public OrderVO confirmReceipt(Long orderId, Long userId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new IllegalArgumentException("订单不存在");
        }

        // 只有买家可以确认收货
        if (!order.getBuyerId().equals(userId)) {
            throw new IllegalArgumentException("无权限操作此订单");
        }

        // 只有 SHIPPED 状态可以确认收货
        if (!"SHIPPED".equals(order.getStatus())) {
            throw new IllegalArgumentException("订单状态不正确");
        }

        order.setStatus("COMPLETED");
        orderMapper.updateById(order);

        return getOrderVO(order);
    }

    /**
     * 获取订单详情
     */
    public OrderVO getOrderById(Long orderId, Long userId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new IllegalArgumentException("订单不存在");
        }

        // 校验权限（买家或卖家可以查看）
        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new IllegalArgumentException("无权限查看此订单");
        }

        return getOrderVO(order);
    }

    /**
     * 获取订单列表（买家或卖家）
     */
    public OrderPageResponse getOrderList(Long userId, OrderPageRequest request) {
        Page<Order> page = new Page<>(request.getPage(), request.getPageSize());

        LambdaQueryWrapper<Order> queryWrapper = new LambdaQueryWrapper<>();
        // 查询当前用户的订单（作为买家或卖家）
        queryWrapper.and(wrapper -> wrapper
                .eq(Order::getBuyerId, userId)
                .or()
                .eq(Order::getSellerId, userId));

        // 状态筛选
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            queryWrapper.eq(Order::getStatus, request.getStatus());
        }

        queryWrapper.orderByDesc(Order::getCreatedAt);

        IPage<Order> orderPage = orderMapper.selectPage(page, queryWrapper);

        List<OrderVO> orderVOList = orderPage.getRecords().stream()
                .map(this::getOrderVO)
                .collect(Collectors.toList());

        OrderPageResponse response = new OrderPageResponse();
        response.setList(orderVOList);
        response.setPage((int) orderPage.getCurrent());
        response.setPageSize((int) orderPage.getSize());
        response.setTotal(orderPage.getTotal());
        response.setTotalPages((int) orderPage.getPages());

        return response;
    }

    /**
     * 获取买家订单列表
     */
    public OrderPageResponse getBuyerOrders(Long buyerId, OrderPageRequest request) {
        Page<Order> page = new Page<>(request.getPage(), request.getPageSize());

        LambdaQueryWrapper<Order> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Order::getBuyerId, buyerId);

        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            queryWrapper.eq(Order::getStatus, request.getStatus());
        }

        queryWrapper.orderByDesc(Order::getCreatedAt);

        IPage<Order> orderPage = orderMapper.selectPage(page, queryWrapper);

        List<OrderVO> orderVOList = orderPage.getRecords().stream()
                .map(this::getOrderVO)
                .collect(Collectors.toList());

        OrderPageResponse response = new OrderPageResponse();
        response.setList(orderVOList);
        response.setPage((int) orderPage.getCurrent());
        response.setPageSize((int) orderPage.getSize());
        response.setTotal(orderPage.getTotal());
        response.setTotalPages((int) orderPage.getPages());

        return response;
    }

    /**
     * 获取卖家订单列表
     */
    public OrderPageResponse getSellerOrders(Long sellerId, OrderPageRequest request) {
        Page<Order> page = new Page<>(request.getPage(), request.getPageSize());

        LambdaQueryWrapper<Order> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Order::getSellerId, sellerId);

        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            queryWrapper.eq(Order::getStatus, request.getStatus());
        }

        queryWrapper.orderByDesc(Order::getCreatedAt);

        IPage<Order> orderPage = orderMapper.selectPage(page, queryWrapper);

        List<OrderVO> orderVOList = orderPage.getRecords().stream()
                .map(this::getOrderVO)
                .collect(Collectors.toList());

        OrderPageResponse response = new OrderPageResponse();
        response.setList(orderVOList);
        response.setPage((int) orderPage.getCurrent());
        response.setPageSize((int) orderPage.getSize());
        response.setTotal(orderPage.getTotal());
        response.setTotalPages((int) orderPage.getPages());

        return response;
    }

    /**
     * 自动取消超时订单（24小时未支付）
     * 由定时任务调用
     */
    @Transactional
    public int autoCancelExpiredOrders() {
        // 查询超时未支付的订单（创建超过24小时）
        LocalDateTime expireTime = LocalDateTime.now().minusHours(24);

        LambdaQueryWrapper<Order> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Order::getStatus, "PENDING")
                .le(Order::getCreatedAt, expireTime);

        List<Order> expiredOrders = orderMapper.selectList(queryWrapper);

        int count = 0;
        for (Order order : expiredOrders) {
            try {
                // 取消订单
                order.setStatus("CANCELLED");
                orderMapper.updateById(order);

                // 恢复商品状态
                Product product = productMapper.selectById(order.getProductId());
                if (product != null && "SOLD".equals(product.getStatus())) {
                    product.setStatus("ON_SALE");
                    productMapper.updateById(product);
                }
                count++;
            } catch (Exception e) {
                // 忽略单个订单的错误，继续处理其他订单
            }
        }

        return count;
    }

    /**
     * 生成订单编号
     */
    private String generateOrderNo() {
        return "ORD" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * 将 Order 转换为 OrderVO
     */
    private OrderVO getOrderVO(Order order) {
        OrderVO vo = new OrderVO();
        vo.setId(order.getId());
        vo.setOrderNo(order.getOrderNo());
        vo.setProductId(order.getProductId());
        vo.setPrice(order.getPrice());
        vo.setBuyerId(order.getBuyerId());
        vo.setSellerId(order.getSellerId());
        vo.setStatus(order.getStatus());
        vo.setTradeType(order.getTradeType());
        vo.setTradeLocation(order.getTradeLocation());
        vo.setRemark(order.getRemark());
        vo.setCreatedAt(order.getCreatedAt());
        vo.setUpdatedAt(order.getUpdatedAt());

        // 查询商品信息
        Product product = productMapper.selectById(order.getProductId());
        if (product != null) {
            vo.setProductTitle(product.getTitle());
            // 解析商品图片
            String images = product.getImages();
            if (images != null && images.startsWith("[")) {
                // 简单解析第一张图片
                int start = images.indexOf("\"");
                if (start >= 0) {
                    int end = images.indexOf("\"", start + 1);
                    if (end > start) {
                        vo.setProductImage(images.substring(start + 1, end));
                    }
                }
            }
        }

        // 查询买家信息
        User buyer = userMapper.selectById(order.getBuyerId());
        if (buyer != null) {
            vo.setBuyerNickname(buyer.getNickname());
        }

        // 查询卖家信息
        User seller = userMapper.selectById(order.getSellerId());
        if (seller != null) {
            vo.setSellerNickname(seller.getNickname());
        }

        // 退款和纠纷信息
        vo.setRefundStatus(order.getRefundStatus());
        vo.setRefundReason(order.getRefundReason());
        vo.setRefundTime(order.getRefundTime());
        vo.setDisputeStatus(order.getDisputeStatus());
        vo.setDisputeReason(order.getDisputeReason());
        vo.setDisputeEvidence(order.getDisputeEvidence());
        vo.setDisputeResult(order.getDisputeResult());
        vo.setDisputeTime(order.getDisputeTime());
        vo.setResolveTime(order.getResolveTime());

        return vo;
    }

    /**
     * 申请退款（买家）
     */
    @Transactional
    public OrderVO applyRefund(Long orderId, Long buyerId, String reason) {
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new IllegalArgumentException("订单不存在");
        }

        // 只有买家可以申请退款
        if (!order.getBuyerId().equals(buyerId)) {
            throw new IllegalArgumentException("无权限操作此订单");
        }

        // 只有已支付的订单可以申请退款
        if (!"PAID".equals(order.getStatus()) && !"SHIPPED".equals(order.getStatus())) {
            throw new IllegalArgumentException("只有已支付或已发货的订单可以申请退款");
        }

        // 检查是否有进行中的退款或纠纷
        if ("APPLYING".equals(order.getRefundStatus())) {
            throw new IllegalArgumentException("订单已有退款申请");
        }
        if (order.getDisputeStatus() != null && !"NONE".equals(order.getDisputeStatus()) && !"RESOLVED".equals(order.getDisputeStatus())) {
            throw new IllegalArgumentException("订单已有纠纷处理中");
        }

        order.setRefundStatus("APPLYING");
        order.setRefundReason(reason);
        orderMapper.updateById(order);

        return getOrderVO(order);
    }

    /**
     * 同意退款（卖家）
     */
    @Transactional
    public OrderVO approveRefund(Long orderId, Long sellerId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new IllegalArgumentException("订单不存在");
        }

        // 只有卖家可以同意退款
        if (!order.getSellerId().equals(sellerId)) {
            throw new IllegalArgumentException("无权限操作此订单");
        }

        // 检查退款状态
        if (!"APPLYING".equals(order.getRefundStatus())) {
            throw new IllegalArgumentException("订单没有退款申请");
        }

        // 同意退款
        order.setRefundStatus("APPROVED");
        order.setRefundTime(LocalDateTime.now());
        order.setStatus("CANCELLED");
        orderMapper.updateById(order);

        // 恢复商品状态
        Product product = productMapper.selectById(order.getProductId());
        if (product != null) {
            product.setStatus("ON_SALE");
            productMapper.updateById(product);
        }

        return getOrderVO(order);
    }

    /**
     * 拒绝退款（卖家）
     */
    @Transactional
    public OrderVO rejectRefund(Long orderId, Long sellerId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new IllegalArgumentException("订单不存在");
        }

        // 只有卖家可以拒绝退款
        if (!order.getSellerId().equals(sellerId)) {
            throw new IllegalArgumentException("无权限操作此订单");
        }

        // 检查退款状态
        if (!"APPLYING".equals(order.getRefundStatus())) {
            throw new IllegalArgumentException("订单没有退款申请");
        }

        order.setRefundStatus("REJECTED");
        orderMapper.updateById(order);

        return getOrderVO(order);
    }

    /**
     * 发起纠纷申诉（买家或卖家）
     */
    @Transactional
    public OrderVO applyDispute(Long orderId, Long userId, String reason, String evidence) {
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new IllegalArgumentException("订单不存在");
        }

        // 只有买家或卖家可以发起纠纷
        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new IllegalArgumentException("无权限操作此订单");
        }

        // 只有已支付、已发货、已完成的订单可以发起纠纷
        if (!"PAID".equals(order.getStatus()) && !"SHIPPED".equals(order.getStatus()) && !"COMPLETED".equals(order.getStatus())) {
            throw new IllegalArgumentException("订单状态不允许发起纠纷");
        }

        // 检查是否有进行中的纠纷
        if (order.getDisputeStatus() != null && !"NONE".equals(order.getDisputeStatus()) && !"RESOLVED".equals(order.getDisputeStatus())) {
            throw new IllegalArgumentException("订单已有纠纷处理中");
        }

        order.setDisputeStatus("APPLYING");
        order.setDisputeReason(reason);
        order.setDisputeEvidence(evidence);
        order.setDisputeTime(LocalDateTime.now());
        orderMapper.updateById(order);

        return getOrderVO(order);
    }

    /**
     * 处理纠纷（管理员）
     */
    @Transactional
    public OrderVO resolveDispute(Long orderId, String result) {
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new IllegalArgumentException("订单不存在");
        }

        // 检查纠纷状态
        if (order.getDisputeStatus() == null || "NONE".equals(order.getDisputeStatus()) || "RESOLVED".equals(order.getDisputeStatus())) {
            throw new IllegalArgumentException("订单没有纠纷需要处理");
        }

        order.setDisputeStatus("RESOLVED");
        order.setDisputeResult(result);
        order.setResolveTime(LocalDateTime.now());

        // 根据处理结果更新订单状态
        if (result.contains("退款") || result.contains("取消")) {
            order.setStatus("CANCELLED");
            // 恢复商品状态
            Product product = productMapper.selectById(order.getProductId());
            if (product != null) {
                product.setStatus("ON_SALE");
                productMapper.updateById(product);
            }
        }

        orderMapper.updateById(order);

        return getOrderVO(order);
    }

    /**
     * 获取订单统计
     */
    public OrderStatisticsVO getOrderStatistics(Long userId) {
        OrderStatisticsVO stats = new OrderStatisticsVO();

        // 总订单数
        LambdaQueryWrapper<Order> totalWrapper = new LambdaQueryWrapper<>();
        totalWrapper.and(wrapper -> wrapper
                .eq(Order::getBuyerId, userId)
                .or()
                .eq(Order::getSellerId, userId));
        stats.setTotalCount(orderMapper.selectCount(totalWrapper));

        // 待支付
        LambdaQueryWrapper<Order> pendingWrapper = new LambdaQueryWrapper<>();
        pendingWrapper.and(wrapper -> wrapper
                .eq(Order::getBuyerId, userId)
                .or()
                .eq(Order::getSellerId, userId))
                .eq(Order::getStatus, "PENDING");
        stats.setPendingCount(orderMapper.selectCount(pendingWrapper));

        // 已支付
        LambdaQueryWrapper<Order> paidWrapper = new LambdaQueryWrapper<>();
        paidWrapper.and(wrapper -> wrapper
                .eq(Order::getBuyerId, userId)
                .or()
                .eq(Order::getSellerId, userId))
                .eq(Order::getStatus, "PAID");
        stats.setPaidCount(orderMapper.selectCount(paidWrapper));

        // 已发货
        LambdaQueryWrapper<Order> shippedWrapper = new LambdaQueryWrapper<>();
        shippedWrapper.and(wrapper -> wrapper
                .eq(Order::getBuyerId, userId)
                .or()
                .eq(Order::getSellerId, userId))
                .eq(Order::getStatus, "SHIPPED");
        stats.setShippedCount(orderMapper.selectCount(shippedWrapper));

        // 已完成
        LambdaQueryWrapper<Order> completedWrapper = new LambdaQueryWrapper<>();
        completedWrapper.and(wrapper -> wrapper
                .eq(Order::getBuyerId, userId)
                .or()
                .eq(Order::getSellerId, userId))
                .eq(Order::getStatus, "COMPLETED");
        stats.setCompletedCount(orderMapper.selectCount(completedWrapper));

        // 已取消
        LambdaQueryWrapper<Order> cancelledWrapper = new LambdaQueryWrapper<>();
        cancelledWrapper.and(wrapper -> wrapper
                .eq(Order::getBuyerId, userId)
                .or()
                .eq(Order::getSellerId, userId))
                .eq(Order::getStatus, "CANCELLED");
        stats.setCancelledCount(orderMapper.selectCount(cancelledWrapper));

        // 退款中
        LambdaQueryWrapper<Order> refundingWrapper = new LambdaQueryWrapper<>();
        refundingWrapper.and(wrapper -> wrapper
                .eq(Order::getBuyerId, userId)
                .or()
                .eq(Order::getSellerId, userId))
                .eq(Order::getRefundStatus, "APPLYING");
        stats.setRefundingCount(orderMapper.selectCount(refundingWrapper));

        // 纠纷中
        LambdaQueryWrapper<Order> disputingWrapper = new LambdaQueryWrapper<>();
        disputingWrapper.and(wrapper -> wrapper
                .eq(Order::getBuyerId, userId)
                .or()
                .eq(Order::getSellerId, userId))
                .in(Order::getDisputeStatus, "APPLYING", "PROCESSING");
        stats.setDisputingCount(orderMapper.selectCount(disputingWrapper));

        // 买家订单数
        LambdaQueryWrapper<Order> buyerWrapper = new LambdaQueryWrapper<>();
        buyerWrapper.eq(Order::getBuyerId, userId);
        stats.setBuyerCount(orderMapper.selectCount(buyerWrapper));

        // 卖家订单数
        LambdaQueryWrapper<Order> sellerWrapper = new LambdaQueryWrapper<>();
        sellerWrapper.eq(Order::getSellerId, userId);
        stats.setSellerCount(orderMapper.selectCount(sellerWrapper));

        return stats;
    }
}

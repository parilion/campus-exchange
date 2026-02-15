package com.campus.exchange.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.exchange.dto.CreateOrderRequest;
import com.campus.exchange.dto.OrderPageRequest;
import com.campus.exchange.dto.OrderPageResponse;
import com.campus.exchange.dto.OrderVO;
import com.campus.exchange.mapper.OrderMapper;
import com.campus.exchange.mapper.ProductMapper;
import com.campus.exchange.mapper.UserMapper;
import com.campus.exchange.model.Order;
import com.campus.exchange.model.Product;
import com.campus.exchange.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        return vo;
    }
}

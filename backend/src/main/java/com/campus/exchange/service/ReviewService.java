package com.campus.exchange.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.exchange.dto.CreateReviewRequest;
import com.campus.exchange.dto.ReviewVO;
import com.campus.exchange.mapper.OrderMapper;
import com.campus.exchange.mapper.ProductMapper;
import com.campus.exchange.mapper.ReviewMapper;
import com.campus.exchange.mapper.UserMapper;
import com.campus.exchange.model.Order;
import com.campus.exchange.model.Product;
import com.campus.exchange.model.Review;
import com.campus.exchange.model.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 评价服务层
 */
@Service
public class ReviewService {

    private final ReviewMapper reviewMapper;
    private final OrderMapper orderMapper;
    private final ProductMapper productMapper;
    private final UserMapper userMapper;
    private final ObjectMapper objectMapper;

    public ReviewService(ReviewMapper reviewMapper, OrderMapper orderMapper,
                         ProductMapper productMapper, UserMapper userMapper,
                         ObjectMapper objectMapper) {
        this.reviewMapper = reviewMapper;
        this.orderMapper = orderMapper;
        this.productMapper = productMapper;
        this.userMapper = userMapper;
        this.objectMapper = objectMapper;
    }

    /**
     * 创建评价
     */
    @Transactional
    public ReviewVO createReview(Long reviewerId, CreateReviewRequest request) {
        // 检查订单是否存在
        Order order = orderMapper.selectById(request.getOrderId());
        if (order == null) {
            throw new IllegalArgumentException("订单不存在");
        }

        // 检查订单状态是否为已完成
        if (!"COMPLETED".equals(order.getStatus())) {
            throw new IllegalArgumentException("只能评价已完成的订单");
        }

        // 检查是否已经评价过
        LambdaQueryWrapper<Review> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Review::getOrderId, request.getOrderId())
               .eq(Review::getReviewerId, reviewerId);
        Long existingCount = reviewMapper.selectCount(wrapper);
        if (existingCount > 0) {
            throw new IllegalArgumentException("您已经评价过此订单");
        }

        // 确定被评价的用户（买家评价卖家，卖家评价买家）
        Long targetUserId;
        if (reviewerId.equals(order.getBuyerId())) {
            targetUserId = order.getSellerId();
        } else if (reviewerId.equals(order.getSellerId())) {
            targetUserId = order.getBuyerId();
        } else {
            throw new IllegalArgumentException("您不是该订单的参与者");
        }

        // 创建评价
        Review review = new Review();
        review.setOrderId(request.getOrderId());
        review.setReviewerId(reviewerId);
        review.setTargetUserId(targetUserId);
        review.setRating(request.getRating());
        review.setContent(request.getContent());
        review.setAnonymous(request.getAnonymous() != null ? request.getAnonymous() : 0);

        // 处理图片JSON
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            try {
                review.setImages(objectMapper.writeValueAsString(request.getImages()));
            } catch (JsonProcessingException e) {
                throw new RuntimeException("图片数据处理失败");
            }
        }

        reviewMapper.insert(review);

        return getReviewVO(review);
    }

    /**
     * 获取订单的评价列表
     */
    public IPage<ReviewVO> getOrderReviews(Long orderId, int page, int size) {
        LambdaQueryWrapper<Review> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Review::getOrderId, orderId)
               .orderByDesc(Review::getCreatedAt);

        Page<Review> reviewPage = reviewMapper.selectPage(new Page<>(page, size), wrapper);
        Page<ReviewVO> voPage = new Page<>(reviewPage.getCurrent(), reviewPage.getSize(), reviewPage.getTotal());

        List<ReviewVO> voList = reviewPage.getRecords().stream()
                .map(this::getReviewVO)
                .collect(Collectors.toList());
        voPage.setRecords(voList);

        return voPage;
    }

    /**
     * 获取用户收到的评价列表
     */
    public IPage<ReviewVO> getUserReviews(Long userId, int page, int size) {
        LambdaQueryWrapper<Review> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Review::getTargetUserId, userId)
               .orderByDesc(Review::getCreatedAt);

        Page<Review> reviewPage = reviewMapper.selectPage(new Page<>(page, size), wrapper);
        Page<ReviewVO> voPage = new Page<>(reviewPage.getCurrent(), reviewPage.getSize(), reviewPage.getTotal());

        List<ReviewVO> voList = reviewPage.getRecords().stream()
                .map(this::getReviewVO)
                .collect(Collectors.toList());
        voPage.setRecords(voList);

        return voPage;
    }

    /**
     * 获取用户的评价统计
     */
    public UserReviewStats getUserReviewStats(Long userId) {
        LambdaQueryWrapper<Review> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Review::getTargetUserId, userId);

        List<Review> reviews = reviewMapper.selectList(wrapper);

        UserReviewStats stats = new UserReviewStats();
        stats.setTotalReviews(reviews.size());

        if (reviews.isEmpty()) {
            stats.setAverageRating(0.0);
        } else {
            double avgRating = reviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            stats.setAverageRating(Math.round(avgRating * 10) / 10.0);
        }

        // 评分分布
        int[] ratingCounts = new int[5];
        for (Review review : reviews) {
            if (review.getRating() >= 1 && review.getRating() <= 5) {
                ratingCounts[review.getRating() - 1]++;
            }
        }
        stats.setRating5Count(ratingCounts[4]);
        stats.setRating4Count(ratingCounts[3]);
        stats.setRating3Count(ratingCounts[2]);
        stats.setRating2Count(ratingCounts[1]);
        stats.setRating1Count(ratingCounts[0]);

        return stats;
    }

    /**
     * 检查用户是否已评价订单
     */
    public boolean hasReviewed(Long userId, Long orderId) {
        LambdaQueryWrapper<Review> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Review::getOrderId, orderId)
               .eq(Review::getReviewerId, userId);
        return reviewMapper.selectCount(wrapper) > 0;
    }

    private ReviewVO getReviewVO(Review review) {
        ReviewVO vo = new ReviewVO();
        vo.setId(review.getId());
        vo.setOrderId(review.getOrderId());
        vo.setReviewerId(review.getReviewerId());
        vo.setTargetUserId(review.getTargetUserId());
        vo.setRating(review.getRating());
        vo.setContent(review.getContent());
        vo.setAnonymous(review.getAnonymous() != null ? review.getAnonymous() : 0);
        vo.setCreatedAt(review.getCreatedAt());

        // 处理图片
        if (review.getImages() != null && !review.getImages().isEmpty()) {
            try {
                List<String> images = objectMapper.readValue(review.getImages(),
                        new TypeReference<List<String>>() {});
                vo.setImages(images);
            } catch (JsonProcessingException e) {
                vo.setImages(new ArrayList<>());
            }
        } else {
            vo.setImages(new ArrayList<>());
        }

        // 获取评价者信息
        User reviewer = userMapper.selectById(review.getReviewerId());
        if (reviewer != null) {
            if (review.getAnonymous() != null && review.getAnonymous() == 1) {
                vo.setReviewerUsername("匿名用户");
                vo.setReviewerAvatar(null);
            } else {
                vo.setReviewerUsername(reviewer.getUsername());
                vo.setReviewerAvatar(reviewer.getAvatar());
            }
        }

        // 获取被评价者信息
        User targetUser = userMapper.selectById(review.getTargetUserId());
        if (targetUser != null) {
            vo.setTargetUsername(targetUser.getUsername());
            vo.setTargetAvatar(targetUser.getAvatar());
        }

        // 获取订单关联的商品信息
        Order order = orderMapper.selectById(review.getOrderId());
        if (order != null) {
            Product product = productMapper.selectById(order.getProductId());
            if (product != null) {
                vo.setProductTitle(product.getTitle());
                // 处理商品图片（取第一张）
                if (product.getImages() != null && !product.getImages().isEmpty()) {
                    try {
                        List<String> productImages = objectMapper.readValue(product.getImages(),
                                new TypeReference<List<String>>() {});
                        if (!productImages.isEmpty()) {
                            vo.setProductImage(productImages.get(0));
                        }
                    } catch (JsonProcessingException ignored) {
                    }
                }
            }
        }

        return vo;
    }

    /**
     * 用户评价统计
     */
    public static class UserReviewStats {
        private int totalReviews;
        private double averageRating;
        private int rating5Count;
        private int rating4Count;
        private int rating3Count;
        private int rating2Count;
        private int rating1Count;

        public int getTotalReviews() {
            return totalReviews;
        }

        public void setTotalReviews(int totalReviews) {
            this.totalReviews = totalReviews;
        }

        public double getAverageRating() {
            return averageRating;
        }

        public void setAverageRating(double averageRating) {
            this.averageRating = averageRating;
        }

        public int getRating5Count() {
            return rating5Count;
        }

        public void setRating5Count(int rating5Count) {
            this.rating5Count = rating5Count;
        }

        public int getRating4Count() {
            return rating4Count;
        }

        public void setRating4Count(int rating4Count) {
            this.rating4Count = rating4Count;
        }

        public int getRating3Count() {
            return rating3Count;
        }

        public void setRating3Count(int rating3Count) {
            this.rating3Count = rating3Count;
        }

        public int getRating2Count() {
            return rating2Count;
        }

        public void setRating2Count(int rating2Count) {
            this.rating2Count = rating2Count;
        }

        public int getRating1Count() {
            return rating1Count;
        }

        public void setRating1Count(int rating1Count) {
            this.rating1Count = rating1Count;
        }
    }
}

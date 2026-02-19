package com.campus.exchange.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.campus.exchange.util.Result;
import com.campus.exchange.dto.CreateReviewReportRequest;
import com.campus.exchange.dto.CreateReviewRequest;
import com.campus.exchange.dto.ReplyReviewRequest;
import com.campus.exchange.dto.ReviewReportVO;
import com.campus.exchange.dto.ReviewVO;
import com.campus.exchange.service.ReviewService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 评价控制器
 */
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /**
     * 创建评价
     */
    @PostMapping
    public Result<ReviewVO> createReview(
            @Validated @RequestBody CreateReviewRequest request) {
        Long userId = getCurrentUserId();
        ReviewVO review = reviewService.createReview(userId, request);
        return Result.success(review);
    }

    /**
     * 获取订单的评价列表
     */
    @GetMapping("/order/{orderId}")
    public Result<IPage<ReviewVO>> getOrderReviews(
            @PathVariable Long orderId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        IPage<ReviewVO> reviews = reviewService.getOrderReviews(orderId, page, size);
        return Result.success(reviews);
    }

    /**
     * 获取用户收到的评价列表
     */
    @GetMapping("/user/{userId}")
    public Result<IPage<ReviewVO>> getUserReviews(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        IPage<ReviewVO> reviews = reviewService.getUserReviews(userId, page, size);
        return Result.success(reviews);
    }

    /**
     * 获取用户评价统计
     */
    @GetMapping("/user/{userId}/stats")
    public Result<ReviewService.UserReviewStats> getUserReviewStats(@PathVariable Long userId) {
        ReviewService.UserReviewStats stats = reviewService.getUserReviewStats(userId);
        return Result.success(stats);
    }

    /**
     * 检查用户是否已评价订单
     */
    @GetMapping("/order/{orderId}/check")
    public Result<Boolean> checkReview(@PathVariable Long orderId) {
        Long userId = getCurrentUserId();
        boolean hasReviewed = reviewService.hasReviewed(userId, orderId);
        return Result.success(hasReviewed);
    }

    /**
     * 评价回复
     */
    @PostMapping("/reply")
    public Result<ReviewVO> replyReview(
            @Validated @RequestBody ReplyReviewRequest request) {
        Long userId = getCurrentUserId();
        ReviewVO review = reviewService.replyReview(userId, request);
        return Result.success(review);
    }

    /**
     * 举报评价
     */
    @PostMapping("/report")
    public Result<ReviewReportVO> reportReview(
            @Validated @RequestBody CreateReviewReportRequest request) {
        Long userId = getCurrentUserId();
        ReviewReportVO report = reviewService.reportReview(userId, request);
        return Result.success(report);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (Long) authentication.getPrincipal();
    }
}

package com.campus.exchange.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.exchange.util.Result;
import com.campus.exchange.dto.ProductVO;
import com.campus.exchange.service.ProductFavoriteService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class ProductFavoriteController {

    private final ProductFavoriteService favoriteService;

    public ProductFavoriteController(ProductFavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (Long) authentication.getPrincipal();
    }

    /**
     * 添加收藏
     */
    @PostMapping("/{productId}")
    public Result<Void> addFavorite(@PathVariable @Valid @NotNull Long productId) {
        Long userId = getCurrentUserId();
        favoriteService.addFavorite(userId, productId);
        return Result.success(null);
    }

    /**
     * 取消收藏
     */
    @DeleteMapping("/{productId}")
    public Result<Void> removeFavorite(@PathVariable @Valid @NotNull Long productId) {
        Long userId = getCurrentUserId();
        favoriteService.removeFavorite(userId, productId);
        return Result.success(null);
    }

    /**
     * 检查是否已收藏
     */
    @GetMapping("/check/{productId}")
    public Result<Boolean> checkFavorite(@PathVariable @Valid @NotNull Long productId) {
        Long userId = getCurrentUserId();
        boolean isFavorited = favoriteService.isFavorited(userId, productId);
        return Result.success(isFavorited);
    }

    /**
     * 获取用户收藏列表
     */
    @GetMapping
    public Result<Page<ProductVO>> getFavoriteList(
            @RequestParam(defaultValue = "1") @Valid @Min(1) Integer pageNum,
            @RequestParam(defaultValue = "10") @Valid @Min(1) Integer pageSize) {
        Long userId = getCurrentUserId();
        Page<ProductVO> result = favoriteService.getFavoriteList(userId, pageNum, pageSize);
        return Result.success(result);
    }

    /**
     * 获取用户收藏的商品ID列表（用于前端判断收藏状态）
     */
    @GetMapping("/ids")
    public Result<List<Long>> getFavoriteProductIds() {
        Long userId = getCurrentUserId();
        List<Long> ids = favoriteService.getFavoriteProductIds(userId);
        return Result.success(ids);
    }
}

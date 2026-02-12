package com.campus.exchange.controller;

import com.campus.exchange.dto.CreateProductRequest;
import com.campus.exchange.dto.ProductVO;
import com.campus.exchange.service.ProductService;
import com.campus.exchange.util.Result;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/**
 * 商品控制器
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * 发布商品（需要登录）
     */
    @PostMapping
    public Result<ProductVO> createProduct(@Valid @RequestBody CreateProductRequest request) {
        Long userId = getCurrentUserId();
        ProductVO product = productService.createProduct(userId, request);
        return Result.success(product);
    }

    /**
     * 获取商品详情
     */
    @GetMapping("/{id}")
    public Result<ProductVO> getProduct(@PathVariable Long id) {
        ProductVO product = productService.getProductById(id);
        return Result.success(product);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (Long) authentication.getPrincipal();
    }
}

package com.campus.exchange.controller;

import com.campus.exchange.dto.CreateProductRequest;
import com.campus.exchange.dto.ProductPageRequest;
import com.campus.exchange.dto.ProductPageResponse;
import com.campus.exchange.dto.ProductVO;
import com.campus.exchange.dto.UpdateProductRequest;
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
     * 分页查询商品列表
     */
    @GetMapping
    public Result<ProductPageResponse> getProductList(@ModelAttribute ProductPageRequest request) {
        ProductPageResponse response = productService.getProductList(request);
        return Result.success(response);
    }

    /**
     * 获取当前用户发布的商品列表
     */
    @GetMapping("/my")
    public Result<ProductPageResponse> getMyProducts(@ModelAttribute ProductPageRequest request) {
        Long userId = getCurrentUserId();
        ProductPageResponse response = productService.getMyProducts(userId, request);
        return Result.success(response);
    }

    /**
     * 获取商品详情
     */
    @GetMapping("/{id}")
    public Result<ProductVO> getProduct(@PathVariable Long id) {
        ProductVO product = productService.getProductById(id);
        return Result.success(product);
    }

    /**
     * 更新商品信息
     */
    @PutMapping("/{id}")
    public Result<ProductVO> updateProduct(@PathVariable Long id, @Valid @RequestBody UpdateProductRequest request) {
        Long userId = getCurrentUserId();
        ProductVO product = productService.updateProduct(id, userId, request);
        return Result.success(product);
    }

    /**
     * 删除商品（软删除）
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteProduct(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        productService.deleteProduct(id, userId);
        return Result.success(null);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (Long) authentication.getPrincipal();
    }
}

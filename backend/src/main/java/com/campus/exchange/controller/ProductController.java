package com.campus.exchange.controller;

import com.campus.exchange.dto.CreateProductRequest;
import com.campus.exchange.dto.ProductPageRequest;
import com.campus.exchange.dto.ProductPageResponse;
import com.campus.exchange.dto.ProductVO;
import com.campus.exchange.dto.UpdateProductRequest;
import com.campus.exchange.service.BrowseHistoryService;
import com.campus.exchange.service.ProductService;
import com.campus.exchange.util.Result;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * 商品控制器
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final BrowseHistoryService browseHistoryService;

    public ProductController(ProductService productService, BrowseHistoryService browseHistoryService) {
        this.productService = productService;
        this.browseHistoryService = browseHistoryService;
    }

    /**
     * 搜索建议（自动补全）
     */
    @GetMapping("/suggestions")
    public Result<List<String>> getSearchSuggestions(@RequestParam String keyword) {
        List<String> suggestions = productService.getSearchSuggestions(keyword);
        return Result.success(suggestions);
    }

    /**
     * 获取热门搜索词
     */
    @GetMapping("/popular-searches")
    public Result<List<String>> getPopularSearches() {
        List<String> popularSearches = productService.getPopularSearches();
        return Result.success(popularSearches);
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
     * 获取指定用户发布的商品列表
     */
    @GetMapping("/user/{userId}")
    public Result<List<ProductVO>> getProductsByUser(@PathVariable Long userId) {
        List<ProductVO> products = productService.getProductsByUserId(userId);
        return Result.success(products);
    }

    /**
     * 获取商品详情
     */
    @GetMapping("/{id}")
    public Result<ProductVO> getProduct(@PathVariable Long id) {
        ProductVO product = productService.getProductById(id);

        // 记录浏览历史（如果用户已登录）
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof Long) {
                Long userId = (Long) auth.getPrincipal();
                browseHistoryService.addBrowseHistory(userId, id);
            }
        } catch (Exception ignored) {
            // 忽略浏览历史记录失败
        }

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

    /**
     * 获取草稿箱商品列表
     */
    @GetMapping("/drafts")
    public Result<ProductPageResponse> getDrafts(@ModelAttribute ProductPageRequest request) {
        Long userId = getCurrentUserId();
        ProductPageResponse response = productService.getDrafts(userId, request);
        return Result.success(response);
    }

    /**
     * 设置商品置顶
     * @param id 商品ID
     * @param days 置顶天数，0或null表示取消置顶
     */
    @PostMapping("/{id}/top")
    public Result<ProductVO> setProductTop(@PathVariable Long id, @RequestParam(required = false) Integer days) {
        Long userId = getCurrentUserId();
        ProductVO product = productService.setProductTop(id, userId, days);
        return Result.success(product);
    }

    /**
     * 增加商品浏览量
     */
    @PostMapping("/{id}/view")
    public Result<Void> incrementViewCount(@PathVariable Long id) {
        productService.incrementViewCount(id);
        return Result.success(null);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (Long) authentication.getPrincipal();
    }
}

package com.campus.exchange.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.exchange.dto.ProductVO;
import com.campus.exchange.mapper.ProductFavoriteMapper;
import com.campus.exchange.mapper.ProductMapper;
import com.campus.exchange.model.Product;
import com.campus.exchange.model.ProductFavorite;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProductFavoriteService {

    private final ProductFavoriteMapper favoriteMapper;
    private final ProductMapper productMapper;
    private final ProductService productService;

    public ProductFavoriteService(ProductFavoriteMapper favoriteMapper,
                                  ProductMapper productMapper,
                                  ProductService productService) {
        this.favoriteMapper = favoriteMapper;
        this.productMapper = productMapper;
        this.productService = productService;
    }

    /**
     * 添加收藏
     */
    @Transactional
    public boolean addFavorite(Long userId, Long productId) {
        // 检查商品是否存在
        Product product = productMapper.selectById(productId);
        if (product == null) {
            throw new RuntimeException("商品不存在");
        }

        // 检查是否已收藏
        LambdaQueryWrapper<ProductFavorite> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductFavorite::getUserId, userId).eq(ProductFavorite::getProductId, productId);
        if (favoriteMapper.selectCount(wrapper) > 0) {
            throw new RuntimeException("已收藏该商品");
        }

        ProductFavorite favorite = new ProductFavorite();
        favorite.setUserId(userId);
        favorite.setProductId(productId);
        favorite.setCreateTime(LocalDateTime.now());
        return favoriteMapper.insert(favorite) > 0;
    }

    /**
     * 取消收藏
     */
    @Transactional
    public boolean removeFavorite(Long userId, Long productId) {
        LambdaQueryWrapper<ProductFavorite> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductFavorite::getUserId, userId).eq(ProductFavorite::getProductId, productId);
        return favoriteMapper.delete(wrapper) > 0;
    }

    /**
     * 检查是否已收藏
     */
    public boolean isFavorited(Long userId, Long productId) {
        LambdaQueryWrapper<ProductFavorite> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductFavorite::getUserId, userId).eq(ProductFavorite::getProductId, productId);
        return favoriteMapper.selectCount(wrapper) > 0;
    }

    /**
     * 获取用户收藏列表
     */
    public Page<ProductVO> getFavoriteList(Long userId, Integer pageNum, Integer pageSize) {
        List<Long> productIds = favoriteMapper.findProductIdsByUserId(userId);
        if (productIds == null || productIds.isEmpty()) {
            return new Page<>(pageNum, pageSize);
        }

        // 查询商品详情
        Page<Product> productPage = productService.getProductListByIds(productIds, pageNum, pageSize);
        Page<ProductVO> voPage = new Page<>(productPage.getCurrent(), productPage.getSize(), productPage.getTotal());

        List<ProductVO> voList = new ArrayList<>();
        for (Product product : productPage.getRecords()) {
            ProductVO vo = new ProductVO();
            BeanUtils.copyProperties(product, vo);
            vo.setIsFavorited(true);
            voList.add(vo);
        }
        voPage.setRecords(voList);
        return voPage;
    }

    /**
     * 获取用户收藏的商品ID列表
     */
    public List<Long> getFavoriteProductIds(Long userId) {
        return favoriteMapper.findProductIdsByUserId(userId);
    }
}

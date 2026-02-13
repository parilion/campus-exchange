package com.campus.exchange.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.exchange.dto.CreateProductRequest;
import com.campus.exchange.dto.ProductPageRequest;
import com.campus.exchange.dto.ProductPageResponse;
import com.campus.exchange.dto.ProductVO;
import com.campus.exchange.dto.UpdateProductRequest;
import com.campus.exchange.mapper.CategoryMapper;
import com.campus.exchange.mapper.ProductMapper;
import com.campus.exchange.model.Category;
import com.campus.exchange.model.Product;
import com.campus.exchange.model.User;
import com.campus.exchange.mapper.UserMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 商品服务层
 */
@Service
public class ProductService {

    private final ProductMapper productMapper;
    private final CategoryMapper categoryMapper;
    private final UserMapper userMapper;
    private final ObjectMapper objectMapper;

    public ProductService(ProductMapper productMapper,
                         CategoryMapper categoryMapper,
                         UserMapper userMapper,
                         ObjectMapper objectMapper) {
        this.productMapper = productMapper;
        this.categoryMapper = categoryMapper;
        this.userMapper = userMapper;
        this.objectMapper = objectMapper;
    }

    /**
     * 发布商品
     */
    public ProductVO createProduct(Long sellerId, CreateProductRequest request) {
        // 创建商品实体
        Product product = new Product();
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setCategoryId(request.getCategoryId());
        product.setCondition(request.getCondition());
        product.setStatus("ON_SALE");
        product.setSellerId(sellerId);
        product.setViewCount(0);
        product.setFavoriteCount(0);

        // 将图片列表转换为JSON字符串存储
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            try {
                product.setImages(objectMapper.writeValueAsString(request.getImages()));
            } catch (JsonProcessingException e) {
                product.setImages("[]");
            }
        } else {
            product.setImages("[]");
        }

        // 保存商品
        productMapper.insert(product);

        // 返回商品详情
        return getProductVO(product);
    }

    /**
     * 获取商品详情
     */
    public ProductVO getProductById(Long productId) {
        Product product = productMapper.selectById(productId);
        if (product == null) {
            throw new IllegalArgumentException("商品不存在");
        }
        return getProductVO(product);
    }

    /**
     * 分页查询商品列表
     */
    public ProductPageResponse getProductList(ProductPageRequest request) {
        // 创建分页对象
        Page<Product> page = new Page<>(request.getPage(), request.getPageSize());

        // 构建查询条件
        LambdaQueryWrapper<Product> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Product::getStatus, request.getStatus());

        // 分类筛选
        if (request.getCategoryId() != null) {
            queryWrapper.eq(Product::getCategoryId, request.getCategoryId());
        }

        // 排序
        String sortBy = request.getSortBy();
        boolean isAsc = "asc".equalsIgnoreCase(request.getSortOrder());

        if ("price".equals(sortBy)) {
            queryWrapper.orderBy(true, isAsc, Product::getPrice);
        } else if ("viewCount".equals(sortBy)) {
            queryWrapper.orderBy(true, isAsc, Product::getViewCount);
        } else {
            // 默认按创建时间排序
            queryWrapper.orderBy(true, isAsc, Product::getCreatedAt);
        }

        // 执行分页查询
        IPage<Product> productPage = productMapper.selectPage(page, queryWrapper);

        // 转换为VO列表
        List<ProductVO> productVOList = productPage.getRecords().stream()
                .map(this::getProductVO)
                .collect(Collectors.toList());

        // 构建响应
        ProductPageResponse response = new ProductPageResponse();
        response.setList(productVOList);
        response.setPage((int) productPage.getCurrent());
        response.setPageSize((int) productPage.getSize());
        response.setTotal(productPage.getTotal());
        response.setTotalPages((int) productPage.getPages());

        return response;
    }

    /**
     * 更新商品信息
     */
    public ProductVO updateProduct(Long productId, Long userId, UpdateProductRequest request) {
        // 查询商品
        Product product = productMapper.selectById(productId);
        if (product == null) {
            throw new IllegalArgumentException("商品不存在");
        }

        // 校验权限（只有卖家可以编辑自己的商品）
        if (!product.getSellerId().equals(userId)) {
            throw new IllegalArgumentException("无权限编辑此商品");
        }

        // 检查商品状态（已售商品不能编辑）
        if ("SOLD".equals(product.getStatus())) {
            throw new IllegalArgumentException("已售商品不能编辑");
        }

        // 更新非空字段
        if (request.getTitle() != null) {
            product.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getOriginalPrice() != null) {
            product.setOriginalPrice(request.getOriginalPrice());
        }
        if (request.getCategoryId() != null) {
            product.setCategoryId(request.getCategoryId());
        }
        if (request.getCondition() != null) {
            product.setCondition(request.getCondition());
        }
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }
        if (request.getTradeType() != null) {
            product.setTradeType(request.getTradeType());
        }
        if (request.getTradeLocation() != null) {
            product.setTradeLocation(request.getTradeLocation());
        }

        // 更新图片
        if (request.getImages() != null) {
            try {
                product.setImages(objectMapper.writeValueAsString(request.getImages()));
            } catch (JsonProcessingException e) {
                // 忽略
            }
        }

        // 保存更新
        productMapper.updateById(product);

        // 返回更新后的商品详情
        return getProductVO(product);
    }

    /**
     * 将 Product 转换为 ProductVO
     */
    private ProductVO getProductVO(Product product) {
        ProductVO vo = new ProductVO();
        vo.setId(product.getId());
        vo.setTitle(product.getTitle());
        vo.setDescription(product.getDescription());
        vo.setPrice(product.getPrice());
        vo.setOriginalPrice(product.getOriginalPrice());
        vo.setCategoryId(product.getCategoryId());
        vo.setCondition(product.getCondition());
        vo.setStatus(product.getStatus());
        vo.setTradeType(product.getTradeType());
        vo.setTradeLocation(product.getTradeLocation());
        vo.setImages(parseImages(product.getImages()));
        vo.setSellerId(product.getSellerId());
        vo.setViewCount(product.getViewCount());
        vo.setFavoriteCount(product.getFavoriteCount());
        vo.setCreatedAt(product.getCreatedAt());
        vo.setUpdatedAt(product.getUpdatedAt());

        // 查询分类名称
        if (product.getCategoryId() != null) {
            Category category = categoryMapper.selectById(product.getCategoryId());
            if (category != null) {
                vo.setCategoryName(category.getName());
            }
        }

        // 查询卖家信息
        User seller = userMapper.selectById(product.getSellerId());
        if (seller != null) {
            vo.setSellerNickname(seller.getNickname());
            vo.setSellerAvatar(seller.getAvatar());
        }

        return vo;
    }

    /**
     * 解析JSON图片字符串为列表
     */
    private List<String> parseImages(String imagesJson) {
        if (imagesJson == null || imagesJson.isEmpty()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(imagesJson,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }
}

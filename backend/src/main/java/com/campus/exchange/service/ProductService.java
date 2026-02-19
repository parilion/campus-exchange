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

import java.util.Arrays;
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
        // 如果是草稿，状态为DRAFT，否则为ON_SALE
        product.setStatus(request.getIsDraft() != null && request.getIsDraft() ? "DRAFT" : "ON_SALE");
        product.setSellerId(sellerId);
        product.setViewCount(0);
        product.setFavoriteCount(0);
        product.setIsTop(false);
        product.setIsDraft(request.getIsDraft() != null && request.getIsDraft());

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

        // 将标签列表转换为JSON字符串存储
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            try {
                product.setTags(objectMapper.writeValueAsString(request.getTags()));
            } catch (JsonProcessingException e) {
                product.setTags("[]");
            }
        } else {
            product.setTags("[]");
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
        // 增加浏览量
        if (product.getViewCount() == null) {
            product.setViewCount(0);
        }
        product.setViewCount(product.getViewCount() + 1);
        productMapper.updateById(product);
        return getProductVO(product);
    }

    /**
     * 增加商品浏览量
     */
    public void incrementViewCount(Long productId) {
        Product product = productMapper.selectById(productId);
        if (product != null) {
            if (product.getViewCount() == null) {
                product.setViewCount(0);
            }
            product.setViewCount(product.getViewCount() + 1);
            productMapper.updateById(product);
        }
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

        // 关键词搜索（标题或描述模糊匹配）
        if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) {
            String keyword = request.getKeyword().trim();
            queryWrapper.and(wrapper -> wrapper
                    .like(Product::getTitle, keyword)
                    .or()
                    .like(Product::getDescription, keyword));
        }

        // 价格区间筛选
        if (request.getMinPrice() != null) {
            queryWrapper.ge(Product::getPrice, request.getMinPrice());
        }
        if (request.getMaxPrice() != null) {
            queryWrapper.le(Product::getPrice, request.getMaxPrice());
        }

        // 新旧程度筛选
        if (request.getCondition() != null && !request.getCondition().trim().isEmpty()) {
            queryWrapper.eq(Product::getCondition, request.getCondition());
        }

        // 草稿筛选
        if (request.getIsDraft() != null) {
            queryWrapper.eq(Product::getIsDraft, request.getIsDraft());
        }

        // 排序
        String sortBy = request.getSortBy();
        boolean isAsc = "asc".equalsIgnoreCase(request.getSortOrder());

        if ("price".equals(sortBy)) {
            queryWrapper.orderBy(true, isAsc, Product::getPrice);
        } else if ("viewCount".equals(sortBy)) {
            queryWrapper.orderBy(true, isAsc, Product::getViewCount);
        } else if ("top".equals(sortBy)) {
            // 置顶商品排在最前面，然后按置顶过期时间排序
            queryWrapper.orderByDesc(Product::getIsTop);
            queryWrapper.orderByAsc(Product::getTopExpireAt);
            queryWrapper.orderByDesc(Product::getCreatedAt);
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
     * 获取搜索建议（自动补全）
     */
    public List<String> getSearchSuggestions(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return Collections.emptyList();
        }

        // 查询匹配的商品标题
        LambdaQueryWrapper<Product> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.like(Product::getTitle, keyword.trim())
                .eq(Product::getStatus, "ON_SALE")
                .orderByDesc(Product::getViewCount)
                .last("LIMIT 10");

        List<Product> products = productMapper.selectList(queryWrapper);

        // 提取标题去重
        return products.stream()
                .map(Product::getTitle)
                .distinct()
                .limit(10)
                .collect(Collectors.toList());
    }

    /**
     * 获取热门搜索词
     */
    public List<String> getPopularSearches() {
        // 预定义热门搜索词
        List<String> popularSearches = Arrays.asList(
                "教材",
                "课本",
                "二手书",
                "电动车",
                "自行车",
                "手机",
                "电脑",
                "笔记本",
                "耳机",
                "键盘",
                "鼠标",
                "显示器",
                "衣架",
                "台灯",
                "收纳"
        );
        return popularSearches;
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

        // 更新标签
        if (request.getTags() != null) {
            try {
                product.setTags(objectMapper.writeValueAsString(request.getTags()));
            } catch (JsonProcessingException e) {
                // 忽略
            }
        }

        // 更新草稿状态
        if (request.getIsDraft() != null) {
            product.setIsDraft(request.getIsDraft());
            // 草稿状态不改变主状态，保持原有状态
        }

        // 保存更新
        productMapper.updateById(product);

        // 返回更新后的商品详情
        return getProductVO(product);
    }

    /**
     * 删除商品（软删除）
     */
    public void deleteProduct(Long productId, Long userId) {
        // 查询商品
        Product product = productMapper.selectById(productId);
        if (product == null) {
            throw new IllegalArgumentException("商品不存在");
        }

        // 校验权限（只有卖家可以删除自己的商品）
        if (!product.getSellerId().equals(userId)) {
            throw new IllegalArgumentException("无权限删除此商品");
        }

        // 软删除：将状态设置为 DELETED
        product.setStatus("DELETED");
        productMapper.updateById(product);
    }

    /**
     * 获取当前用户发布的商品列表
     */
    public ProductPageResponse getMyProducts(Long userId, ProductPageRequest request) {
        // 创建分页对象
        Page<Product> page = new Page<>(request.getPage(), request.getPageSize());

        // 构建查询条件：查询当前用户的商品
        LambdaQueryWrapper<Product> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Product::getSellerId, userId);

        // 状态筛选（可选）
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            queryWrapper.eq(Product::getStatus, request.getStatus());
        }

        // 分类筛选
        if (request.getCategoryId() != null) {
            queryWrapper.eq(Product::getCategoryId, request.getCategoryId());
        }

        // 排序：默认按创建时间倒序
        String sortBy = request.getSortBy();
        boolean isAsc = "asc".equalsIgnoreCase(request.getSortOrder());
        if ("price".equals(sortBy)) {
            queryWrapper.orderBy(true, isAsc, Product::getPrice);
        } else {
            queryWrapper.orderBy(true, false, Product::getCreatedAt);
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
        vo.setIsTop(product.getIsTop() != null ? product.getIsTop() : false);
        vo.setTopExpireAt(product.getTopExpireAt());
        vo.setTags(parseTags(product.getTags()));
        vo.setIsDraft(product.getIsDraft() != null ? product.getIsDraft() : false);
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

    /**
     * 解析JSON标签字符串为列表
     */
    private List<String> parseTags(String tagsJson) {
        if (tagsJson == null || tagsJson.isEmpty()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(tagsJson,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }

    /**
     * 获取用户的草稿箱商品列表
     */
    public ProductPageResponse getDrafts(Long userId, ProductPageRequest request) {
        // 创建分页对象
        Page<Product> page = new Page<>(request.getPage(), request.getPageSize());

        // 构建查询条件：查询当前用户的草稿
        LambdaQueryWrapper<Product> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Product::getSellerId, userId);
        queryWrapper.eq(Product::getIsDraft, true);

        // 排序：默认按创建时间倒序
        queryWrapper.orderBy(true, false, Product::getCreatedAt);

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
     * 设置/取消商品置顶
     */
    public ProductVO setProductTop(Long productId, Long userId, Integer days) {
        Product product = productMapper.selectById(productId);
        if (product == null) {
            throw new IllegalArgumentException("商品不存在");
        }

        // 校验权限（只有卖家可以置顶自己的商品）
        if (!product.getSellerId().equals(userId)) {
            throw new IllegalArgumentException("无权限操作此商品");
        }

        if (days != null && days > 0) {
            // 置顶
            product.setIsTop(true);
            product.setTopExpireAt(java.time.LocalDateTime.now().plusDays(days));
        } else {
            // 取消置顶
            product.setIsTop(false);
            product.setTopExpireAt(null);
        }

        productMapper.updateById(product);
        return getProductVO(product);
    }

    /**
     * 根据ID列表获取商品列表（用于收藏列表）
     */
    public Page<Product> getProductListByIds(List<Long> productIds, Integer pageNum, Integer pageSize) {
        Page<Product> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Product> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.in(Product::getId, productIds);
        queryWrapper.eq(Product::getStatus, "ON_SALE");
        queryWrapper.orderByDesc(Product::getCreatedAt);
        return productMapper.selectPage(page, queryWrapper);
    }

    /**
     * 获取指定用户发布的商品列表（用于公开主页）
     */
    public List<ProductVO> getProductsByUserId(Long userId) {
        // 查询用户发布的在售商品（非草稿）
        LambdaQueryWrapper<Product> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Product::getSellerId, userId);
        queryWrapper.eq(Product::getStatus, "ON_SALE");
        queryWrapper.ne(Product::getIsDraft, true);
        queryWrapper.orderByDesc(Product::getCreatedAt);
        queryWrapper.last("LIMIT 20");

        List<Product> products = productMapper.selectList(queryWrapper);

        // 转换为VO列表
        return products.stream()
                .map(this::getProductVO)
                .collect(Collectors.toList());
    }
}

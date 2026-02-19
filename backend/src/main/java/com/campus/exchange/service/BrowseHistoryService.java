package com.campus.exchange.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.campus.exchange.mapper.BrowseHistoryMapper;
import com.campus.exchange.mapper.ProductMapper;
import com.campus.exchange.dto.ProductVO;
import com.campus.exchange.model.BrowseHistory;
import com.campus.exchange.model.Product;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class BrowseHistoryService {

    @Autowired
    private BrowseHistoryMapper browseHistoryMapper;

    @Autowired
    private ProductMapper productMapper;

    private static final int DEFAULT_LIMIT = 20;

    /**
     * 添加浏览记录
     */
    public void addBrowseHistory(Long userId, Long productId) {
        if (userId == null || productId == null) {
            return;
        }

        // 检查是否已存在浏览记录，存在则更新时间
        BrowseHistory existing = browseHistoryMapper.findByUserIdAndProductId(userId, productId);
        if (existing != null) {
            existing.setCreateTime(LocalDateTime.now());
            browseHistoryMapper.updateById(existing);
        } else {
            BrowseHistory history = new BrowseHistory();
            history.setUserId(userId);
            history.setProductId(productId);
            history.setCreateTime(LocalDateTime.now());
            browseHistoryMapper.insert(history);
        }
    }

    /**
     * 获取浏览历史列表
     */
    public List<ProductVO> getBrowseHistory(Long userId, Integer limit) {
        if (limit == null || limit <= 0) {
            limit = DEFAULT_LIMIT;
        }

        List<Long> productIds = browseHistoryMapper.findProductIdsByUserId(userId, limit);
        if (productIds == null || productIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<Product> products = productMapper.selectBatchIds(productIds);
        // 按productIds顺序排序
        Map<Long, Product> productMap = products.stream()
                .collect(Collectors.toMap(Product::getId, p -> p));
        return productIds.stream()
                .map(productMap::get)
                .filter(Objects::nonNull)
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    /**
     * 清空浏览历史
     */
    public void clearBrowseHistory(Long userId) {
        QueryWrapper<BrowseHistory> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        browseHistoryMapper.delete(wrapper);
    }

    /**
     * 删除单条浏览记录
     */
    public void deleteBrowseHistory(Long userId, Long productId) {
        QueryWrapper<BrowseHistory> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).eq("product_id", productId);
        browseHistoryMapper.delete(wrapper);
    }

    private ProductVO convertToVO(Product product) {
        ProductVO vo = new ProductVO();
        BeanUtils.copyProperties(product, vo);
        return vo;
    }
}

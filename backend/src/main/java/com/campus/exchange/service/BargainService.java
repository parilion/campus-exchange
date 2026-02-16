package com.campus.exchange.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.exchange.dto.BargainRequest;
import com.campus.exchange.dto.BargainVO;
import com.campus.exchange.mapper.BargainMapper;
import com.campus.exchange.mapper.ProductMapper;
import com.campus.exchange.mapper.UserMapper;
import com.campus.exchange.model.Bargain;
import com.campus.exchange.model.Product;
import com.campus.exchange.model.User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BargainService {

    private final BargainMapper bargainMapper;
    private final ProductMapper productMapper;
    private final UserMapper userMapper;

    public BargainService(BargainMapper bargainMapper, ProductMapper productMapper, UserMapper userMapper) {
        this.bargainMapper = bargainMapper;
        this.productMapper = productMapper;
        this.userMapper = userMapper;
    }

    /**
     * 发起议价
     */
    public BargainVO createBargain(Long userId, BargainRequest request) {
        Product product = productMapper.selectById(request.getProductId());
        if (product == null) {
            throw new RuntimeException("商品不存在");
        }

        if (product.getSellerId().equals(userId)) {
            throw new RuntimeException("不能对自己发布的商品议价");
        }

        // 创建议价记录
        Bargain bargain = new Bargain();
        bargain.setProductId(request.getProductId());
        bargain.setBargainerId(userId);
        bargain.setTargetUserId(product.getSellerId());
        bargain.setOriginalPrice(request.getOriginalPrice());
        bargain.setProposedPrice(request.getProposedPrice());
        bargain.setMessage(request.getMessage());
        bargain.setStatus("PENDING");

        bargainMapper.insert(bargain);

        return convertToVO(bargain);
    }

    /**
     * 获取商品的所有议价记录
     */
    public List<BargainVO> getBargainsByProduct(Long productId) {
        LambdaQueryWrapper<Bargain> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Bargain::getProductId, productId)
               .orderByDesc(Bargain::getCreatedAt);
        List<Bargain> bargains = bargainMapper.selectList(wrapper);
        return bargains.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    /**
     * 获取用户相关的议价列表
     */
    public IPage<BargainVO> getUserBargains(Long userId, int page, int size) {
        Page<Bargain> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Bargain> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(w -> w.eq(Bargain::getBargainerId, userId).or().eq(Bargain::getTargetUserId, userId))
               .orderByDesc(Bargain::getCreatedAt);

        IPage<Bargain> bargainPage = bargainMapper.selectPage(pageParam, wrapper);
        return bargainPage.convert(this::convertToVO);
    }

    /**
     * 接受议价
     */
    public BargainVO acceptBargain(Long bargainId, Long userId) {
        Bargain bargain = bargainMapper.selectById(bargainId);
        if (bargain == null) {
            throw new RuntimeException("议价记录不存在");
        }

        if (!bargain.getTargetUserId().equals(userId)) {
            throw new RuntimeException("只有卖家可以接受议价");
        }

        if (!"PENDING".equals(bargain.getStatus())) {
            throw new RuntimeException("议价已被处理");
        }

        bargain.setStatus("ACCEPTED");
        bargainMapper.updateById(bargain);

        return convertToVO(bargain);
    }

    /**
     * 拒绝议价
     */
    public BargainVO rejectBargain(Long bargainId, Long userId) {
        Bargain bargain = bargainMapper.selectById(bargainId);
        if (bargain == null) {
            throw new RuntimeException("议价记录不存在");
        }

        if (!bargain.getTargetUserId().equals(userId)) {
            throw new RuntimeException("只有卖家可以拒绝议价");
        }

        if (!"PENDING".equals(bargain.getStatus())) {
            throw new RuntimeException("议价已被处理");
        }

        bargain.setStatus("REJECTED");
        bargainMapper.updateById(bargain);

        return convertToVO(bargain);
    }

    /**
     * 取消议价
     */
    public BargainVO cancelBargain(Long bargainId, Long userId) {
        Bargain bargain = bargainMapper.selectById(bargainId);
        if (bargain == null) {
            throw new RuntimeException("议价记录不存在");
        }

        if (!bargain.getBargainerId().equals(userId)) {
            throw new RuntimeException("只有发起者可以取消议价");
        }

        if (!"PENDING".equals(bargain.getStatus())) {
            throw new RuntimeException("议价已被处理，无法取消");
        }

        bargain.setStatus("CANCELLED");
        bargainMapper.updateById(bargain);

        return convertToVO(bargain);
    }

    private BargainVO convertToVO(Bargain bargain) {
        BargainVO vo = new BargainVO();
        vo.setId(bargain.getId());
        vo.setProductId(bargain.getProductId());
        vo.setOrderId(bargain.getOrderId());
        vo.setBargainerId(bargain.getBargainerId());
        vo.setTargetUserId(bargain.getTargetUserId());
        vo.setOriginalPrice(bargain.getOriginalPrice());
        vo.setProposedPrice(bargain.getProposedPrice());
        vo.setStatus(bargain.getStatus());
        vo.setMessage(bargain.getMessage());
        vo.setCreatedAt(bargain.getCreatedAt());
        vo.setUpdatedAt(bargain.getUpdatedAt());

        // 获取商品信息
        if (bargain.getProductId() != null) {
            Product product = productMapper.selectById(bargain.getProductId());
            if (product != null) {
                vo.setProductTitle(product.getTitle());
                vo.setProductImage(product.getImages() != null && !product.getImages().isEmpty()
                    ? product.getImages().split(",")[0].replace("[\"", "").replace("\"]", "").replace("\"", "")
                    : null);
            }
        }

        // 获取买家昵称
        if (bargain.getBargainerId() != null) {
            User bargainer = userMapper.selectById(bargain.getBargainerId());
            if (bargainer != null) {
                vo.setBargainerNickname(bargainer.getNickname());
            }
        }

        // 获取目标用户昵称
        if (bargain.getTargetUserId() != null) {
            User targetUser = userMapper.selectById(bargain.getTargetUserId());
            if (targetUser != null) {
                vo.setTargetUserNickname(targetUser.getNickname());
            }
        }

        return vo;
    }
}

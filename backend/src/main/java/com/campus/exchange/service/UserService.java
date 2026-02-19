package com.campus.exchange.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.campus.exchange.dto.UpdateProfileRequest;
import com.campus.exchange.dto.UserPublicProfileVO;
import com.campus.exchange.mapper.OrderMapper;
import com.campus.exchange.mapper.ProductMapper;
import com.campus.exchange.mapper.UserMapper;
import com.campus.exchange.model.Order;
import com.campus.exchange.model.Product;
import com.campus.exchange.model.User;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserMapper userMapper;
    private final ProductMapper productMapper;
    private final OrderMapper orderMapper;

    public UserService(UserMapper userMapper, ProductMapper productMapper, OrderMapper orderMapper) {
        this.userMapper = userMapper;
        this.productMapper = productMapper;
        this.orderMapper = orderMapper;
    }

    /**
     * 获取用户详情
     */
    public User getUserById(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        user.setPassword(null);
        return user;
    }

    /**
     * 更新用户资料
     */
    public void updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }

        // 检查邮箱是否被其他用户使用
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            User existing = userMapper.selectOne(
                    new LambdaQueryWrapper<User>()
                            .eq(User::getEmail, request.getEmail())
                            .ne(User::getId, userId)
            );
            if (existing != null) {
                throw new IllegalArgumentException("该邮箱已被其他用户使用");
            }
            user.setEmail(request.getEmail());
        }

        // 更新其他字段
        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }

        userMapper.updateById(user);
    }

    /**
     * 更新用户头像
     */
    public String updateAvatar(Long userId, String avatarUrl) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        user.setAvatar(avatarUrl);
        userMapper.updateById(user);
        return avatarUrl;
    }

    /**
     * 获取用户公开主页信息
     */
    public UserPublicProfileVO getPublicProfile(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }

        UserPublicProfileVO profile = new UserPublicProfileVO();
        profile.setId(user.getId());
        profile.setUsername(user.getUsername());
        profile.setNickname(user.getNickname());
        profile.setAvatar(user.getAvatar());
        profile.setVerified(user.getVerified());
        profile.setCreatedAt(user.getCreatedAt());

        // 脱敏显示学号（只显示前3位和后3位）
        if (user.getStudentId() != null && user.getStudentId().length() >= 6) {
            String studentId = user.getStudentId();
            profile.setStudentId(studentId.substring(0, 3) + "***" + studentId.substring(studentId.length() - 3));
        } else {
            profile.setStudentId(null);
        }

        // 统计发布的商品数（已发布，非草稿）
        Long productCount = productMapper.selectCount(
                new LambdaQueryWrapper<Product>()
                        .eq(Product::getSellerId, userId)
                        .eq(Product::getStatus, "ON_SALE")
                        .ne(Product::getIsDraft, true)
        );
        profile.setProductCount(productCount.intValue());

        // 统计已售商品数（已完成订单）
        Long soldCount = orderMapper.selectCount(
                new LambdaQueryWrapper<Order>()
                        .eq(Order::getSellerId, userId)
                        .eq(Order::getStatus, "completed")
        );
        profile.setSoldCount(soldCount.intValue());

        // 计算好评率（暂时使用固定值，后续评价系统上线后需要查询评价表）
        // 暂时返回 100%
        profile.setPositiveRate(100);

        // 信用等级（根据已售数量计算）
        if (soldCount >= 50) {
            profile.setCreditLevel(5);
        } else if (soldCount >= 30) {
            profile.setCreditLevel(4);
        } else if (soldCount >= 15) {
            profile.setCreditLevel(3);
        } else if (soldCount >= 5) {
            profile.setCreditLevel(2);
        } else {
            profile.setCreditLevel(1);
        }

        return profile;
    }
}

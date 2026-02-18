package com.campus.exchange.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.campus.exchange.dto.UpdateProfileRequest;
import com.campus.exchange.mapper.UserMapper;
import com.campus.exchange.model.User;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserMapper userMapper;

    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
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
}

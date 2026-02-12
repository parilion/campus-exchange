package com.campus.exchange.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.campus.exchange.dto.LoginRequest;
import com.campus.exchange.dto.LoginResponse;
import com.campus.exchange.dto.RegisterRequest;
import com.campus.exchange.mapper.UserMapper;
import com.campus.exchange.model.User;
import com.campus.exchange.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserMapper userMapper, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * 用户注册
     */
    public LoginResponse register(RegisterRequest request) {
        // 检查用户名是否已存在
        User existing = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername())
        );
        if (existing != null) {
            throw new IllegalArgumentException("用户名已存在");
        }

        // 检查邮箱是否已存在
        existing = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getEmail, request.getEmail())
        );
        if (existing != null) {
            throw new IllegalArgumentException("邮箱已被注册");
        }

        // 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        user.setRole("USER");
        user.setEnabled(true);
        user.setVerified(false);
        userMapper.insert(user);

        // 生成 Token 并返回
        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole());
        return new LoginResponse(token, user.getId(), user.getUsername(),
                user.getNickname(), user.getAvatar(), user.getRole());
    }

    /**
     * 用户登录
     */
    public LoginResponse login(LoginRequest request) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername())
        );
        if (user == null) {
            throw new IllegalArgumentException("用户名或密码错误");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("用户名或密码错误");
        }

        if (!user.getEnabled()) {
            throw new IllegalArgumentException("账号已被禁用");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole());
        return new LoginResponse(token, user.getId(), user.getUsername(),
                user.getNickname(), user.getAvatar(), user.getRole());
    }

    /**
     * 刷新 Token
     */
    public LoginResponse refreshToken(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null || !user.getEnabled()) {
            throw new IllegalArgumentException("用户不存在或已被禁用");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole());
        return new LoginResponse(token, user.getId(), user.getUsername(),
                user.getNickname(), user.getAvatar(), user.getRole());
    }

    /**
     * 获取当前用户信息
     */
    public User getCurrentUser(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        user.setPassword(null); // 不返回密码
        return user;
    }
}

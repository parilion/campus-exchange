package com.campus.exchange.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.campus.exchange.dto.LoginRequest;
import com.campus.exchange.dto.LoginResponse;
import com.campus.exchange.dto.RegisterRequest;
import com.campus.exchange.dto.ResetPasswordRequest;
import com.campus.exchange.mapper.PasswordResetCodeMapper;
import com.campus.exchange.mapper.UserMapper;
import com.campus.exchange.model.PasswordResetCode;
import com.campus.exchange.model.User;
import com.campus.exchange.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class AuthService {

    private final UserMapper userMapper;
    private final PasswordResetCodeMapper passwordResetCodeMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final Random random = new Random();

    public AuthService(UserMapper userMapper, PasswordResetCodeMapper passwordResetCodeMapper,
                      PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.userMapper = userMapper;
        this.passwordResetCodeMapper = passwordResetCodeMapper;
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

    /**
     * 发送密码重置验证码
     */
    public void sendPasswordResetCode(String email) {
        System.out.println("sendPasswordResetCode called with email: " + email);
        // 检查邮箱是否已注册
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getEmail, email)
        );
        if (user == null) {
            System.out.println("User not found for email: " + email);
            throw new IllegalArgumentException("该邮箱未注册");
        }
        System.out.println("User found: " + user.getUsername());

        // 生成6位验证码
        String code = String.format("%06d", random.nextInt(1000000));
        System.out.println("Generated code: " + code);

        // 保存验证码，有效期15分钟
        PasswordResetCode resetCode = new PasswordResetCode();
        resetCode.setEmail(email);
        resetCode.setCode(code);
        resetCode.setExpireTime(LocalDateTime.now().plusMinutes(15));
        resetCode.setUsed(false);
        System.out.println("Inserting reset code...");
        passwordResetCodeMapper.insert(resetCode);
        System.out.println("Reset code inserted successfully");

        // TODO: 实际项目中需要发送邮件
        // 这里模拟发送，直接返回验证码（演示用）
        System.out.println("【Campus Exchange】您的验证码是：" + code + "，15分钟内有效");
    }

    /**
     * 验证验证码并重置密码
     */
    public void resetPassword(ResetPasswordRequest request) {
        // 检查邮箱是否已注册
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getEmail, request.getEmail())
        );
        if (user == null) {
            throw new IllegalArgumentException("该邮箱未注册");
        }

        // 查询最新的未使用的验证码
        PasswordResetCode resetCode = passwordResetCodeMapper.selectOne(
                new LambdaQueryWrapper<PasswordResetCode>()
                        .eq(PasswordResetCode::getEmail, request.getEmail())
                        .eq(PasswordResetCode::getCode, request.getCode())
                        .eq(PasswordResetCode::getUsed, false)
                        .orderByDesc(PasswordResetCode::getCreateTime)
                        .last("LIMIT 1")
        );

        if (resetCode == null) {
            throw new IllegalArgumentException("验证码无效");
        }

        if (resetCode.getExpireTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("验证码已过期");
        }

        // 更新密码
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userMapper.updateById(user);

        // 标记验证码已使用
        resetCode.setUsed(true);
        passwordResetCodeMapper.updateById(resetCode);
    }
}

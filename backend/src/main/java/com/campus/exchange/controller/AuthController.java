package com.campus.exchange.controller;

import com.campus.exchange.dto.ChangePasswordRequest;
import com.campus.exchange.dto.LoginRequest;
import com.campus.exchange.dto.LoginResponse;
import com.campus.exchange.dto.RegisterRequest;
import com.campus.exchange.dto.ResetPasswordRequest;
import com.campus.exchange.dto.SendResetCodeRequest;
import com.campus.exchange.model.User;
import com.campus.exchange.service.AuthService;
import com.campus.exchange.util.Result;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        LoginResponse response = authService.register(request);
        return Result.success(response);
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return Result.success(response);
    }

    /**
     * 刷新 Token（需要认证）
     */
    @PostMapping("/refresh")
    public Result<LoginResponse> refreshToken() {
        Long userId = getCurrentUserId();
        LoginResponse response = authService.refreshToken(userId);
        return Result.success(response);
    }

    /**
     * 获取当前用户信息（需要认证）
     */
    @GetMapping("/me")
    public Result<User> getCurrentUser() {
        Long userId = getCurrentUserId();
        User user = authService.getCurrentUser(userId);
        return Result.success(user);
    }

    /**
     * 退出登录（前端清除 Token 即可，后端返回成功）
     */
    @PostMapping("/logout")
    public Result<Void> logout() {
        return Result.success();
    }

    /**
     * 发送密码重置验证码（无需登录）
     */
    @PostMapping("/forgot-password/send-code")
    public Result<Void> sendPasswordResetCode(@Valid @RequestBody SendResetCodeRequest request) {
        authService.sendPasswordResetCode(request.getEmail());
        return Result.success();
    }

    /**
     * 验证验证码并重置密码（无需登录）
     */
    @PostMapping("/forgot-password/reset")
    public Result<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return Result.success();
    }

    /**
     * 修改密码（需要登录）
     */
    @PostMapping("/change-password")
    public Result<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Long userId = getCurrentUserId();
        authService.changePassword(userId, request.getOldPassword(), request.getNewPassword());
        return Result.success();
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (Long) authentication.getPrincipal();
    }
}

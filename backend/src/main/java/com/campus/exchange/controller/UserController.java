package com.campus.exchange.controller;

import com.campus.exchange.dto.ProductVO;
import com.campus.exchange.dto.UpdateProfileRequest;
import com.campus.exchange.dto.UserPublicProfileVO;
import com.campus.exchange.model.User;
import com.campus.exchange.service.BrowseHistoryService;
import com.campus.exchange.service.UserService;
import com.campus.exchange.util.Result;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final BrowseHistoryService browseHistoryService;

    public UserController(UserService userService, BrowseHistoryService browseHistoryService) {
        this.userService = userService;
        this.browseHistoryService = browseHistoryService;
    }

    /**
     * 获取当前用户资料
     */
    @GetMapping("/profile")
    public Result<User> getProfile() {
        Long userId = getCurrentUserId();
        User user = userService.getUserById(userId);
        return Result.success(user);
    }

    /**
     * 获取指定用户详情
     */
    @GetMapping("/{userId}")
    public Result<User> getUserById(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        return Result.success(user);
    }

    /**
     * 获取用户公开主页信息
     */
    @GetMapping("/{userId}/public")
    public Result<UserPublicProfileVO> getUserPublicProfile(@PathVariable Long userId) {
        UserPublicProfileVO profile = userService.getPublicProfile(userId);
        return Result.success(profile);
    }

    /**
     * 更新当前用户资料
     */
    @PutMapping("/profile")
    public Result<Void> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Long userId = getCurrentUserId();
        userService.updateProfile(userId, request);
        return Result.success();
    }

    /**
     * 上传头像
     */
    @PostMapping("/avatar")
    public Result<String> uploadAvatar(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("上传文件不能为空");
        }

        // 检查文件大小 (最大 2MB)
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new IllegalArgumentException("文件大小不能超过 2MB");
        }

        // 检查文件类型
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("只能上传图片文件");
        }

        // 生成文件名
        String originalFilename = file.getOriginalFilename();
        String suffix = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + suffix;

        // 保存文件
        try {
            String uploadDir = System.getProperty("user.dir") + "/uploads/avatars";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            File destFile = new File(uploadDir, filename);
            file.transferTo(destFile);

            // 返回文件访问URL
            String avatarUrl = "/api/images/avatars/" + filename;
            Long userId = getCurrentUserId();
            userService.updateAvatar(userId, avatarUrl);

            return Result.success(avatarUrl);
        } catch (IOException e) {
            throw new IllegalArgumentException("文件上传失败: " + e.getMessage());
        }
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }
        // 如果是匿名用户，抛出异常
        throw new IllegalArgumentException("用户未登录");
    }

    /**
     * 获取浏览历史列表
     */
    @GetMapping("/browse-history")
    public Result<List<ProductVO>> getBrowseHistory(@RequestParam(defaultValue = "20") Integer limit) {
        Long userId = getCurrentUserId();
        List<ProductVO> history = browseHistoryService.getBrowseHistory(userId, limit);
        return Result.success(history);
    }

    /**
     * 清空浏览历史
     */
    @DeleteMapping("/browse-history")
    public Result<Void> clearBrowseHistory() {
        Long userId = getCurrentUserId();
        browseHistoryService.clearBrowseHistory(userId);
        return Result.success();
    }

    /**
     * 删除单条浏览记录
     */
    @DeleteMapping("/browse-history/{productId}")
    public Result<Void> deleteBrowseHistory(@PathVariable Long productId) {
        Long userId = getCurrentUserId();
        browseHistoryService.deleteBrowseHistory(userId, productId);
        return Result.success();
    }
}

package com.campus.exchange.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.exchange.dto.UserPageRequest;
import com.campus.exchange.mapper.UserMapper;
import com.campus.exchange.model.User;
import com.campus.exchange.util.Result;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserMapper userMapper;

    public AdminController(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    /**
     * 获取当前管理员信息
     */
    @GetMapping("/me")
    public Result<User> getAdminInfo() {
        Long userId = getCurrentUserId();
        User user = userMapper.selectById(userId);
        if (user != null) {
            user.setPassword(null);
        }
        return Result.success(user);
    }

    /**
     * 获取用户列表（分页）
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Page<User>> getUserList(UserPageRequest request) {
        Page<User> page = new Page<>(request.getPage(), request.getPageSize());
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();

        // 关键词搜索（用户名/邮箱/手机号）
        if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
            wrapper.and(w -> w
                    .like(User::getUsername, request.getKeyword())
                    .or()
                    .like(User::getEmail, request.getKeyword())
                    .or()
                    .like(User::getPhone, request.getKeyword())
            );
        }

        // 按角色筛选
        if (request.getRole() != null && !request.getRole().isEmpty()) {
            wrapper.eq(User::getRole, request.getRole());
        }

        // 按状态筛选
        if (request.getEnabled() != null) {
            wrapper.eq(User::getEnabled, request.getEnabled());
        }

        // 按注册时间筛选
        if (request.getStartDate() != null) {
            wrapper.ge(User::getCreatedAt, request.getStartDate());
        }
        if (request.getEndDate() != null) {
            wrapper.le(User::getCreatedAt, request.getEndDate());
        }

        wrapper.orderByDesc(User::getCreatedAt);
        Page<User> result = userMapper.selectPage(page, wrapper);

        // 隐藏密码
        result.getRecords().forEach(user -> user.setPassword(null));

        return Result.success(result);
    }

    /**
     * 获取所有用户列表（不分页，用于下拉选择等）
     */
    @GetMapping("/users/all")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<List<User>> getAllUsers() {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.select(User.class, info -> !"password".equals(info.getColumn()));
        wrapper.orderByDesc(User::getCreatedAt);
        List<User> users = userMapper.selectList(wrapper);
        return Result.success(users);
    }

    /**
     * 获取用户详情
     */
    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<User> getUserDetail(@PathVariable Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            return Result.error("用户不存在");
        }
        user.setPassword(null);
        return Result.success(user);
    }

    /**
     * 封禁用户
     */
    @PostMapping("/users/{id}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> banUser(@PathVariable Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            return Result.error("用户不存在");
        }

        // 不能封禁管理员
        if ("ADMIN".equals(user.getRole())) {
            return Result.error("不能封禁管理员账号");
        }

        user.setEnabled(false);
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.updateById(user);

        return Result.success();
    }

    /**
     * 解封用户
     */
    @PostMapping("/users/{id}/unban")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> unbanUser(@PathVariable Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            return Result.error("用户不存在");
        }

        user.setEnabled(true);
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.updateById(user);

        return Result.success();
    }

    /**
     * 删除用户（软删除）
     */
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteUser(@PathVariable Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            return Result.error("用户不存在");
        }

        // 不能删除管理员
        if ("ADMIN".equals(user.getRole())) {
            return Result.error("不能删除管理员账号");
        }

        userMapper.deleteById(id);
        return Result.success();
    }

    /**
     * 设置用户为管理员
     */
    @PostMapping("/users/{id}/set-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> setUserAsAdmin(@PathVariable Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            return Result.error("用户不存在");
        }

        user.setRole("ADMIN");
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.updateById(user);

        return Result.success();
    }

    /**
     * 取消用户管理员权限
     */
    @PostMapping("/users/{id}/remove-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> removeUserAdmin(@PathVariable Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            return Result.error("用户不存在");
        }

        // 不能取消自己的管理员权限
        Long currentUserId = getCurrentUserId();
        if (currentUserId.equals(id)) {
            return Result.error("不能取消自己的管理员权限");
        }

        user.setRole("USER");
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.updateById(user);

        return Result.success();
    }

    /**
     * 获取用户统计数据
     */
    @GetMapping("/users/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<UserStats> getUserStats() {
        Long totalUsers = userMapper.selectCount(null);
        Long totalEnabled = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getEnabled, true)
        );
        Long totalDisabled = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getEnabled, false)
        );
        Long totalAdmins = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getRole, "ADMIN")
        );
        Long totalVerified = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getVerified, true)
        );

        UserStats stats = new UserStats();
        stats.setTotalUsers(totalUsers);
        stats.setTotalEnabled(totalEnabled);
        stats.setTotalDisabled(totalDisabled);
        stats.setTotalAdmins(totalAdmins);
        stats.setTotalVerified(totalVerified);

        return Result.success(stats);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (Long) authentication.getPrincipal();
    }

    // 用户统计数据内部类
    public static class UserStats {
        private Long totalUsers;
        private Long totalEnabled;
        private Long totalDisabled;
        private Long totalAdmins;
        private Long totalVerified;

        public Long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
        public Long getTotalEnabled() { return totalEnabled; }
        public void setTotalEnabled(Long totalEnabled) { this.totalEnabled = totalEnabled; }
        public Long getTotalDisabled() { return totalDisabled; }
        public void setTotalDisabled(Long totalDisabled) { this.totalDisabled = totalDisabled; }
        public Long getTotalAdmins() { return totalAdmins; }
        public void setTotalAdmins(Long totalAdmins) { this.totalAdmins = totalAdmins; }
        public Long getTotalVerified() { return totalVerified; }
        public void setTotalVerified(Long totalVerified) { this.totalVerified = totalVerified; }
    }
}

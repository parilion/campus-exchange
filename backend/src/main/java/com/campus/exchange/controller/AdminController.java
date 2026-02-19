package com.campus.exchange.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.exchange.dto.*;
import com.campus.exchange.mapper.ProductMapper;
import com.campus.exchange.mapper.ProductReportMapper;
import com.campus.exchange.mapper.UserMapper;
import com.campus.exchange.model.Product;
import com.campus.exchange.model.ProductReport;
import com.campus.exchange.model.User;
import com.campus.exchange.util.Result;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserMapper userMapper;
    private final ProductMapper productMapper;
    private final ProductReportMapper productReportMapper;

    public AdminController(UserMapper userMapper, ProductMapper productMapper, ProductReportMapper productReportMapper) {
        this.userMapper = userMapper;
        this.productMapper = productMapper;
        this.productReportMapper = productReportMapper;
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

    // ========== 商品管理 ==========

    /**
     * 获取商品列表（支持审核状态筛选）
     */
    @GetMapping("/products")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Page<Product>> getProductList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String auditStatus,
            @RequestParam(required = false) String status) {

        Page<Product> pageObj = new Page<>(page, pageSize);
        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();

        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Product::getTitle, keyword);
        }
        if (auditStatus != null && !auditStatus.isEmpty()) {
            wrapper.eq(Product::getAuditStatus, auditStatus);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Product::getStatus, status);
        }
        wrapper.orderByDesc(Product::getCreatedAt);

        Page<Product> result = productMapper.selectPage(pageObj, wrapper);
        return Result.success(result);
    }

    /**
     * 审核商品（通过/拒绝）
     */
    @PostMapping("/products/{id}/audit")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> auditProduct(@PathVariable Long id, @Valid @RequestBody AuditProductRequest req) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            return Result.error("商品不存在");
        }
        if ("APPROVE".equals(req.getAction())) {
            product.setAuditStatus("APPROVED");
            product.setRejectReason(null);
        } else if ("REJECT".equals(req.getAction())) {
            product.setAuditStatus("REJECTED");
            product.setRejectReason(req.getRejectReason());
            // 拒绝后自动下架
            product.setStatus("OFF_SHELF");
        } else {
            return Result.error("无效的审核操作");
        }
        product.setUpdatedAt(LocalDateTime.now());
        productMapper.updateById(product);
        return Result.success();
    }

    /**
     * 强制下架商品
     */
    @PostMapping("/products/{id}/force-offline")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> forceOffline(@PathVariable Long id, @Valid @RequestBody ForceOfflineRequest req) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            return Result.error("商品不存在");
        }
        product.setStatus("OFF_SHELF");
        product.setForceOfflineReason(req.getReason());
        product.setUpdatedAt(LocalDateTime.now());
        productMapper.updateById(product);
        return Result.success();
    }

    /**
     * 删除商品（管理员）
     */
    @DeleteMapping("/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteProduct(@PathVariable Long id) {
        Product product = productMapper.selectById(id);
        if (product == null) {
            return Result.error("商品不存在");
        }
        productMapper.deleteById(id);
        return Result.success();
    }

    /**
     * 获取商品统计数据
     */
    @GetMapping("/products/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Map<String, Long>> getProductStats() {
        Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("total", productMapper.selectCount(new LambdaQueryWrapper<Product>()));
        stats.put("onSale", productMapper.selectCount(new LambdaQueryWrapper<Product>().eq(Product::getStatus, "ON_SALE")));
        stats.put("pending", productMapper.selectCount(new LambdaQueryWrapper<Product>().eq(Product::getAuditStatus, "PENDING")));
        stats.put("rejected", productMapper.selectCount(new LambdaQueryWrapper<Product>().eq(Product::getAuditStatus, "REJECTED")));
        return Result.success(stats);
    }

    // ========== 举报处理 ==========

    /**
     * 获取商品举报列表
     */
    @GetMapping("/reports")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Page<ProductReportVO>> getReportList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String status) {

        Page<ProductReport> pageObj = new Page<>(page, pageSize);
        LambdaQueryWrapper<ProductReport> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(ProductReport::getStatus, status);
        }
        wrapper.orderByDesc(ProductReport::getCreatedAt);

        Page<ProductReport> reportPage = productReportMapper.selectPage(pageObj, wrapper);

        // 组装VO
        List<ProductReportVO> voList = new ArrayList<>();
        for (ProductReport report : reportPage.getRecords()) {
            ProductReportVO vo = new ProductReportVO();
            vo.setId(report.getId());
            vo.setProductId(report.getProductId());
            vo.setReporterId(report.getReporterId());
            vo.setReason(report.getReason());
            vo.setDescription(report.getDescription());
            vo.setStatus(report.getStatus());
            vo.setHandleResult(report.getHandleResult());
            vo.setHandledAt(report.getHandledAt());
            vo.setCreatedAt(report.getCreatedAt());

            // 查询商品信息
            Product product = productMapper.selectById(report.getProductId());
            if (product != null) {
                vo.setProductTitle(product.getTitle());
                vo.setProductImages(product.getImages());
            }

            // 查询举报者信息
            User reporter = userMapper.selectById(report.getReporterId());
            if (reporter != null) {
                vo.setReporterUsername(reporter.getUsername());
            }

            voList.add(vo);
        }

        Page<ProductReportVO> resultPage = new Page<>(reportPage.getCurrent(), reportPage.getSize(), reportPage.getTotal());
        resultPage.setRecords(voList);
        return Result.success(resultPage);
    }

    /**
     * 处理商品举报
     */
    @PostMapping("/reports/{id}/handle")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> handleReport(@PathVariable Long id, @Valid @RequestBody HandleReportRequest req) {
        ProductReport report = productReportMapper.selectById(id);
        if (report == null) {
            return Result.error("举报记录不存在");
        }

        report.setHandleResult(req.getHandleResult());
        report.setHandledAt(LocalDateTime.now());

        if ("RESOLVE".equals(req.getAction())) {
            report.setStatus("RESOLVED");
        } else if ("IGNORE".equals(req.getAction())) {
            report.setStatus("IGNORED");
        } else {
            return Result.error("无效的处理操作");
        }

        productReportMapper.updateById(report);

        // 若勾选了同时下架商品
        if (Boolean.TRUE.equals(req.getOfflineProduct())) {
            Product product = productMapper.selectById(report.getProductId());
            if (product != null) {
                product.setStatus("OFF_SHELF");
                product.setForceOfflineReason("举报处理下架：" + (req.getHandleResult() != null ? req.getHandleResult() : ""));
                product.setUpdatedAt(LocalDateTime.now());
                productMapper.updateById(product);
            }
        }

        return Result.success();
    }

    /**
     * 获取举报统计
     */
    @GetMapping("/reports/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Map<String, Long>> getReportStats() {
        Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("total", productReportMapper.selectCount(new LambdaQueryWrapper<ProductReport>()));
        stats.put("pending", productReportMapper.selectCount(new LambdaQueryWrapper<ProductReport>().eq(ProductReport::getStatus, "PENDING")));
        stats.put("resolved", productReportMapper.selectCount(new LambdaQueryWrapper<ProductReport>().eq(ProductReport::getStatus, "RESOLVED")));
        stats.put("ignored", productReportMapper.selectCount(new LambdaQueryWrapper<ProductReport>().eq(ProductReport::getStatus, "IGNORED")));
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

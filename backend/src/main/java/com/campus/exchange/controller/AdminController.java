package com.campus.exchange.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.exchange.dto.*;
import com.campus.exchange.mapper.*;
import com.campus.exchange.model.*;
import com.campus.exchange.util.Result;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserMapper userMapper;
    private final ProductMapper productMapper;
    private final ProductReportMapper productReportMapper;
    private final CategoryMapper categoryMapper;
    private final AnnouncementMapper announcementMapper;
    private final CarouselMapper carouselMapper;
    private final OrderMapper orderMapper;
    private final ReviewMapper reviewMapper;
    private final SystemMessageMapper systemMessageMapper;

    public AdminController(UserMapper userMapper, ProductMapper productMapper, ProductReportMapper productReportMapper,
                          CategoryMapper categoryMapper, AnnouncementMapper announcementMapper, CarouselMapper carouselMapper,
                          OrderMapper orderMapper, ReviewMapper reviewMapper, SystemMessageMapper systemMessageMapper) {
        this.userMapper = userMapper;
        this.productMapper = productMapper;
        this.productReportMapper = productReportMapper;
        this.categoryMapper = categoryMapper;
        this.announcementMapper = announcementMapper;
        this.carouselMapper = carouselMapper;
        this.orderMapper = orderMapper;
        this.reviewMapper = reviewMapper;
        this.systemMessageMapper = systemMessageMapper;
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

    // ========== 分类管理 ==========

    /**
     * 获取分类列表
     */
    @GetMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<List<Category>> getCategoryList() {
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(Category::getSort);
        List<Category> categories = categoryMapper.selectList(wrapper);
        return Result.success(categories);
    }

    /**
     * 创建分类
     */
    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> createCategory(@Valid @RequestBody Category category) {
        category.setCreatedAt(LocalDateTime.now());
        categoryMapper.insert(category);
        return Result.success();
    }

    /**
     * 更新分类
     */
    @PutMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> updateCategory(@PathVariable Long id, @Valid @RequestBody Category category) {
        Category existing = categoryMapper.selectById(id);
        if (existing == null) {
            return Result.error("分类不存在");
        }
        category.setId(id);
        category.setUpdatedAt(LocalDateTime.now());
        categoryMapper.updateById(category);
        return Result.success();
    }

    /**
     * 删除分类
     */
    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            return Result.error("分类不存在");
        }
        categoryMapper.deleteById(id);
        return Result.success();
    }

    // ========== 公告管理 ==========

    /**
     * 获取公告列表
     */
    @GetMapping("/announcements")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Page<Announcement>> getAnnouncementList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type) {

        Page<Announcement> pageObj = new Page<>(page, pageSize);
        LambdaQueryWrapper<Announcement> wrapper = new LambdaQueryWrapper<>();

        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w
                    .like(Announcement::getTitle, keyword)
                    .or()
                    .like(Announcement::getContent, keyword)
            );
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Announcement::getStatus, status);
        }
        if (type != null && !type.isEmpty()) {
            wrapper.eq(Announcement::getType, type);
        }
        wrapper.orderByDesc(Announcement::getPriority, Announcement::getCreatedAt);

        Page<Announcement> result = announcementMapper.selectPage(pageObj, wrapper);
        return Result.success(result);
    }

    /**
     * 获取公告详情
     */
    @GetMapping("/announcements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Announcement> getAnnouncementDetail(@PathVariable Long id) {
        Announcement announcement = announcementMapper.selectById(id);
        if (announcement == null) {
            return Result.error("公告不存在");
        }
        return Result.success(announcement);
    }

    /**
     * 创建公告
     */
    @PostMapping("/announcements")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> createAnnouncement(@Valid @RequestBody Announcement announcement) {
        announcement.setCreatedBy(getCurrentUserId());
        announcement.setCreatedAt(LocalDateTime.now());
        announcement.setUpdatedAt(LocalDateTime.now());
        announcementMapper.insert(announcement);
        return Result.success();
    }

    /**
     * 更新公告
     */
    @PutMapping("/announcements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> updateAnnouncement(@PathVariable Long id, @Valid @RequestBody Announcement announcement) {
        Announcement existing = announcementMapper.selectById(id);
        if (existing == null) {
            return Result.error("公告不存在");
        }
        announcement.setId(id);
        announcement.setUpdatedAt(LocalDateTime.now());
        announcementMapper.updateById(announcement);
        return Result.success();
    }

    /**
     * 删除公告
     */
    @DeleteMapping("/announcements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteAnnouncement(@PathVariable Long id) {
        Announcement announcement = announcementMapper.selectById(id);
        if (announcement == null) {
            return Result.error("公告不存在");
        }
        announcementMapper.deleteById(id);
        return Result.success();
    }

    /**
     * 发布公告
     */
    @PostMapping("/announcements/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> publishAnnouncement(@PathVariable Long id) {
        Announcement announcement = announcementMapper.selectById(id);
        if (announcement == null) {
            return Result.error("公告不存在");
        }
        announcement.setStatus("PUBLISHED");
        announcement.setUpdatedAt(LocalDateTime.now());
        announcementMapper.updateById(announcement);
        return Result.success();
    }

    /**
     * 获取公告统计
     */
    @GetMapping("/announcements/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Map<String, Long>> getAnnouncementStats() {
        Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("total", announcementMapper.selectCount(new LambdaQueryWrapper<Announcement>()));
        stats.put("published", announcementMapper.selectCount(new LambdaQueryWrapper<Announcement>().eq(Announcement::getStatus, "PUBLISHED")));
        stats.put("draft", announcementMapper.selectCount(new LambdaQueryWrapper<Announcement>().eq(Announcement::getStatus, "DRAFT")));
        stats.put("archived", announcementMapper.selectCount(new LambdaQueryWrapper<Announcement>().eq(Announcement::getStatus, "ARCHIVED")));
        return Result.success(stats);
    }

    // ========== 轮播图管理 ==========

    /**
     * 获取轮播图列表
     */
    @GetMapping("/carousels")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Page<Carousel>> getCarouselList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String position) {

        Page<Carousel> pageObj = new Page<>(page, pageSize);
        LambdaQueryWrapper<Carousel> wrapper = new LambdaQueryWrapper<>();

        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Carousel::getTitle, keyword);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Carousel::getStatus, status);
        }
        if (position != null && !position.isEmpty()) {
            wrapper.eq(Carousel::getPosition, position);
        }
        wrapper.orderByDesc(Carousel::getSort, Carousel::getCreatedAt);

        Page<Carousel> result = carouselMapper.selectPage(pageObj, wrapper);
        return Result.success(result);
    }

    /**
     * 获取轮播图详情
     */
    @GetMapping("/carousels/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Carousel> getCarouselDetail(@PathVariable Long id) {
        Carousel carousel = carouselMapper.selectById(id);
        if (carousel == null) {
            return Result.error("轮播图不存在");
        }
        return Result.success(carousel);
    }

    /**
     * 创建轮播图
     */
    @PostMapping("/carousels")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> createCarousel(@Valid @RequestBody Carousel carousel) {
        carousel.setCreatedBy(getCurrentUserId());
        carousel.setClickCount(0);
        carousel.setCreatedAt(LocalDateTime.now());
        carousel.setUpdatedAt(LocalDateTime.now());
        carouselMapper.insert(carousel);
        return Result.success();
    }

    /**
     * 更新轮播图
     */
    @PutMapping("/carousels/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> updateCarousel(@PathVariable Long id, @Valid @RequestBody Carousel carousel) {
        Carousel existing = carouselMapper.selectById(id);
        if (existing == null) {
            return Result.error("轮播图不存在");
        }
        carousel.setId(id);
        carousel.setUpdatedAt(LocalDateTime.now());
        carouselMapper.updateById(carousel);
        return Result.success();
    }

    /**
     * 删除轮播图
     */
    @DeleteMapping("/carousels/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteCarousel(@PathVariable Long id) {
        Carousel carousel = carouselMapper.selectById(id);
        if (carousel == null) {
            return Result.error("轮播图不存在");
        }
        carouselMapper.deleteById(id);
        return Result.success();
    }

    /**
     * 发布轮播图
     */
    @PostMapping("/carousels/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> publishCarousel(@PathVariable Long id) {
        Carousel carousel = carouselMapper.selectById(id);
        if (carousel == null) {
            return Result.error("轮播图不存在");
        }
        carousel.setStatus("PUBLISHED");
        carousel.setUpdatedAt(LocalDateTime.now());
        carouselMapper.updateById(carousel);
        return Result.success();
    }

    /**
     * 获取轮播图统计
     */
    @GetMapping("/carousels/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Map<String, Long>> getCarouselStats() {
        Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("total", carouselMapper.selectCount(new LambdaQueryWrapper<Carousel>()));
        stats.put("published", carouselMapper.selectCount(new LambdaQueryWrapper<Carousel>().eq(Carousel::getStatus, "PUBLISHED")));
        stats.put("draft", carouselMapper.selectCount(new LambdaQueryWrapper<Carousel>().eq(Carousel::getStatus, "DRAFT")));
        stats.put("disabled", carouselMapper.selectCount(new LambdaQueryWrapper<Carousel>().eq(Carousel::getStatus, "DISABLED")));
        return Result.success(stats);
    }

    // ========== 订单管理 ==========

    /**
     * 获取订单列表（分页）
     */
    @GetMapping("/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Page<Order>> getOrderList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String keyword) {

        Page<Order> pageObj = new Page<>(page, pageSize);
        LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<>();

        if (status != null && !status.isEmpty()) {
            wrapper.eq(Order::getStatus, status);
        }
        if (startDate != null && !startDate.isEmpty()) {
            wrapper.ge(Order::getCreatedAt, LocalDateTime.parse(startDate + "T00:00:00"));
        }
        if (endDate != null && !endDate.isEmpty()) {
            wrapper.le(Order::getCreatedAt, LocalDateTime.parse(endDate + "T23:59:59"));
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w
                    .like(Order::getOrderNo, keyword)
                    .or()
                    .like(Order::getRemark, keyword)
            );
        }
        wrapper.orderByDesc(Order::getCreatedAt);

        Page<Order> result = orderMapper.selectPage(pageObj, wrapper);
        return Result.success(result);
    }

    /**
     * 获取订单详情
     */
    @GetMapping("/orders/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Order> getOrderDetail(@PathVariable Long id) {
        Order order = orderMapper.selectById(id);
        if (order == null) {
            return Result.error("订单不存在");
        }
        return Result.success(order);
    }

    /**
     * 管理员取消订单
     */
    @PostMapping("/orders/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> cancelOrder(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Order order = orderMapper.selectById(id);
        if (order == null) {
            return Result.error("订单不存在");
        }

        String reason = request.get("reason");
        order.setStatus("CANCELLED");
        order.setRemark((order.getRemark() != null ? order.getRemark() + " | " : "") + "[管理员取消] " + reason);
        order.setUpdatedAt(LocalDateTime.now());
        orderMapper.updateById(order);

        // 恢复商品状态
        Product product = productMapper.selectById(order.getProductId());
        if (product != null) {
            product.setStatus("ON_SALE");
            product.setUpdatedAt(LocalDateTime.now());
            productMapper.updateById(product);
        }

        return Result.success();
    }

    /**
     * 获取订单统计数据
     */
    @GetMapping("/orders/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Map<String, Long>> getOrderStats() {
        Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("total", orderMapper.selectCount(new LambdaQueryWrapper<Order>()));
        stats.put("pending", orderMapper.selectCount(new LambdaQueryWrapper<Order>().eq(Order::getStatus, "PENDING")));
        stats.put("paid", orderMapper.selectCount(new LambdaQueryWrapper<Order>().eq(Order::getStatus, "PAID")));
        stats.put("shipped", orderMapper.selectCount(new LambdaQueryWrapper<Order>().eq(Order::getStatus, "SHIPPED")));
        stats.put("completed", orderMapper.selectCount(new LambdaQueryWrapper<Order>().eq(Order::getStatus, "COMPLETED")));
        stats.put("cancelled", orderMapper.selectCount(new LambdaQueryWrapper<Order>().eq(Order::getStatus, "CANCELLED")));
        return Result.success(stats);
    }

    // ========== 评价管理 ==========

    /**
     * 获取评价列表（分页）
     */
    @GetMapping("/reviews")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Page<Review>> getReviewList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String keyword) {

        Page<Review> pageObj = new Page<>(page, pageSize);
        LambdaQueryWrapper<Review> wrapper = new LambdaQueryWrapper<>();

        if (rating != null) {
            wrapper.eq(Review::getRating, rating);
        }
        if (startDate != null && !startDate.isEmpty()) {
            wrapper.ge(Review::getCreatedAt, LocalDateTime.parse(startDate + "T00:00:00"));
        }
        if (endDate != null && !endDate.isEmpty()) {
            wrapper.le(Review::getCreatedAt, LocalDateTime.parse(endDate + "T23:59:59"));
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w
                    .like(Review::getContent, keyword)
                    .or()
                    .like(Review::getTags, keyword)
            );
        }
        wrapper.orderByDesc(Review::getCreatedAt);

        Page<Review> result = reviewMapper.selectPage(pageObj, wrapper);
        return Result.success(result);
    }

    /**
     * 获取评价详情
     */
    @GetMapping("/reviews/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Review> getReviewDetail(@PathVariable Long id) {
        Review review = reviewMapper.selectById(id);
        if (review == null) {
            return Result.error("评价不存在");
        }
        return Result.success(review);
    }

    /**
     * 删除评价
     */
    @DeleteMapping("/reviews/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteReview(@PathVariable Long id) {
        Review review = reviewMapper.selectById(id);
        if (review == null) {
            return Result.error("评价不存在");
        }
        reviewMapper.deleteById(id);
        return Result.success();
    }

    /**
     * 获取评价统计数据
     */
    @GetMapping("/reviews/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Map<String, Object>> getReviewStats() {
        Map<String, Object> stats = new java.util.HashMap<>();
        Long total = reviewMapper.selectCount(new LambdaQueryWrapper<Review>());
        stats.put("total", total);

        // 计算平均评分
        List<Review> reviews = reviewMapper.selectList(null);
        if (!reviews.isEmpty()) {
            double avgRating = reviews.stream().mapToInt(Review::getRating).average().orElse(0);
            stats.put("avgRating", Math.round(avgRating * 10) / 10.0);
        } else {
            stats.put("avgRating", 0.0);
        }

        // 评分分布
        for (int i = 1; i <= 5; i++) {
            long count = reviewMapper.selectCount(new LambdaQueryWrapper<Review>().eq(Review::getRating, i));
            stats.put("star" + i, count);
        }

        return Result.success(stats);
    }

    // ========== 消息推送 ==========

    /**
     * 推送系统消息（单用户或群发）
     */
    @PostMapping("/messages/push")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> pushMessage(@Valid @RequestBody AdminPushMessageRequest request) {
        if (request.getUserId() == null) {
            // 群发给所有用户
            List<User> users = userMapper.selectList(new LambdaQueryWrapper<User>());
            for (User user : users) {
                SystemMessage message = new SystemMessage();
                message.setUserId(user.getId());
                message.setTitle(request.getTitle());
                message.setContent(request.getContent());
                message.setType("ADMIN_BROADCAST");
                message.setRead(false);
                message.setCreateTime(LocalDateTime.now());
                systemMessageMapper.insert(message);
            }
        } else {
            // 单用户推送
            SystemMessage message = new SystemMessage();
            message.setUserId(request.getUserId());
            message.setTitle(request.getTitle());
            message.setContent(request.getContent());
            message.setType("ADMIN_PUSH");
            message.setRead(false);
            message.setCreateTime(LocalDateTime.now());
            systemMessageMapper.insert(message);
        }
        return Result.success();
    }

    /**
     * 获取推送历史
     */
    @GetMapping("/messages/history")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Page<SystemMessage>> getMessageHistory(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String type) {

        Page<SystemMessage> pageObj = new Page<>(page, pageSize);
        LambdaQueryWrapper<SystemMessage> wrapper = new LambdaQueryWrapper<>();
        if (type != null && !type.isEmpty()) {
            wrapper.eq(SystemMessage::getType, type);
        }
        wrapper.orderByDesc(SystemMessage::getCreateTime);
        Page<SystemMessage> result = systemMessageMapper.selectPage(pageObj, wrapper);
        return Result.success(result);
    }

    // ========== 数据导出 ==========

    /**
     * 导出订单数据
     */
    @GetMapping("/export/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public void exportOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            HttpServletResponse response) throws IOException {

        LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Order::getStatus, status);
        }
        if (startDate != null && !startDate.isEmpty()) {
            wrapper.ge(Order::getCreatedAt, LocalDateTime.parse(startDate + "T00:00:00"));
        }
        if (endDate != null && !endDate.isEmpty()) {
            wrapper.le(Order::getCreatedAt, LocalDateTime.parse(endDate + "T23:59:59"));
        }
        wrapper.orderByDesc(Order::getCreatedAt);

        List<Order> orders = orderMapper.selectList(wrapper);
        exportToCsv(response, "orders", orders);
    }

    /**
     * 导出用户数据
     */
    @GetMapping("/export/users")
    @PreAuthorize("hasRole('ADMIN')")
    public void exportUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean enabled,
            HttpServletResponse response) throws IOException {

        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (role != null && !role.isEmpty()) {
            wrapper.eq(User::getRole, role);
        }
        if (enabled != null) {
            wrapper.eq(User::getEnabled, enabled);
        }
        wrapper.orderByDesc(User::getCreatedAt);

        List<User> users = userMapper.selectList(wrapper);
        // 隐藏密码
        users.forEach(u -> u.setPassword(null));
        exportToCsv(response, "users", users);
    }

    /**
     * 导出商品数据
     */
    @GetMapping("/export/products")
    @PreAuthorize("hasRole('ADMIN')")
    public void exportProducts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String auditStatus,
            HttpServletResponse response) throws IOException {

        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Product::getStatus, status);
        }
        if (auditStatus != null && !auditStatus.isEmpty()) {
            wrapper.eq(Product::getAuditStatus, auditStatus);
        }
        wrapper.orderByDesc(Product::getCreatedAt);

        List<Product> products = productMapper.selectList(wrapper);
        exportToCsv(response, "products", products);
    }

    private <T> void exportToCsv(HttpServletResponse response, String filename, List<T> data) throws IOException {
        response.setContentType("text/csv;charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=" + filename + "_" +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + ".csv");

        PrintWriter writer = response.getWriter();
        writer.write("\uFEFF"); // BOM for UTF-8

        if (data.isEmpty()) {
            writer.close();
            return;
        }

        // 写入表头
        java.lang.reflect.Field[] fields = data.get(0).getClass().getDeclaredFields();
        String[] headers = new String[fields.length];
        for (int i = 0; i < fields.length; i++) {
            fields[i].setAccessible(true);
            headers[i] = fields[i].getName();
        }
        writer.println(String.join(",", headers));

        // 写入数据
        for (T item : data) {
            String[] row = new String[fields.length];
            for (int i = 0; i < fields.length; i++) {
                try {
                    Object value = fields[i].get(item);
                    row[i] = value != null ? value.toString() : "";
                } catch (Exception e) {
                    row[i] = "";
                }
            }
            writer.println(String.join(",", row));
        }

        writer.close();
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

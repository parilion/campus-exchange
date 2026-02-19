package com.campus.exchange.dto;

import lombok.Data;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import java.time.LocalDateTime;

/**
 * 用户分页查询请求
 */
@Data
public class UserPageRequest {

    /**
     * 页码，从1开始
     */
    @Min(1)
    private Integer page = 1;

    /**
     * 每页数量
     */
    @Min(1)
    @Max(50)
    private Integer pageSize = 10;

    /**
     * 关键词搜索（用户名/邮箱/手机号）
     */
    private String keyword;

    /**
     * 角色筛选：USER, ADMIN
     */
    private String role;

    /**
     * 状态筛选：true-正常, false-禁用
     */
    private Boolean enabled;

    /**
     * 注册开始时间
     */
    private LocalDateTime startDate;

    /**
     * 注册结束时间
     */
    private LocalDateTime endDate;
}

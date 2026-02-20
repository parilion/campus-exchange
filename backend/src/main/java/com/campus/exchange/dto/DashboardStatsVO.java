package com.campus.exchange.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class DashboardStatsVO {
    private Long totalUsers;
    private Long totalProducts;
    private Long totalOrders;
    private Long totalRevenue;
    private Long pendingProducts;
    private Long pendingReports;
    private Long todayUsers;
    private Long todayProducts;
    private Long todayOrders;
    private List<RecentOrderVO> recentOrders;
    private Map<String, Long> userStats;
    private Map<String, Long> productStats;
    private Map<String, Long> orderStats;
}

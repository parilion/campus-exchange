package com.campus.exchange.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 接口限流拦截器
 * 基于 IP 地址进行简单的请求计数限流
 * 限制每个 IP 每分钟最多 60 次请求
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(RateLimitInterceptor.class);
    private static final int MAX_REQUESTS_PER_MINUTE = 60;
    private static final long WINDOW_SIZE_MS = 60 * 1000; // 1分钟

    // 存储每个 IP 的请求记录
    private final Map<String, IpRequestRecord> ipRecords = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 只对 API 请求进行限流
        String uri = request.getRequestURI();
        if (!uri.startsWith("/api/")) {
            return true;
        }

        // 排除公开接口（登录、注册等）
        if (isPublicEndpoint(uri)) {
            return true;
        }

        String clientIp = getClientIp(request);
        IpRequestRecord record = ipRecords.computeIfAbsent(clientIp, k -> new IpRequestRecord());

        long now = System.currentTimeMillis();
        synchronized (record) {
            // 检查是否在时间窗口内
            if (now - record.windowStart > WINDOW_SIZE_MS) {
                // 重置窗口
                record.windowStart = now;
                record.count.set(1);
            } else {
                int count = record.incrementAndGet();
                if (count > MAX_REQUESTS_PER_MINUTE) {
                    log.warn("Rate limit exceeded for IP: {}", clientIp);
                    response.setStatus(429);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"code\":429,\"message\":\"请求过于频繁，请稍后再试\"}");
                    return false;
                }
            }
        }
        return true;
    }

    private boolean isPublicEndpoint(String uri) {
        // 公开接口不需要限流
        return uri.contains("/auth/login") ||
               uri.contains("/auth/register") ||
               uri.contains("/products/list") ||
               uri.contains("/categories") ||
               uri.contains("/announcements");
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 如果有多个代理，取第一个
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    private static class IpRequestRecord {
        long windowStart = System.currentTimeMillis();
        AtomicInteger count = new AtomicInteger(1);

        int incrementAndGet() {
            return count.incrementAndGet();
        }
    }
}

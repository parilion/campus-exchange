package com.campus.exchange.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * HTTP 请求日志过滤器
 * 记录每个请求的方法、路径、状态码和耗时
 */
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        long startTime = System.currentTimeMillis();
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String query = request.getQueryString();
        String fullPath = query != null ? uri + "?" + query : uri;

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            int status = response.getStatus();
            // 只记录 API 请求，静态资源请求忽略
            if (uri.startsWith("/api/")) {
                if (status >= 400) {
                    log.warn("[{}] {} {} - {}ms", status, method, fullPath, duration);
                } else {
                    log.info("[{}] {} {} - {}ms", status, method, fullPath, duration);
                }
            }
        }
    }
}

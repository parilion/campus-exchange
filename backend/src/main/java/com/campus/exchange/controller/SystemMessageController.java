package com.campus.exchange.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.campus.exchange.util.Result;
import com.campus.exchange.mapper.UserMapper;
import com.campus.exchange.model.SystemMessage;
import com.campus.exchange.model.User;
import com.campus.exchange.security.JwtTokenProvider;
import com.campus.exchange.service.SystemMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/system-messages")
public class SystemMessageController {

    @Autowired
    private SystemMessageService systemMessageService;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    /**
     * 获取系统消息列表
     */
    @GetMapping
    public Result<IPage<SystemMessage>> getMessages(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Boolean read,
            HttpServletRequest request) {
        Long userId = getUserId(request);
        IPage<SystemMessage> messages = systemMessageService.getUserMessages(userId, page, size, read);
        return Result.success(messages);
    }

    /**
     * 获取未读消息数量
     */
    @GetMapping("/unread-count")
    public Result<Map<String, Object>> getUnreadCount(HttpServletRequest request) {
        Long userId = getUserId(request);
        long count = systemMessageService.getUnreadCount(userId);
        Map<String, Object> result = new HashMap<>();
        result.put("count", count);
        return Result.success(result);
    }

    /**
     * 标记消息为已读
     */
    @PutMapping("/{id}/read")
    public Result<Void> markAsRead(@PathVariable Long id, HttpServletRequest request) {
        Long userId = getUserId(request);
        systemMessageService.markAsRead(id, userId);
        return Result.success(null);
    }

    /**
     * 标记所有消息为已读
     */
    @PutMapping("/read-all")
    public Result<Void> markAllAsRead(HttpServletRequest request) {
        Long userId = getUserId(request);
        systemMessageService.markAllAsRead(userId);
        return Result.success(null);
    }

    /**
     * 删除消息
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteMessage(@PathVariable Long id, HttpServletRequest request) {
        Long userId = getUserId(request);
        systemMessageService.deleteMessage(id, userId);
        return Result.success(null);
    }

    private Long getUserId(HttpServletRequest request) {
        String token = jwtTokenProvider.getTokenFromRequest(request);
        String username = jwtTokenProvider.getUsernameFromToken(token);
        User user = userMapper.selectByUsername(username);
        return user.getId();
    }
}

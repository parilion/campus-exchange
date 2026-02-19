package com.campus.exchange.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.campus.exchange.util.Result;
import com.campus.exchange.model.SystemMessage;
import com.campus.exchange.service.SystemMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/system-messages")
public class SystemMessageController {

    @Autowired
    private SystemMessageService systemMessageService;

    /**
     * 获取系统消息列表
     */
    @GetMapping
    public Result<IPage<SystemMessage>> getMessages(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Boolean read) {
        Long userId = getCurrentUserId();
        IPage<SystemMessage> messages = systemMessageService.getUserMessages(userId, page, size, read);
        return Result.success(messages);
    }

    /**
     * 获取未读消息数量
     */
    @GetMapping("/unread-count")
    public Result<Map<String, Object>> getUnreadCount() {
        Long userId = getCurrentUserId();
        long count = systemMessageService.getUnreadCount(userId);
        Map<String, Object> result = new HashMap<>();
        result.put("count", count);
        return Result.success(result);
    }

    /**
     * 标记消息为已读
     */
    @PutMapping("/{id}/read")
    public Result<Void> markAsRead(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        systemMessageService.markAsRead(id, userId);
        return Result.success(null);
    }

    /**
     * 标记所有消息为已读
     */
    @PutMapping("/read-all")
    public Result<Void> markAllAsRead() {
        Long userId = getCurrentUserId();
        systemMessageService.markAllAsRead(userId);
        return Result.success(null);
    }

    /**
     * 删除消息
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteMessage(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        systemMessageService.deleteMessage(id, userId);
        return Result.success(null);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (Long) authentication.getPrincipal();
    }
}

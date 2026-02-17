package com.campus.exchange.controller;

import com.campus.exchange.dto.ConversationVO;
import com.campus.exchange.dto.MessageVO;
import com.campus.exchange.dto.SendMessageRequest;
import com.campus.exchange.model.User;
import com.campus.exchange.service.MessageService;
import com.campus.exchange.util.Result;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    /**
     * 发送私信
     */
    @PostMapping
    public Result<MessageVO> sendMessage(@Valid @RequestBody SendMessageRequest request) {
        Long userId = getCurrentUserId();
        MessageVO message = messageService.sendMessage(userId, request);
        return Result.success(message);
    }

    /**
     * 获取与指定用户的聊天记录
     */
    @GetMapping("/conversation/{partnerId}")
    public Result<List<MessageVO>> getConversation(
            @PathVariable Long partnerId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int size) {
        Long userId = getCurrentUserId();
        List<MessageVO> messages = messageService.getConversation(userId, partnerId, page, size);
        return Result.success(messages);
    }

    /**
     * 获取会话列表
     */
    @GetMapping("/conversations")
    public Result<List<ConversationVO>> getConversationList() {
        Long userId = getCurrentUserId();
        List<ConversationVO> conversations = messageService.getConversationList(userId);
        return Result.success(conversations);
    }

    /**
     * 获取未读消息数
     */
    @GetMapping("/unread-count")
    public Result<Integer> getUnreadCount() {
        Long userId = getCurrentUserId();
        int count = messageService.getUnreadCount(userId);
        return Result.success(count);
    }

    /**
     * 标记会话为已读
     */
    @PutMapping("/read/{partnerId}")
    public Result<Void> markAsRead(@PathVariable Long partnerId) {
        Long userId = getCurrentUserId();
        messageService.markAsRead(partnerId, userId);
        return Result.success(null);
    }

    /**
     * 搜索聊天记录
     */
    @GetMapping("/search")
    public Result<List<MessageVO>> searchMessages(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getCurrentUserId();
        List<MessageVO> messages = messageService.searchMessages(userId, keyword, page, size);
        return Result.success(messages);
    }

    /**
     * 屏蔽用户
     */
    @PostMapping("/block/{blockedUserId}")
    public Result<Void> blockUser(@PathVariable Long blockedUserId) {
        Long userId = getCurrentUserId();
        messageService.blockUser(userId, blockedUserId);
        return Result.success(null);
    }

    /**
     * 取消屏蔽用户
     */
    @DeleteMapping("/block/{blockedUserId}")
    public Result<Void> unblockUser(@PathVariable Long blockedUserId) {
        Long userId = getCurrentUserId();
        messageService.unblockUser(userId, blockedUserId);
        return Result.success(null);
    }

    /**
     * 获取屏蔽的用户列表
     */
    @GetMapping("/blocks")
    public Result<List<User>> getBlockedUsers() {
        Long userId = getCurrentUserId();
        List<User> users = messageService.getBlockedUsers(userId);
        return Result.success(users);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (Long) authentication.getPrincipal();
    }
}

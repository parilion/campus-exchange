package com.campus.exchange.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.campus.exchange.mapper.SystemMessageMapper;
import com.campus.exchange.model.SystemMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SystemMessageService {

    @Autowired
    private SystemMessageMapper systemMessageMapper;

    /**
     * 发送系统消息
     */
    public void sendMessage(Long userId, String title, String content, String type, Long relatedId) {
        SystemMessage message = new SystemMessage();
        message.setUserId(userId);
        message.setTitle(title);
        message.setContent(content);
        message.setType(type);
        message.setRelatedId(relatedId);
        message.setRead(false);
        message.setCreateTime(LocalDateTime.now());
        systemMessageMapper.insert(message);
    }

    /**
     * 批量发送系统消息
     */
    public void batchSendMessage(List<Long> userIds, String title, String content, String type, Long relatedId) {
        LocalDateTime now = LocalDateTime.now();
        for (Long userId : userIds) {
            SystemMessage message = new SystemMessage();
            message.setUserId(userId);
            message.setTitle(title);
            message.setContent(content);
            message.setType(type);
            message.setRelatedId(relatedId);
            message.setRead(false);
            message.setCreateTime(now);
            systemMessageMapper.insert(message);
        }
    }

    /**
     * 获取用户的系统消息列表
     */
    public IPage<SystemMessage> getUserMessages(Long userId, int page, int size, Boolean read) {
        Page<SystemMessage> pageParam = new Page<>(page, size);
        QueryWrapper<SystemMessage> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        if (read != null) {
            wrapper.eq("`read`", read);
        }
        wrapper.orderByDesc("create_time");
        return systemMessageMapper.selectPage(pageParam, wrapper);
    }

    /**
     * 获取用户未读消息数量
     */
    public long getUnreadCount(Long userId) {
        QueryWrapper<SystemMessage> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        wrapper.eq("`read`", false);
        return systemMessageMapper.selectCount(wrapper);
    }

    /**
     * 标记消息为已读
     */
    public void markAsRead(Long messageId, Long userId) {
        SystemMessage message = systemMessageMapper.selectById(messageId);
        if (message != null && message.getUserId().equals(userId)) {
            message.setRead(true);
            message.setReadTime(LocalDateTime.now());
            systemMessageMapper.updateById(message);
        }
    }

    /**
     * 标记所有消息为已读
     */
    public void markAllAsRead(Long userId) {
        QueryWrapper<SystemMessage> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        wrapper.eq("`read`", false);
        List<SystemMessage> messages = systemMessageMapper.selectList(wrapper);
        for (SystemMessage message : messages) {
            message.setRead(true);
            message.setReadTime(LocalDateTime.now());
            systemMessageMapper.updateById(message);
        }
    }

    /**
     * 删除消息
     */
    public void deleteMessage(Long messageId, Long userId) {
        SystemMessage message = systemMessageMapper.selectById(messageId);
        if (message != null && message.getUserId().equals(userId)) {
            systemMessageMapper.deleteById(messageId);
        }
    }
}

package com.campus.exchange.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.campus.exchange.dto.ConversationVO;
import com.campus.exchange.dto.MessageVO;
import com.campus.exchange.dto.SendMessageRequest;
import com.campus.exchange.mapper.MessageMapper;
import com.campus.exchange.mapper.ProductMapper;
import com.campus.exchange.mapper.UserMapper;
import com.campus.exchange.model.Message;
import com.campus.exchange.model.Product;
import com.campus.exchange.model.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageMapper messageMapper;
    private final UserMapper userMapper;
    private final ProductMapper productMapper;

    public MessageService(MessageMapper messageMapper, UserMapper userMapper, ProductMapper productMapper) {
        this.messageMapper = messageMapper;
        this.userMapper = userMapper;
        this.productMapper = productMapper;
    }

    /**
     * 发送私信
     */
    public MessageVO sendMessage(Long senderId, SendMessageRequest request) {
        if (senderId.equals(request.getReceiverId())) {
            throw new RuntimeException("不能给自己发送消息");
        }

        // 检查接收者是否存在
        User receiver = userMapper.selectById(request.getReceiverId());
        if (receiver == null) {
            throw new RuntimeException("接收者不存在");
        }

        Message message = new Message();
        message.setSenderId(senderId);
        message.setReceiverId(request.getReceiverId());
        message.setContent(request.getContent());
        message.setType(request.getType() != null ? request.getType() : "TEXT");
        message.setRead(false);
        message.setCreatedAt(LocalDateTime.now());

        messageMapper.insert(message);

        return convertToVO(message);
    }

    /**
     * 获取与指定用户的聊天记录
     */
    public List<MessageVO> getConversation(Long userId, Long partnerId, int page, int size) {
        // 查询两人之间的所有消息
        LambdaQueryWrapper<Message> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(w -> w
                .eq(Message::getSenderId, userId).eq(Message::getReceiverId, partnerId)
                .or()
                .eq(Message::getSenderId, partnerId).eq(Message::getReceiverId, userId)
        ).orderByAsc(Message::getCreatedAt);

        List<Message> messages = messageMapper.selectList(wrapper);

        // 分页
        int start = (page - 1) * size;
        int end = Math.min(start + size, messages.size());
        if (start >= messages.size()) {
            return new ArrayList<>();
        }

        List<Message> pagedMessages = messages.subList(start, end);

        // 标记未读消息为已读
        markAsRead(partnerId, userId);

        return pagedMessages.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    /**
     * 获取会话列表（与当前用户有聊天记录的所有用户）
     */
    public List<ConversationVO> getConversationList(Long userId) {
        // 查询所有发送或接收的消息
        LambdaQueryWrapper<Message> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(w -> w
                .eq(Message::getSenderId, userId)
                .or()
                .eq(Message::getReceiverId, userId)
        ).orderByDesc(Message::getCreatedAt);

        List<Message> allMessages = messageMapper.selectList(wrapper);

        // 按聊天对象分组，获取每个对象最新的一条消息
        Map<Long, Message> latestMessages = new HashMap<>();
        for (Message msg : allMessages) {
            Long partnerId = msg.getSenderId().equals(userId) ? msg.getReceiverId() : msg.getSenderId();
            if (!latestMessages.containsKey(partnerId)) {
                latestMessages.put(partnerId, msg);
            }
        }

        // 构建会话列表
        List<ConversationVO> conversations = new ArrayList<>();
        for (Map.Entry<Long, Message> entry : latestMessages.entrySet()) {
            Long partnerId = entry.getKey();
            Message lastMsg = entry.getValue();

            // 获取未读消息数量
            LambdaQueryWrapper<Message> unreadWrapper = new LambdaQueryWrapper<>();
            unreadWrapper.eq(Message::getSenderId, partnerId)
                    .eq(Message::getReceiverId, userId)
                    .eq(Message::getRead, false);
            long unreadCount = messageMapper.selectCount(unreadWrapper);

            // 获取对方用户信息
            User partner = userMapper.selectById(partnerId);

            ConversationVO conversation = new ConversationVO();
            conversation.setPartnerId(partnerId);
            conversation.setPartnerNickname(partner != null ? partner.getNickname() : "未知用户");
            conversation.setPartnerAvatar(partner != null ? partner.getAvatar() : null);
            conversation.setLastMessage(lastMsg.getContent());
            conversation.setLastMessageType(lastMsg.getType());
            conversation.setLastMessageTime(lastMsg.getCreatedAt());
            conversation.setUnreadCount((int) unreadCount);

            conversations.add(conversation);
        }

        // 按最后消息时间排序
        conversations.sort((a, b) -> b.getLastMessageTime().compareTo(a.getLastMessageTime()));

        return conversations;
    }

    /**
     * 标记消息为已读
     */
    public void markAsRead(Long senderId, Long receiverId) {
        LambdaQueryWrapper<Message> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Message::getSenderId, senderId)
                .eq(Message::getReceiverId, receiverId)
                .eq(Message::getRead, false);

        Message update = new Message();
        update.setRead(true);
        messageMapper.update(update, wrapper);
    }

    /**
     * 获取未读消息总数
     */
    public int getUnreadCount(Long userId) {
        LambdaQueryWrapper<Message> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Message::getReceiverId, userId)
                .eq(Message::getRead, false);
        return messageMapper.selectCount(wrapper).intValue();
    }

    private MessageVO convertToVO(Message message) {
        MessageVO vo = new MessageVO();
        vo.setId(message.getId());
        vo.setSenderId(message.getSenderId());
        vo.setReceiverId(message.getReceiverId());
        vo.setContent(message.getContent());
        vo.setType(message.getType());
        vo.setRead(message.getRead());
        vo.setCreatedAt(message.getCreatedAt());

        // 获取发送者信息
        User sender = userMapper.selectById(message.getSenderId());
        if (sender != null) {
            vo.setSenderNickname(sender.getNickname());
            vo.setSenderAvatar(sender.getAvatar());
        }

        // 获取接收者信息
        User receiver = userMapper.selectById(message.getReceiverId());
        if (receiver != null) {
            vo.setReceiverNickname(receiver.getNickname());
            vo.setReceiverAvatar(receiver.getAvatar());
        }

        return vo;
    }
}

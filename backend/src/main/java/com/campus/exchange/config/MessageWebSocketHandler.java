package com.campus.exchange.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class MessageWebSocketHandler extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(MessageWebSocketHandler.class);

    private static final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 客户端连接时调用
     */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userId = getUserIdFromSession(session);
        if (userId != null) {
            sessions.put(userId, session);
            logger.info("WebSocket连接建立: userId={}, sessionId={}", userId, session.getId());
        }
    }

    /**
     * 收到消息时调用
     */
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        logger.info("收到WebSocket消息: {}", message.getPayload());
        try {
            Map<String, Object> msgMap = objectMapper.readValue(message.getPayload(), Map.class);
            String type = (String) msgMap.get("type");

            if ("HEARTBEAT".equals(type)) {
                // 心跳消息，直接回复
                session.sendMessage(new TextMessage("{\"type\":\"HEARTBEAT_ACK\"}"));
            }
        } catch (Exception e) {
            logger.error("解析消息失败: {}", e.getMessage());
        }
    }

    /**
     * 连接关闭时调用
     */
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String userId = getUserIdFromSession(session);
        if (userId != null) {
            sessions.remove(userId);
            logger.info("WebSocket连接关闭: userId={}", userId);
        }
    }

    /**
     * 发生错误时调用
     */
    @Override
    public void handleTransportError(WebSocketSession session, Throwable error) throws Exception {
        logger.error("WebSocket错误: {}", error.getMessage());
    }

    /**
     * 发送消息给指定用户
     */
    public static void sendMessageToUser(String userId, String message) {
        WebSocketSession session = sessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                session.sendMessage(new TextMessage(message));
                logger.info("发送消息给用户: userId={}", userId);
            } catch (IOException e) {
                logger.error("发送消息失败: {}", e.getMessage());
            }
        }
    }

    /**
     * 从Session中获取用户ID（通过查询参数）
     */
    private String getUserIdFromSession(WebSocketSession session) {
        Map<String, Object> attributes = session.getAttributes();
        Object userId = attributes.get("userId");
        if (userId != null) {
            return userId.toString();
        }
        // 尝试从URI参数获取
        String query = session.getUri().getQuery();
        if (query != null && query.contains("userId=")) {
            String[] params = query.split("&");
            for (String param : params) {
                if (param.startsWith("userId=")) {
                    return param.substring(7);
                }
            }
        }
        return null;
    }

    /**
     * 检查用户是否在线
     */
    public static boolean isUserOnline(String userId) {
        WebSocketSession session = sessions.get(userId);
        return session != null && session.isOpen();
    }
}

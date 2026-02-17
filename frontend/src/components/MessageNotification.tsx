import { useEffect, useState } from 'react';
import { Badge, Button, List, Avatar, message as antdMessage } from 'antd';
import { BellOutlined, MessageOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { wsClient } from '../utils/websocket';
import { getUnreadCount, type Message } from '../services/messages';

interface MessageNotificationProps {
  onMessageReceived?: (message: Message) => void;
}

export default function MessageNotification({ onMessageReceived }: MessageNotificationProps) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);

  const currentUserId = (() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
      } catch {
        return null;
      }
    }
    return null;
  })();

  // 加载未读消息数
  const loadUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      const count = (res.data as any)?.data || 0;
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  // 初始化
  useEffect(() => {
    if (!currentUserId) return;

    // 加载未读数
    loadUnreadCount();

    // 连接 WebSocket
    wsClient.connect(currentUserId);

    // 监听新消息
    const handleNewMessage = (msg: Message) => {
      setUnreadCount(prev => prev + 1);
      setLastMessage(msg);

      // 播放提示音
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (e) {}

      // 显示通知
      antdMessage.info({
        content: `${msg.senderNickname}: ${msg.content.substring(0, 30)}${msg.content.length > 30 ? '...' : ''}`,
        duration: 3,
        onClick: () => {
          navigate(`/chat/${msg.senderId}`);
        },
      });

      // 回调
      if (onMessageReceived) {
        onMessageReceived(msg);
      }
    };

    wsClient.on('message', handleNewMessage);

    // 定时刷新未读数
    const interval = setInterval(loadUnreadCount, 60000);

    return () => {
      wsClient.off('message', handleNewMessage);
      clearInterval(interval);
    };
  }, [currentUserId]);

  const handleClick = () => {
    navigate('/messages');
  };

  return (
    <Badge count={unreadCount} size="small" offset={[5, 0]}>
      <Button
        type="text"
        icon={<MessageOutlined />}
        onClick={handleClick}
        style={{ color: '#fff' }}
      >
        消息
      </Button>
    </Badge>
  );
}

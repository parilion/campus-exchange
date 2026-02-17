import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Avatar, Badge, Typography, Spin, Empty, Button } from 'antd';
import { ArrowLeftOutlined, MessageOutlined } from '@ant-design/icons';
import { getConversationList, type Conversation } from '../services/messages';
import './MessagesPage.css';

const { Title, Text } = Typography;

export default function MessagesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await getConversationList();
      setConversations((res.data as any)?.data || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return date.toLocaleDateString('zh-CN', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  const getMessageTypeText = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return '[图片]';
      case 'PRODUCT_CARD':
        return '[商品卡片]';
      default:
        return '';
    }
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        <div className="messages-header">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            className="back-button"
          >
            返回
          </Button>
          <Title level={4} className="page-title">我的消息</Title>
        </div>

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : conversations.length === 0 ? (
          <Empty
            image={<MessageOutlined style={{ fontSize: 48, color: '#ccc' }} />}
            description="暂无消息"
            className="empty-container"
          >
            <Button type="primary" onClick={() => navigate('/')}>
              去逛逛
            </Button>
          </Empty>
        ) : (
          <List
            className="conversation-list"
            itemLayout="horizontal"
            dataSource={conversations}
            renderItem={(item) => (
              <List.Item
                className="conversation-item"
                onClick={() => navigate(`/chat/${item.partnerId}`)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge count={item.unreadCount} size="small" offset={[8, 0]}>
                      <Avatar
                        src={item.partnerAvatar}
                        size={48}
                        style={{ backgroundColor: '#87d068' }}
                      >
                        {item.partnerNickname?.charAt(0) || '?'}
                      </Avatar>
                    </Badge>
                  }
                  title={
                    <div className="conversation-title">
                      <Text strong>{item.partnerNickname}</Text>
                      <Text type="secondary" className="conversation-time">
                        {formatTime(item.lastMessageTime)}
                      </Text>
                    </div>
                  }
                  description={
                    <Text type="secondary" ellipsis className="conversation-preview">
                      {getMessageTypeText(item.lastMessageType)}
                      {item.lastMessage}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
}

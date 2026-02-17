import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, Button, Avatar, Typography, Spin, List, message } from 'antd';
import { ArrowLeftOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { getConversation, sendMessage, markAsRead, type Message } from '../services/messages';
import './ChatPage.css';

const { Text } = Typography;

export default function ChatPage() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [currentUserId] = useState(() => {
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
  });

  const loadMessages = async () => {
    if (!partnerId) return;
    setLoading(true);
    try {
      const res = await getConversation(parseInt(partnerId));
      const msgs = (res.data as any)?.data || [];
      setMessages(msgs);

      // 获取对方昵称
      if (msgs.length > 0) {
        const partnerMsg = msgs.find(m => m.senderId !== currentUserId);
        if (partnerMsg) {
          setPartnerName(partnerMsg.senderNickname);
        } else {
          const myMsg = msgs.find(m => m.senderId === currentUserId);
          if (myMsg) {
            setPartnerName(myMsg.receiverNickname);
          }
        }
      }

      // 标记为已读
      await markAsRead(parseInt(partnerId));
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [partnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !partnerId) return;

    setSending(true);
    try {
      const res = await sendMessage({
        receiverId: parseInt(partnerId),
        content: inputValue.trim(),
        type: 'TEXT',
      });

      setMessages(prev => [...prev, (res.data as any)?.data]);
      setInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
      message.error('发送失败');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/messages')}
            className="back-button"
          >
            返回
          </Button>
          <div className="chat-header-info">
            <Avatar icon={<UserOutlined />} src={null} />
            <Text strong>{partnerName || '聊天'}</Text>
          </div>
        </div>

        <div className="chat-messages">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-chat">
              <Text type="secondary">暂无消息记录，开始聊天吧</Text>
            </div>
          ) : (
            <List
              dataSource={messages}
              renderItem={(item) => {
                const isMe = item.senderId === currentUserId;
                return (
                  <List.Item className={`message-item ${isMe ? 'message-mine' : 'message-other'}`}>
                    <div className="message-content">
                      {!isMe && (
                        <Avatar size={36} className="message-avatar">
                          {item.senderNickname?.charAt(0) || '?'}
                        </Avatar>
                      )}
                      <div className={`message-bubble ${isMe ? 'bubble-mine' : 'bubble-other'}`}>
                        <div className="message-text">{item.content}</div>
                        <div className="message-time">{formatTime(item.createdAt)}</div>
                      </div>
                      {isMe && (
                        <Avatar size={36} className="message-avatar">
                          {item.senderNickname?.charAt(0) || '?'}
                        </Avatar>
                      )}
                    </div>
                  </List.Item>
                );
              }}
            />
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <Input.TextArea
            placeholder="输入消息..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            autoSize={{ minRows: 1, maxRows: 4 }}
            className="chat-input"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={sending}
            disabled={!inputValue.trim()}
            className="send-button"
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
}

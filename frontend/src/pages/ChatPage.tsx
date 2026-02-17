import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, Button, Avatar, Typography, Spin, List, message, Card, Modal, Popconfirm, Tooltip, Dropdown } from 'antd';
import { ArrowLeftOutlined, SendOutlined, UserOutlined, ShoppingOutlined, SearchOutlined, StopOutlined, MoreOutlined, MessageOutlined } from '@ant-design/icons';
import { getConversation, sendMessage, markAsRead, searchMessages, blockUser, type Message } from '../services/messages';
import { wsClient } from '../utils/websocket';
import './ChatPage.css';

const { Text } = Typography;

// 快捷回复语
const QUICK_REPLIES = [
  '好的，我考虑一下',
  '可以再便宜一点吗？',
  '商品还在吗？',
  '可以面交吗？',
  '什么时候可以交易？',
];

export default function ChatPage() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [searching, setSearching] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
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
        const partnerMsg = msgs.find((m: Message) => m.senderId !== currentUserId);
        if (partnerMsg) {
          setPartnerName(partnerMsg.senderNickname);
        } else {
          const myMsg = msgs.find((m: Message) => m.senderId === currentUserId);
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

  // 快捷回复
  const handleQuickReply = (reply: string) => {
    setInputValue(reply);
    setShowQuickReplies(false);
  };

  // 搜索聊天记录
  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    setSearchLoading(true);
    try {
      const res = await searchMessages(searchKeyword.trim());
      const results = (res.data as any)?.data || [];
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      message.error('搜索失败');
    } finally {
      setSearchLoading(false);
    }
  };

  // 屏蔽用户
  const handleBlockUser = async () => {
    if (!partnerId) return;
    setBlocking(true);
    try {
      await blockUser(parseInt(partnerId));
      message.success('已屏蔽该用户');
      navigate('/messages');
    } catch (error: any) {
      console.error('Block failed:', error);
      message.error(error.response?.data?.message || '屏蔽失败');
    } finally {
      setBlocking(false);
    }
  };

  // 更多操作菜单
  const menuItems = [
    {
      key: 'search',
      icon: <SearchOutlined />,
      label: '搜索聊天记录',
      onClick: () => setShowSearch(true),
    },
    {
      key: 'block',
      icon: <StopOutlined />,
      label: '屏蔽该用户',
      danger: true,
      onClick: handleBlockUser,
    },
  ];

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
          <div className="chat-header-actions">
            <Tooltip title="快捷回复">
              <Button
                type="text"
                icon={<MessageOutlined />}
                onClick={() => setShowQuickReplies(!showQuickReplies)}
              />
            </Tooltip>
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </div>
        </div>

        {/* 快捷回复面板 */}
        {showQuickReplies && (
          <div className="quick-replies-panel">
            <div className="quick-replies-title">快捷回复</div>
            <div className="quick-replies-list">
              {QUICK_REPLIES.map((reply, index) => (
                <Button
                  key={index}
                  type="default"
                  size="small"
                  className="quick-reply-btn"
                  onClick={() => handleQuickReply(reply)}
                >
                  {reply}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 搜索聊天记录弹窗 */}
        <Modal
          title="搜索聊天记录"
          open={showSearch}
          onCancel={() => {
            setShowSearch(false);
            setSearchKeyword('');
            setSearchResults([]);
          }}
          footer={null}
          width={600}
        >
          <div className="search-chat-container">
            <Input.Search
              placeholder="输入关键词搜索聊天记录"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              onSearch={handleSearch}
              loading={searchLoading}
              enterButton="搜索"
            />
            {searchResults.length > 0 && (
              <div className="search-results">
                <Text type="secondary">找到 {searchResults.length} 条相关记录</Text>
                <List
                  size="small"
                  dataSource={searchResults}
                  renderItem={(item: Message) => {
                    const isMe = item.senderId === currentUserId;
                    return (
                      <List.Item className="search-result-item">
                        <div className="search-result-content">
                          <Avatar size={24} icon={<UserOutlined />} />
                          <div className="search-result-text">
                            <Text type="secondary">{isMe ? '我' : item.senderNickname}: </Text>
                            <Text>{item.content}</Text>
                            <Text type="secondary" style={{ marginLeft: 8 }}>
                              {new Date(item.createdAt).toLocaleString()}
                            </Text>
                          </div>
                        </div>
                      </List.Item>
                    );
                  }}
                />
              </div>
            )}
          </div>
        </Modal>

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
                const isProductCard = item.type === 'PRODUCT_CARD';
                return (
                  <List.Item className={`message-item ${isMe ? 'message-mine' : 'message-other'}`}>
                    <div className="message-content">
                      {!isMe && (
                        <Avatar size={36} className="message-avatar">
                          {item.senderNickname?.charAt(0) || '?'}
                        </Avatar>
                      )}
                      <div className={`message-bubble ${isMe ? 'bubble-mine' : 'bubble-other'}`}>
                        {isProductCard && item.productId ? (
                          <div className="product-card-message">
                            <Card size="small" className="product-card-in-chat">
                              <div className="product-card-content">
                                {item.productImage && (
                                  <img
                                    src={item.productImage}
                                    alt={item.productTitle}
                                    className="product-card-image"
                                  />
                                )}
                                <div className="product-card-info">
                                  <div className="product-card-title">
                                    <ShoppingOutlined /> {item.productTitle}
                                  </div>
                                  <div className="product-card-text">{item.content}</div>
                                </div>
                              </div>
                            </Card>
                            <div className="message-time">{formatTime(item.createdAt)}</div>
                          </div>
                        ) : (
                          <>
                            <div className="message-text">{item.content}</div>
                            <div className="message-time">{formatTime(item.createdAt)}</div>
                          </>
                        )}
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

import { useState, useEffect } from 'react';
import { List, Card, Tag, Button, Empty, Spin, Badge, Space, Modal, Typography } from 'antd';
import { BellOutlined, DeleteOutlined, CheckOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getSystemMessages, getSystemUnreadCount, markSystemMessageAsRead, markAllSystemMessagesAsRead, deleteSystemMessage, SystemMessage } from '../services/messages';

const { Title, Text, Paragraph } = Typography;

const SystemMessagesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<SystemMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<SystemMessage | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const fetchMessages = async (page: number = 1) => {
    setLoading(true);
    try {
      const res = await getSystemMessages(page, 10);
      if (res.data) {
        setMessages(res.data.records || []);
        setTotal(res.data.total || 0);
        setCurrent(res.data.current || 1);
      }
    } catch (error) {
      console.error('获取系统消息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await getSystemUnreadCount();
      if (res.data) {
        setUnreadCount(res.data.count || 0);
      }
    } catch (error) {
      console.error('获取未读数量失败:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchUnreadCount();
  }, []);

  const handlePageChange = (page: number) => {
    fetchMessages(page);
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      await markSystemMessageAsRead(messageId);
      setMessages(messages.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
      fetchUnreadCount();
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllSystemMessagesAsRead();
      setMessages(messages.map(msg => ({ ...msg, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('全部标记已读失败:', error);
    }
  };

  const handleDelete = async (messageId: number) => {
    try {
      await deleteSystemMessage(messageId);
      setMessages(messages.filter(msg => msg.id !== messageId));
      fetchUnreadCount();
    } catch (error) {
      console.error('删除消息失败:', error);
    }
  };

  const handleViewDetail = (message: SystemMessage) => {
    setSelectedMessage(message);
    setDetailVisible(true);
    if (!message.read) {
      handleMarkAsRead(message.id);
    }
  };

  const getTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      'ORDER_NOTIFY': { color: 'blue', text: '订单通知' },
      'SYSTEM_NOTIFY': { color: 'orange', text: '系统通知' },
      'ACTIVITY_NOTIFY': { color: 'green', text: '活动通知' }
    };
    const config = typeMap[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
      <Card
        title={
          <Space>
            <BellOutlined />
            <span>系统消息</span>
            {unreadCount > 0 && <Badge count={unreadCount} style={{ backgroundColor: '#ff4d4f' }} />}
          </Space>
        }
        extra={
          unreadCount > 0 && (
            <Button icon={<CheckOutlined />} onClick={handleMarkAllAsRead}>
              全部已读
            </Button>
          )
        }
      >
        <Spin spinning={loading}>
          {messages.length === 0 ? (
            <Empty description="暂无系统消息" />
          ) : (
            <List
              dataSource={messages}
              renderItem={(item) => (
                <List.Item
                  style={{
                    background: item.read ? '#fff' : '#f6ffed',
                    padding: '16px',
                    marginBottom: '8px',
                    borderRadius: '8px',
                    border: item.read ? '1px solid #f0f0f0' : '1px solid #b7eb8f',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleViewDetail(item)}
                  actions={[
                    !item.read && (
                      <Button
                        type="link"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(item.id);
                        }}
                      >
                        已读
                      </Button>
                    ),
                    <Button
                      type="link"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                    >
                      删除
                    </Button>
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong={!item.read}>{item.title}</Text>
                        {getTypeTag(item.type)}
                      </Space>
                    }
                    description={
                      <Text type="secondary" style={{ display: 'block', maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.content}
                      </Text>
                    }
                  />
                  <Text type="secondary">{formatTime(item.createTime)}</Text>
                </List.Item>
              )}
              pagination={{
                current,
                pageSize: 10,
                total,
                onChange: handlePageChange,
                showSizeChanger: false,
                showTotal: (total) => `共 ${total} 条消息`
              }}
            />
          )}
        </Spin>
      </Card>

      <Modal
        title={selectedMessage?.title}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="delete" danger icon={<DeleteOutlined />} onClick={() => {
            if (selectedMessage) {
              handleDelete(selectedMessage.id);
              setDetailVisible(false);
            }
          }}>
            删除
          </Button>,
          <Button key="close" type="primary" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {selectedMessage && (
          <div>
            <Space style={{ marginBottom: 16 }}>
              {getTypeTag(selectedMessage.type)}
              <Text type="secondary">{formatTime(selectedMessage.createTime)}</Text>
              {selectedMessage.read && <Tag color="success">已读</Tag>}
            </Space>
            <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
              {selectedMessage.content}
            </Paragraph>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SystemMessagesPage;

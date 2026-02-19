import React, { useState, useEffect } from 'react';
import { Card, List, Image, Typography, Button, Empty, Popconfirm, message, Tag, Space } from 'antd';
import { DeleteOutlined, EyeOutlined, ShopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getBrowseHistory, clearBrowseHistory, deleteBrowseHistory } from '../services/user';

interface BrowseProduct {
  id: number;
  title: string;
  price: number;
  images: string[];
  status: string;
  sellerId: number;
  sellerNickname?: string;
  sellerUsername?: string;
}

const { Title, Text } = Typography;

const BrowseHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<BrowseProduct[]>([]);

  useEffect(() => {
    loadBrowseHistory();
  }, []);

  const loadBrowseHistory = async () => {
    setLoading(true);
    try {
      const res = await getBrowseHistory(20);
      setHistory(res.data.data || []);
    } catch (error) {
      message.error('加载浏览历史失败');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearBrowseHistory();
      message.success('浏览历史已清空');
      setHistory([]);
    } catch (error) {
      message.error('清空失败');
    }
  };

  const handleDelete = async (productId: number) => {
    try {
      await deleteBrowseHistory(productId);
      message.success('删除成功');
      setHistory(history.filter(item => item.id !== productId));
    } catch (error) {
      message.error('删除失败');
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      AVAILABLE: { color: 'green', text: '在售' },
      PENDING: { color: 'orange', text: '待审核' },
      SOLD: { color: 'red', text: '已售' },
      OFFLINE: { color: 'default', text: '已下架' },
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px' }}>
      <Card
        title={
          <Space>
            <EyeOutlined />
            <span>浏览历史</span>
          </Space>
        }
        extra={
          history.length > 0 && (
            <Popconfirm
              title="确定清空所有浏览记录吗？"
              onConfirm={handleClearAll}
              okText="确定"
              cancelText="取消"
            >
              <Button danger>清空全部</Button>
            </Popconfirm>
          )
        }
      >
        {history.length === 0 ? (
          <Empty
            description="暂无浏览记录"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/')}>
              去逛逛
            </Button>
          </Empty>
        ) : (
          <List
            loading={loading}
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
            dataSource={history}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  onClick={() => navigate(`/products/${item.id}`)}
                  cover={
                    <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                      <Image
                        src={item.images?.[0] ? `http://localhost:8080${item.images[0]}` : '/placeholder.png'}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        preview={false}
                      />
                      <div style={{ position: 'absolute', top: 8, right: 8 }}>
                        {getStatusTag(item.status)}
                      </div>
                    </div>
                  }
                  actions={[
                    <Popconfirm
                      title="确定删除这条记录吗？"
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        handleDelete(item.id);
                      }}
                      onCancel={(e) => e?.stopPropagation()}
                      okText="确定"
                      cancelText="取消"
                    >
                      <DeleteOutlined onClick={(e) => e.stopPropagation()} />
                    </Popconfirm>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <Text ellipsis style={{ maxWidth: 180 }}>
                        {item.title}
                      </Text>
                    }
                    description={
                      <Space direction="vertical" size={0} style={{ width: '100%' }}>
                        <Text strong style={{ color: '#ff4d4f', fontSize: 16 }}>
                          ¥{item.price}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <ShopOutlined /> {item.sellerNickname || item.sellerUsername || '未知卖家'}
                        </Text>
                      </Space>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default BrowseHistoryPage;

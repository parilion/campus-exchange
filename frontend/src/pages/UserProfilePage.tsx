import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Avatar, Tag, Descriptions, Spin, Button, Row, Col, List, Empty } from 'antd';
import { UserOutlined, CheckCircleFilled, ShopOutlined, StarFilled, LikeOutlined } from '@ant-design/icons';
import { getUserPublicProfile, type UserPublicProfile } from '../services/user';
import { getProductsByUser } from '../services/product';
import type { Product } from '../types';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserPublicProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const res = await getUserPublicProfile(parseInt(userId));
        setProfile(res.data);
      } catch (error) {
        console.error('获取用户信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchProducts = async () => {
      setProductLoading(true);
      try {
        const res = await getProductsByUser(parseInt(userId));
        setProducts(res.data || []);
      } catch (error) {
        console.error('获取用户商品失败:', error);
      } finally {
        setProductLoading(false);
      }
    };

    fetchProfile();
    fetchProducts();
  }, [userId]);

  const getCreditStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarFilled key={i} style={{ color: i < level ? '#faad14' : '#d9d9d9' }} />
    ));
  };

  const getCreditLabel = (level: number): { text: string; color: string } => {
    const labels: Record<number, { text: string; color: string }> = {
      1: { text: '新手卖家', color: '#8c8c8c' },
      2: { text: '普通卖家', color: '#1890ff' },
      3: { text: '良好信用', color: '#52c41a' },
      4: { text: '优质卖家', color: '#fa8c16' },
      5: { text: '卓越卖家', color: '#f5222d' },
    };
    return labels[level] || labels[1];
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Empty description="用户不存在" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      {/* 用户信息卡片 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
            <Avatar
              size={120}
              src={profile.avatar}
              icon={!profile.avatar && <UserOutlined />}
              style={{ marginBottom: 16 }}
            />
            {profile.verified && (
              <Tag color="green" icon={<CheckCircleFilled />} style={{ marginTop: 8 }}>
                已认证
              </Tag>
            )}
          </Col>
          <Col xs={24} sm={18}>
            <div style={{ marginBottom: 16 }}>
              <h1 style={{ margin: 0, fontSize: 24 }}>
                {profile.nickname || profile.username}
              </h1>
              <span style={{ color: '#888', marginLeft: 12 }}>
                @{profile.username}
              </span>
            </div>

            {profile.studentId && (
              <Tag color="blue" style={{ marginBottom: 16 }}>
                学号: {profile.studentId}
              </Tag>
            )}

            <Descriptions column={2} size="small">
              <Descriptions.Item label="注册时间">
                {formatDate(profile.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="信用等级">
                <span>
                  <span style={{ fontSize: 14 }}>
                    {getCreditStars(profile.creditLevel)}
                  </span>
                  <span style={{
                    marginLeft: 6,
                    color: getCreditLabel(profile.creditLevel).color,
                    fontWeight: 500,
                    fontSize: 12,
                  }}>
                    {getCreditLabel(profile.creditLevel).text}
                  </span>
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* 统计数据卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <ShopOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>
                {profile.productCount}
              </div>
              <div style={{ color: '#888' }}>在售商品</div>
            </div>
          </Card>
        </Col>
        <Col xs={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <LikeOutlined style={{ fontSize: 32, color: '#52c41a' }} />
              <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>
                {profile.soldCount}
              </div>
              <div style={{ color: '#888' }}>已售商品</div>
            </div>
          </Card>
        </Col>
        <Col xs={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <StarFilled style={{ fontSize: 32, color: '#faad14' }} />
              <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>
                {profile.positiveRate}%
              </div>
              <div style={{ color: '#888' }}>好评率</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 用户商品列表 */}
      <Card
        title="TA的商品"
        extra={
          <Button type="link" onClick={() => navigate(`/products?userId=${userId}`)}>
            查看全部
          </Button>
        }
      >
        {productLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin />
          </div>
        ) : products.length > 0 ? (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 4 }}
            dataSource={products.slice(0, 8)}
            renderItem={(product) => (
              <List.Item>
                <Card
                  hoverable
                  cover={
                    product.images && product.images.length > 0 ? (
                      <img
                        alt={product.title}
                        src={product.images[0]}
                        style={{ height: 200, objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ height: 200, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                      </div>
                    )
                  }
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <Card.Meta
                    title={product.title}
                    description={
                      <div>
                        <span style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: 16 }}>
                          ¥{product.price}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span style={{ textDecoration: 'line-through', color: '#999', marginLeft: 8, fontSize: 12 }}>
                            ¥{product.originalPrice}
                          </span>
                        )}
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无在售商品" />
        )}
      </Card>
    </div>
  );
};

export default UserProfilePage;

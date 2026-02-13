import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Image, Tag, Button, Descriptions, Avatar, Space, Typography, Spin, Divider, message, Alert } from 'antd';
import { ArrowLeftOutlined, EyeOutlined, HeartOutlined, MessageOutlined, ShareAltOutlined, WarningOutlined, EditOutlined } from '@ant-design/icons';
import { getProduct } from '../services/product';
import { useAuthStore } from '../stores/authStore';
import type { Product } from '../types';
import './ProductDetailPage.css';

const { Title, Text, Paragraph } = Typography;

// 新旧程度映射
const CONDITION_COLORS: Record<string, string> = {
  NEW: '#52c41a',
  LIKE_NEW: '#73d13d',
  GOOD: '#1890ff',
  FAIR: '#faad14',
  POOR: '#ff4d4f',
};

const CONDITION_LABELS: Record<string, string> = {
  NEW: '全新',
  LIKE_NEW: '几乎全新',
  GOOD: '良好',
  FAIR: '一般',
  POOR: '较差',
};

const STATUS_LABELS: Record<string, string> = {
  ON_SALE: '在售',
  SOLD: '已售',
  OFF_SHELF: '已下架',
};

const STATUS_COLORS: Record<string, string> = {
  ON_SALE: 'green',
  SOLD: 'orange',
  OFF_SHELF: 'red',
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const userId = useAuthStore((state) => state.user?.id);

  // 加载商品详情
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getProduct(Number(id));
        setProduct(data);
      } catch (error) {
        console.error('Failed to load product:', error);
        message.error('商品不存在或已被删除');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  // 处理联系卖家
  const handleContactSeller = () => {
    message.info('聊天功能开发中...');
  };

  // 处理返回
  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://via.placeholder.com/600x400?text=No+Image'];

  return (
    <div className="product-detail-page">
      {/* 返回按钮和编辑按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleGoBack}
          className="back-button"
        >
          返回
        </Button>
        {userId === product.sellerId && product.status === 'ON_SALE' && (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/${product.id}/edit`)}
          >
            编辑商品
          </Button>
        )}
      </div>

      <Row gutter={[24, 24]}>
        {/* 左侧 - 商品图片 */}
        <Col xs={24} md={12}>
          <div className="image-section">
            {/* 主图 */}
            <div className="main-image-wrapper">
              <Image
                src={images[selectedImage]}
                alt={product.title}
                fallback="https://via.placeholder.com/600x400?text=Image+Error"
                className="main-image"
              />
              <Tag
                className="condition-tag"
                color={CONDITION_COLORS[product.condition] || 'default'}
              >
                {CONDITION_LABELS[product.condition] || product.condition}
              </Tag>
              <Tag
                className="status-tag"
                color={STATUS_COLORS[product.status] || 'default'}
              >
                {STATUS_LABELS[product.status] || product.status}
              </Tag>
            </div>

            {/* 缩略图列表 */}
            {images.length > 1 && (
              <div className="thumbnail-list">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail-item ${index === selectedImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <Image
                      src={img}
                      alt={`${product.title} ${index + 1}`}
                      preview={false}
                      fallback="https://via.placeholder.com/100x100?text=Error"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Col>

        {/* 右侧 - 商品信息 */}
        <Col xs={24} md={12}>
          <div className="info-section">
            {/* 商品标题 */}
            <Title level={2} className="product-title">
              {product.title}
            </Title>

            {/* 价格信息 */}
            <div className="price-section">
              <span className="current-price">¥{product.price.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="original-price">¥{product.originalPrice.toFixed(2)}</span>
                  <Tag color="red" className="discount-tag">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </Tag>
                </>
              )}
            </div>

            {/* 统计信息 */}
            <div className="stats-section">
              <Space size="large">
                <span><EyeOutlined /> {product.viewCount || 0} 次浏览</span>
                <span><HeartOutlined /> {product.favoriteCount || 0} 人收藏</span>
              </Space>
            </div>

            <Divider />

            {/* 商品详细信息 */}
            <Descriptions column={1} className="product-descriptions">
              <Descriptions.Item label="商品分类">
                {product.categoryName || '未分类'}
              </Descriptions.Item>
              <Descriptions.Item label="新旧程度">
                <Tag color={CONDITION_COLORS[product.condition]}>
                  {CONDITION_LABELS[product.condition] || product.condition}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="商品状态">
                <Tag color={STATUS_COLORS[product.status]}>
                  {STATUS_LABELS[product.status] || product.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="发布时间">
                {new Date(product.createdAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* 商品描述 */}
            <div className="description-section">
              <Text strong>商品描述</Text>
              <Paragraph className="description-content">
                {product.description || '暂无描述'}
              </Paragraph>
            </div>

            <Divider />

            {/* 卖家信息 */}
            <div className="seller-section">
              <Text strong>卖家信息</Text>
              <Card className="seller-card" size="small">
                <div className="seller-info">
                  <Avatar
                    size={48}
                    src={product.sellerAvatar}
                    style={{ backgroundColor: '#1890ff' }}
                  >
                    {product.sellerNickname?.charAt(0) || 'U'}
                  </Avatar>
                  <div className="seller-details">
                    <Text strong>{product.sellerNickname || '匿名用户'}</Text>
                    <Text type="secondary" className="seller-id">
                      ID: {product.sellerId}
                    </Text>
                  </div>
                </div>
              </Card>
            </div>

            {/* 操作按钮 */}
            <div className="action-buttons">
              {product.status === 'ON_SALE' ? (
                <>
                  <Button
                    type="primary"
                    size="large"
                    icon={<MessageOutlined />}
                    onClick={handleContactSeller}
                    className="contact-button"
                  >
                    联系卖家
                  </Button>
                  <Button
                    size="large"
                    icon={<HeartOutlined />}
                    className="favorite-button"
                  >
                    收藏
                  </Button>
                </>
              ) : (
                <Alert
                  message="该商品已下架或已售出"
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                />
              )}
              <Button
                size="large"
                icon={<ShareAltOutlined />}
                className="share-button"
              >
                分享
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Spin } from 'antd';
import {
  BookOutlined,
  LaptopOutlined,
  CoffeeOutlined,
  SkinOutlined,
  TeamOutlined,
  ShoppingOutlined,
  FireOutlined,
  ClockCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { getProductList } from '../services/product';
import type { Product, ProductPageResponse } from '../types';
import SearchBox from '../components/SearchBox';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import HomeBanner from '../components/HomeBanner';
import type { BannerItem } from '../components/HomeBanner';
import './HomePage.css';

const { Title, Text } = Typography;

// 分类数据
const CATEGORIES = [
  { id: 1, name: '教材书籍', icon: <BookOutlined />, color: '#1890ff' },
  { id: 2, name: '电子产品', icon: <LaptopOutlined />, color: '#52c41a' },
  { id: 3, name: '生活用品', icon: <CoffeeOutlined />, color: '#faad14' },
  { id: 4, name: '服饰鞋帽', icon: <ShoppingOutlined />, color: '#eb2f96' },
  { id: 5, name: '运动户外', icon: <TeamOutlined />, color: '#13c2c2' },
  { id: 6, name: '美妆护肤', icon: <SkinOutlined />, color: '#722ed1' },
];

// 轮播图数据
const BANNERS: BannerItem[] = [
  {
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=400&fit=crop',
    title: '校园二手交易平台',
    description: '省钱又环保，让闲置物品找到新主人',
    link: '/products',
  },
  {
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=400&fit=crop',
    title: '电子产品专场',
    description: '手机、电脑、平板优惠多多',
    link: '/products?categoryId=2',
  },
  {
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&h=400&fit=crop',
    title: '教材书籍优惠',
    description: '学长学姐的笔记和教材，超值转让',
    link: '/products?categoryId=1',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const [hotData, latestData] = await Promise.all([
          getProductList({ page: 1, pageSize: 8, sortBy: 'viewCount', sortOrder: 'desc' }),
          getProductList({ page: 1, pageSize: 8, sortBy: 'createdAt', sortOrder: 'desc' }),
        ]) as [ProductPageResponse, ProductPageResponse];
        setHotProducts(hotData.list || []);
        setLatestProducts(latestData.list || []);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleSearch = (value: string) => {
    navigate(`/products?keyword=${encodeURIComponent(value)}`);
  };

  const handleCategoryClick = (categoryId: number) => {
    navigate(`/products?categoryId=${categoryId}`);
  };

  // 骨架屏列表
  const SkeletonGrid = () => (
    <Row gutter={[16, 16]}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Col key={i} xs={12} sm={8} md={6} lg={6}>
          <ProductCardSkeleton />
        </Col>
      ))}
    </Row>
  );

  return (
    <div className="home-page">
      {/* 轮播图 */}
      <div className="home-banner">
        <HomeBanner banners={BANNERS} height={360} />
      </div>

      {/* 搜索区域 */}
      <div className="home-search-section">
        <div className="home-search-container">
          <SearchBox onSearch={handleSearch} />
        </div>
      </div>

      {/* 分类导航 */}
      <div className="home-category-section">
        <div className="home-section-container">
          <Row gutter={[16, 16]}>
            {CATEGORIES.map(category => (
              <Col key={category.id} xs={8} sm={4} md={4}>
                <div
                  className="home-category-item"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <div className="home-category-icon" style={{ backgroundColor: category.color }}>
                    {category.icon}
                  </div>
                  <Text className="home-category-name">{category.name}</Text>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* 热门推荐 */}
      <div className="home-section">
        <div className="home-section-container">
          <div className="home-section-header">
            <Title level={4} className="home-section-title">
              <FireOutlined className="home-fire-icon" />
              热门推荐
            </Title>
            <Text
              className="home-section-more"
              onClick={() => navigate('/products?sortBy=viewCount&sortOrder=desc')}
            >
              查看更多 <RightOutlined />
            </Text>
          </div>
          <Spin spinning={loading}>
            {loading ? (
              <SkeletonGrid />
            ) : (
              <Row gutter={[16, 16]}>
                {hotProducts.map(product => (
                  <Col key={product.id} xs={12} sm={8} md={6} lg={6}>
                    <ProductCard
                      product={product}
                      onClick={() => navigate(`/products/${product.id}`)}
                      showSeller
                      showFavoriteCount
                      imageHeight={180}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Spin>
        </div>
      </div>

      {/* 最新发布 */}
      <div className="home-section">
        <div className="home-section-container">
          <div className="home-section-header">
            <Title level={4} className="home-section-title">
              <ClockCircleOutlined className="home-clock-icon" />
              最新发布
            </Title>
            <Text
              className="home-section-more"
              onClick={() => navigate('/products?sortBy=createdAt&sortOrder=desc')}
            >
              查看更多 <RightOutlined />
            </Text>
          </div>
          <Spin spinning={loading}>
            {loading ? (
              <SkeletonGrid />
            ) : (
              <Row gutter={[16, 16]}>
                {latestProducts.map(product => (
                  <Col key={product.id} xs={12} sm={8} md={6} lg={6}>
                    <ProductCard
                      product={product}
                      onClick={() => navigate(`/products/${product.id}`)}
                      showSeller
                      showDate
                      imageHeight={180}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Spin>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="home-footer-tips">
        <div className="home-section-container">
          <Row gutter={[32, 16]} justify="center">
            <Col xs={24} md={8}>
              <div className="home-tip-item">
                <div className="home-tip-icon">💰</div>
                <div className="home-tip-content">
                  <Title level={5}>省钱环保</Title>
                  <Text type="secondary">二手交易节省开支，资源共享保护环境</Text>
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="home-tip-item">
                <div className="home-tip-icon">🔒</div>
                <div className="home-tip-content">
                  <Title level={5}>安全交易</Title>
                  <Text type="secondary">实名认证保障，平台担保交易安全</Text>
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="home-tip-item">
                <div className="home-tip-icon">📱</div>
                <div className="home-tip-content">
                  <Title level={5}>便捷快速</Title>
                  <Text type="secondary">随时随地发布商品，快速匹配买卖双方</Text>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}

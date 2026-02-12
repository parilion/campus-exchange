import { useState, useEffect } from 'react';
import { Row, Col, Card, Select, Pagination, Empty, Image, Tag, Space, Typography } from 'antd';
import { FireOutlined, ClockCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { getProductList } from '../services/product';
import type { Product, ProductPageResponse } from '../types';
import './ProductListPage.css';

const { Title, Text } = Typography;

// 分类选项
const CATEGORY_OPTIONS = [
  { value: undefined, label: '全部分类' },
  { value: 1, label: '教材书籍' },
  { value: 2, label: '电子产品' },
  { value: 3, label: '生活用品' },
  { value: 4, label: '服饰鞋帽' },
  { value: 5, label: '运动户外' },
  { value: 6, label: '美妆护肤' },
  { value: 7, label: '食品饮料' },
  { value: 8, label: '其他' },
];

// 排序选项
const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: '最新发布' },
  { value: 'createdAt-asc', label: '最早发布' },
  { value: 'price-asc', label: '价格从低到高' },
  { value: 'price-desc', label: '价格从高到低' },
  { value: 'viewCount-desc', label: '热度优先' },
];

// 新旧程度标签颜色
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

// 价格显示组件
const PriceTag = ({ price, originalPrice }: { price: number; originalPrice?: number }) => (
  <div className="price-container">
    <span className="current-price">¥{price.toFixed(2)}</span>
    {originalPrice && originalPrice > price && (
      <span className="original-price">¥{originalPrice.toFixed(2)}</span>
    )}
  </div>
);

// 商品卡片组件
const ProductCard = ({ product }: { product: Product }) => {
  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <Card
      hoverable
      className="product-card"
      cover={
        <div className="product-image-wrapper">
          <Image
            src={imageUrl}
            alt={product.title}
            preview={false}
            fallback="https://via.placeholder.com/300x200?text=Image+Error"
            style={{ height: 200, objectFit: 'cover' }}
          />
          <Tag
            className="condition-tag"
            color={CONDITION_COLORS[product.condition] || 'default'}
          >
            {CONDITION_LABELS[product.condition] || product.condition}
          </Tag>
        </div>
      }
    >
      <Card.Meta
        title={<Text ellipsis={{ tooltip: product.title }}>{product.title}</Text>}
        description={
          <div className="product-info">
            <PriceTag price={product.price} originalPrice={product.originalPrice} />
            <Space className="product-stats" size="small">
              <span><ClockCircleOutlined /> {new Date(product.createdAt).toLocaleDateString()}</span>
              <span><EyeOutlined /> {product.viewCount || 0}</span>
            </Space>
          </div>
        }
      />
    </Card>
  );
};

// 页面骨架组件
const ProductCardSkeleton = () => (
  <Card hoverable className="product-card skeleton">
    <div className="skeleton-image" />
    <div className="skeleton-content">
      <div className="skeleton-title" />
      <div className="skeleton-price" />
    </div>
  </Card>
);

export default function ProductListPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    categoryId: undefined as number | undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // 加载商品列表
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data: ProductPageResponse = await getProductList({
        page: pagination.page,
        pageSize: pagination.pageSize,
        categoryId: filters.categoryId,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });
      setProducts(data.list);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages,
      }));
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [pagination.page, filters]);

  // 处理筛选变化
  const handleCategoryChange = (value: number | undefined) => {
    setFilters(prev => ({ ...prev, categoryId: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, page, pageSize }));
  };

  return (
    <div className="product-list-page">
      {/* 页面头部 */}
      <div className="page-header">
        <Title level={2} className="page-title">
          <FireOutlined className="fire-icon" />
          闲置好物
        </Title>
        <Text type="secondary">精选校园二手好物，发现更多惊喜</Text>
      </div>

      {/* 筛选栏 */}
      <div className="filter-bar">
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} sm={12} md={8}>
            <Select
              style={{ width: '100%' }}
              value={filters.categoryId}
              onChange={handleCategoryChange}
              options={CATEGORY_OPTIONS}
              placeholder="选择分类"
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={handleSortChange}
              options={SORT_OPTIONS}
              placeholder="排序方式"
            />
          </Col>
          <Col xs={24} md={10} className="result-count">
            <Text type="secondary">
              共 {pagination.total} 件商品
            </Text>
          </Col>
        </Row>
      </div>

      {/* 商品列表 */}
      <div className="product-grid">
        {loading ? (
          // 加载骨架屏
          <Row gutter={[16, 16]}>
            {Array.from({ length: 8 }).map((_, index) => (
              <Col key={index} xs={12} sm={8} md={6} lg={6}>
                <ProductCardSkeleton />
              </Col>
            ))}
          </Row>
        ) : products.length === 0 ? (
          <Empty
            description="暂无商品"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ marginTop: 80 }}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {products.map(product => (
              <Col key={product.id} xs={12} sm={8} md={6} lg={6}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* 分页 */}
      {!loading && products.length > 0 && (
        <div className="pagination-wrapper">
          <Pagination
            current={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `共 ${total} 件商品`}
            pageSizeOptions={['8', '12', '24', '48']}
          />
        </div>
      )}
    </div>
  );
}

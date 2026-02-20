import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Select, Pagination, Empty, Space, Typography, Input } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import { getProductList } from '../services/product';
import type { Product, ProductPageResponse } from '../types';
import SearchBox from '../components/SearchBox';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { CATEGORY_OPTIONS, CONDITION_LABELS } from '../constants/product';
import './ProductListPage.css';

const { Title, Text } = Typography;

// 排序选项
const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: '最新发布' },
  { value: 'createdAt-asc', label: '最早发布' },
  { value: 'price-asc', label: '价格从低到高' },
  { value: 'price-desc', label: '价格从高到低' },
  { value: 'viewCount-desc', label: '热度优先' },
];

// 新旧程度筛选选项
const CONDITION_OPTIONS = [
  { value: undefined, label: '全部成色' },
  ...Object.entries(CONDITION_LABELS).map(([value, label]) => ({ value, label })),
];

export default function ProductListPage() {
  const navigate = useNavigate();
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
    keyword: '',
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    condition: undefined as string | undefined,
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data: ProductPageResponse = await getProductList({
        page: pagination.page,
        pageSize: pagination.pageSize,
        categoryId: filters.categoryId,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        keyword: filters.keyword || undefined,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        condition: filters.condition,
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

  const handleCategoryChange = (value: number | undefined) => {
    setFilters(prev => ({ ...prev, categoryId: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, keyword: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePriceChange = (type: 'min' | 'max', value: number | undefined) => {
    setFilters(prev => ({ ...prev, [type === 'min' ? 'minPrice' : 'maxPrice']: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleConditionChange = (value: string | undefined) => {
    setFilters(prev => ({ ...prev, condition: value }));
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
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <SearchBox defaultValue={filters.keyword} onSearch={handleSearch} />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              style={{ width: '100%' }}
              value={filters.categoryId}
              onChange={handleCategoryChange}
              options={CATEGORY_OPTIONS}
              placeholder="选择分类"
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="最低价"
                type="number"
                value={filters.minPrice}
                onChange={(e) => handlePriceChange('min', e.target.value ? Number(e.target.value) : undefined)}
                style={{ width: '50%' }}
              />
              <Input
                placeholder="最高价"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handlePriceChange('max', e.target.value ? Number(e.target.value) : undefined)}
                style={{ width: '50%' }}
              />
            </Space.Compact>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              style={{ width: '100%' }}
              value={filters.condition}
              onChange={handleConditionChange}
              options={CONDITION_OPTIONS}
              placeholder="新旧程度"
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              style={{ width: '100%' }}
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={handleSortChange}
              options={SORT_OPTIONS}
              placeholder="排序方式"
            />
          </Col>
          <Col xs={24} md={4} className="result-count">
            <Text type="secondary">共 {pagination.total} 件商品</Text>
          </Col>
        </Row>
      </div>

      {/* 商品列表 */}
      <div className="product-grid">
        {loading ? (
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
                <ProductCard
                  product={product}
                  onClick={() => navigate(`/products/${product.id}`)}
                  showSeller
                  showDate
                />
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

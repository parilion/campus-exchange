import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Select, Pagination, Empty, Image, Tag, Space, Typography, Button, Modal, message, Dropdown, Menu, Tabs } from 'antd';
import { PlusOutlined, ClockCircleOutlined, EyeOutlined, MoreOutlined, EditOutlined, DeleteOutlined, StopOutlined, FileTextOutlined, PushpinOutlined } from '@ant-design/icons';
import { getMyProducts, deleteProduct, getDrafts, setProductTop } from '../services/product';
import type { Product, ProductPageResponse } from '../types';
import './MyProductsPage.css';

const { Title, Text } = Typography;

// 状态选项
const STATUS_OPTIONS = [
  { value: undefined, label: '全部' },
  { value: 'ON_SALE', label: '在售' },
  { value: 'SOLD', label: '已售' },
  { value: 'OFF_SHELF', label: '已下架' },
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

const STATUS_LABELS: Record<string, string> = {
  ON_SALE: '在售',
  SOLD: '已售',
  OFF_SHELF: '已下架',
  DELETED: '已删除',
};

const STATUS_COLORS: Record<string, string> = {
  ON_SALE: 'green',
  SOLD: 'orange',
  OFF_SHELF: 'red',
  DELETED: 'default',
};

// 商品卡片组件
const MyProductCard = ({ product, onEdit, onDelete, onStatusChange, onSetTop }: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
  onSetTop: (days: number) => void;
}) => {
  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://via.placeholder.com/300x200?text=No+Image';

  const menu = (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={onEdit}>
        编辑商品
      </Menu.Item>
      {product.status === 'ON_SALE' && (
        <>
          <Menu.Item key="top7" onClick={() => onSetTop(7)}>
            置顶7天
          </Menu.Item>
          <Menu.Item key="top30" onClick={() => onSetTop(30)}>
            置顶30天
          </Menu.Item>
          <Menu.Item key="offshelf" icon={<StopOutlined />} onClick={() => onStatusChange('OFF_SHELF')}>
            下架商品
          </Menu.Item>
        </>
      )}
      {product.isTop && (
        <Menu.Item key="untop" onClick={() => onSetTop(0)}>
          取消置顶
        </Menu.Item>
      )}
      {product.status === 'OFF_SHELF' && (
        <Menu.Item key="onshelf" icon={<PlusOutlined />} onClick={() => onStatusChange('ON_SALE')}>
          重新上架
        </Menu.Item>
      )}
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={onDelete}>
        删除商品
      </Menu.Item>
    </Menu>
  );

  return (
    <Card
      className="my-product-card"
      cover={
        <div className="product-image-wrapper">
          <Image
            src={imageUrl}
            alt={product.title}
            preview={false}
            fallback="https://via.placeholder.com/300x200?text=Image+Error"
            style={{ height: 160, objectFit: 'cover' }}
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
          {product.isTop && (
            <Tag color="red" className="top-tag" style={{ position: 'absolute', top: 8, left: 8 }}>
              <PushpinOutlined /> 置顶
            </Tag>
          )}
        </div>
      }
    >
      <Card.Meta
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text ellipsis={{ tooltip: product.title }} style={{ flex: 1 }}>{product.title}</Text>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Dropdown dropdownRender={() => menu as any} trigger={['click']}>
              <Button type="text" icon={<MoreOutlined />} size="small" />
            </Dropdown>
          </div>
        }
        description={
          <div className="product-info">
            {/* 显示标签 */}
            {product.tags && product.tags.length > 0 && (
              <Space wrap size={4} style={{ marginBottom: 8 }}>
                {product.tags.slice(0, 3).map((tag, index) => (
                  <Tag key={index} color="blue" style={{ fontSize: 12, padding: '0 4px' }}>{tag}</Tag>
                ))}
                {product.tags.length > 3 && (
                  <Tag style={{ fontSize: 12, padding: '0 4px' }}>+{product.tags.length - 3}</Tag>
                )}
              </Space>
            )}
            <div className="price-row">
              <span className="current-price">¥{product.price.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="original-price">¥{product.originalPrice.toFixed(2)}</span>
              )}
            </div>
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

export default function MyProductsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('products');

  // 加载商品列表
  const loadProducts = async () => {
    setLoading(true);
    try {
      let data: ProductPageResponse;
      if (activeTab === 'drafts') {
        data = await getDrafts({
          page: pagination.page,
          pageSize: pagination.pageSize,
        });
      } else {
        data = await getMyProducts({
          page: pagination.page,
          pageSize: pagination.pageSize,
          status: statusFilter,
        });
      }
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
  }, [pagination.page, statusFilter, activeTab]);

  // 处理状态筛选变化
  const handleFilterStatusChange = (value: string | undefined) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, page, pageSize }));
  };

  // 编辑商品
  const handleEdit = (id: number) => {
    navigate(`/products/${id}/edit`);
  };

  // 删除商品
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个商品吗？删除后无法恢复。',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteProduct(id);
          message.success('商品已删除');
          loadProducts();
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : '删除失败';
          message.error(errorMsg);
        }
      },
    });
  };

  // 上下架商品
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleProductStatusChange = async (_id: number, status: string) => {
    try {
      // TODO: 实现上下架API
      message.success(status === 'ON_SALE' ? '商品已上架' : '商品已下架');
      loadProducts();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '操作失败';
      message.error(errorMsg);
    }
  };

  // 置顶商品
  const handleSetTop = async (id: number, days: number) => {
    try {
      await setProductTop(id, days);
      message.success(days > 0 ? `商品已置顶${days}天` : '商品已取消置顶');
      loadProducts();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '操作失败';
      message.error(errorMsg);
    }
  };

  return (
    <div className="my-products-page">
      {/* 页面头部 */}
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">我的发布</Title>
          <Text type="secondary">管理您发布的商品</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/publish')}
        >
          发布商品
        </Button>
      </div>

      {/* 筛选栏 */}
      <div className="filter-bar">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'products', label: <span><PushpinOutlined /> 我的发布</span> },
            { key: 'drafts', label: <span><FileTextOutlined /> 草稿箱</span> },
          ]}
        />
        {activeTab === 'products' && (
          <Select
            style={{ width: 200 }}
            value={statusFilter}
            onChange={handleFilterStatusChange}
            options={STATUS_OPTIONS}
            placeholder="选择状态"
          />
        )}
        <Text type="secondary">
          共 {pagination.total} 件{activeTab === 'drafts' ? '草稿' : '商品'}
        </Text>
      </div>

      {/* 商品列表 */}
      <div className="product-grid">
        {loading ? (
          <Row gutter={[16, 16]}>
            {Array.from({ length: 8 }).map((_, index) => (
              <Col key={index} xs={12} sm={8} md={6} lg={6}>
                <Card hoverable className="my-product-card skeleton">
                  <div className="skeleton-image" />
                  <div className="skeleton-content">
                    <div className="skeleton-title" />
                    <div className="skeleton-price" />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : products.length === 0 ? (
          <Empty
            description="暂无发布的商品"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ marginTop: 80 }}
          >
            <Button type="primary" onClick={() => navigate('/publish')}>
              发布第一个商品
            </Button>
          </Empty>
        ) : (
          <Row gutter={[16, 16]}>
            {products.map(product => (
              <Col key={product.id} xs={12} sm={8} md={6} lg={6}>
                <MyProductCard
                  product={product}
                  onEdit={() => handleEdit(product.id)}
                  onDelete={() => handleDelete(product.id)}
                  onStatusChange={(status) => handleProductStatusChange(product.id, status)}
                  onSetTop={(days) => handleSetTop(product.id, days)}
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
            showTotal={(total) => `共 ${total} 件商品`}
          />
        </div>
      )}
    </div>
  );
}

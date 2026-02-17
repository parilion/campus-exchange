import React, { useEffect, useState } from 'react';
import { Card, Empty, Button, Spin, message, Modal } from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getFavoriteList, removeFavorite } from '../services/favorite';
import type { ProductVO } from '../types';

const { Meta } = Card;

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<ProductVO[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(12);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const result = await getFavoriteList(page, pageSize);
      setFavorites(result.list || []);
      setTotal(result.total || 0);
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      message.error('获取收藏列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [page]);

  const handleRemoveFavorite = async (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: '确认取消收藏',
      content: '确定要取消收藏该商品吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await removeFavorite(productId);
          message.success('取消收藏成功');
          fetchFavorites();
        } catch (error) {
          message.error('取消收藏失败');
        }
      },
    });
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const handleBuy = (product: ProductVO, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`, { state: { scrollToBuy: true } });
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 'bold' }}>我的收藏</h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
          </div>
        ) : favorites.length === 0 ? (
          <Empty
            description="暂无收藏商品"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '16px',
            }}>
              {favorites.map((product) => (
                <Card
                  key={product.id}
                  hoverable
                  onClick={() => handleProductClick(product.id)}
                  style={{ borderRadius: '8px', overflow: 'hidden' }}
                  cover={
                    <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                      <img
                        alt={product.title}
                        src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {product.isTop && (
                        <span style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: '#ff4d4f',
                          color: '#fff',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}>
                          置顶
                        </span>
                      )}
                    </div>
                  }
                  actions={[
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={(e) => handleRemoveFavorite(product.id, e)}
                      danger
                    >
                      取消收藏
                    </Button>,
                    <Button
                      type="text"
                      icon={<ShoppingOutlined />}
                      onClick={(e) => handleBuy(product, e)}
                    >
                      去购买
                    </Button>,
                  ]}
                >
                  <Meta
                    title={
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.title}
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ color: '#ff4d4f', fontSize: '18px', fontWeight: 'bold' }}>
                          ¥{product.price}
                        </div>
                        {product.viewCount !== undefined && (
                          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                            {product.viewCount} 次浏览
                          </div>
                        )}
                      </div>
                    }
                  />
                </Card>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Button
                disabled={page * pageSize >= total}
                onClick={() => setPage(page + 1)}
              >
                加载更多
              </Button>
              <span style={{ marginLeft: '16px', color: '#999' }}>
                共 {total} 条收藏
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;

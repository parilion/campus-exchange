import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, List, Avatar, Rate, Spin, Empty, Pagination, message, Typography, Tooltip } from 'antd';
import { getUserReviews, getUserReviewStats } from '../services/review';
import type { Review, ReviewStats } from '../services/review';
import { getProfile } from '../services/user';

const { Text } = Typography;

const MyReviewsPage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getProfile();
        setCurrentUserId(userInfo.data.id);
        if (!userId) {
          loadReviews(userInfo.data.id, 1);
          loadStats(userInfo.data.id);
        }
      } catch (error) {
        message.error('获取用户信息失败');
      }
    };
    fetchUserInfo();
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadReviews(parseInt(userId), 1);
      loadStats(parseInt(userId));
    }
  }, [userId]);

  const loadReviews = async (uid: number, page: number) => {
    setLoading(true);
    try {
      const res = await getUserReviews(uid, page, 10);
      setReviews(res.data.records);
      setTotal(res.data.total);
      setCurrent(page);
    } catch (error) {
      message.error('获取评价列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (uid: number) => {
    try {
      const res = await getUserReviewStats(uid);
      setStats(res.data);
    } catch (error) {
      message.error('获取评价统计失败');
    }
  };

  const handlePageChange = (page: number) => {
    if (userId) {
      loadReviews(parseInt(userId), page);
    } else if (currentUserId) {
      loadReviews(currentUserId, page);
    }
  };

  const renderRatingDist = () => {
    if (!stats) return null;
    const total = stats.totalReviews || 1;

    return (
      <Card title="评价统计" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#faad14' }}>
            {stats.averageRating}
          </div>
          <div style={{ marginLeft: 16 }}>
            <Rate disabled allowHalf value={stats.averageRating} />
            <div style={{ color: '#999', marginTop: 4 }}>
              {stats.totalReviews} 条评价
            </div>
          </div>
        </div>
        <div>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = star === 5 ? stats.rating5Count :
                          star === 4 ? stats.rating4Count :
                          star === 3 ? stats.rating3Count :
                          star === 2 ? stats.rating2Count :
                          stats.rating1Count;
            const percent = Math.round((count / total) * 100);
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ width: 20 }}>{star} 星</span>
                <div style={{ flex: 1, height: 8, background: '#f0f0f0', borderRadius: 4, margin: '0 12px' }}>
                  <div style={{ width: `${percent}%`, height: '100%', background: '#faad14', borderRadius: 4 }} />
                </div>
                <span style={{ width: 40, textAlign: 'right' }}>{count} ({percent}%)</span>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  const renderReviewItem = (review: Review) => (
    <List.Item
      key={review.id}
      style={{ padding: '12px 0' }}
    >
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <Avatar src={review.reviewerAvatar} style={{ marginRight: 8 }}>
            {review.reviewerUsername?.charAt(0)}
          </Avatar>
          <span style={{ fontWeight: 500, marginRight: 8 }}>
            {review.reviewerUsername}
          </span>
          <Rate disabled value={review.rating} style={{ fontSize: 14 }} />
          <span style={{ marginLeft: 'auto', color: '#999', fontSize: 12 }}>
            <Tooltip title={review.createdAt}>
              {new Date(review.createdAt).toLocaleDateString('zh-CN')}
            </Tooltip>
          </span>
        </div>
        <div style={{ marginBottom: 8 }}>
          {review.content || '默认好评'}
        </div>
        {review.images && review.images.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            {review.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
              />
            ))}
          </div>
        )}
        <div style={{ fontSize: 12, color: '#999' }}>
          评价商品: {review.productTitle}
        </div>
      </div>
    </List.Item>
  );

  return (
    <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 24 }}>
        {userId ? '用户评价' : '我的评价'}
      </h2>

      {renderRatingDist()}

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : reviews.length === 0 ? (
          <Empty description="暂无评价" />
        ) : (
          <>
            <List
              dataSource={reviews}
              renderItem={renderReviewItem}
              split={false}
            />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Pagination
                current={current}
                total={total}
                pageSize={10}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default MyReviewsPage;

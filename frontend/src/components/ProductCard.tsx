import { Card, Image, Tag, Space, Avatar, Typography, Badge } from 'antd';
import { EyeOutlined, HeartOutlined, ClockCircleOutlined, PushpinOutlined, UserOutlined } from '@ant-design/icons';
import type { Product } from '../types';
import {
  CONDITION_COLORS,
  CONDITION_LABELS,
  DEFAULT_PRODUCT_IMAGE,
  IMAGE_FALLBACK,
} from '../constants/product';
import './ProductCard.css';

const { Text } = Typography;

// 价格显示组件
export const PriceDisplay = ({ price, originalPrice }: { price: number; originalPrice?: number }) => (
  <div className="pc-price-container">
    <span className="pc-current-price">¥{price.toFixed(2)}</span>
    {originalPrice && originalPrice > price && (
      <span className="pc-original-price">¥{originalPrice.toFixed(2)}</span>
    )}
  </div>
);

// 卖家信息行
const SellerInfo = ({ avatar, nickname }: { avatar?: string; nickname?: string }) => (
  <div className="pc-seller-info">
    <Avatar
      size={20}
      src={avatar}
      icon={<UserOutlined />}
      className="pc-seller-avatar"
    />
    <Text className="pc-seller-name" ellipsis>
      {nickname || '匿名用户'}
    </Text>
  </div>
);

// 商品标签列表
const TagList = ({ tags }: { tags?: string[] }) => {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="pc-tags">
      {tags.slice(0, 3).map((tag) => (
        <Tag key={tag} className="pc-tag">
          {tag}
        </Tag>
      ))}
    </div>
  );
};

// 骨架屏
export const ProductCardSkeleton = () => (
  <Card className="pc-card pc-skeleton">
    <div className="pc-skeleton-image" />
    <div className="pc-skeleton-body">
      <div className="pc-skeleton-title" />
      <div className="pc-skeleton-price" />
      <div className="pc-skeleton-meta" />
    </div>
  </Card>
);

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  /** 显示卖家信息 */
  showSeller?: boolean;
  /** 显示日期 */
  showDate?: boolean;
  /** 显示收藏数 */
  showFavoriteCount?: boolean;
  /** 图片高度 */
  imageHeight?: number;
  /** 额外操作按钮，渲染在卡片右上角 */
  extraAction?: React.ReactNode;
}

/**
 * 可复用商品卡片组件
 * 支持：图片、成色标签、标题、价格、卖家头像/昵称、标签、浏览量、收藏数
 */
const ProductCard = ({
  product,
  onClick,
  showSeller = true,
  showDate = false,
  showFavoriteCount = false,
  imageHeight = 200,
  extraAction,
}: ProductCardProps) => {
  const imageUrl =
    product.images && product.images.length > 0 ? product.images[0] : DEFAULT_PRODUCT_IMAGE;

  return (
    <Badge.Ribbon
      text={product.isTop ? <><PushpinOutlined /> 置顶</> : undefined}
      color="gold"
      style={{ display: product.isTop ? 'block' : 'none' }}
    >
      <Card
        hoverable={!!onClick}
        className="pc-card"
        onClick={onClick}
        cover={
          <div className="pc-image-wrapper" style={{ height: imageHeight }}>
            <Image
              src={imageUrl}
              alt={product.title}
              preview={false}
              fallback={IMAGE_FALLBACK}
              style={{ height: imageHeight, objectFit: 'cover', width: '100%' }}
            />
            <Tag
              className="pc-condition-tag"
              color={CONDITION_COLORS[product.condition] || 'default'}
            >
              {CONDITION_LABELS[product.condition] || product.condition}
            </Tag>
            {extraAction && (
              <div className="pc-extra-action" onClick={(e) => e.stopPropagation()}>
                {extraAction}
              </div>
            )}
          </div>
        }
        styles={{ body: { padding: '12px' } }}
      >
        {/* 商品标题 */}
        <Text strong className="pc-title" ellipsis={{ tooltip: product.title }}>
          {product.title}
        </Text>

        {/* 标签 */}
        <TagList tags={product.tags} />

        {/* 价格 */}
        <PriceDisplay price={product.price} originalPrice={product.originalPrice} />

        {/* 卖家信息 */}
        {showSeller && (
          <SellerInfo avatar={product.sellerAvatar} nickname={product.sellerNickname} />
        )}

        {/* 统计信息 */}
        <Space className="pc-stats" size={8}>
          <span>
            <EyeOutlined /> {product.viewCount || 0}
          </span>
          {showFavoriteCount && (
            <span>
              <HeartOutlined /> {product.favoriteCount || 0}
            </span>
          )}
          {showDate && (
            <span>
              <ClockCircleOutlined /> {new Date(product.createdAt).toLocaleDateString()}
            </span>
          )}
        </Space>
      </Card>
    </Badge.Ribbon>
  );
};

export default ProductCard;

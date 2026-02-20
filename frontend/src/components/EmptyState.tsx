import { Empty, Button } from 'antd';
import { ReactNode, CSSProperties } from 'react';

interface EmptyStateProps {
  /** 图标或图片 */
  image?: ReactNode;
  /** 说明文字 */
  description?: string;
  /** 操作按钮文字 */
  actionText?: string;
  /** 操作按钮点击回调 */
  onAction?: () => void;
  /** 容器样式 */
  style?: CSSProperties;
}

const PRESETS: Record<string, { description: string; image: string }> = {
  product: { description: '暂无商品', image: Empty.PRESENTED_IMAGE_SIMPLE as unknown as string },
  order: { description: '暂无订单', image: Empty.PRESENTED_IMAGE_SIMPLE as unknown as string },
  message: { description: '暂无消息', image: Empty.PRESENTED_IMAGE_SIMPLE as unknown as string },
  favorite: { description: '暂无收藏', image: Empty.PRESENTED_IMAGE_SIMPLE as unknown as string },
  history: { description: '暂无浏览历史', image: Empty.PRESENTED_IMAGE_SIMPLE as unknown as string },
  review: { description: '暂无评价', image: Empty.PRESENTED_IMAGE_SIMPLE as unknown as string },
  search: { description: '没有找到相关内容', image: Empty.PRESENTED_IMAGE_SIMPLE as unknown as string },
};

/**
 * 增强版空状态组件，支持操作按钮
 */
const EmptyState = ({
  image,
  description = '暂无数据',
  actionText,
  onAction,
  style,
}: EmptyStateProps) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      ...style,
    }}
  >
    <Empty
      image={image ?? Empty.PRESENTED_IMAGE_SIMPLE}
      description={<span style={{ color: '#8c8c8c', fontSize: 14 }}>{description}</span>}
    />
    {actionText && onAction && (
      <Button type="primary" onClick={onAction} style={{ marginTop: 16 }}>
        {actionText}
      </Button>
    )}
  </div>
);

/** 预设空状态类型 */
EmptyState.Product = (props: Partial<EmptyStateProps>) => (
  <EmptyState description="暂无商品，快去发布吧" {...props} />
);
EmptyState.Order = (props: Partial<EmptyStateProps>) => (
  <EmptyState description="暂无订单" {...props} />
);
EmptyState.Message = (props: Partial<EmptyStateProps>) => (
  <EmptyState description="暂无消息" {...props} />
);
EmptyState.Search = (props: Partial<EmptyStateProps>) => (
  <EmptyState description="没有找到相关内容，换个关键词试试" {...props} />
);

export { PRESETS };
export default EmptyState;

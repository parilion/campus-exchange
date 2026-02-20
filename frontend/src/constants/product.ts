// 商品相关共享常量

// 新旧程度标签颜色
export const CONDITION_COLORS: Record<string, string> = {
  NEW: '#52c41a',
  LIKE_NEW: '#73d13d',
  GOOD: '#1890ff',
  FAIR: '#faad14',
  POOR: '#ff4d4f',
};

// 新旧程度文字
export const CONDITION_LABELS: Record<string, string> = {
  NEW: '全新',
  LIKE_NEW: '几乎全新',
  GOOD: '良好',
  FAIR: '一般',
  POOR: '较差',
};

// 商品状态文字
export const STATUS_LABELS: Record<string, string> = {
  ON_SALE: '在售',
  SOLD: '已售',
  OFF_SHELF: '已下架',
  DRAFT: '草稿',
  DELETED: '已删除',
};

// 商品状态颜色
export const STATUS_COLORS: Record<string, string> = {
  ON_SALE: 'green',
  SOLD: 'orange',
  OFF_SHELF: 'red',
  DRAFT: 'default',
  DELETED: 'default',
};

// 分类选项
export const CATEGORY_OPTIONS = [
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

// 默认商品图片
export const DEFAULT_PRODUCT_IMAGE = 'https://via.placeholder.com/300x200?text=No+Image';
export const IMAGE_FALLBACK = 'https://via.placeholder.com/300x200?text=Image+Error';

// 默认用户头像
export const DEFAULT_AVATAR = 'https://via.placeholder.com/32x32?text=U';

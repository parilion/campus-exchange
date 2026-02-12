// 统一响应类型
export interface Result<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// 分页请求
export interface PageRequest {
  page: number;
  size: number;
}

// 分页响应
export interface PageResult<T> {
  records: T[];
  total: number;
  page: number;
  size: number;
}

// 商品分页响应
export interface ProductPageResponse {
  list: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// 商品分页请求参数
export interface ProductPageParams {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}

// 用户信息
export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  nickname: string;
  studentId?: string;
  verified: boolean;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

// 商品信息
export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: number;
  categoryName?: string;
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  status: 'ON_SALE' | 'SOLD' | 'OFF_SHELF';
  images: string[];
  sellerId: number;
  sellerName?: string;
  sellerAvatar?: string;
  viewCount: number;
  favoriteCount: number;
  createdAt: string;
  updatedAt: string;
}

// 订单信息
export interface Order {
  id: number;
  orderNo: string;
  productId: number;
  productTitle: string;
  productImage: string;
  price: number;
  buyerId: number;
  sellerId: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  tradeType: 'ONLINE' | 'OFFLINE';
  tradeLocation?: string;
  createdAt: string;
  updatedAt: string;
}

// 消息
export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'PRODUCT_CARD';
  read: boolean;
  createdAt: string;
}

// 分类
export interface Category {
  id: number;
  name: string;
  icon?: string;
  parentId?: number;
  sort: number;
}

import request from './request';

export interface Review {
  id: number;
  orderId: number;
  reviewerId: number;
  reviewerUsername: string;
  reviewerAvatar: string | null;
  targetUserId: number;
  targetUsername: string;
  targetAvatar: string | null;
  rating: number;
  content: string;
  images: string[];
  anonymous: number;
  createdAt: string;
  productTitle: string;
  productImage: string;
}

export interface CreateReviewRequest {
  orderId: number;
  rating: number;
  content?: string;
  images?: string[];
  anonymous?: number;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  rating5Count: number;
  rating4Count: number;
  rating3Count: number;
  rating2Count: number;
  rating1Count: number;
}

export interface ReviewPageResponse {
  records: Review[];
  total: number;
  pages: number;
  current: number;
  size: number;
}

// 创建评价
export function createReview(data: CreateReviewRequest) {
  return request({
    url: '/reviews',
    method: 'POST',
    data,
  });
}

// 获取订单的评价列表
export function getOrderReviews(orderId: number, page = 1, size = 10) {
  return request({
    url: `/reviews/order/${orderId}`,
    method: 'GET',
    params: { page, size },
  });
}

// 获取用户收到的评价列表
export function getUserReviews(userId: number, page = 1, size = 10) {
  return request({
    url: `/reviews/user/${userId}`,
    method: 'GET',
    params: { page, size },
  });
}

// 获取用户评价统计
export function getUserReviewStats(userId: number) {
  return request({
    url: `/reviews/user/${userId}/stats`,
    method: 'GET',
  });
}

// 检查是否已评价
export function checkReview(orderId: number) {
  return request({
    url: `/reviews/order/${orderId}/check`,
    method: 'GET',
  });
}

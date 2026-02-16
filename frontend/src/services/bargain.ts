import request from './request';

export interface PageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}

export interface Bargain {
  id: number;
  productId: number;
  productTitle: string;
  productImage: string;
  orderId: number | null;
  bargainerId: number;
  bargainerNickname: string;
  targetUserId: number;
  targetUserNickname: string;
  originalPrice: number;
  proposedPrice: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  message: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BargainRequest {
  productId: number;
  originalPrice: number;
  proposedPrice: number;
  message?: string;
}

// 发起议价
export function createBargain(data: BargainRequest) {
  return request.post<Bargain>('/bargains', data);
}

// 获取商品的所有议价记录
export function getBargainsByProduct(productId: number) {
  return request.get<Bargain[]>(`/bargains/product/${productId}`);
}

// 获取当前用户的议价列表
export function getUserBargains(page: number = 1, size: number = 10) {
  return request.get<PageResponse<Bargain>>('/bargains', { params: { page, size } });
}

// 接受议价
export function acceptBargain(id: number) {
  return request.post<Bargain>(`/bargains/${id}/accept`);
}

// 拒绝议价
export function rejectBargain(id: number) {
  return request.post<Bargain>(`/bargains/${id}/reject`);
}

// 取消议价
export function cancelBargain(id: number) {
  return request.post<Bargain>(`/bargains/${id}/cancel`);
}

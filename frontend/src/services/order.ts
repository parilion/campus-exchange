import request from './request';
import type { Result } from '../types';

export interface Order {
  id: number;
  orderNo: string;
  productId: number;
  productTitle: string;
  productImage: string | null;
  price: number;
  buyerId: number;
  buyerNickname: string;
  sellerId: number;
  sellerNickname: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  tradeType: 'ONLINE' | 'OFFLINE';
  tradeLocation: string | null;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderPageResponse {
  list: Order[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface OrderPageParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

// 创建订单
export async function createOrder(data: { productId: number; tradeType?: string; tradeLocation?: string; remark?: string }) {
  const res = await request.post<Result<Order>>('/orders', data);
  return res.data.data;
}

// 获取订单列表
export async function getOrderList(params: OrderPageParams = {}) {
  const res = await request.get<Result<OrderPageResponse>>('/orders', {
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      status: params.status
    }
  });
  return res.data.data;
}

// 获取订单详情
export async function getOrder(id: number) {
  const res = await request.get<Result<Order>>(`/orders/${id}`);
  return res.data.data;
}

// 取消订单
export async function cancelOrder(id: number) {
  const res = await request.post<Result<Order>>(`/orders/${id}/cancel`);
  return res.data.data;
}

// 支付订单
export async function payOrder(id: number) {
  const res = await request.post<Result<Order>>(`/orders/${id}/pay`);
  return res.data.data;
}

// 发货
export async function shipOrder(id: number) {
  const res = await request.post<Result<Order>>(`/orders/${id}/ship`);
  return res.data.data;
}

// 确认收货
export async function confirmOrder(id: number) {
  const res = await request.post<Result<Order>>(`/orders/${id}/confirm`);
  return res.data.data;
}

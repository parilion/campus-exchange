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
  // 退款相关
  refundStatus: 'NONE' | 'APPLYING' | 'APPROVED' | 'REJECTED' | null;
  refundReason: string | null;
  refundTime: string | null;
  // 纠纷相关
  disputeStatus: 'NONE' | 'APPLYING' | 'PROCESSING' | 'RESOLVED' | null;
  disputeReason: string | null;
  disputeEvidence: string | null;
  disputeResult: string | null;
  disputeTime: string | null;
  resolveTime: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatistics {
  totalCount: number;
  pendingCount: number;
  paidCount: number;
  shippedCount: number;
  completedCount: number;
  cancelledCount: number;
  refundingCount: number;
  disputingCount: number;
  totalAmount: number;
  buyerCount: number;
  sellerCount: number;
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

// 申请退款
export async function applyRefund(id: number, reason: string) {
  const res = await request.post<Result<Order>>(`/orders/${id}/refund`, { reason });
  return res.data.data;
}

// 同意退款（卖家）
export async function approveRefund(id: number) {
  const res = await request.post<Result<Order>>(`/orders/${id}/refund/approve`);
  return res.data.data;
}

// 拒绝退款（卖家）
export async function rejectRefund(id: number) {
  const res = await request.post<Result<Order>>(`/orders/${id}/refund/reject`);
  return res.data.data;
}

// 发起纠纷
export async function applyDispute(id: number, reason: string, evidence: string) {
  const res = await request.post<Result<Order>>(`/orders/${id}/dispute`, { reason, evidence });
  return res.data.data;
}

// 处理纠纷（管理员）
export async function resolveDispute(id: number, result: string) {
  const res = await request.post<Result<Order>>(`/orders/${id}/dispute/resolve`, { result });
  return res.data.data;
}

// 获取订单统计
export async function getOrderStatistics() {
  const res = await request.get<Result<OrderStatistics>>('/orders/statistics');
  return res.data.data;
}

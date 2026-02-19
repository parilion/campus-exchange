import request from './request';
import type { Result, User } from '../types';

export interface UserPageRequest {
  page?: number;
  pageSize?: number;
  keyword?: string;
  role?: string;
  enabled?: boolean;
}

export interface UserStats {
  totalUsers: number;
  totalEnabled: number;
  totalDisabled: number;
  totalAdmins: number;
  totalVerified: number;
}

interface PageResponse<T> {
  records: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 获取用户列表（分页）
export async function getUserList(params: UserPageRequest) {
  const res = await request.get<Result<PageResponse<User>>>('/admin/users', { params });
  return res.data.data;
}

// 获取所有用户列表
export async function getAllUsers() {
  const res = await request.get<Result<User[]>>('/admin/users/all');
  return res.data.data;
}

// 获取用户详情
export async function getUserDetail(userId: number) {
  const res = await request.get<Result<User>>(`/admin/users/${userId}`);
  return res.data.data;
}

// 封禁用户
export async function banUser(userId: number) {
  const res = await request.post<Result<void>>(`/admin/users/${userId}/ban`);
  return res.data;
}

// 解封用户
export async function unbanUser(userId: number) {
  const res = await request.post<Result<void>>(`/admin/users/${userId}/unban`);
  return res.data;
}

// 删除用户
export async function deleteUser(userId: number) {
  const res = await request.delete<Result<void>>(`/admin/users/${userId}`);
  return res.data;
}

// 设置用户为管理员
export async function setUserAsAdmin(userId: number) {
  const res = await request.post<Result<void>>(`/admin/users/${userId}/set-admin`);
  return res.data;
}

// 取消用户管理员权限
export async function removeUserAdmin(userId: number) {
  const res = await request.post<Result<void>>(`/admin/users/${userId}/remove-admin`);
  return res.data;
}

// 获取用户统计数据
export async function getUserStats() {
  const res = await request.get<Result<UserStats>>('/admin/users/stats');
  return res.data.data;
}

// 获取管理员信息
export async function getAdminInfo() {
  const res = await request.get<Result<User>>('/admin/me');
  return res.data.data;
}

// ========== 商品管理 ==========

export interface AdminProduct {
  id: number;
  title: string;
  price: number;
  status: string;
  auditStatus: string;
  rejectReason?: string;
  forceOfflineReason?: string;
  images?: string;
  sellerId: number;
  viewCount: number;
  favoriteCount: number;
  createdAt: string;
  isDraft: boolean;
  deleted: number;
}

export interface ProductStats {
  total: number;
  onSale: number;
  pending: number;
  rejected: number;
}

export interface ProductReport {
  id: number;
  productId: number;
  productTitle: string;
  productImages?: string;
  reporterId: number;
  reporterUsername: string;
  reason: string;
  description?: string;
  status: string;
  handleResult?: string;
  handledAt?: string;
  createdAt: string;
}

export interface ReportStats {
  total: number;
  pending: number;
  resolved: number;
  ignored: number;
}

// 获取商品列表
export async function getAdminProductList(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  auditStatus?: string;
  status?: string;
}) {
  const res = await request.get<Result<PageResponse<AdminProduct>>>('/admin/products', { params });
  return res.data.data;
}

// 获取商品统计
export async function getProductStats() {
  const res = await request.get<Result<ProductStats>>('/admin/products/stats');
  return res.data.data;
}

// 审核商品
export async function auditProduct(productId: number, action: 'APPROVE' | 'REJECT', rejectReason?: string) {
  const res = await request.post<Result<void>>(`/admin/products/${productId}/audit`, { action, rejectReason });
  return res.data;
}

// 强制下架
export async function forceOfflineProduct(productId: number, reason: string) {
  const res = await request.post<Result<void>>(`/admin/products/${productId}/force-offline`, { reason });
  return res.data;
}

// 删除商品
export async function deleteAdminProduct(productId: number) {
  const res = await request.delete<Result<void>>(`/admin/products/${productId}`);
  return res.data;
}

// ========== 举报管理 ==========

// 获取举报列表
export async function getReportList(params: { page?: number; pageSize?: number; status?: string }) {
  const res = await request.get<Result<PageResponse<ProductReport>>>('/admin/reports', { params });
  return res.data.data;
}

// 获取举报统计
export async function getReportStats() {
  const res = await request.get<Result<ReportStats>>('/admin/reports/stats');
  return res.data.data;
}

// 处理举报
export async function handleReport(reportId: number, action: 'RESOLVE' | 'IGNORE', handleResult?: string, offlineProduct?: boolean) {
  const res = await request.post<Result<void>>(`/admin/reports/${reportId}/handle`, {
    action,
    handleResult,
    offlineProduct,
  });
  return res.data;
}

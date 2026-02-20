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

// ========== 分类管理 ==========

export interface Category {
  id: number;
  name: string;
  icon?: string;
  parentId?: number;
  sort: number;
  createdAt: string;
}

// 获取分类列表
export async function getCategoryList() {
  const res = await request.get<Result<Category[]>>('/admin/categories');
  return res.data.data;
}

// 创建分类
export async function createCategory(data: { name: string; icon?: string; parentId?: number; sort?: number }) {
  const res = await request.post<Result<void>>('/admin/categories', data);
  return res.data;
}

// 更新分类
export async function updateCategory(id: number, data: { name?: string; icon?: string; parentId?: number; sort?: number }) {
  const res = await request.put<Result<void>>(`/admin/categories/${id}`, data);
  return res.data;
}

// 删除分类
export async function deleteCategory(id: number) {
  const res = await request.delete<Result<void>>(`/admin/categories/${id}`);
  return res.data;
}

// ========== 公告管理 ==========

export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  priority: number;
  status: string;
  startTime?: string;
  endTime?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

// 获取公告列表
export async function getAnnouncementList(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  type?: string;
}) {
  const res = await request.get<Result<PageResponse<Announcement>>>('/admin/announcements', { params });
  return res.data.data;
}

// 获取公告详情
export async function getAnnouncementDetail(id: number) {
  const res = await request.get<Result<Announcement>>(`/admin/announcements/${id}`);
  return res.data.data;
}

// 创建公告
export async function createAnnouncement(data: {
  title: string;
  content: string;
  type?: string;
  priority?: number;
  status?: string;
  startTime?: string;
  endTime?: string;
}) {
  const res = await request.post<Result<void>>('/admin/announcements', data);
  return res.data;
}

// 更新公告
export async function updateAnnouncement(id: number, data: {
  title?: string;
  content?: string;
  type?: string;
  priority?: number;
  status?: string;
  startTime?: string;
  endTime?: string;
}) {
  const res = await request.put<Result<void>>(`/admin/announcements/${id}`, data);
  return res.data;
}

// 删除公告
export async function deleteAnnouncement(id: number) {
  const res = await request.delete<Result<void>>(`/admin/announcements/${id}`);
  return res.data;
}

// 发布公告
export async function publishAnnouncement(id: number) {
  const res = await request.post<Result<void>>(`/admin/announcements/${id}/publish`);
  return res.data;
}

// 获取公告统计
export async function getAnnouncementStats() {
  const res = await request.get<Result<AnnouncementStats>>('/admin/announcements/stats');
  return res.data.data;
}

// ========== 轮播图管理 ==========

export interface Carousel {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  linkType?: string;
  targetId?: number;
  position: string;
  sort: number;
  status: string;
  startTime?: string;
  endTime?: string;
  clickCount: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface CarouselStats {
  total: number;
  published: number;
  draft: number;
  disabled: number;
}

// 获取轮播图列表
export async function getCarouselList(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  position?: string;
}) {
  const res = await request.get<Result<PageResponse<Carousel>>>('/admin/carousels', { params });
  return res.data.data;
}

// 获取轮播图详情
export async function getCarouselDetail(id: number) {
  const res = await request.get<Result<Carousel>>(`/admin/carousels/${id}`);
  return res.data.data;
}

// 创建轮播图
export async function createCarousel(data: {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  linkType?: string;
  targetId?: number;
  position?: string;
  sort?: number;
  status?: string;
  startTime?: string;
  endTime?: string;
}) {
  const res = await request.post<Result<void>>('/admin/carousels', data);
  return res.data;
}

// 更新轮播图
export async function updateCarousel(id: number, data: {
  title?: string;
  imageUrl?: string;
  linkUrl?: string;
  linkType?: string;
  targetId?: number;
  position?: string;
  sort?: number;
  status?: string;
  startTime?: string;
  endTime?: string;
}) {
  const res = await request.put<Result<void>>(`/admin/carousels/${id}`, data);
  return res.data;
}

// 删除轮播图
export async function deleteCarousel(id: number) {
  const res = await request.delete<Result<void>>(`/admin/carousels/${id}`);
  return res.data;
}

// 发布轮播图
export async function publishCarousel(id: number) {
  const res = await request.post<Result<void>>(`/admin/carousels/${id}/publish`);
  return res.data;
}

// 获取轮播图统计
export async function getCarouselStats() {
  const res = await request.get<Result<CarouselStats>>('/admin/carousels/stats');
  return res.data.data;
}

// ========== 订单管理 ==========

export interface AdminOrder {
  id: number;
  orderNo: string;
  productId: number;
  price: number;
  buyerId: number;
  sellerId: number;
  status: string;
  tradeType: string;
  tradeLocation?: string;
  remark?: string;
  refundStatus?: string;
  refundReason?: string;
  refundTime?: string;
  disputeStatus?: string;
  disputeReason?: string;
  disputeEvidence?: string;
  disputeResult?: string;
  disputeTime?: string;
  resolveTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStats {
  total: number;
  pending: number;
  paid: number;
  shipped: number;
  completed: number;
  cancelled: number;
}

// 获取订单列表
export async function getOrderList(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}) {
  const res = await request.get<Result<PageResponse<AdminOrder>>>('/admin/orders', { params });
  return res.data.data;
}

// 获取订单详情
export async function getOrderDetail(orderId: number) {
  const res = await request.get<Result<AdminOrder>>(`/admin/orders/${orderId}`);
  return res.data.data;
}

// 管理员取消订单
export async function cancelOrder(orderId: number, reason: string) {
  const res = await request.post<Result<void>>(`/admin/orders/${orderId}/cancel`, { reason });
  return res.data;
}

// 获取订单统计
export async function getOrderStats() {
  const res = await request.get<Result<OrderStats>>('/admin/orders/stats');
  return res.data.data;
}

// ========== 评价管理 ==========

export interface AdminReview {
  id: number;
  orderId: number;
  reviewerId: number;
  targetUserId: number;
  rating: number;
  content?: string;
  images?: string;
  anonymous: number;
  reply?: string;
  replyAt?: string;
  tags?: string;
  createdAt: string;
}

export interface ReviewStats {
  total: number;
  avgRating: number;
  star1: number;
  star2: number;
  star3: number;
  star4: number;
  star5: number;
}

// 获取评价列表
export async function getReviewList(params: {
  page?: number;
  pageSize?: number;
  rating?: number;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}) {
  const res = await request.get<Result<PageResponse<AdminReview>>>('/admin/reviews', { params });
  return res.data.data;
}

// 获取评价详情
export async function getReviewDetail(reviewId: number) {
  const res = await request.get<Result<AdminReview>>(`/admin/reviews/${reviewId}`);
  return res.data.data;
}

// 删除评价
export async function deleteReview(reviewId: number) {
  const res = await request.delete<Result<void>>(`/admin/reviews/${reviewId}`);
  return res.data;
}

// 获取评价统计
export async function getReviewStats() {
  const res = await request.get<Result<ReviewStats>>('/admin/reviews/stats');
  return res.data.data;
}

// ========== 消息推送 ==========

export interface SystemMessage {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: string;
  relatedId?: number;
  read: boolean;
  createTime: string;
  readTime?: string;
}

// 推送消息（userId为空时群发）
export async function pushMessage(data: { userId?: number; title: string; content: string }) {
  const res = await request.post<Result<void>>('/admin/messages/push', data);
  return res.data;
}

// 获取推送历史
export async function getMessageHistory(params: { page?: number; pageSize?: number; type?: string }) {
  const res = await request.get<Result<PageResponse<SystemMessage>>>('/admin/messages/history', { params });
  return res.data.data;
}

// ========== 数据导出 ==========

// 导出订单
export function exportOrders(params?: { status?: string; startDate?: string; endDate?: string }) {
  const query = new URLSearchParams(params as any).toString();
  window.open(`/api/admin/export/orders?${query}`, '_blank');
}

// 导出用户
export function exportUsers(params?: { role?: string; enabled?: boolean }) {
  const query = new URLSearchParams(params as any).toString();
  window.open(`/api/admin/export/users?${query}`, '_blank');
}

// 导出商品
export function exportProducts(params?: { status?: string; auditStatus?: string }) {
  const query = new URLSearchParams(params as any).toString();
  window.open(`/api/admin/export/products?${query}`, '_blank');
}

// ========== 数据统计面板 ==========

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingProducts: number;
  pendingReports: number;
  todayUsers: number;
  todayProducts: number;
  todayOrders: number;
  recentOrders: Array<{
    id: number;
    orderNo: string;
    productName: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  userStats: Record<string, number>;
  productStats: Record<string, number>;
  orderStats: Record<string, number>;
}

// 获取仪表盘统计数据
export async function getDashboardStats() {
  const res = await request.get<Result<DashboardStats>>('/admin/dashboard/stats');
  return res.data.data;
}

// ========== 系统配置管理 ==========

export interface SystemConfig {
  id: number;
  configKey: string;
  configValue: string;
  configType: string;
  configName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 获取配置列表
export async function getConfigList(params: { page?: number; pageSize?: number; keyword?: string }) {
  const res = await request.get<Result<PageResponse<SystemConfig>>>('/admin/config', { params });
  return res.data.data;
}

// 获取配置详情
export async function getConfigDetail(id: number) {
  const res = await request.get<Result<SystemConfig>>(`/admin/config/${id}`);
  return res.data.data;
}

// 创建配置
export async function createConfig(data: {
  configKey: string;
  configValue?: string;
  configType?: string;
  configName: string;
  description?: string;
}) {
  const res = await request.post<Result<void>>('/admin/config', data);
  return res.data;
}

// 更新配置
export async function updateConfig(id: number, data: {
  configKey?: string;
  configValue?: string;
  configType?: string;
  configName?: string;
  description?: string;
}) {
  const res = await request.put<Result<void>>(`/admin/config/${id}`, data);
  return res.data;
}

// 删除配置
export async function deleteConfig(id: number) {
  const res = await request.delete<Result<void>>(`/admin/config/${id}`);
  return res.data;
}

// ========== 敏感词管理 ==========

export interface SensitiveWord {
  id: number;
  word: string;
  category: string;
  level: number;
  replaceWord: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// 获取敏感词列表
export async function getSensitiveWordList(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  category?: string;
  isEnabled?: boolean;
}) {
  const res = await request.get<Result<PageResponse<SensitiveWord>>>('/admin/sensitive-words', { params });
  return res.data.data;
}

// 获取所有敏感词
export async function getAllSensitiveWords() {
  const res = await request.get<Result<SensitiveWord[]>>('/admin/sensitive-words/all');
  return res.data.data;
}

// 创建敏感词
export async function createSensitiveWord(data: {
  word: string;
  category?: string;
  level?: number;
  replaceWord?: string;
  isEnabled?: boolean;
}) {
  const res = await request.post<Result<void>>('/admin/sensitive-words', data);
  return res.data;
}

// 更新敏感词
export async function updateSensitiveWord(id: number, data: {
  word?: string;
  category?: string;
  level?: number;
  replaceWord?: string;
  isEnabled?: boolean;
}) {
  const res = await request.put<Result<void>>(`/admin/sensitive-words/${id}`, data);
  return res.data;
}

// 删除敏感词
export async function deleteSensitiveWord(id: number) {
  const res = await request.delete<Result<void>>(`/admin/sensitive-words/${id}`);
  return res.data;
}

// 批量导入敏感词
export async function batchImportSensitiveWords(words: string[]) {
  const res = await request.post<Result<{ success: number; failed: number; errors: string[] }>>('/admin/sensitive-words/batch', words);
  return res.data.data;
}

// ========== 操作日志管理 ==========

export interface OperationLog {
  id: number;
  userId?: number;
  username?: string;
  operation: string;
  module?: string;
  method?: string;
  requestUrl?: string;
  requestMethod?: string;
  requestParams?: string;
  requestIp?: string;
  responseStatus?: number;
  responseTime?: number;
  errorMessage?: string;
  createdAt: string;
}

// 获取操作日志列表
export async function getOperationLogList(params: {
  page?: number;
  pageSize?: number;
  operation?: string;
  module?: string;
  username?: string;
  startDate?: string;
  endDate?: string;
}) {
  const res = await request.get<Result<PageResponse<OperationLog>>>('/admin/operation-logs', { params });
  return res.data.data;
}

// 获取操作日志详情
export async function getOperationLogDetail(id: number) {
  const res = await request.get<Result<OperationLog>>(`/admin/operation-logs/${id}`);
  return res.data.data;
}

// 删除操作日志
export async function deleteOperationLog(id: number) {
  const res = await request.delete<Result<void>>(`/admin/operation-logs/${id}`);
  return res.data;
}

// 批量删除操作日志
export async function batchDeleteOperationLogs(ids: number[]) {
  const res = await request.delete<Result<void>>('/admin/operation-logs/batch', { data: ids });
  return res.data;
}

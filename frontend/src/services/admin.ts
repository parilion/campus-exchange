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

import request from './request';
import type { Result } from '../types';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  studentId?: string;
  verified: boolean;
  role: string;
  enabled: boolean;
  createdAt: string;
  emailNotificationEnabled?: boolean;
}

export interface UserPublicProfile {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  verified: boolean;
  studentId?: string;
  createdAt: string;
  productCount: number;
  soldCount: number;
  positiveRate: number;
  creditLevel: number;
}

export interface UpdateProfileRequest {
  nickname?: string;
  phone?: string;
  email?: string;
  avatar?: string;
}

export const getProfile = () => {
  return request.get<Result<UserProfile>>('/users/profile');
};

export const getUserById = (userId: number) => {
  return request.get<Result<UserProfile>>(`/users/${userId}`);
};

export const getUserPublicProfile = (userId: number) => {
  return request.get<Result<UserPublicProfile>>(`/users/${userId}/public`);
};

export const updateProfile = (data: UpdateProfileRequest) => {
  return request.put<void>('/users/profile', data);
};

export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post<Result<string>>('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 获取浏览历史
export const getBrowseHistory = (limit: number = 20) => {
  return request.get<Result<any[]>>(`/users/browse-history?limit=${limit}`);
};

// 清空浏览历史
export const clearBrowseHistory = () => {
  return request.delete<void>('/users/browse-history');
};

// 删除单条浏览记录
export const deleteBrowseHistory = (productId: number) => {
  return request.delete<void>(`/users/browse-history/${productId}`);
};

// ===== 收货地址 =====

export interface Address {
  id?: number;
  userId?: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const getAddresses = () => {
  return request.get<Result<Address[]>>('/addresses');
};

export const addAddress = (data: Address) => {
  return request.post<Result<Address>>('/addresses', data);
};

export const updateAddress = (id: number, data: Address) => {
  return request.put<void>(`/addresses/${id}`, data);
};

export const deleteAddress = (id: number) => {
  return request.delete<void>(`/addresses/${id}`);
};

export const setDefaultAddress = (id: number) => {
  return request.put<void>(`/addresses/${id}/default`, {});
};

// ===== 邮件通知设置 =====

export const updateEmailNotification = (enabled: boolean) => {
  return request.put('/users/email-notification', { enabled });
};

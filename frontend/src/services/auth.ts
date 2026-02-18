import request from './request';
import type { Result, User } from '../types';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  phone?: string;
  nickname?: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  nickname: string;
  avatar: string;
  role: string;
}

// 用户登录
export async function login(data: LoginRequest) {
  const res = await request.post<Result<LoginResponse>>('/auth/login', data);
  return res.data.data;
}

// 用户注册
export async function register(data: RegisterRequest) {
  const res = await request.post<Result<LoginResponse>>('/auth/register', data);
  return res.data.data;
}

// 获取当前用户信息
export async function getCurrentUser() {
  const res = await request.get<Result<User>>('/auth/me');
  return res.data.data;
}

// 刷新 Token
export async function refreshToken() {
  const res = await request.post<Result<LoginResponse>>('/auth/refresh');
  return res.data.data;
}

// 退出登录
export async function logout() {
  await request.post('/auth/logout');
}

// 发送密码重置验证码
export async function sendPasswordResetCode(email: string) {
  const res = await request.post<Result<void>>('/auth/forgot-password/send-code', { email });
  return res.data;
}

// 重置密码
export async function resetPassword(email: string, code: string, newPassword: string) {
  const res = await request.post<Result<void>>('/auth/forgot-password/reset', {
    email,
    code,
    newPassword,
  });
  return res.data;
}

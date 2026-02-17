import request from './request';
import type { ProductVO } from '../types';

export interface PageResult<T> {
  list: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// 添加收藏
export function addFavorite(productId: number): Promise<void> {
  return request({
    url: `/api/favorites/${productId}`,
    method: 'POST',
  });
}

// 取消收藏
export function removeFavorite(productId: number): Promise<void> {
  return request({
    url: `/api/favorites/${productId}`,
    method: 'DELETE',
  });
}

// 检查是否已收藏
export function checkFavorite(productId: number): Promise<boolean> {
  return request({
    url: `/api/favorites/check/${productId}`,
    method: 'GET',
  });
}

// 获取收藏列表
export function getFavoriteList(pageNum: number = 1, pageSize: number = 10): Promise<PageResult<ProductVO>> {
  return request({
    url: '/api/favorites',
    method: 'GET',
    params: { pageNum, pageSize },
  });
}

// 获取用户收藏的商品ID列表
export function getFavoriteProductIds(): Promise<number[]> {
  return request({
    url: '/api/favorites/ids',
    method: 'GET',
  });
}

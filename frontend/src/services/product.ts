import request from './request';
import type { Result, Product, ProductPageResponse, ProductPageParams } from '../types';

export interface CreateProductRequest {
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  categoryId?: number;
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  images?: string[];
  tradeType?: 'ONLINE' | 'OFFLINE';
  tradeLocation?: string;
}

// 发布商品
export async function createProduct(data: CreateProductRequest) {
  const res = await request.post<Result<Product>>('/products', data);
  return res.data.data;
}

// 获取商品详情
export async function getProduct(id: number) {
  const res = await request.get<Result<Product>>(`/products/${id}`);
  return res.data.data;
}

// 获取商品列表（分页）
export async function getProductList(params: ProductPageParams = {}) {
  const res = await request.get<Result<ProductPageResponse>>('/products', {
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      categoryId: params.categoryId,
      status: params.status || 'ON_SALE',
      sortBy: params.sortBy || 'createdAt',
      sortOrder: params.sortOrder || 'desc'
    }
  });
  return res.data.data;
}

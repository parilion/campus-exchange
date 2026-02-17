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
  tags?: string[];
  isDraft?: boolean;
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
      sortOrder: params.sortOrder || 'desc',
      keyword: params.keyword,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      condition: params.condition
    }
  });
  return res.data.data;
}

// 更新商品
export async function updateProduct(id: number, data: Partial<CreateProductRequest>) {
  const res = await request.put<Result<Product>>(`/products/${id}`, data);
  return res.data.data;
}

// 删除商品（软删除）
export async function deleteProduct(id: number) {
  const res = await request.delete<Result<void>>(`/products/${id}`);
  return res.data.data;
}

// 获取当前用户发布的商品列表
export async function getMyProducts(params: ProductPageParams = {}) {
  const res = await request.get<Result<ProductPageResponse>>('/products/my', {
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      categoryId: params.categoryId,
      status: params.status,
      sortBy: params.sortBy || 'createdAt',
      sortOrder: params.sortOrder || 'desc'
    }
  });
  return res.data.data;
}

// 获取搜索建议（自动补全）
export async function getSearchSuggestions(keyword: string): Promise<string[]> {
  const res = await request.get<Result<string[]>>('/products/suggestions', {
    params: { keyword }
  });
  return res.data.data || [];
}

// 获取热门搜索词
export async function getPopularSearches(): Promise<string[]> {
  const res = await request.get<Result<string[]>>('/products/popular-searches');
  return res.data.data || [];
}

// 获取草稿箱商品列表
export async function getDrafts(params: ProductPageParams = {}) {
  const res = await request.get<Result<ProductPageResponse>>('/products/drafts', {
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 10
    }
  });
  return res.data.data;
}

// 设置商品置顶
export async function setProductTop(id: number, days: number) {
  const res = await request.post<Result<Product>>(`/products/${id}/top`, null, {
    params: { days }
  });
  return res.data.data;
}

// 增加商品浏览量
export async function incrementViewCount(id: number) {
  const res = await request.post<Result<void>>(`/products/${id}/view`);
  return res.data.data;
}

import axios from 'axios';
import type { Result } from '../types';
import { globalMessage } from '../utils/message';

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// 请求拦截器 - 自动携带 Token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 统一处理错误
request.interceptors.response.use(
  (response) => {
    const res = response.data as Result;
    if (res.code !== 200) {
      globalMessage.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      // Token 过期，清除本地状态并跳转登录
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 统一错误提示
    let errMsg = '网络异常，请稍后重试';
    if (status === 403) errMsg = '无权限访问';
    else if (status === 404) errMsg = '请求的资源不存在';
    else if (status === 500) errMsg = '服务器错误，请稍后重试';
    else if (error.code === 'ECONNABORTED') errMsg = '请求超时，请检查网络';
    else if (error.message) errMsg = error.message;

    globalMessage.error(errMsg);
    return Promise.reject(error);
  }
);

export default request;

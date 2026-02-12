import request from './request';
import type { Result } from '../types';

export interface UploadResponse {
  url: string;
}

/**
 * 上传单张图片
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await request.post<Result<UploadResponse>>('/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data.data.url;
}

/**
 * 上传多张图片
 */
export async function uploadImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const res = await request.post<Result<UploadResponse[]>>('/images/upload-multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data.data.map((item) => item.url);
}

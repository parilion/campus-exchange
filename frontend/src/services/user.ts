import request from './request';

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
}

export interface UpdateProfileRequest {
  nickname?: string;
  phone?: string;
  email?: string;
  avatar?: string;
}

export const getProfile = () => {
  return request.get<UserProfile>('/users/profile');
};

export const getUserById = (userId: number) => {
  return request.get<UserProfile>(`/users/${userId}`);
};

export const updateProfile = (data: UpdateProfileRequest) => {
  return request.put<void>('/users/profile', data);
};

export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post<string>('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

import request from './request';

export interface Message {
  id: number;
  senderId: number;
  senderNickname: string;
  senderAvatar: string | null;
  receiverId: number;
  receiverNickname: string;
  receiverAvatar: string | null;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'PRODUCT_CARD';
  read: boolean;
  createdAt: string;
  productId?: number;
  productTitle?: string;
  productImage?: string;
}

export interface Conversation {
  partnerId: number;
  partnerNickname: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageType: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface SendMessageRequest {
  receiverId: number;
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'PRODUCT_CARD';
  productId?: number;
}

// 发送私信
export function sendMessage(data: SendMessageRequest) {
  return request.post<Message>('/messages', data);
}

// 获取与指定用户的聊天记录
export function getConversation(partnerId: number, page: number = 1, size: number = 50) {
  return request.get<Message[]>(`/messages/conversation/${partnerId}`, { params: { page, size } });
}

// 获取会话列表
export function getConversationList() {
  return request.get<Conversation[]>('/messages/conversations');
}

// 获取未读消息数
export function getUnreadCount() {
  return request.get<number>('/messages/unread-count');
}

// 标记会话为已读
export function markAsRead(partnerId: number) {
  return request.put<void>(`/messages/read/${partnerId}`);
}

// 搜索聊天记录
export function searchMessages(keyword: string, page: number = 1, size: number = 20) {
  return request.get<Message[]>('/messages/search', { params: { keyword, page, size } });
}

// 屏蔽用户
export function blockUser(blockedUserId: number) {
  return request.post<void>(`/messages/block/${blockedUserId}`);
}

// 取消屏蔽用户
export function unblockUser(blockedUserId: number) {
  return request.delete<void>(`/messages/block/${blockedUserId}`);
}

// 获取屏蔽的用户列表
export function getBlockedUsers() {
  return request.get<User[]>('/messages/blocks');
}

// 用户类型
interface User {
  id: number;
  username: string;
  nickname: string;
  avatar: string | null;
  email: string;
}

// 系统消息类型
export interface SystemMessage {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: 'ORDER_NOTIFY' | 'SYSTEM_NOTIFY' | 'ACTIVITY_NOTIFY';
  relatedId?: number;
  read: boolean;
  createTime: string;
  readTime?: string;
}

// 获取系统消息列表
export function getSystemMessages(page: number = 1, size: number = 10, read?: boolean) {
  return request.get<{ records: SystemMessage[]; total: number; pages: number; current: number }>('/system-messages', {
    params: { page, size, read }
  });
}

// 获取系统消息未读数量
export function getSystemUnreadCount() {
  return request.get<{ count: number }>('/system-messages/unread-count');
}

// 标记系统消息为已读
export function markSystemMessageAsRead(messageId: number) {
  return request.put<void>(`/system-messages/${messageId}/read`);
}

// 标记所有系统消息为已读
export function markAllSystemMessagesAsRead() {
  return request.put<void>('/system-messages/read-all');
}

// 删除系统消息
export function deleteSystemMessage(messageId: number) {
  return request.delete<void>(`/system-messages/${messageId}`);
}

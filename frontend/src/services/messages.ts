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

/**
 * 全局消息工具
 * 解决 Axios 拦截器中无法使用 Ant Design App Context 的问题
 * 在 App.tsx 中调用 initMessage 初始化，之后在拦截器中安全使用
 */
import type { MessageInstance } from 'antd/es/message/interface';

let messageApi: MessageInstance | null = null;

export function initMessage(api: MessageInstance) {
  messageApi = api;
}

export const globalMessage = {
  error: (content: string) => {
    if (messageApi) {
      messageApi.error(content);
    }
  },
  success: (content: string) => {
    if (messageApi) {
      messageApi.success(content);
    }
  },
  warning: (content: string) => {
    if (messageApi) {
      messageApi.warning(content);
    }
  },
};

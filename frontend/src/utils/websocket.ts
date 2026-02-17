// WebSocket 连接管理
type MessageHandler = (message: any) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string = '';
  private handlers: Map<string, MessageHandler[]> = new Map();
  private reconnectInterval: number = 3000;
  private reconnectTimer: any = null;
  private heartbeatTimer: any = null;
  private isManualClose: boolean = false;

  // 连接 WebSocket
  connect(userId: number) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    this.isManualClose = false;
    const token = localStorage.getItem('token');
    const wsUrl = `ws://localhost:8080/ws/message?userId=${userId}&token=${token || ''}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.startHeartbeat();
        this.emit('connect', null);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket received:', data);

          if (data.type === 'HEARTBEAT_ACK') {
            return;
          }

          this.emit('message', data);
        } catch (e) {
          console.error('Parse message error:', e);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.stopHeartbeat();
        this.emit('disconnect', null);

        if (!this.isManualClose) {
          this.reconnectTimer = setTimeout(() => {
            this.connect(userId);
          }, this.reconnectInterval);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (e) {
      console.error('WebSocket connection error:', e);
    }
  }

  // 断开连接
  disconnect() {
    this.isManualClose = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // 发送消息
  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  // 心跳
  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'HEARTBEAT' });
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // 事件监听
  on(event: string, handler: MessageHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  off(event: string, handler: MessageHandler) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  // 检查是否已连接
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// 单例
export const wsClient = new WebSocketClient();

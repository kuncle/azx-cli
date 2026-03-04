export interface WsMessage {
  event?: string;
  channel?: string;
  data?: unknown;
  [key: string]: unknown;
}

export interface WsSubscription {
  channel: string;
  params?: Record<string, string>;
}

export interface WsOptions {
  reconnect?: boolean;
  reconnectDelay?: number;
  maxReconnects?: number;
  pingInterval?: number;
}

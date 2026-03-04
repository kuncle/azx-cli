import { BaseWebSocket } from './base-ws.js';
import type { WsMessage, WsOptions } from './types.js';
import { logger } from '../utils/logger.js';

const SPOT_WS_URLS = {
  production: 'wss://s-ws.azverse.xyz/ws',
  sandbox: 'wss://s-ws.az-qa.xyz/ws',
} as const;

export class SpotWebSocket extends BaseWebSocket {
  private subscriptions: { channel: string; params?: Record<string, string> }[] = [];

  constructor(options?: { sandbox?: boolean; wsOptions?: WsOptions }) {
    const url = options?.sandbox ? SPOT_WS_URLS.sandbox : SPOT_WS_URLS.production;
    super(url, options?.wsOptions);
  }

  subscribe(channel: string, params?: Record<string, string>): void {
    this.subscriptions.push({ channel, params });
    if (this.ws?.readyState === 1) {
      this.send({ op: 'subscribe', args: [{ channel, ...params }] });
    }
  }

  protected onConnected(): void {
    for (const sub of this.subscriptions) {
      this.send({ op: 'subscribe', args: [{ channel: sub.channel, ...sub.params }] });
    }
  }

  protected onMessage(msg: WsMessage): void {
    if (msg.event === 'subscribe') {
      logger.debug(`Subscribed: ${JSON.stringify(msg)}`);
      return;
    }
    if (msg.event === 'error') {
      logger.error(`WS error: ${JSON.stringify(msg)}`);
      return;
    }
    this.emit(msg);
  }

  protected sendPing(): void {
    this.send({ op: 'ping' });
  }
}

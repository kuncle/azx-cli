import WebSocket from 'ws';
import type { WsOptions, WsMessage } from './types.js';
import { logger } from '../utils/logger.js';

const DEFAULT_OPTIONS: Required<WsOptions> = {
  reconnect: true,
  reconnectDelay: 3000,
  maxReconnects: 10,
  pingInterval: 30000,
};

export abstract class BaseWebSocket {
  protected ws: WebSocket | null = null;
  protected url: string;
  protected options: Required<WsOptions>;
  protected reconnectCount = 0;
  protected pingTimer: ReturnType<typeof setInterval> | null = null;
  protected closed = false;

  constructor(url: string, options?: WsOptions) {
    this.url = url;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      logger.debug(`WS connecting to ${this.url}`);
      this.ws = new WebSocket(this.url);

      this.ws.on('open', () => {
        logger.debug('WS connected');
        this.reconnectCount = 0;
        this.startPing();
        this.onConnected();
        resolve();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const msg = JSON.parse(data.toString()) as WsMessage;
          this.onMessage(msg);
        } catch {
          logger.debug(`WS non-JSON message: ${data.toString().substring(0, 100)}`);
        }
      });

      this.ws.on('close', () => {
        logger.debug('WS closed');
        this.stopPing();
        if (!this.closed && this.options.reconnect) {
          this.tryReconnect();
        }
      });

      this.ws.on('error', (err) => {
        logger.error(`WS error: ${err.message}`);
        if (this.reconnectCount === 0) {
          reject(err);
        }
      });
    });
  }

  protected startPing(): void {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.ping();
        this.sendPing();
      }
    }, this.options.pingInterval);
  }

  protected stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  protected tryReconnect(): void {
    if (this.reconnectCount >= this.options.maxReconnects) {
      logger.error('Max reconnects reached');
      throw new Error('WebSocket max reconnects reached');
    }
    this.reconnectCount++;
    logger.info(`Reconnecting (${this.reconnectCount}/${this.options.maxReconnects})...`);
    setTimeout(() => this.connect().catch((err) => logger.error('Reconnect failed:', err.message)), this.options.reconnectDelay);
  }

  send(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  close(): void {
    this.closed = true;
    this.stopPing();
    this.ws?.close();
  }

  /** Output one NDJSON line to stdout */
  protected emit(data: unknown): void {
    console.log(JSON.stringify(data));
  }

  // Subclass hooks
  protected abstract onConnected(): void;
  protected abstract onMessage(msg: WsMessage): void;
  protected sendPing(): void {
    // Override in subclass if API requires application-level pings
  }
}

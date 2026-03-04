import { BaseClient } from './base-client.js';
import { signSpot } from '../auth/signer.js';
import type { ApiCredentials, SignedHeaders } from '../auth/types.js';
import type { RetryOptions } from '../utils/retry.js';

const SPOT_URLS = {
  production: 'https://s-api.azverse.xyz',
  sandbox: 'https://s-api.az-qa.xyz',
} as const;

export class SpotClient extends BaseClient {
  constructor(options: {
    credentials?: ApiCredentials;
    sandbox?: boolean;
    retryOptions?: Partial<RetryOptions>;
  } = {}) {
    const baseUrl = options.sandbox ? SPOT_URLS.sandbox : SPOT_URLS.production;
    super(baseUrl, options.credentials, options.retryOptions);
  }

  protected sign(params: { method: string; path: string; query?: string; body?: string }): SignedHeaders {
    if (!this.credentials) throw new Error('No credentials');
    return signSpot(this.credentials, params);
  }

  // ─── Market (Public) ─────────────────────

  async getServerTime() {
    return this.request({ method: 'GET', path: '/az/spot/public/time' });
  }

  async getSymbols() {
    return this.request({ method: 'GET', path: '/az/spot/public/symbol' });
  }

  async getTicker(symbol?: string) {
    if (symbol) {
      return this.request({
        method: 'GET',
        path: '/az/spot/public/ticker',
        query: { symbol },
      });
    }
    return this.request({ method: 'GET', path: '/az/spot/public/ticker' });
  }

  async getTickerPrice(symbol?: string) {
    return this.request({
      method: 'GET',
      path: '/az/spot/public/ticker/price',
      query: symbol ? { symbol } : undefined,
    });
  }

  async getTicker24h(symbol?: string) {
    return this.request({
      method: 'GET',
      path: '/az/spot/public/ticker/24h',
      query: symbol ? { symbol } : undefined,
    });
  }

  async getTickerBook(symbol?: string) {
    return this.request({
      method: 'GET',
      path: '/az/spot/public/ticker/book',
      query: symbol ? { symbol } : undefined,
    });
  }

  async getDepth(symbol: string, limit?: number) {
    return this.request({
      method: 'GET',
      path: '/az/spot/public/depth',
      query: { symbol, ...(limit !== undefined ? { limit } : {}) },
    });
  }

  async getKlines(symbol: string, interval: string, limit?: number) {
    return this.request({
      method: 'GET',
      path: '/az/spot/public/kline',
      query: { symbol, interval, ...(limit !== undefined ? { limit } : {}) },
    });
  }

  async getRecentTrades(symbol: string, limit?: number) {
    return this.request({
      method: 'GET',
      path: '/az/spot/public/trade/recent',
      query: { symbol, ...(limit !== undefined ? { limit } : {}) },
    });
  }

  async getTradeHistory(symbol: string, limit?: number) {
    return this.request({
      method: 'GET',
      path: '/az/spot/public/trade/history',
      query: { symbol, ...(limit !== undefined ? { limit } : {}) },
    });
  }

  async getCurrencies() {
    return this.request({ method: 'GET', path: '/az/spot/public/currencies' });
  }

  // ─── Order ───────────────────────────────

  async placeOrder(params: Record<string, unknown>) {
    return this.request({
      method: 'POST',
      path: '/az/spot/order',
      body: params,
      signed: true,
    });
  }

  async queryOrder(params: { orderId?: string; clientOrderId?: string }) {
    return this.request({
      method: 'GET',
      path: '/az/spot/order',
      query: params as Record<string, string>,
      signed: true,
    });
  }

  async getOrderById(orderId: string) {
    return this.request({
      method: 'GET',
      path: `/az/spot/order/${encodeURIComponent(orderId)}`,
      signed: true,
    });
  }

  async cancelOrder(orderId: string) {
    return this.request({
      method: 'DELETE',
      path: `/az/spot/order/${encodeURIComponent(orderId)}`,
      signed: true,
    });
  }

  async updateOrder(orderId: string, params: Record<string, unknown>) {
    return this.request({
      method: 'PUT',
      path: `/az/spot/order/${encodeURIComponent(orderId)}`,
      body: params,
      signed: true,
    });
  }

  async getOpenOrders(symbol?: string) {
    return this.request({
      method: 'GET',
      path: '/az/spot/open-order',
      query: symbol ? { symbol } : undefined,
      signed: true,
    });
  }

  async cancelOpenOrders(symbol?: string) {
    return this.request({
      method: 'DELETE',
      path: '/az/spot/open-order',
      query: symbol ? { symbol } : undefined,
      signed: true,
    });
  }

  async getOrderHistory(params?: { symbol?: string; limit?: number; startTime?: number; endTime?: number; direction?: string }) {
    return this.request({
      method: 'GET',
      path: '/az/spot/history-order',
      query: params as Record<string, string | number> | undefined,
      signed: true,
    });
  }

  // ─── Batch Order ─────────────────────────

  async batchPlaceOrders(orders: Record<string, unknown>[]) {
    return this.request({
      method: 'POST',
      path: '/az/spot/batch-order',
      body: { items: orders },
      signed: true,
    });
  }

  async batchCancelOrders(orderIds: string[]) {
    return this.request({
      method: 'DELETE',
      path: '/az/spot/batch-order',
      query: { orderIds: orderIds.join(',') },
      signed: true,
    });
  }

  // ─── Trade ───────────────────────────────

  async getTrades(params?: { symbol?: string; orderId?: string; limit?: number }) {
    return this.request({
      method: 'GET',
      path: '/az/spot/trade',
      query: params as Record<string, string | number> | undefined,
      signed: true,
    });
  }

  // ─── Account ─────────────────────────────

  async getBalance(currency?: string) {
    if (currency) {
      return this.request({
        method: 'GET',
        path: '/az/spot/balance',
        query: { currency },
        signed: true,
      });
    }
    return this.request({
      method: 'GET',
      path: '/az/spot/balances',
      signed: true,
    });
  }

  async getDepositAddress(coin: string) {
    return this.request({
      method: 'GET',
      path: '/az/spot/deposit/address',
      query: { coin },
      signed: true,
    });
  }

  async getDepositHistory(params?: { coin?: string; limit?: number }) {
    return this.request({
      method: 'GET',
      path: '/az/spot/deposit/history',
      query: params as Record<string, string | number> | undefined,
      signed: true,
    });
  }

  async withdraw(params: Record<string, unknown>) {
    return this.request({
      method: 'POST',
      path: '/az/spot/withdraw',
      body: params,
      signed: true,
    });
  }

  async getWithdrawHistory(params?: { coin?: string; limit?: number }) {
    return this.request({
      method: 'GET',
      path: '/az/spot/withdraw/history',
      query: params as Record<string, string | number> | undefined,
      signed: true,
    });
  }

  async transfer(params: { coin: string; amount: string; from: string; to: string }) {
    return this.request({
      method: 'POST',
      path: '/az/spot/balance/transfer',
      body: params,
      signed: true,
    });
  }
}

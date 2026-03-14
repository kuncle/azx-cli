import { BaseClient } from './base-client.js';
import { signFutures } from '../auth/signer.js';
import type { ApiCredentials, SignedHeaders } from '../auth/types.js';
import type { RetryOptions } from '../utils/retry.js';

const FUTURES_URLS = {
  production: 'https://f-api.azverse.xyz',
  sandbox: 'https://f-api.az-qa.xyz',
} as const;

export class FuturesClient extends BaseClient {
  constructor(options: {
    credentials?: ApiCredentials;
    sandbox?: boolean;
    retryOptions?: Partial<RetryOptions>;
    builderCode?: string;
  } = {}) {
    const baseUrl = options.sandbox ? FUTURES_URLS.sandbox : FUTURES_URLS.production;
    super(baseUrl, options.credentials, options.retryOptions, options.builderCode);
  }

  protected sign(params: { method: string; path: string; query?: string; body?: string }): SignedHeaders {
    if (!this.credentials) throw new Error('No credentials');
    return signFutures(this.credentials, params);
  }

  // ─── Market / Quotes (Public) ────────────

  async getSymbols() {
    return this.request({ method: 'GET', path: '/az/future/market/v3/public/symbol/list' });
  }

  async getSymbol(symbol: string) {
    return this.request({
      method: 'GET',
      path: '/az/future/market/v1/public/symbol/detail',
      query: { symbol },
    });
  }

  async getCoins() {
    return this.request({ method: 'GET', path: '/az/future/market/v1/public/symbol/coins' });
  }

  async getTicker(symbol: string) {
    return this.request({
      method: 'GET',
      path: '/az/future/market/v1/public/q/ticker',
      query: { symbol },
    });
  }

  async getTickers() {
    return this.request({ method: 'GET', path: '/az/future/market/v1/public/q/tickers' });
  }

  async getAggTicker(symbol: string) {
    return this.request({
      method: 'GET',
      path: '/az/future/market/v1/public/q/agg-ticker',
      query: { symbol },
    });
  }

  async getAggTickers() {
    return this.request({ method: 'GET', path: '/az/future/market/v1/public/q/agg-tickers' });
  }

  async getDepth(symbol: string, level?: number) {
    return this.request({
      method: 'GET',
      path: '/az/future/market/v1/public/q/depth',
      query: { symbol, ...(level !== undefined ? { level } : {}) },
    });
  }

  async getKlines(symbol: string, interval: string, limit?: number, startTime?: number, endTime?: number) {
    return this.request({
      method: 'GET',
      path: '/az/future/market/v1/public/q/kline',
      query: {
        symbol,
        interval,
        ...(limit !== undefined ? { limit } : {}),
        ...(startTime !== undefined ? { startTime } : {}),
        ...(endTime !== undefined ? { endTime } : {}),
      },
    });
  }

  async getDeal(symbol: string, num?: number) {
    return this.request({
      method: 'GET',
      path: '/az/future/market/v1/public/q/deal',
      query: { symbol, ...(num !== undefined ? { num } : {}) },
    });
  }

  async getFundingRate(symbol: string) {
    return this.request({
      method: 'GET',
      path: '/az/future/market/v1/public/q/funding-rate',
      query: { symbol },
    });
  }

  async getFundingRateRecord(params: { symbol?: string; id?: string; direction?: string; limit?: number }) {
    return this.request({
      method: 'GET',
      path: '/az/future/market/v1/public/q/funding-rate-record',
      query: params as Record<string, string | number>,
    });
  }

  async getOpenInterest(symbol: string) {
    return this.request({
      method: 'GET',
      path: '/az/future/market/v1/public/contract/open-interest',
      query: { symbol },
    });
  }

  async getMarkPrice(symbol: string) {
    return this.request({
      method: 'GET',
      path: '/az/future/market/v1/public/q/symbol-mark-price',
      query: { symbol },
    });
  }

  async getMarkPrices() {
    return this.request({ method: 'GET', path: '/az/future/market/v1/public/q/mark-price' });
  }

  async getIndexPrice(symbol: string) {
    return this.request({
      method: 'GET',
      path: '/az/future/market/v1/public/q/symbol-index-price',
      query: { symbol },
    });
  }

  async getIndexPrices() {
    return this.request({ method: 'GET', path: '/az/future/market/v1/public/q/index-price' });
  }

  async getBestPrice(symbol: string) {
    return this.request({
      method: 'GET',
      path: '/az/future/market/v1/public/q/best-price',
      query: { symbol },
    });
  }

  async getTickerBook(symbol: string) {
    return this.request({
      method: 'GET',
      path: '/az/future/market/v1/public/q/ticker/book',
      query: { symbol },
    });
  }

  async getTickerBooks(symbol?: string) {
    return this.request({
      method: 'GET',
      path: '/az/future/market/v1/public/q/ticker/books',
      query: symbol ? { symbol } : undefined,
    });
  }

  async getLeverageBracket(symbol: string) {
    return this.request({
      method: 'GET',
      path: '/az/future/market/v1/public/leverage/bracket/detail',
      query: { symbol },
    });
  }

  async getLeverageBrackets() {
    return this.request({ method: 'GET', path: '/az/future/market/v1/public/leverage/bracket/list' });
  }

  async getRiskBalance(symbol: string, params?: { id?: string; direction?: string; limit?: number }) {
    return this.request({
      method: 'GET',
      path: '/az/future/market/v1/public/contract/risk-balance',
      query: { symbol, ...params } as Record<string, string | number>,
    });
  }

  async getClientInfo() {
    return this.request({ method: 'GET', path: '/az/future/public/client' });
  }

  // ─── Order ───────────────────────────────

  async placeOrder(params: Record<string, unknown>) {
    return this.request({
      method: 'POST',
      path: '/az/future/trade/v1/order/create',
      body: params,
      signed: true,
      extraHeaders: { 'builder-code': this.builderCode },
    });
  }

  async getOrderById(orderId: string) {
    return this.request({
      method: 'GET',
      path: '/az/future/trade/v1/order/detail',
      query: { orderId },
      signed: true,
    });
  }

  async getOrderSimpleInfo(orderId: string) {
    return this.request({
      method: 'GET',
      path: '/az/future/trade/v1/order/slim',
      query: { orderId },
      signed: true,
    });
  }

  async cancelOrder(orderId: string) {
    return this.request({
      method: 'POST',
      path: '/az/future/trade/v1/order/cancel',
      body: { orderId },
      signed: true,
    });
  }

  async cancelBatchOrders(symbol: string) {
    return this.request({
      method: 'POST',
      path: '/az/future/trade/v1/order/cancel-all',
      body: { symbol },
      signed: true,
    });
  }

  async updateOrder(params: { orderId: string; price: string; origQty: string; [key: string]: unknown }) {
    return this.request({
      method: 'POST',
      path: '/az/future/trade/v1/order/update',
      body: params,
      signed: true,
    });
  }

  async batchPlaceOrders(list: Record<string, unknown>[]) {
    return this.request({
      method: 'POST',
      path: '/az/future/trade/v2/order/create-batch',
      body: { list },
      signed: true,
      extraHeaders: { 'builder-code': this.builderCode },
    });
  }

  async getOpenOrders(params?: { symbol?: string; state?: string; page?: number; size?: number }) {
    return this.request({
      method: 'GET',
      path: '/az/future/trade/v1/order/list',
      query: { state: 'NEW', ...params } as Record<string, string | number>,
      signed: true,
    });
  }

  async getOrders(params?: { symbol?: string; state?: string; page?: number; size?: number; startTime?: number; endTime?: number; clientOrderId?: string }) {
    return this.request({
      method: 'GET',
      path: '/az/future/trade/v1/order/list',
      query: params as Record<string, string | number> | undefined,
      signed: true,
    });
  }

  async getOrderHistory(params?: { symbol?: string; limit?: number; startTime?: number; endTime?: number; direction?: string; id?: string }) {
    return this.request({
      method: 'GET',
      path: '/az/future/trade/v1/order/list-history',
      query: params as Record<string, string | number> | undefined,
      signed: true,
    });
  }

  async getOrderTrades(params?: { symbol?: string; orderId?: string; startTime?: number; endTime?: number; fromId?: string; direction?: string; size?: number }) {
    return this.request({
      method: 'GET',
      path: '/az/future/trade/v1/order/trade-list',
      query: params as Record<string, string | number> | undefined,
      signed: true,
    });
  }

  // ─── Entrust: Plan (Trigger) ─────────────

  async createPlanEntrust(params: Record<string, unknown>) {
    return this.request({
      method: 'POST',
      path: '/az/future/trade/v1/entrust/create-plan',
      body: params,
      signed: true,
    });
  }

  async cancelPlanEntrust(entrustId: string) {
    return this.request({
      method: 'POST',
      path: '/az/future/trade/v1/entrust/cancel-plan',
      body: { entrustId },
      signed: true,
    });
  }

  async cancelAllPlanEntrusts(symbol: string) {
    return this.request({
      method: 'POST',
      path: '/az/future/trade/v1/entrust/cancel-all-plan',
      body: { symbol },
      signed: true,
    });
  }

  async getPlanEntrusts(params: { symbol: string; state: string; page?: number; size?: number; startTime?: number; endTime?: number }) {
    return this.request({
      method: 'GET',
      path: '/az/future/trade/v1/entrust/plan-list',
      query: params as Record<string, string | number>,
      signed: true,
    });
  }

  async getPlanEntrustById(entrustId: string) {
    return this.request({
      method: 'GET',
      path: '/az/future/trade/v1/entrust/plan-detail',
      query: { entrustId },
      signed: true,
    });
  }

  async getPlanEntrustHistory(params: { symbol: string; direction?: string; id?: string; limit?: number; startTime?: number; endTime?: number }) {
    return this.request({
      method: 'GET',
      path: '/az/future/trade/v1/entrust/plan-list-history',
      query: params as Record<string, string | number>,
      signed: true,
    });
  }

  // ─── Entrust: Profit (TP/SL) ────────────

  async createProfitEntrust(params: Record<string, unknown>) {
    return this.request({
      method: 'POST',
      path: '/az/future/trade/v1/entrust/create-profit',
      body: params,
      signed: true,
    });
  }

  async cancelProfitEntrust(profitId: string) {
    return this.request({
      method: 'POST',
      path: '/az/future/trade/v1/entrust/cancel-profit-stop',
      body: { profitId },
      signed: true,
    });
  }

  async cancelAllProfitEntrusts(symbol: string) {
    return this.request({
      method: 'POST',
      path: '/az/future/trade/v1/entrust/cancel-all-profit-stop',
      body: { symbol },
      signed: true,
    });
  }

  async getProfitEntrusts(params: { symbol: string; state: string; page?: number; size?: number; startTime?: number; endTime?: number }) {
    return this.request({
      method: 'GET',
      path: '/az/future/trade/v1/entrust/profit-list',
      query: params as Record<string, string | number>,
      signed: true,
    });
  }

  async getProfitEntrustById(profitId: string) {
    return this.request({
      method: 'GET',
      path: '/az/future/trade/v1/entrust/profit-detail',
      query: { profitId },
      signed: true,
    });
  }

  async updateProfitEntrust(params: { profitId: string; triggerProfitPrice?: string; triggerStopPrice?: string }) {
    return this.request({
      method: 'POST',
      path: '/az/future/trade/v1/entrust/update-profit-stop',
      body: params,
      signed: true,
    });
  }

  // ─── Entrust: Track (Trailing Stop) ──────

  async createTrackEntrust(params: Record<string, unknown>) {
    return this.request({
      method: 'POST',
      path: '/az/future/trade/v1/entrust/create-track',
      body: params,
      signed: true,
    });
  }

  async cancelTrackEntrust(trackId: string) {
    return this.request({
      method: 'POST',
      path: '/az/future/trade/v1/entrust/cancel-track',
      body: { trackId },
      signed: true,
    });
  }

  async cancelAllTrackEntrusts() {
    return this.request({
      method: 'POST',
      path: '/az/future/trade/v1/entrust/cancel-all-track',
      signed: true,
    });
  }

  async getTrackEntrusts(params?: { symbol?: string; page?: number; size?: number; startTime?: number; endTime?: number }) {
    return this.request({
      method: 'GET',
      path: '/az/future/trade/v1/entrust/track-list',
      query: params as Record<string, string | number> | undefined,
      signed: true,
    });
  }

  async getTrackEntrustDetail(trackId: string) {
    return this.request({
      method: 'GET',
      path: '/az/future/trade/v1/entrust/track-detail',
      query: { trackId },
      signed: true,
    });
  }

  async getTrackEntrustHistory(params?: { symbol?: string; direction?: string; id?: string; limit?: number; startTime?: number; endTime?: number }) {
    return this.request({
      method: 'GET',
      path: '/az/future/trade/v1/entrust/track-list-history',
      query: params as Record<string, string | number> | undefined,
      signed: true,
    });
  }

  // ─── User / Account ─────────────────────

  async getAccountInfo() {
    return this.request({ method: 'GET', path: '/az/future/user/v1/account/info', signed: true });
  }

  async getContractInfo() {
    return this.request({ method: 'GET', path: '/az/future/user/v1/compat/balance/list', signed: true });
  }

  async getBalance(coin?: string) {
    if (coin) {
      return this.request({
        method: 'GET',
        path: '/az/future/user/v1/balance/detail',
        query: { coin },
        signed: true,
      });
    }
    return this.request({ method: 'GET', path: '/az/future/user/v1/balance/list', signed: true });
  }

  async getBalanceBill(params?: { symbol?: string; direction?: string; id?: string; limit?: number; startTime?: number; endTime?: number }) {
    return this.request({
      method: 'GET',
      path: '/az/future/user/v1/balance/bills',
      query: params as Record<string, string | number> | undefined,
      signed: true,
    });
  }

  async getFunding(params?: { symbol?: string; direction?: string; id?: string; limit?: number; startTime?: number; endTime?: number }) {
    return this.request({
      method: 'GET',
      path: '/az/future/user/v1/balance/funding-rate-list',
      query: params as Record<string, string | number> | undefined,
      signed: true,
    });
  }

  // ─── Position ────────────────────────────

  async getPositions(symbol?: string) {
    return this.request({
      method: 'GET',
      path: '/az/future/user/v1/position/list',
      query: symbol ? { symbol } : undefined,
      signed: true,
    });
  }

  async getPosition(symbol?: string) {
    return this.request({
      method: 'GET',
      path: '/az/future/user/v1/position',
      query: symbol ? { symbol } : undefined,
      signed: true,
    });
  }

  async setLeverage(params: { symbol: string; positionSide?: string; leverage: number }) {
    return this.request({
      method: 'POST',
      path: '/az/future/user/v1/position/adjust-leverage',
      body: params,
      signed: true,
    });
  }

  async adjustMargin(params: { symbol: string; margin: string; positionSide: string; type: string }) {
    return this.request({
      method: 'POST',
      path: '/az/future/user/v1/position/margin',
      body: params,
      signed: true,
    });
  }

  async setPositionType(params: { symbol: string; positionSide: string; positionType: string }) {
    return this.request({
      method: 'POST',
      path: '/az/future/user/v1/position/change-type',
      body: params,
      signed: true,
    });
  }

  async closeAllPositions() {
    return this.request({
      method: 'POST',
      path: '/az/future/user/v1/position/close-all',
      signed: true,
    });
  }

  async getStepRate() {
    return this.request({
      method: 'GET',
      path: '/az/future/user/v1/user/step-rate',
      signed: true,
    });
  }

  async getListenKey() {
    return this.request({ method: 'GET', path: '/az/future/user/v1/user/listen-key', signed: true });
  }

  async getAdl() {
    return this.request({ method: 'GET', path: '/az/future/user/v1/position/adl', signed: true });
  }

  async getMarginCall(symbol?: string) {
    return this.request({
      method: 'GET',
      path: '/az/future/user/v1/position/break-list',
      query: symbol ? { symbol } : undefined,
      signed: true,
    });
  }

  async setAutoMargin(params: { symbol: string; positionSide: string; autoMargin: boolean }) {
    return this.request({
      method: 'POST',
      path: '/az/future/user/v1/position/auto-margin',
      body: params,
      signed: true,
    });
  }
}

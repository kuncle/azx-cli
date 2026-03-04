export interface FuturesTicker {
  symbol: string;
  lastPrice: string;
  markPrice: string;
  indexPrice: string;
  bidPrice: string;
  askPrice: string;
  high24h: string;
  low24h: string;
  volume24h: string;
  change24h: string;
  changePercent24h: string;
}

export interface FuturesDepth {
  symbol: string;
  bids: [string, string][];
  asks: [string, string][];
  timestamp: number;
}

export interface FuturesKline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
}

export interface FundingRate {
  symbol: string;
  fundingRate: string;
  fundingTime: number;
  nextFundingTime: number;
}

export interface OpenInterest {
  symbol: string;
  openInterest: string;
  timestamp: number;
}

export interface FuturesOrder {
  orderId: string;
  clientOrderId?: string;
  symbol: string;
  side: string;
  positionSide?: string;
  type: string;
  price?: string;
  quantity: string;
  executedQty?: string;
  status: string;
  timeInForce?: string;
  createTime: number;
}

export interface Position {
  symbol: string;
  positionSide: string;
  marginMode: string;
  leverage: string;
  quantity: string;
  entryPrice: string;
  markPrice: string;
  unrealizedPnl: string;
  marginBalance: string;
  liquidationPrice: string;
}

export interface FuturesBalance {
  coin: string;
  available: string;
  frozen: string;
  total: string;
  unrealizedPnl: string;
}

export interface Entrust {
  entrustId: string;
  symbol: string;
  type: string;
  side: string;
  triggerPrice: string;
  price?: string;
  quantity: string;
  status: string;
  createTime: number;
}

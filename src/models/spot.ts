export interface SpotTicker {
  symbol: string;
  lastPrice: string;
  bidPrice: string;
  askPrice: string;
  high24h: string;
  low24h: string;
  volume24h: string;
  change24h: string;
  changePercent24h: string;
}

export interface SpotDepth {
  symbol: string;
  bids: [string, string][];
  asks: [string, string][];
  timestamp: number;
}

export interface SpotKline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
}

export interface SpotTrade {
  id: string;
  price: string;
  quantity: string;
  time: number;
  isBuyerMaker: boolean;
}

export interface SpotOrder {
  orderId: string;
  clientOrderId?: string;
  symbol: string;
  side: string;
  type: string;
  price?: string;
  quantity: string;
  executedQty?: string;
  status: string;
  timeInForce?: string;
  createTime: number;
}

export interface SpotBalance {
  coin: string;
  available: string;
  frozen: string;
  total: string;
}

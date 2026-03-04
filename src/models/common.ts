export type OrderSide = 'BUY' | 'SELL';

export type OrderType = 'LIMIT' | 'MARKET' | 'LIMIT_MAKER';

export type TimeInForce = 'GTC' | 'IOC' | 'FOK' | 'GTX';

export type OrderStatus =
  | 'NEW'
  | 'PARTIALLY_FILLED'
  | 'FILLED'
  | 'CANCELED'
  | 'REJECTED'
  | 'EXPIRED';

export type KlineInterval =
  | '1m' | '3m' | '5m' | '15m' | '30m'
  | '1h' | '2h' | '4h' | '6h' | '8h' | '12h'
  | '1d' | '3d' | '1w' | '1M';

export type MarginMode = 'CROSSED' | 'ISOLATED';

export type PositionSide = 'LONG' | 'SHORT' | 'BOTH';

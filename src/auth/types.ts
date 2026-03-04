export interface ApiCredentials {
  apiKey: string;
  secretKey: string;
}

export interface SignedHeaders {
  'validate-appkey': string;
  'validate-timestamp': string;
  'validate-signature': string;
  'validate-recvwindow'?: string;
  'validate-algorithms'?: string;
}

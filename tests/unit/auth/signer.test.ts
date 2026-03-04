import { describe, it, expect } from 'vitest';
import { signSpot, signFutures } from '../../../src/auth/signer.js';

const MOCK_CREDENTIALS = {
  apiKey: 'test-api-key',
  secretKey: 'test-secret-key',
};

describe('signSpot', () => {
  it('should produce a valid signature with all required headers', () => {
    const result = signSpot(MOCK_CREDENTIALS, {
      method: 'GET',
      path: '/az/spot/balances',
      query: 'symbol=btc_usdt',
    });

    expect(result['validate-appkey']).toBe('test-api-key');
    expect(result['validate-signature']).toMatch(/^[a-f0-9]{64}$/);
    expect(result['validate-algorithms']).toBe('HmacSHA256');
    expect(result['validate-recvwindow']).toBe('5000');
    expect(result['validate-timestamp']).toMatch(/^\d+$/);
  });

  it('should produce different signatures for different paths', () => {
    const sig1 = signSpot(MOCK_CREDENTIALS, {
      method: 'GET',
      path: '/az/spot/public/ticker',
    });

    const sig2 = signSpot(MOCK_CREDENTIALS, {
      method: 'GET',
      path: '/az/spot/public/depth',
    });

    expect(sig1['validate-signature']).not.toBe(sig2['validate-signature']);
  });

  it('should produce different signatures for different methods', () => {
    const sig1 = signSpot(MOCK_CREDENTIALS, {
      method: 'GET',
      path: '/az/spot/open-order',
    });

    const sig2 = signSpot(MOCK_CREDENTIALS, {
      method: 'POST',
      path: '/az/spot/open-order',
    });

    expect(sig1['validate-signature']).not.toBe(sig2['validate-signature']);
  });

  it('should handle body in POST requests', () => {
    const result = signSpot(MOCK_CREDENTIALS, {
      method: 'POST',
      path: '/az/spot/order',
      body: '{"symbol":"btc_usdt","side":"BUY"}',
    });

    expect(result['validate-signature']).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should not append separators when query and body are empty', () => {
    // With no query and no body, preSign should end with #path (no trailing #)
    const sig1 = signSpot(MOCK_CREDENTIALS, {
      method: 'GET',
      path: '/az/spot/balances',
    });

    const sig2 = signSpot(MOCK_CREDENTIALS, {
      method: 'GET',
      path: '/az/spot/balances',
      query: '',
      body: '',
    });

    // Empty string query/body should be treated same as undefined
    expect(sig1['validate-signature']).toBe(sig2['validate-signature']);
  });

  it('should produce different signature when query is present vs absent', () => {
    const sigNoQuery = signSpot(MOCK_CREDENTIALS, {
      method: 'GET',
      path: '/az/spot/balances',
    });

    const sigWithQuery = signSpot(MOCK_CREDENTIALS, {
      method: 'GET',
      path: '/az/spot/balances',
      query: 'currency=USDT',
    });

    expect(sigNoQuery['validate-signature']).not.toBe(sigWithQuery['validate-signature']);
  });
});

describe('signFutures', () => {
  it('should produce a valid signature with only appkey and timestamp headers', () => {
    const result = signFutures(MOCK_CREDENTIALS, {
      method: 'GET',
      path: '/az/future/user/v1/balance/list',
      query: 'symbol=btc_usdt',
    });

    expect(result['validate-appkey']).toBe('test-api-key');
    expect(result['validate-signature']).toMatch(/^[a-f0-9]{64}$/);
    expect(result['validate-timestamp']).toMatch(/^\d+$/);
    // Futures should NOT include algorithms or recvwindow
    expect(result['validate-algorithms']).toBeUndefined();
    expect(result['validate-recvwindow']).toBeUndefined();
  });

  it('should handle POST with body correctly', () => {
    const result = signFutures(MOCK_CREDENTIALS, {
      method: 'POST',
      path: '/az/future/trade/v1/order/create',
      body: '{"symbol":"btc_usdt","orderSide":"BUY","origQty":"1"}',
    });

    expect(result['validate-signature']).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should produce different signatures from spot signing (different preSign format)', () => {
    const spotSig = signSpot(MOCK_CREDENTIALS, {
      method: 'GET',
      path: '/test/path',
      query: 'foo=bar',
    });

    const futuresSig = signFutures(MOCK_CREDENTIALS, {
      method: 'GET',
      path: '/test/path',
      query: 'foo=bar',
    });

    // Spot uses all 4 sorted headers, Futures uses only appkey+timestamp
    // Different preSign format means different signatures
    expect(spotSig['validate-signature']).not.toBe(futuresSig['validate-signature']);
  });
});

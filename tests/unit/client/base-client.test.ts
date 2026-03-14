import { describe, it, expect, afterEach, vi } from 'vitest';
import { SpotClient } from '../../../src/client/spot-client.js';
import { FuturesClient } from '../../../src/client/futures-client.js';

const MOCK_CREDENTIALS = { apiKey: 'test-key', secretKey: 'test-secret' };

let capturedHeaders: Record<string, string> = {};

const mockFetch = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
  capturedHeaders = {};
  if (init?.headers) {
    const entries = Object.entries(init.headers as Record<string, string>);
    for (const [k, v] of entries) {
      capturedHeaders[k] = v;
    }
  }
  return new Response(JSON.stringify({ rc: 0, returnCode: 0, result: { orderId: '1' } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

vi.stubGlobal('fetch', mockFetch);

afterEach(() => {
  mockFetch.mockClear();
  capturedHeaders = {};
});

describe('builder-code header', () => {
  it('should include builder-code on spot placeOrder with default AZX', async () => {
    const client = new SpotClient({ credentials: MOCK_CREDENTIALS });
    await client.placeOrder({ symbol: 'btc_usdt', side: 'BUY', type: 'MARKET', quantity: '1' });

    expect(capturedHeaders['builder-code']).toBe('AZX');
  });

  it('should include builder-code on spot placeOrder with custom value', async () => {
    const client = new SpotClient({ credentials: MOCK_CREDENTIALS, builderCode: 'CUSTOM' });
    await client.placeOrder({ symbol: 'btc_usdt', side: 'BUY', type: 'MARKET', quantity: '1' });

    expect(capturedHeaders['builder-code']).toBe('CUSTOM');
  });

  it('should include builder-code on spot batchPlaceOrders', async () => {
    const client = new SpotClient({ credentials: MOCK_CREDENTIALS });
    await client.batchPlaceOrders([{ symbol: 'btc_usdt', side: 'BUY', type: 'MARKET', quantity: '1' }]);

    expect(capturedHeaders['builder-code']).toBe('AZX');
  });

  it('should include builder-code on futures placeOrder with default AZX', async () => {
    const client = new FuturesClient({ credentials: MOCK_CREDENTIALS });
    await client.placeOrder({ symbol: 'btc_usdt', orderSide: 'BUY', orderType: 'MARKET', origQty: '1' });

    expect(capturedHeaders['builder-code']).toBe('AZX');
  });

  it('should include builder-code on futures placeOrder with custom value', async () => {
    const client = new FuturesClient({ credentials: MOCK_CREDENTIALS, builderCode: 'MY_CODE' });
    await client.placeOrder({ symbol: 'btc_usdt', orderSide: 'BUY', orderType: 'MARKET', origQty: '1' });

    expect(capturedHeaders['builder-code']).toBe('MY_CODE');
  });

  it('should include builder-code on futures batchPlaceOrders', async () => {
    const client = new FuturesClient({ credentials: MOCK_CREDENTIALS });
    await client.batchPlaceOrders([{ symbol: 'btc_usdt', orderSide: 'BUY', orderType: 'MARKET', origQty: '1' }]);

    expect(capturedHeaders['builder-code']).toBe('AZX');
  });

  it('should NOT include builder-code on unsigned (public) requests', async () => {
    const client = new SpotClient();
    await client.getServerTime();

    expect(capturedHeaders['builder-code']).toBeUndefined();
  });

  it('should NOT include builder-code on non-order signed requests', async () => {
    const client = new SpotClient({ credentials: MOCK_CREDENTIALS });
    await client.getOpenOrders();

    expect(capturedHeaders['builder-code']).toBeUndefined();
  });

  it('should NOT include builder-code on futures non-order signed requests', async () => {
    const client = new FuturesClient({ credentials: MOCK_CREDENTIALS });
    await client.getBalance();

    expect(capturedHeaders['builder-code']).toBeUndefined();
  });
});

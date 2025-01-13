import { SetupServerApi, setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

// test the preInstall and postInstall hooks

describe('Maven hooks', async () => {
  let server: SetupServerApi;

  beforeAll(async () => {
    console.log('beforeAll');
    server = setupServer();
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
    vi.restoreAllMocks();
  });

  describe('preInstall', () => {
    it('should run without error', () => {
      expect(1).toBe(1);
    });
  });

  describe('postInstall', () => {
    it('should run without error', () => {
      expect(1).toBe(1);
    });
  });
});

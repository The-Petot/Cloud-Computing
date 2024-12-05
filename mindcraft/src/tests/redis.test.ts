import { describe, expect, test } from 'bun:test';
import {
  setSessionId,
  getSessionData,
  setRefreshTokenOnRedis,
  isGetSessionDataSuccess,
  createSessionId,
} from '../lib';

const redis = await import('../database/redis').then((m) => m.default);

describe('Redis Service', () => {
  const sessionId = createSessionId(1)
  test('setSessionId should set a session id', async () => {
    const result = await setSessionId(redis, sessionId, { firstName: 'John' });

    expect(result).toBe(true);
  })

  test('getSessionData should get session data', async () => {
    const sessionData = await getSessionData(redis, sessionId);

    if (isGetSessionDataSuccess(sessionData)) {
      expect(sessionData.firstName).toBe('John');
    }
  });

  test('setRefreshTokenOnRedis should set a refresh token', async () => {
    const result = await setRefreshTokenOnRedis(redis, 'refreshToken', 1);
    const refreshToken = await redis.get(`refresh-token:1`);

    expect(result).toBe(true);
    expect(refreshToken).toBe('refreshToken');
  });
  
});

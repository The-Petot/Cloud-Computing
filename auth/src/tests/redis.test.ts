import { describe, expect, test } from 'bun:test';
import {
  setRefreshTokenOnRedis,
  isGetSessionDataSuccess,
  setSessionId,
  getSessionData,
} from '../libs/index';
import { v4 as uuidv4 } from 'uuid';

const redis = await import('../database/redis').then((m) => m.default);

describe('Redis Service', () => {
  const sessionId = `1:${uuidv4()}`;
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

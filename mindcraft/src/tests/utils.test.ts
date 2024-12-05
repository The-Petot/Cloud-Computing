import { describe, expect, test } from 'bun:test';
import {
  getEnv,
  hashPassword,
  isANumber,
  isEmailValid,
  isPasswordMatch,
  isPasswordValid,
  isServiceMethodSuccess,
} from '../utils';

describe('Utils', () => {
  test('getEnv should return an environment variable', async () => {
    const value = getEnv('TEST');
    expect(value).toBe('test');
  });

  test('hashPassword should hash a password', async () => {
    const hashedPassword = await hashPassword('password');
    expect(hashedPassword).toBeString();
  });

  test('isANumber should return true if the input is a number', async () => {
    const result = isANumber(1);
    expect(result).toBe(true);
  });

  test('isEmailValid should return true if the email is valid', async () => {
    const result = isEmailValid('user@example.com');
    expect(result).toBe(true);
  });

  test('isPasswordMatch should return true if the passwords match', async () => {
    const hashedPassword = await hashPassword('password');
    const result = await isPasswordMatch('password', hashedPassword);
    expect(result).toBe(true);
  });

  test('isPasswordValid should return true if the password is greater than or equal 8 characters', async () => {
    const result = isPasswordValid('password');
    expect(result).toBe(true);
  });

  test('isServiceMethodSuccess should return true if the service method is successful', async () => {
    const success = { data: { success: true } };
    if (isServiceMethodSuccess<{ success: boolean }>(success)) {
      expect(success.data.success).toBe(true);
    }
  });

  test('isServiceMethodSuccess should return false if the service method is not successful', async () => {
    const error = { errors: [{ messages: ['error'] }], statusCode: 500 };
    if (!isServiceMethodSuccess<{ message: string }>(error)) {
      expect(error.errors[0].messages[0]).toBe('error');
    }
  });
});

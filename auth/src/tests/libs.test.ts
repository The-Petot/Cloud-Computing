import speakeasy from 'speakeasy';
import { test, describe, expect } from 'bun:test';
import {
  getEnv,
  createSessionId,
  generateAccessToken,
  generateRefreshToken,
  generateQRCode,
  generateTwoFactorSecret,
  isGenerateQRCodeSuccess,
  isVerifyJwtTokenSuccess,
  verifyJwtToken,
  hashPassword,
  isEmailValid,
  isPasswordMatch,
  isPasswordValid,
  isServiceMethodSuccess,
  setError,
  setFieldError,
  verifyTwoFactorToken,

} from '../libs/index';
import { ServiceMethodReturnType } from '../types/global.types';

describe('Environment Utilities', () => {
  test('getEnv should return a string', () => {
    const env = getEnv('TEST');
    expect(env).toBe('test');
  });
});

describe('Session Utilities', () => {
  test('createSessionId should return a string with format "id:uuid"', () => {
    const sessionId = createSessionId(1);

    expect(sessionId.at(0)).toBe('1');
    expect(sessionId.split(':').length).toBe(2);
  });
});

describe('Token Utilities', () => {
  test('generateAccessToken should return a valid JWT', async () => {
    const accessToken = await generateAccessToken({
      userId: 1,
      sessionId: '1:uuid',
    });

    const decodedSuccess = await verifyJwtToken(accessToken);
    if (isVerifyJwtTokenSuccess(decodedSuccess)) {
      expect(decodedSuccess.payload.userId).toBe(1);
      expect(decodedSuccess.payload.sessionId).toBe('1:uuid');
    }

    const decodedError = await verifyJwtToken('invalid token');
    if (!isVerifyJwtTokenSuccess(decodedError)) {
      expect(decodedError.error).toStartWith('Unable to verify access token:');
    }
  });

  test('generateRefreshToken should return a valid JWT', async () => {
    const refreshToken = await generateRefreshToken({
      userId: 1,
      sessionId: '1:uuid',
    });

    const decodedSuccess = await verifyJwtToken(refreshToken);
    if (isVerifyJwtTokenSuccess(decodedSuccess)) {
      expect(decodedSuccess.payload.userId).toBe(1);
      expect(decodedSuccess.payload.sessionId).toBe('1:uuid');
    }

    const decodedError = await verifyJwtToken('invalid token');
    if (!isVerifyJwtTokenSuccess(decodedError)) {
      expect(decodedError.error).toStartWith('Unable to verify access token:');
    }
  });
});

describe('QR Code Utilities', () => {
  test('generateQRCode should return a valid QR code', async () => {
    const qrCode = await generateQRCode('https://example.com');
    if (isGenerateQRCodeSuccess(qrCode)) {
      expect(qrCode.qrCode).toStartWith('data:image/png;base64');
    }
  });

  test('generateTwoFactorSecret should return a secret object', () => {
    const secret = generateTwoFactorSecret();
    expect(secret).toHaveProperty('base32');
    expect(secret).toHaveProperty('otpauth_url');
  });

  test('should validate a correct TOTP code', async () => {
    const secret = generateTwoFactorSecret();
    const token = speakeasy.totp({
      secret: secret.base32,
      encoding: 'base32',
    });

    const isValid = await verifyTwoFactorToken(secret.base32, token);
    expect(isValid).toBe(true);
  });

  test('should reject an incorrect TOTP code', () => {
    const secret = speakeasy.generateSecret();
    const invalidToken = '123456';

    const isValid = speakeasy.totp.verify({
      secret: secret.base32,
      encoding: 'base32',
      token: invalidToken,
      window: 1,
    });

    expect(isValid).toBe(false);
  });
});

describe('Password Utilities', () => {
  test('hashPassword should return a hashed password', async () => {
    const password = 'password';
    const hashedPassword = await hashPassword(password);
    expect(hashedPassword).not.toBe(password);

    const passwordMatch = await isPasswordMatch(password, hashedPassword);
    expect(passwordMatch).toBe(true);

    const passwordNotMatch = await isPasswordMatch(
      'wrong password',
      hashedPassword
    );
    expect(passwordNotMatch).toBe(false);
  });

  test('isPasswordValid should return true for password with at least 8 chars', () => {
    const validPassword = 'password';
    const invalidPassword = 'pass';

    expect(isPasswordValid(validPassword)).toBe(true);
    expect(isPasswordValid(invalidPassword)).toBe(false);
  });
});

describe('Email Utilities', () => {
  test('isEmailValid should return true for valid email', () => {
    const validEmail = 'user@example.com';
    const invalidEmail = 'user@example';

    expect(isEmailValid(validEmail)).toBe(true);
    expect(isEmailValid(invalidEmail)).toBe(false);
  });
});

describe('Service Method Utilities', () => {
  test('isServiceMethodSuccess should return true for success object', async () => {
    async function dummySuccessServiceMethod(): Promise<
      ServiceMethodReturnType<number>
    > {
      return { data: 1 };
    }

    async function dummyErrorServiceMethod(): Promise<
      ServiceMethodReturnType<number>
    > {
      return { errors: [{ messages: ['error'] }], statusCode: 400 };
    }

    expect(isServiceMethodSuccess(await dummySuccessServiceMethod())).toBe(
      true
    );
    expect(isServiceMethodSuccess(await dummyErrorServiceMethod())).toBe(false);
  });
});

describe('Error Utilities', () => {
  test('setError should return an error object', () => {
    const error = setError(
      {} as any,
      400,
      [{ field: 'test field', messages: ['error message'] }],
      ['error message']
    );
    expect(error).toHaveProperty('success');
    expect(error).toHaveProperty('errors');
    expect(error.success).toBe(false);
    expect(error.errors).toHaveLength(2);
  });

  test('setFieldError should return an error object with field', () => {
    const error = setFieldError({} as any, 400, 'field', ['error message']);
    expect(error).toHaveProperty('success');
    expect(error).toHaveProperty('errors');
    expect(error.success).toBe(false);
    expect(error.errors).toHaveLength(1);
  });
});

describe('Google Utility Functions', () => {
  // Add tests for Google utility functions here
});

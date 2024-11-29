import * as jose from 'jose'
import {  Redis, User } from './types/global.type';
import {
  ServiceMethodReturnType,
  ServiceMethodSuccessReturnType,
} from './types/global.type';
import { ExtendedEnv } from './types/types';
import bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import speakeasy, { GeneratedSecret } from 'speakeasy';
import QRcode from 'qrcode';
import { HTTPHeaders } from 'elysia/dist/types';
import { StatusMap } from 'elysia';
import { ElysiaCookie } from 'elysia/dist/cookies';

export function getEnv(key: keyof ExtendedEnv): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export function isEmailValid(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isPasswordValid(password: string): boolean {
  return password.length >= 8;
}

export function isServiceMethodSuccess<T>(
  result: ServiceMethodReturnType<T>
): result is ServiceMethodSuccessReturnType<T> {
  return (result as ServiceMethodSuccessReturnType<T>).data !== undefined;
}

export async function hashPassword(password: string): Promise<string> {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    return password;
  }
}

export async function isPasswordMatch(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
    return isPasswordMatch;
  } catch (error) {
    console.error(
      'ERR:BCRYPT: Unknown error happen when comparing password',
      error
    );
    return false;
  }
}

export function createSessionId(userId: number): string {
  const sessionId = `${String(userId)}:${v4()}`
  return sessionId;
}

const jwtSecret = new TextEncoder().encode(getEnv('JWT_SECRET'));
export async function generateAccessToken<T extends Record<string, unknown>>(
  payload: T
): Promise<string> {
  const accessToken = await new jose.SignJWT(payload)
    .setProtectedHeader({
      alg: 'HS256',
    })
    .setExpirationTime('1h')
    .setIssuedAt()
    .setIssuer('Mindcraft')
    .setAudience('Mindcraft')
    .sign(jwtSecret);

  return accessToken;
}

export async function generateRefreshToken<T extends Record<string, unknown>>(
  payload: T
): Promise<string> {
  const accessToken = await new jose.SignJWT(payload)
    .setProtectedHeader({
      alg: 'HS256',
    })
    .setExpirationTime('7d')
    .setIssuedAt()
    .setIssuer('Mindcraft')
    .setAudience('Mindcraft')
    .sign(jwtSecret);

  return accessToken;
}

type VerifyJwtTokenSuccess = {
  payload: jose.JWTPayload;
  protectedHeader: jose.JWTHeaderParameters;
};

type VerifyJwtTokenError = {
  error: string;
};

type VerifyJwtTokenResult = VerifyJwtTokenSuccess | VerifyJwtTokenError;

export function isVerifyJwtTokenSuccess(
  result: VerifyJwtTokenResult
): result is VerifyJwtTokenSuccess {
  return (result as VerifyJwtTokenSuccess).payload !== undefined;
}

export async function verifyJwtToken(
  token: string
): Promise<VerifyJwtTokenResult> {
  try {
    const result = await jose.jwtVerify(token, jwtSecret);
    return result;
  } catch (error) {
    return {
      error: `Unable to verify access token: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
  }
}

export function generateTwoFactorSecret(): GeneratedSecret {
  const secret = speakeasy.generateSecret({ name: 'Mindcraft' });
  return secret;
}


type GenerateQRCodeSuccess = {
  qrCode: string;
}

type GenerateQRCodeError = {
  error: string;
}

type GenerateQRCodeResult = GenerateQRCodeSuccess | GenerateQRCodeError;

export function isGenerateQRCodeSuccess(
  result: GenerateQRCodeResult
): result is GenerateQRCodeSuccess {
  return (result as GenerateQRCodeSuccess).qrCode !== undefined;
}

export async function generateQRCode(
  url: string
): Promise<GenerateQRCodeResult> {
  try {
    const qrCode = await QRcode.toDataURL(url);
    return {
      qrCode,
    };
  } catch (error) {
    console.error('ERR:QR: Unable to generate QR code', error);
    return {
      error: `Unable to generate QR code: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
  }
}

export async function verifyTwoFactorToken(
  secret: string,
  token: string
): Promise<boolean> {
  const isTokenValid = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
  });
  return isTokenValid;
}

export async function setSessionId<T>(redis: Redis, sessionId: string, data: T): Promise<boolean> {
  try {
    await redis.set(sessionId, JSON.stringify(data));
    return true;
  } catch (error) {
    return false;
  }
}

export async function setRefreshTokenOnRedis(
  redis: Redis,
  refreshToken: string,
  userId: number
): Promise<boolean> {
  try {
    await redis.set(`refresh-token:${userId}`, refreshToken);
    return true;
  } catch (error) {
    return false;
  }
}


type GetSessionDataSuccess = Omit<User, "password">
type GetSessionDataFailed = {
  error: string;
  statusCode: number
}
type GetSessionDataResult = GetSessionDataSuccess | GetSessionDataFailed

export function isGetSessionDataSuccess(
  result: GetSessionDataResult
): result is GetSessionDataSuccess {
  return (result as GetSessionDataSuccess).email !== undefined;
}

export async function getSessionData(redis: Redis, sessionId: string): Promise<GetSessionDataResult> {
  try {
    const data = await redis.get(sessionId);
    if (!data) {
      return { error: 'Session not found', statusCode: 401 };
    }
    return JSON.parse(data);
  } catch (error) {
    return {
      error: `Unable to get session data: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      statusCode: 500,
    };
  }
}

export type BaseError = {
  field?: string;
  messages: string[];
}

export type Errors = BaseError[]

export const setError = (
  set: {
    headers: HTTPHeaders;
    status?: number | keyof StatusMap;
    redirect?: string;
    cookie?: Record<string, ElysiaCookie>;
  },
  statusCode: number,
  errors: Errors | null,
  messages: string[] | null
) => {
  const response: { success: boolean; errors: Errors } = {
    success: false,
    errors: [],
  };
  set.status = statusCode;

  if (errors !== null) {
    response.errors = errors;
  }

  if (messages !== null) {
    response.errors.push({ messages });
  }

  return response;
};

export const setFieldError = (
  set: {
    headers: HTTPHeaders;
    status?: number | keyof StatusMap;
    redirect?: string;
    cookie?: Record<string, ElysiaCookie>;
  },
  statusCode: number,
  field: string,
  messages: string[]
) => {
  return setError(set, statusCode, [{ field, messages }], null);
};

export function isANumber(param: string): boolean {
  return !isNaN(Number(param));
}

export function handleDBError(error: unknown, message: string) {
  return {
    statusCode: 500,
    errors: [
      {
        messages: [
          `${message}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        ],
      },
    ],
  };
}

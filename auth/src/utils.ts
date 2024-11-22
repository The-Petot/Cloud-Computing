import { JWTPayloadSpec } from '@elysiajs/jwt';
import { Jwt, Redis, UserSessionData } from './global.types';
import {
  ServiceMethodReturnType,
  ServiceMethodSuccessReturnType,
} from './services/service.type';
import { ExtendedEnv } from './types';
import bcrypt from 'bcrypt';
import { v4 } from 'uuid';

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

export async function createSessionId(userId: number): Promise<string> {
  const sessionId = await bcrypt.hash(`${String(userId)}:${v4()}`, 10);
  return sessionId;
}

export async function generateAccessToken(
  jwt: Jwt,
  userId: number
): Promise<string> {
  const accessToken = await jwt.sign({
    userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  });
  return accessToken;
}

export async function generateRefreshToken(
  jwt: Jwt,
  userId: number
): Promise<string> {
  const refreshToken = await jwt.sign({
    userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  });
  return refreshToken;
}
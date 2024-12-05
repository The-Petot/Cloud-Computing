import {
  ServiceMethodReturnType,
  ServiceMethodSuccessReturnType,
} from './types/global.type';
import { ExtendedEnv } from './types/types';
import bcrypt from 'bcrypt';
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


export type BaseError = {
  field?: string;
  messages: string[];
};

export type Errors = BaseError[];

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

export function isANumber(param: string | number): boolean {
  return !isNaN(Number(param));
}




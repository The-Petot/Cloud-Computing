import { InferHandler } from 'elysia';
import app from '../index';
import { User } from './global.types';

export interface JSONErrorResponse {
  success: boolean;
  errors: {
    messages: string[];
    field?: string;
  }[];
}

export interface JSONSuccessResponse<T> {
  data?: T;
  message: string;
  success: boolean;
  links: {
    self: string;
    [key: string]: string;
  };
}

export type HandleUserRegister = InferHandler<
  typeof app,
  '/register',
  {
    body: User;
    response: {
      201: JSONSuccessResponse<{
        userId: number;
      }>;
      400: JSONErrorResponse;
      409: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleUserLogin = InferHandler<
  typeof app,
  '/login',
  {
    body: { email: string; password: string; token?: string };
    response: {
      200: JSONSuccessResponse<Omit<User, 'password'>>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleUserLogout = InferHandler<
  typeof app,
  '/logout',
  {
    body: { userId: number };
    response: {
      200: JSONSuccessResponse<{}>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleTokenRefresh = InferHandler<
  typeof app,
  '/refresh',
  {
    body: { userId: number };
    response: {
      200: JSONSuccessResponse<{}>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleToggleTwoFactor = InferHandler<
  typeof app,
  '/two-factor',
  {
    query: { enable: string };
    body: { userId: number; secret: string; token: string };
    response: {
      200: JSONSuccessResponse<{}>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleGoogleOAuth = InferHandler<
  typeof app,
  '/oauth/google',
  {
    body: { token: string };
    response: {
      200: JSONSuccessResponse<Omit<User, 'password'>>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleGetTwoFactorQR = InferHandler<
  typeof app,
  '/two-factor',
  {
    body: { userId: number };
    response: {
      200: JSONSuccessResponse<{ qrCode: string; secret: string }>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

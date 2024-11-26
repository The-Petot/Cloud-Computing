import { InferHandler } from 'elysia';
import app from '..';
import { Challenge, User } from './global.type';

interface JSONErrorResponse {
  errors: {
    messages: string[];
    field?: string;
    header?: string;
  }[];
}

interface JSONSuccessResponse<T> {
  data?: T;
  message: string;
  links: {
    self: string;
    [key: string]: string;
  };
}

export type HandleGetUserById = InferHandler<
  typeof app,
  '/users/:userId',
  {
    params: { userId: number };
    response: {
      200: JSONSuccessResponse<Omit<User, 'password'>>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleGetUsers = InferHandler<
  typeof app,
  '/users',
  {
    response: {
      200: JSONSuccessResponse<Omit<User, 'password'>[]>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleGetUserChallenges = InferHandler<
  typeof app,
  '/users/:userId/challenges',
  {
    params: { userId: number };
    response: {
      200: JSONSuccessResponse<Challenge[]>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleGetUserParticipations = InferHandler<
  typeof app,
  '/users/:userId/participations',
  {
    params: { userId: number };
    response: {
      200: JSONSuccessResponse<Challenge[]>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleUserUpdate = InferHandler<
  typeof app,
  '/users/:userId',
  {
    body: Partial<User>;
    params: { userId: number };
    response: {
      200: JSONSuccessResponse<Omit<User, 'password'>>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleCreateUser = InferHandler<
  typeof app,
  '/users',
  {
    body: Omit<User, 'id'>;
    response: {
      201: JSONSuccessResponse<User>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleDeleteUser = InferHandler<
  typeof app,
  '/users/:id',
  {
    params: { userId: number };
    response: {
      200: JSONSuccessResponse<{}>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;
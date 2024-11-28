import { InferHandler } from 'elysia';
import app from '..';
import { Challenge, JSONErrorResponse, JSONSuccessResponse } from './global.type';

export type HandleCreateChallenge = InferHandler<
  typeof app,
  '/challenges',
  {
    body: Omit<Challenge, 'id'>;
    response: {
      201: JSONSuccessResponse<Challenge>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleGetChallengeById = InferHandler<
  typeof app,
  '/challenges/:challengeId',
  {
    params: { challengeId: number };
    response: {
      200: JSONSuccessResponse<Challenge>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleGetChallenges = InferHandler<
  typeof app,
  '/challenges',
  {
    response: {
      200: JSONSuccessResponse<Challenge[]>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleUpdateChallenge = InferHandler<
  typeof app,
  '/challenges/:challengeId',
  {
    body: Partial<Omit<Challenge, 'id'>>;
    params: { challengeId: number };
    response: {
      200: JSONSuccessResponse<Challenge>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;



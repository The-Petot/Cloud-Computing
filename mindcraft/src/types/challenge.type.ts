import { InferHandler } from 'elysia';
import app from '..';
import {
  Challenge,
  JSONErrorResponse,
  JSONSuccessResponse,
  Participation,
  Question,
  QuestionWithAnswers,
} from './global.type';

export type HandleGetChallengeById = InferHandler<
  typeof app,
  '/challenges/:challengeId',
  {
    params: { challengeId: string };
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

export type HandleGetChallengeParticipants = InferHandler<
  typeof app,
  '/challenges/:challengeId/participants',
  {
    params: { challengeId: string };
    response: {
      200: JSONSuccessResponse<Participation[]>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleGetChallengeQuestions = InferHandler<
  typeof app,
  '/challenges/:challengeId/questions',
  {
    params: { challengeId: string };
    response: {
      200: JSONSuccessResponse<QuestionWithAnswers[]>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

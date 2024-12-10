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
      200: JSONSuccessResponse<Challenge & { authorFirstName: string; authorLastName: string }>;
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
    query: { limit?: string; offset?: string, search?: string };
    response: {
      200: JSONSuccessResponse<(Challenge & { authorFirstName: string; authorLastName: string })[]>;
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
    query: { limit?: string; offset?: string };
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
    query: { limit?: string; offset?: string };
    params: { challengeId: string };
    response: {
      200: JSONSuccessResponse<QuestionWithAnswers[]>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

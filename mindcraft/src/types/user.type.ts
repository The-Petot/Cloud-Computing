import { InferHandler } from 'elysia';
import app from '..';
import { Challenge, JSONErrorResponse, JSONSuccessResponse, Participation, User } from './global.type';

export type HandleGetUserById = InferHandler<
  typeof app,
  '/users/:userId',
  {
    params: { userId: string };
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
    query: { limit?: string; offset?: string };
    response: {
      200: JSONSuccessResponse<
        {
          id: number;
          firstName: string;
          lastName: string;
          email: string;
          profileImgUrl: string;
          totalScore: number;
          currentRank: number;
        }[]
      >;
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
    query: { limit?: string; offset?: string };
    params: { userId: string };
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
    query: { limit?: string; offset?: string };
    params: { userId: string };
    response: {
      200: JSONSuccessResponse<Participation[]>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleUpdateUser = InferHandler<
  typeof app,
  '/users/:userId',
  {
    body: { newUserData: Partial<User>; profileImage?: File };
    params: { userId: string };
    response: {
      200: JSONSuccessResponse<Partial<Omit<User, 'password'>>>;
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
  '/users/:userId',
  {
    params: { userId: string };
    response: {
      200: JSONSuccessResponse<{}>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleCreateUserChallenge = InferHandler<
  typeof app,
  '/users/:userId/challenges',
  {
    params: { userId: string };
    body: {
      title: string;
      description: string;
      material: string;
      timeSeconds: number;
      tags?: string[];
    };
    response: {
      200: JSONSuccessResponse<Challenge>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleCreateUserParticipation = InferHandler<
  typeof app,
  '/users/:userId/participations',
  {
    params: { userId: string };
    body: {
      challengeId: number;
      score: number;
    };
    response: {
      200: JSONSuccessResponse<Participation>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleDeleteUserChallenge = InferHandler<
  typeof app,
  '/users/:userId/challenges/:challengeId',
  {
    params: { userId: string; challengeId: string };
    response: {
      200: JSONSuccessResponse<{}>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

export type HandleUpdateUserChallenge = InferHandler<
  typeof app,
  '/users/:userId/challenges/:challengeId',
  {
    params: { userId: string; challengeId: string };
    body: Omit<
      Challenge,
      | 'id'
      | 'updatedAt'
      | 'createdAt'
      | 'summary'
      | 'authorId'
      | 'totalQuestions'
      | 'createdAt'
      | 'updatedAt'
    >;
    response: {
      200: JSONSuccessResponse<Challenge>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>;

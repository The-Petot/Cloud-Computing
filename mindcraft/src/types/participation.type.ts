import { InferHandler } from 'elysia';
import app from '..';
import {
  JSONErrorResponse,
  JSONSuccessResponse,
  Participation,
} from './global.type';


export type HandleGetParticipations = InferHandler<
  typeof app,
  '/participations',
  {
    query: { limit?: string; offset?: string };
    response: {
      200: JSONSuccessResponse<Participation[]>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>

export type HandleGetParticipationById = InferHandler<
  typeof app,
  '/participations/:participationId',
  {
    params: { participationId: string };
    response: {
      200: JSONSuccessResponse<Participation>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>
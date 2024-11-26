import { InferHandler } from 'elysia';
import app from '..';
import {
  JSONErrorResponse,
  JSONSuccessResponse,
  Participation,
} from './global.type';


export type GetParticipations = InferHandler<
  typeof app,
  '/participations',
  {
    response: {
      200: JSONSuccessResponse<Participation[]>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>

export type CreateParticipation = InferHandler<
  typeof app,
  '/participations',
  {
    body: Omit<Participation, 'id'>;
    response: {
      201: JSONSuccessResponse<Participation>;
      400: JSONErrorResponse;
      401: JSONErrorResponse;
      500: JSONErrorResponse;
    };
  }
>
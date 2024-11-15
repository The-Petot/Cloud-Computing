import { InferHandler } from 'elysia';
import app from '../index';

export type HandleUserRegister = InferHandler<
  typeof app,
  '/register',
  {
    body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };
    response: {
      200: string;
      400: { error: string }; // Bad request, e.g., validation errors
      409: { error: string }; // Conflict, e.g., email already exists
      500: { error: string }; // Internal server error
    };
  }
>;

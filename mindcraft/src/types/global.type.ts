import { JWTPayloadSpec } from '@elysiajs/jwt';
import redis from '../database/redis';
import { challengesTable, participantsTable, usersTable } from '../database/schema';

export type Jwt = {
  readonly sign: (
    morePayload: Record<string, string | number> & JWTPayloadSpec
  ) => Promise<string>;
  readonly verify: (
    jwt?: string
  ) => Promise<false | (Record<string, string | number> & JWTPayloadSpec)>;
};

export interface JSONErrorResponse {
  errors: {
    messages: string[];
    field?: string;
    header?: string;
  }[];
}

export interface JSONSuccessResponse<T> {
  data?: T;
  message: string;
  links: {
    self: string;
    [key: string]: string;
  };
}

export type ServiceMethodSuccessReturnType<T> = {
  data: T;
};

export type ServiceMethodReturnType<T> =
  | ServiceMethodSuccessReturnType<T>
  | {
      errors: {
        messages: string[];
        field?: string;
        header?: string;
      }[];
      statusCode: number;
    };

export type Redis = typeof redis;
export type User = typeof usersTable.$inferInsert;
export type Challenge = typeof challengesTable.$inferInsert;
export type Participation = typeof participantsTable.$inferInsert;
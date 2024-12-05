import { JWTPayloadSpec } from '@elysiajs/jwt';
import redis from '../database/redis';
import { usersTable } from '../database/schema';

export type Jwt = {
  readonly sign: (
    morePayload: Record<string, string | number> & JWTPayloadSpec
  ) => Promise<string>;
  readonly verify: (
    jwt?: string
  ) => Promise<false | (Record<string, string | number> & JWTPayloadSpec)>;
};

export type Redis = typeof redis;

export type User = typeof usersTable.$inferInsert;

export type UserSessionData = {
  email: string;
  firstName: string;
  lastName: string;
  profileImgUrl: string;

  currentRank: number;
  totalScore: number;

  twoFactorEnabled: boolean;
  notificationEnabled: boolean;
}


export type BaseError = {
  messages: string[];
  field?: string;
}[];

export interface ServiceMethodSuccessReturnType<T> {
  data: T;
}

export interface ServiceMethodErrorReturnType {
  errors: {
    messages: string[];
    field?: string;
  }[];
  statusCode: number;
}

export type ServiceMethodReturnType<T> =
  | ServiceMethodSuccessReturnType<T>
  | ServiceMethodErrorReturnType;
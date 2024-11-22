import { JWTPayloadSpec } from '@elysiajs/jwt';
import redis from './database/redis';
import { usersTable } from './database/schema';

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
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  totalScore: number;
  currentRank: number;
}
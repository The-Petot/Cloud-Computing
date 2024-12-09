import { getEnv } from './utils';
import * as jose from 'jose';
import { Redis, User } from './types/global.type';
import { v4 } from 'uuid';

export type Questions = {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: string;
  explanation: string;
}[];

export type GenerateQuestionsResult =
  | Questions
  | { error: string };

export function isGenerateQuestionsError(
  result: GenerateQuestionsResult
): result is { error: string } {
  return (result as { error: string }).error !== undefined;
}

export async function generateQuestions(
  material: string
): Promise<GenerateQuestionsResult> {
  try {
    const result = await fetch(
      `${getEnv('QUESTION_MODEL_URL')}/generate?RequestContext=${material}`
    );
    const data: Questions = await result.json();
    return data;
  } catch (error) {
    return {
      error: `Unable to generate questions: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
  }
}

export type CreateMaterialSummaryResult =
  | { error: string }
  | { summary: string; processing_time_seconds: number };
export function isCreateMaterialSummarySuccess(
  result: CreateMaterialSummaryResult
): result is { summary: string; processing_time_seconds: number } {
  return (
    (result as { summary: string; processing_time_seconds: number }).summary !==
    undefined
  );
}

export async function createMaterialSummary(
  material: string
): Promise<CreateMaterialSummaryResult> {
  try {
    const result = await fetch(`${getEnv('SUMMARY_MODEL_URL')}/summarize`, {
      method: 'POST',
      body: JSON.stringify({ text: material }),
    });
    const data: { summary: string; processing_time_seconds: number } =
      await result.json();

    return data;
  } catch (error) {
    return {
      error: `Unable to create material summary: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
  }
}

const jwtSecret = new TextEncoder().encode(getEnv('JWT_SECRET'));
export async function generateAccessToken<T extends Record<string, unknown>>(
  payload: T
): Promise<string> {
  const accessToken = await new jose.SignJWT(payload)
    .setProtectedHeader({
      alg: 'HS256',
    })
    .setExpirationTime('1h')
    .setIssuedAt()
    .setIssuer('Mindcraft')
    .setAudience('Mindcraft')
    .sign(jwtSecret);

  return accessToken;
}

export async function generateRefreshToken<T extends Record<string, unknown>>(
  payload: T
): Promise<string> {
  const accessToken = await new jose.SignJWT(payload)
    .setProtectedHeader({
      alg: 'HS256',
    })
    .setExpirationTime('7d')
    .setIssuedAt()
    .setIssuer('Mindcraft')
    .setAudience('Mindcraft')
    .sign(jwtSecret);

  return accessToken;
}

type VerifyJwtTokenSuccess = {
  payload: jose.JWTPayload;
  protectedHeader: jose.JWTHeaderParameters;
};

type VerifyJwtTokenError = {
  error: string;
};

type VerifyJwtTokenResult = VerifyJwtTokenSuccess | VerifyJwtTokenError;

export function isVerifyJwtTokenSuccess(
  result: VerifyJwtTokenResult
): result is VerifyJwtTokenSuccess {
  return (result as VerifyJwtTokenSuccess).payload !== undefined;
}

export async function verifyJwtToken(
  token: string
): Promise<VerifyJwtTokenResult> {
  try {
    const result = await jose.jwtVerify(token, jwtSecret);
    return result;
  } catch (error) {
    return {
      error: `Unable to verify access token: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
  }
}

export function createSessionId(userId: number): string {
  const sessionId = `${String(userId)}:${v4()}`;
  return sessionId;
}

export async function setSessionId<T>(
  redis: Redis,
  sessionId: string,
  data: T
): Promise<boolean> {
  try {
    await redis.set(sessionId, JSON.stringify(data));
    return true;
  } catch (error) {
    return false;
  }
}

export async function setRefreshTokenOnRedis(
  redis: Redis,
  refreshToken: string,
  userId: number
): Promise<boolean> {
  try {
    await redis.set(`refresh-token:${userId}`, refreshToken);
    return true;
  } catch (error) {
    return false;
  }
}

type GetSessionDataSuccess = Omit<User, 'password'>;
type GetSessionDataFailed = {
  error: string;
  statusCode: number;
};
type GetSessionDataResult = GetSessionDataSuccess | GetSessionDataFailed;

export function isGetSessionDataSuccess(
  result: GetSessionDataResult
): result is GetSessionDataSuccess {
  return (result as GetSessionDataSuccess).email !== undefined;
}

export async function getSessionData(
  redis: Redis,
  sessionId: string
): Promise<GetSessionDataResult> {
  try {
    const data = await redis.get(sessionId);
    if (!data) {
      return { error: 'Session not found', statusCode: 401 };
    }
    return JSON.parse(data);
  } catch (error) {
    return {
      error: `Unable to get session data: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      statusCode: 500,
    };
  }
}

export function handleDBError(error: unknown, message: string) {
  return {
    statusCode: 500,
    errors: [
      {
        messages: [
          `${message}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        ],
      },
    ],
  };
}

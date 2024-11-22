import { User, UserSessionData } from '../global.types';
import userService from '../services/auth.service';
import {
  isEmailValid,
  isServiceMethodSuccess,
  isPasswordValid,
  hashPassword,
  isPasswordMatch,
  createSessionId,
  generateRefreshToken,
  generateAccessToken,
} from '../utils';
import {
  HandleTokenRefresh,
  HandleUserLogin,
  HandleUserRegister,
  HandleUserLogout,
} from './controller.type';

export const handleUserRegister: HandleUserRegister = async ({
  body,
  set,
  jwt,
  redis,
}) => {
  let { email, password, lastName, firstName } = body;
  set.headers['content-type'] = 'application/json';
  if (!email || !password || !lastName || !firstName) {
    set.status = 400;
    return {
      error: 'Missing required fields',
    };
  }

  email = email.trim();
  password = password.trim();
  lastName = lastName.trim();
  firstName = firstName.trim();

  if (!isPasswordValid(password)) {
    set.status = 400;
    return {
      error: 'Password must be at least 8 characters long',
    };
  }

  if (!isEmailValid(email)) {
    set.status = 400;
    return {
      error: 'Invalid email format',
    };
  }

  const getTotalUsers = await userService.getTotalusers();
  if (!isServiceMethodSuccess<{ totalUser: number }>(getTotalUsers)) {
    set.status = getTotalUsers.statusCode;
    return {
      error: getTotalUsers.error,
    };
  }

  const newUserData: User = {
    password: await hashPassword(password.trim()),
    email,
    firstName,
    lastName,
    totalScore: 0,
    currentRank: getTotalUsers.data.totalUser + 1,
  };

  const result = await userService.create(newUserData);
  if (!isServiceMethodSuccess<{ userId: number }>(result)) {
    set.status = result.statusCode;
    return {
      error: result.error,
    };
  }

  const accessToken = await jwt.sign({
    userId: result.data.userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  });
  const refreshToken = await jwt.sign({
    userId: result.data.userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  });
  const sessionId = await createSessionId(result.data.userId);

  redis.set(`refresh-token:${sessionId}`, refreshToken);
  redis.hSet(sessionId, {
    firstName: newUserData.firstName,
    lastName: newUserData.lastName,
    email: newUserData.email,
    totalScore: String(newUserData.totalScore),
    currentRank: String(newUserData.currentRank),
  });

  set.status = 201;
  set.headers['authorization'] = `Bearer ${accessToken}`;
  set.headers['X-Refresh-Token'] = refreshToken;
  set.headers['X-Session-Id'] = sessionId;

  return {
    data: { userId: result.data.userId },
    message: 'User registered successfully',
  };
};

export const handleUserLogin: HandleUserLogin = async ({
  jwt,
  body,
  set,
  redis,
}) => {
  let { email, password } = body;
  set.headers['content-type'] = 'application/json';

  if (!email || !password) {
    set.status = 400;
    return {
      error: 'Missing required fields',
    };
  }

  email = email.trim();
  password = password.trim();

  if (!isPasswordValid(password)) {
    set.status = 400;
    return {
      error: 'Password must be at least 8 characters long',
    };
  }

  if (!isEmailValid(email)) {
    set.status = 400;
    return {
      error: 'Invalid email format',
    };
  }

  const user = await userService.getUserByEmail(email);
  if (!isServiceMethodSuccess<UserSessionData>(user)) {
    set.status = user.statusCode;
    return {
      error: user.error,
    };
  }

  if (!(await isPasswordMatch(password, user.data.password))) {
    set.status = 401;
    return {
      error: 'Wrong password',
    };
  }

  const accessToken = await generateAccessToken(jwt, user.data.id);
  const refreshToken = await generateRefreshToken(jwt, user.data.id);
  const sessionId = await createSessionId(user.data.id);

  redis.set(`refresh-token:${sessionId}`, refreshToken);
  redis.hSet(sessionId, {
    firstName: user.data.firstName,
    lastName: user.data.lastName,
    email: user.data.email,
    totalScore: String(user.data.totalScore),
    currentRank: String(user.data.currentRank),
  });

  set.status = 200;
  set.headers['authorization'] = `Bearer ${accessToken}`;
  set.headers['X-Refresh-Token'] = refreshToken;
  set.headers['X-Session-Id'] = sessionId;

  return {
    data: { userId: user.data.id },
    message: 'User logged in successfully',
  };
};

export const handleTokenRefresh: HandleTokenRefresh = async ({
  set,
  jwt,
  redis,
  body,
  request,
}) => {
  const refreshToken = request.headers.get('X-Refresh-Token');
  const sessionId = request.headers.get('X-Session-Id');
  const { userId } = body;
  set.headers['content-type'] = 'application/json';

  if (!userId) {
    set.status = 400;
    return {
      error: 'Missing user id',
    };
  }

  if (!sessionId) {
    set.status = 400;
    return {
      error: 'Missing session id',
    };
  }

  if (!refreshToken) {
    set.status = 400;
    return {
      error: 'Missing refresh token',
    };
  }

  const user = await userService.getUserById(userId);
  if (
    !isServiceMethodSuccess<{
      id: number;
      password: string;
      email: string;
      firstName: string;
      lastName: string;
      totalScore: number;
      currentRank: number;
    }>(user)
  ) {
    set.status = user.statusCode;
    return {
      error: user.error,
    };
  }

  const decoded = await jwt.verify(refreshToken);
  if (!decoded) {
    set.status = 401;
    return {
      error: 'Invalid refresh token',
    };
  }

  const storedRefreshToken = await redis.get(`refresh-token:${sessionId}`);
  if (storedRefreshToken !== refreshToken) {
    set.status = 401;
    return {
      error: 'Invalid refresh token',
    };
  }

  const accessToken = await generateAccessToken(jwt, userId);
  const newRefreshToken = await generateRefreshToken(jwt, userId);
  const newSessionId = await createSessionId(userId);

  await redis.del(`refresh-token:${sessionId}`);
  await redis.set(`refresh-token:${newSessionId}`, newRefreshToken);

  set.status = 200;
  set.headers['authorization'] = `Bearer ${accessToken}`;
  set.headers['X-Refresh-Token'] = newRefreshToken;

  return {
    message: 'Token refreshed successfully',
  };
};

export const handleUserLogout: HandleUserLogout = async ({
  body,
  set,
  request,
  jwt,
  redis,
}) => {
  const sessionId = request.headers.get('X-Session-Id');
  const refreshToken = request.headers.get('X-Refresh-Token');
  const accessToken = request.headers.get('Authorization')?.split(' ')[1] ?? '';
  console.log({ sessionId, refreshToken, accessToken });
  const { userId } = body;
  set.headers['content-type'] = 'application/json';

  if (!sessionId) {
    set.status = 400;
    return {
      error: 'Missing session id',
    };
  }

  if (!refreshToken) {
    set.status = 400;
    return {
      error: 'Missing refresh token',
    };
  }

  if (!accessToken) {
    set.status = 400;
    return {
      error: 'Missing access token',
    };
  }

  if (!userId) {
    set.status = 400;
    return {
      error: 'Missing user id',
    };
  }

  const user = await userService.getUserById(userId);
  if (
    !isServiceMethodSuccess<{
      id: number;
      password: string;
      email: string;
      firstName: string;
      lastName: string;
      totalScore: number;
      currentRank: number;
    }>(user)
  ) {
    set.status = user.statusCode;
    return {
      error: user.error,
    };
  }

  const decodedAccessToken = await jwt.verify(accessToken);
  if (!decodedAccessToken) {
    set.status = 401;
    return {
      error: 'Invalid access token',
    };
  }

  const decodedRefreshToken = await jwt.verify(refreshToken);
  if (!decodedRefreshToken) {
    set.status = 401;
    return {
      error: 'Invalid refresh token',
    };
  }

  const storedRefreshToken = await redis.get(`refresh-token:${sessionId}`);
  if (storedRefreshToken !== refreshToken) {
    set.status = 401;
    return {
      error: 'Invalid refresh token',
    };
  }

  await redis.del(`refresh-token:${sessionId}`);
  await redis.del(sessionId);
  
  set.status = 200;
  return {
    message: 'User logged out successfully',
  };
};

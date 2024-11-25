import { User } from '../global.types';
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
  verifyTwoFactorToken,
  generateQRCode,
  generateTwoFactorSecret,
  isGenerateQRCodeSuccess,
  setRefreshTokenOnRedis,
  setSessionId,
  getSessionData,
  isGetSessionDataSuccess,
} from '../utils';
import {
  HandleTokenRefresh,
  HandleUserLogin,
  HandleUserRegister,
  HandleUserLogout,
  HandleEnableTwoFactorAuth,
  HandleDisableTwoFactorAuth,
} from './controller.type';

export const handleUserRegister: HandleUserRegister = async ({ body, set }) => {
  if (!body) {
    set.status = 400;
    return {
      error: 'Request body is missing.',
    };
  }

  let { email, password, lastName, firstName } = body;
  set.headers['content-type'] = 'application/json';
  if (!email) {
    set.status = 400;
    return {
      error: 'Email is missing.',
    };
  }

  if (!password) {
    set.status = 400;
    return {
      error: 'Password is missing.',
    };
  }

  if (!lastName) {
    set.status = 400;
    return {
      error: 'Last name is missing.',
    };
  }

  if (!firstName) {
    set.status = 400;
    return {
      error: 'First name is missing.',
    };
  }

  email = email.trim();
  password = password.trim();
  lastName = lastName.trim();
  firstName = firstName.trim();

  if (!isPasswordValid(password)) {
    set.status = 400;
    return {
      error: 'Password must be at least 8 characters long.',
    };
  }

  if (!isEmailValid(email)) {
    set.status = 400;
    return {
      error: 'Email format is invalid.',
    };
  }

  const getTotalUsers = await userService.getTotalusers();
  if (!isServiceMethodSuccess<{ totalUser: number }>(getTotalUsers)) {
    set.status = getTotalUsers.statusCode;
    return {
      error: `Failed to retrieve total users: ${getTotalUsers.error}`,
    };
  }

  const newUserData: User = {
    email,
    firstName,
    lastName,
    password: await hashPassword(password.trim()),
    totalScore: 0,
    currentRank: getTotalUsers.data.totalUser + 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    notificationEnabled: false,
    twoFactorEnabled: false,
    profileImgUrl: `https://avatar.iran.liara.run/username?username=${firstName}+${lastName}`,
  };

  const result = await userService.create(newUserData);
  if (!isServiceMethodSuccess<User>(result)) {
    set.status = result.statusCode;
    return {
      error: `User creation failed: ${result.error}`,
    };
  }

  set.status = 201;
  return {
    data: { userId: result.data.id! },
    message: 'User registered successfully.',
  };
};

export const handleUserLogin: HandleUserLogin = async ({
  jwt,
  body,
  set,
  redis,
}) => {
  if (!body) {
    set.status = 400;
    return {
      error: 'Request body is missing.',
    };
  }

  let { email, password, token } = body;
  set.headers['content-type'] = 'application/json';

  if (!email || !password) {
    set.status = 400;
    return {
      error: 'Required fields: email and password are missing.',
    };
  }

  email = email.trim();
  password = password.trim();

  if (!isPasswordValid(password)) {
    set.status = 400;
    return {
      error: 'Password must be at least 8 characters long.',
    };
  }

  if (!isEmailValid(email)) {
    set.status = 400;
    return {
      error: 'Email format is invalid.',
    };
  }

  const user = await userService.getUserByEmail(email);
  if (!isServiceMethodSuccess<User>(user)) {
    set.status = user.statusCode;
    return {
      error: `User retrieval failed: ${user.error}`,
    };
  }

  if (user.data.twoFactorEnabled && !token) {
    set.status = 400;
    return {
      error: 'Two-factor authentication token is missing.',
    };
  }

  if (!(await isPasswordMatch(password, user.data.password))) {
    set.status = 401;
    return {
      error: 'Incorrect password.',
    };
  }

  if (
    user.data.twoFactorEnabled &&
    !(await verifyTwoFactorToken(user.data.twoFactorSecret!, token!))
  ) {
    set.status = 401;
    return {
      error: 'Invalid two-factor authentication token.',
    };
  }

  const sessionId = createSessionId(user.data.id!);
  const accessToken = await generateAccessToken(jwt, sessionId);
  const refreshToken = await generateRefreshToken(jwt, sessionId);

  const isSetRefreshTokenOnRedisSuccess = await setRefreshTokenOnRedis(
    redis,
    refreshToken,
    user.data.id!
  );
  if (!isSetRefreshTokenOnRedisSuccess) {
    set.status = 500;
    return {
      error: 'Failed to store refresh token in Redis.',
    };
  }

  const isSetSessionIdOnRedisSuccess = await setSessionId<User>(
    redis,
    sessionId,
    user.data
  );
  if (!isSetSessionIdOnRedisSuccess) {
    set.status = 500;
    return {
      error: 'Failed to store session ID in Redis.',
    };
  }

  set.status = 200;
  set.headers['authorization'] = `Bearer ${accessToken}`;
  set.headers['X-Refresh-Token'] = refreshToken;
  set.headers['X-Session-Id'] = sessionId;

  return {
    data: { userId: user.data.id! },
    message: 'User logged in successfully.',
  };
};

export const handleTokenRefresh: HandleTokenRefresh = async ({
  set,
  jwt,
  redis,
  body,
  refreshToken,
  sessionId,
}) => {
  if (!body) {
    set.status = 400;
    return {
      error: 'Request body is missing.',
    };
  }

  const { userId } = body;
  set.headers['content-type'] = 'application/json';

  if (!userId) {
    set.status = 400;
    return {
      error: 'User ID is missing.',
    };
  }

  if (!sessionId) {
    set.status = 400;
    return {
      error: 'Session ID is missing.',
    };
  }

  if (!refreshToken) {
    set.status = 400;
    return {
      error: 'Refresh token is missing.',
    };
  }

  const user = await userService.getUserById(userId);
  if (!isServiceMethodSuccess<User>(user)) {
    set.status = user.statusCode;
    return {
      error: `User retrieval failed: ${user.error}`,
    };
  }

  const decoded = await jwt.verify(refreshToken);
  if (!decoded) {
    set.status = 401;
    return {
      error: 'Invalid refresh token.',
    };
  }

  const storedRefreshToken = await redis.get(`refresh-token:${userId}`);
  if (storedRefreshToken !== refreshToken) {
    set.status = 401;
    return {
      error: 'Refresh token mismatch.',
    };
  }

  const userSessionData = await getSessionData(redis, sessionId);
  if (!isGetSessionDataSuccess(userSessionData)) {
    set.status = userSessionData.statusCode;
    return {
      error: `Session data retrieval failed: ${userSessionData.error}`,
    };
  }

  const newSessionId = createSessionId(userId);
  const accessToken = await generateAccessToken(jwt, newSessionId);
  const newRefreshToken = await generateRefreshToken(jwt, newSessionId);

  await redis.del(`refresh-token:${userId}`);
  await redis.del(sessionId);

  const isSetRefreshTokenOnRedisSuccess = await setRefreshTokenOnRedis(
    redis,
    newRefreshToken,
    user.data.id!
  );
  if (!isSetRefreshTokenOnRedisSuccess) {
    set.status = 500;
    return {
      error: 'Failed to store new refresh token in Redis.',
    };
  }

  const isSetSessionIdOnRedisSuccess = await setSessionId<User>(
    redis,
    newSessionId,
    user.data
  );
  if (!isSetSessionIdOnRedisSuccess) {
    set.status = 500;
    return {
      error: 'Failed to store new session ID in Redis.',
    };
  }

  set.status = 200;
  set.headers['authorization'] = `Bearer ${accessToken}`;
  set.headers['X-Refresh-Token'] = newRefreshToken;
  set.headers['X-Session-Id'] = newSessionId;

  return {
    message: 'Token refreshed successfully.',
  };
};

export const handleUserLogout: HandleUserLogout = async ({
  body,
  set,
  jwt,
  redis,
  accessToken,
  refreshToken,
  sessionId,
}) => {
  if (!body) {
    set.status = 400;
    return {
      error: 'Request body is missing.',
    };
  }

  const { userId } = body;
  set.headers['content-type'] = 'application/json';

  if (!sessionId) {
    set.status = 400;
    return {
      error: 'Session ID is missing.',
    };
  }

  if (!refreshToken) {
    set.status = 400;
    return {
      error: 'Refresh token is missing.',
    };
  }

  if (!accessToken) {
    set.status = 400;
    return {
      error: 'Access token is missing.',
    };
  }

  if (!userId) {
    set.status = 400;
    return {
      error: 'User ID is missing.',
    };
  }

  const user = await userService.getUserById(userId);
  if (!isServiceMethodSuccess<User>(user)) {
    set.status = user.statusCode;
    return {
      error: `User retrieval failed: ${user.error}`,
    };
  }

  const decodedAccessToken = await jwt.verify(accessToken);
  if (!decodedAccessToken) {
    set.status = 401;
    return {
      error: 'Invalid access token.',
    };
  }

  const decodedRefreshToken = await jwt.verify(refreshToken);
  if (!decodedRefreshToken) {
    set.status = 401;
    return {
      error: 'Invalid refresh token.',
    };
  }

  const storedRefreshToken = await redis.get(`refresh-token:${userId}`);
  if (storedRefreshToken !== refreshToken) {
    set.status = 401;
    return {
      error: 'Refresh token mismatch.',
    };
  }

  const userSessionData = await getSessionData(redis, sessionId);
  if (!isGetSessionDataSuccess(userSessionData)) {
    set.status = userSessionData.statusCode;
    return {
      error: `Session data retrieval failed: ${userSessionData.error}`,
    };
  }

  await redis.del(`refresh-token:${userId}`);
  await redis.del(sessionId);

  set.status = 200;
  return {
    message: 'User logged out successfully.',
  };
};

export const handleEnableTwoFactorAuth: HandleEnableTwoFactorAuth = async ({
  body,
  set,
  jwt,
  redis,
  accessToken,
  refreshToken,
  sessionId,
}) => {
  if (!body) {
    set.status = 400;
    return {
      error: 'Request body is missing.',
    };
  }

  const { userId } = body;
  set.headers['content-type'] = 'application/json';

  if (!userId) {
    set.status = 400;
    return {
      error: 'User ID is missing.',
    };
  }

  if (!sessionId) {
    set.status = 400;
    return {
      error: 'Session ID is missing.',
    };
  }

  if (!refreshToken) {
    set.status = 400;
    return {
      error: 'Refresh token is missing.',
    };
  }

  if (!accessToken) {
    set.status = 400;
    return {
      error: 'Access token is missing.',
    };
  }

  const user = await userService.getUserById(userId);
  if (!isServiceMethodSuccess<User>(user)) {
    set.status = user.statusCode;
    return {
      error: `User retrieval failed: ${user.error}`,
    };
  }

  const decodedAccessToken = await jwt.verify(accessToken);
  if (!decodedAccessToken) {
    set.status = 401;
    return {
      error: 'Invalid access token.',
    };
  }

  const decodedRefreshToken = await jwt.verify(refreshToken);
  if (!decodedRefreshToken) {
    set.status = 401;
    return {
      error: 'Invalid refresh token.',
    };
  }

  const storedRefreshToken = await redis.get(`refresh-token:${userId}`);
  if (storedRefreshToken !== refreshToken) {
    set.status = 401;
    return {
      error: 'Refresh token mismatch.',
    };
  }

  const isUserSessionDataExists = await getSessionData(redis, sessionId);
  if (!isGetSessionDataSuccess(isUserSessionDataExists)) {
    set.status = isUserSessionDataExists.statusCode;
    return {
      error: `Session data retrieval failed: ${isUserSessionDataExists.error}`,
    };
  }

  const secret = generateTwoFactorSecret();
  const qrCode = await generateQRCode(secret.otpauth_url!);
  if (!isGenerateQRCodeSuccess(qrCode)) {
    set.status = 500;
    return {
      error: `Failed to generate QR code: ${qrCode.error}`,
    };
  }

  const userEnabledTwoFactor = await userService.enableTwoFactorAuth(
    userId,
    secret.base32
  );
  if (!isServiceMethodSuccess<{ userId: number }>(userEnabledTwoFactor)) {
    set.status = userEnabledTwoFactor.statusCode;
    return {
      error: `Failed to enable two-factor authentication: ${userEnabledTwoFactor.error}`,
    };
  }

  set.status = 200;
  return {
    message: 'Two-factor authentication enabled successfully.',
    data: {
      qrCode: qrCode.qrCode,
    },
  };
};

export const handleDisableTwoFactorAuth: HandleDisableTwoFactorAuth = async ({
  body,
  set,
  jwt,
  redis,
  accessToken,
  refreshToken,
  sessionId,
}) => {
  if (!body) {
    set.status = 400;
    return {
      error: 'Request body is missing.',
    };
  }

  const { userId } = body;
  set.headers['content-type'] = 'application/json';

  if (!userId) {
    set.status = 400;
    return {
      error: 'User ID is missing.',
    };
  }

  if (!sessionId) {
    set.status = 400;
    return {
      error: 'Session ID is missing.',
    };
  }

  if (!refreshToken) {
    set.status = 400;
    return {
      error: 'Refresh token is missing.',
    };
  }

  if (!accessToken) {
    set.status = 400;
    return {
      error: 'Access token is missing.',
    };
  }

  const user = await userService.getUserById(userId);
  if (!isServiceMethodSuccess<User>(user)) {
    set.status = user.statusCode;
    return {
      error: `User retrieval failed: ${user.error}`,
    };
  }

  if (user.data.twoFactorEnabled === false) {
    set.status = 400;
    return {
      error: 'Two-factor authentication is not enabled.',
    };
  }

  const decodedAccessToken = await jwt.verify(accessToken);
  if (!decodedAccessToken) {
    set.status = 401;
    return {
      error: 'Invalid access token.',
    };
  }

  const decodedRefreshToken = await jwt.verify(refreshToken);
  if (!decodedRefreshToken) {
    set.status = 401;
    return {
      error: 'Invalid refresh token.',
    };
  }

  const storedRefreshToken = await redis.get(`refresh-token:${userId}`);
  if (storedRefreshToken !== refreshToken) {
    set.status = 401;
    return {
      error: 'Refresh token mismatch.',
    };
  }

  const isUserSessionDataExists = await getSessionData(redis, sessionId);
  if (!isGetSessionDataSuccess(isUserSessionDataExists)) {
    set.status = isUserSessionDataExists.statusCode;
    return {
      error: `Session data retrieval failed: ${isUserSessionDataExists.error}`,
    };
  }

  const userDisabledTwoFactor = await userService.disableTwoFactorAuth(userId);
  if (!isServiceMethodSuccess<{ userId: number }>(userDisabledTwoFactor)) {
    set.status = userDisabledTwoFactor.statusCode;
    return {
      error: `Failed to disable two-factor authentication: ${userDisabledTwoFactor.error}`,
    };
  }

  set.status = 200;
  return {
    message: 'Two-factor authentication disabled successfully.',
  };
};

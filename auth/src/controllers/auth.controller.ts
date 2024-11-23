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
} from '../utils';
import {
  HandleTokenRefresh,
  HandleUserLogin,
  HandleUserRegister,
  HandleUserLogout,
  HandleEnableTwoFactorAuth,
  HandleDisableTwoFactorAuth
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
    notificationEnabled: String(newUserData.notificationEnabled),
    profileImgUrl: newUserData.profileImgUrl!,
    twoFactorEnabled: String(newUserData.twoFactorEnabled),
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
  let { email, password, token } = body;
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
  if (!isServiceMethodSuccess<User>(user)) {
    set.status = user.statusCode;
    return {
      error: user.error,
    };
  }

  if (user.data.twoFactorEnabled && !token) {
    set.status = 400;
    return {
      error: 'Missing two factor token',
    };
  }

  if (!(await isPasswordMatch(password, user.data.password))) {
    set.status = 401;
    return {
      error: 'Wrong password',
    };
  }

  if (user.data.twoFactorEnabled && !verifyTwoFactorToken(user.data.twoFactorSecret!, token!)) {
    set.status = 401;
    return {
      error: 'Invalid two factor token',
    };
  }

  const accessToken = await generateAccessToken(jwt, user.data.id!);
  const refreshToken = await generateRefreshToken(jwt, user.data.id!);
  const sessionId = await createSessionId(user.data.id!);

  redis.set(`refresh-token:${sessionId}`, refreshToken);
  redis.hSet(sessionId, {
    firstName: user.data.firstName,
    lastName: user.data.lastName,
    email: user.data.email,
    totalScore: String(user.data.totalScore),
    currentRank: String(user.data.currentRank),
    notificationEnabled: String(user.data.notificationEnabled),
    profileImgUrl: user.data.profileImgUrl!,
    twoFactorEnabled: String(user.data.twoFactorEnabled),
  });

  set.status = 200;
  set.headers['authorization'] = `Bearer ${accessToken}`;
  set.headers['X-Refresh-Token'] = refreshToken;
  set.headers['X-Session-Id'] = sessionId;

  return {
    data: { userId: user.data.id! },
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
  if (!isServiceMethodSuccess<User>(user)) {
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
  set.headers['X-Session-Id'] = newSessionId;

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
  if (!isServiceMethodSuccess<User>(user)) {
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

export const handleEnableTwoFactorAuth: HandleEnableTwoFactorAuth = async ({ body, set, request, jwt, redis }) => {
  const sessionId = request.headers.get('X-Session-Id');
  const refreshToken = request.headers.get('X-Refresh-Token');
  const accessToken = request.headers.get('Authorization')?.split(' ')[1] ?? '';
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

  if (!accessToken) {
    set.status = 400;
    return {
      error: 'Missing access token',
    };
  }

  const user = await userService.getUserById(userId);
  if (!isServiceMethodSuccess<User>(user)) {
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

  const secret = generateTwoFactorSecret()
  const qrCode = await generateQRCode(secret.otpauth_url!);
  if (!isGenerateQRCodeSuccess(qrCode)) {
    set.status = 500;
    return {
      error: qrCode.error,
    };
  }

  const userEnabledTwoFactor = await userService.enableTwoFactorAuth(userId, secret.base32);
  if (!isServiceMethodSuccess<{ userId: number }>(userEnabledTwoFactor)) {
    set.status = userEnabledTwoFactor.statusCode;
    return {
      error: userEnabledTwoFactor.error,
    };
  }

  set.status = 200;
  return {
    message: 'Two factor auth enabled successfully',
    data: {
      qrCode: qrCode.qrCode,
    }
  };
}

export const handleDisableTwoFactorAuth: HandleDisableTwoFactorAuth = async ({ body, set, request, jwt, redis }) => {
  const sessionId = request.headers.get('X-Session-Id');
  const refreshToken = request.headers.get('X-Refresh-Token');
  const accessToken = request.headers.get('Authorization')?.split(' ')[1] ?? '';
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

  if (!accessToken) {
    set.status = 400;
    return {
      error: 'Missing access token',
    };
  }

  const user = await userService.getUserById(userId);
  if (!isServiceMethodSuccess<User>(user)) {
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

  const userDisabledTwoFactor = await userService.disableTwoFactorAuth(userId);
  if (!isServiceMethodSuccess<{ userId: number }>(userDisabledTwoFactor)) {
    set.status = userDisabledTwoFactor.statusCode;
    return {
      error: userDisabledTwoFactor.error,
    };
  }

  set.status = 200;
  return {
    message: 'Two factor auth disabled successfully',
  };
}
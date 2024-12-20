import { BaseError, User } from '../types/global.types';
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
  setFieldError,
  setError,
  verifyJwtToken,
  isVerifyJwtTokenSuccess,
  getGoogleUser,
  isFetchGoogleUserSuccess,
} from '../libs/index';
import {
  HandleTokenRefresh,
  HandleUserLogin,
  HandleUserRegister,
  HandleUserLogout,
  HandleGoogleOAuth,
  HandleToggleTwoFactor,
  HandleGetTwoFactorQR,
} from '../types/controller.types';

export const handleUserRegister: HandleUserRegister = async ({ set, body }) => {
  set.headers['content-type'] = 'application/json';
  set.headers['accept'] = 'application/json';

  if (!body) return setError(set, 400, null, ['Request body is missing.']);

  const { email, password, firstName, lastName } = body;
  const errors: BaseError = [];
  const validations = [
    {
      field: 'email',
      value: email !== undefined && email.trim() !== undefined,
      errorMessage: 'Email is missing.',
    },
    {
      field: 'password',
      value: password !== undefined && password?.trim() !== undefined,
      errorMessage: 'Password is missing.',
    },
    {
      field: 'firstName',
      value: firstName !== undefined && firstName.trim() !== undefined,
      errorMessage: 'First name is missing.',
    },
    {
      field: 'lastName',
      value: lastName !== undefined && lastName.trim() !== undefined,
      errorMessage: 'Last name is missing.',
    },
  ];

  for (const { field, value, errorMessage } of validations) {
    if (!value) errors.push({ messages: [errorMessage], field });
  }

  if (errors.length > 0) return setError(set, 400, errors, null);

  const trimmedEmail = email.trim();
  const trimmedPassword = password!.trim();
  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();

  if (!isEmailValid(trimmedEmail))
    return setFieldError(set, 400, 'email', ['Email format is invalid.']);

  if (!isPasswordValid(trimmedPassword))
    return setFieldError(set, 400, 'password', [
      'Password must be at least 8 characters long.',
    ]);

  const hashedPassword = await hashPassword(trimmedPassword);
  if (!hashedPassword)
    return setError(set, 500, null, ['Failed to hash password.']);

  const totalUserResult = await userService.getTotalUsers();
  if (!isServiceMethodSuccess<{ totalUser: number }>(totalUserResult)) {
    return setError(
      set,
      totalUserResult.statusCode,
      totalUserResult.errors,
      null
    );
  }

  const user: User = {
    email: trimmedEmail,
    password: hashedPassword,
    firstName: trimmedFirstName,
    lastName: trimmedLastName,
    totalScore: 0,
    currentRank: totalUserResult.data.totalUser + 1,
    notificationEnabled: false,
    twoFactorEnabled: false,
    profileImgUrl: `https://avatar.iran.liara.run/username?username=${firstName[0]}+${lastName[0]}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createUserResult = await userService.create(user);
  if (!isServiceMethodSuccess<User>(createUserResult)) {
    return setError(
      set,
      createUserResult.statusCode,
      createUserResult.errors,
      null
    );
  }

  set.status = 201;
  return {
    success: true,
    data: { userId: createUserResult.data.id },
    message: 'User created successfully.',
    links: {
      self: `/users/${createUserResult.data.id}`,
      login: '/auth/login',
      logout: '/auth/logout',
      tokenRefresh: '/auth/refresh',
      toggleTwoFactorAuth: '/auth/two-factor',
    },
  };
};

export const handleUserLogin: HandleUserLogin = async ({
  body,
  set,
  redis,
}) => {
  set.headers['content-type'] = 'application/json';
  set.headers['accept'] = 'application/json';

  if (!body) return setError(set, 400, null, ['Request body is missing.']);

  const { email, password, token } = body;
  const erros: BaseError = [];

  const validations = [
    {
      field: 'email',
      value: email !== undefined && email.trim() !== undefined,
      errorMessage: 'Email is missing.',
    },
    {
      field: 'password',
      value: password !== undefined && password.trim() !== undefined,
      errorMessage: 'Password is missing.',
    },
  ];

  for (const { field, value, errorMessage } of validations) {
    if (!value) erros.push({ messages: [errorMessage], field });
  }

  if (erros.length > 0) return setError(set, 400, erros, null);

  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!isEmailValid(trimmedEmail))
    return setFieldError(set, 400, 'email', ['Email format is invalid.']);

  if (!isPasswordValid(trimmedPassword))
    return setFieldError(set, 400, 'password', [
      'Password must be at least 8 characters long.',
    ]);

  const userResult = await userService.getUserByEmail(trimmedEmail);
  if (!isServiceMethodSuccess<User>(userResult)) {
    return setError(set, userResult.statusCode, userResult.errors, null);
  }

  const user = userResult.data;

  if (user.twoFactorEnabled && !token)
    return setFieldError(set, 400, 'token', [
      'Two-factor authentication token is missing.',
    ]);

  if (!(await isPasswordMatch(trimmedPassword, user.password!)))
    return setFieldError(set, 401, 'password', ['Incorrect password.']);

  if (
    user.twoFactorEnabled &&
    !(await verifyTwoFactorToken(user.twoFactorSecret!, token!))
  )
    return setFieldError(set, 401, 'token', [
      'Invalid two-factor authentication token.',
    ]);

  const sessionId = createSessionId(user.id!);
  const accessToken = await generateAccessToken({ sessionId, userId: user.id });
  const refreshToken = await generateRefreshToken({
    sessionId,
    userId: user.id,
  });

  const isSetRefreshTokenOnRedisSuccess = await setRefreshTokenOnRedis(
    redis,
    refreshToken,
    user.id!
  );
  if (!isSetRefreshTokenOnRedisSuccess) {
    return setError(set, 500, null, [
      'Failed to store refresh token in Redis.',
    ]);
  }

  const isSetSessionIdOnRedisSuccess = await setSessionId<User>(
    redis,
    sessionId,
    user
  );
  if (!isSetSessionIdOnRedisSuccess) {
    return setError(set, 500, null, ['Failed to store session ID in Redis.']);
  }

  set.status = 200;
  set.headers['authorization'] = `Bearer ${accessToken}`;
  set.headers['X-Refresh-Token'] = refreshToken;
  set.headers['X-Session-Id'] = sessionId;

  const { password: pass, ...userData } = user;

  return {
    success: true,
    data: userData,
    message: 'User logged in successfully.',
    links: {
      self: `/users/${user.id}`,
      logout: '/auth/logout',
      tokenRefresh: '/auth/refresh',
      toggleTwoFactorAuth: '/auth/two-factor',
    },
  };
};

export const handleTokenRefresh: HandleTokenRefresh = async ({
  body,
  set,
  redis,
  refreshToken,
  sessionId,
}) => {
  set.headers['content-type'] = 'application/json';
  set.headers['accept'] = 'application/json';

  if (!body) return setError(set, 400, null, ['Request body is missing.']);

  const { userId } = body;
  const errors: BaseError = [];
  const validations = [
    {
      field: 'userId',
      value: userId !== undefined,
      errorMessage: 'User ID is missing.',
    },
    {
      field: 'sessionId',
      value: sessionId !== undefined,
      errorMessage: 'Session ID is missing.',
    },
    {
      field: 'refreshToken',
      value: refreshToken !== undefined,
      errorMessage: 'Refresh token is missing.',
    },
  ];

  for (const { field, value, errorMessage } of validations) {
    if (!value) errors.push({ messages: [errorMessage], field });
  }

  if (errors.length > 0) return setError(set, 400, errors, null);

  const userResult = await userService.getUserById(userId);
  if (!isServiceMethodSuccess<User>(userResult)) {
    return setError(set, userResult.statusCode, userResult.errors, null);
  }

  const user = userResult.data;
  const decoded = await verifyJwtToken(refreshToken!);
  if (!isVerifyJwtTokenSuccess(decoded)) {
    return setFieldError(set, 401, 'refreshToken', [decoded.error]);
  }

  const storedRefreshToken = await redis.get(`refresh-token:${userId}`);
  if (storedRefreshToken !== refreshToken)
    return setFieldError(set, 401, 'refreshToken', ['Refresh token mismatch.']);

  const userSessionData = await getSessionData(redis, sessionId!);
  if (!isGetSessionDataSuccess(userSessionData)) {
    return setError(
      set,
      userSessionData.statusCode,
      userSessionData.errors,
      null
    );
  }

  const newSessionId = createSessionId(userId);
  const newAccessToken = await generateAccessToken({
    sessionId: newSessionId,
    userId,
  });
  const newRefreshToken = await generateRefreshToken({
    sessionId: newSessionId,
    userId,
  });

  try {
    await redis.del(`refresh-token:${userId}`);
    await redis.del(sessionId!);
  } catch (error) {
    return setError(set, 500, null, ['Failed to delete old session data.']);
  }

  const isSetRefreshTokenOnRedisSuccess = await setRefreshTokenOnRedis(
    redis,
    newRefreshToken,
    userId
  );
  if (!isSetRefreshTokenOnRedisSuccess)
    return setError(set, 500, null, [
      'Failed to store new refresh token in Redis.',
    ]);

  const isSetSessionIdOnRedisSuccess = await setSessionId<User>(
    redis,
    newSessionId,
    user
  );
  if (!isSetSessionIdOnRedisSuccess)
    return setError(set, 500, null, [
      'Failed to store new session ID in Redis.',
    ]);

  set.status = 200;
  set.headers['authorization'] = `Bearer ${newAccessToken}`;
  set.headers['X-Refresh-Token'] = newRefreshToken;
  set.headers['X-Session-Id'] = newSessionId;

  return {
    success: true,
    message: 'Token refreshed successfully.',
    links: {
      self: `/users/${userId}`,
      login: '/auth/login',
      logout: '/auth/logout',
      toggleTwoFactorAuth: '/auth/two-factor',
    },
  };
};

export const handleUserLogout: HandleUserLogout = async ({
  body,
  set,
  redis,
  accessToken,
  sessionId,
}) => {
  set.headers['content-type'] = 'application/json';
  set.headers['accept'] = 'application/json';

  if (!body) return setError(set, 400, null, ['Request body is missing.']);

  const { userId } = body;
  const errors: BaseError = [];
  const validations = [
    {
      field: 'userId',
      value: userId !== undefined,
      errorMessage: 'User ID is missing.',
    },
    {
      field: 'sessionId',
      value: sessionId !== undefined,
      errorMessage: 'Session ID is missing.',
    },
    {
      field: 'accessToken',
      value: accessToken !== undefined,
      errorMessage: 'Access token is missing.',
    },
  ];

  for (const { field, value, errorMessage } of validations) {
    if (!value) errors.push({ messages: [errorMessage], field });
  }

  if (errors.length > 0) return setError(set, 400, errors, null);

  const userResult = await userService.getUserById(userId);
  if (!isServiceMethodSuccess<User>(userResult)) {
    return setError(set, userResult.statusCode, userResult.errors, null);
  }

  const decodedAccessToken = await verifyJwtToken(accessToken!);
  if (!isVerifyJwtTokenSuccess(decodedAccessToken)) {
    return setFieldError(set, 401, 'accessToken', [decodedAccessToken.error]);
  }

  const userSessionData = await getSessionData(redis, sessionId!);
  if (!isGetSessionDataSuccess(userSessionData)) {
    return setError(
      set,
      userSessionData.statusCode,
      userSessionData.errors,
      null
    );
  }

  try {
    await redis.del(`refresh-token:${userId}`);
    await redis.del(sessionId!);
  } catch (error) {
    return setError(set, 500, null, ['Failed to delete session data.']);
  }

  set.status = 200;
  return {
    success: true,
    message: 'User logged out successfully.',
    links: {
      self: `/users/${userId}`,
      login: '/auth/login',
      tokenRefresh: '/auth/refresh',
      toggleTwoFactorAuth: '/auth/two-factor',
      getTwoFactorQR: '/auth/two-factor/qr',
    },
  };
};

export const handleToggleTwoFactor: HandleToggleTwoFactor = async ({
  set,
  body,
  query,
  accessToken,
  sessionId,
  redis,
}) => {
  set.headers['content-type'] = 'application/json';
  set.headers['accept'] = 'application/json';

  if (!body) return setError(set, 400, null, ['Request body is missing.']);
  if (!query) return setError(set, 400, null, ['Query parameter is missing.']);

  const { userId, secret, token } = body;
  const { enable } = query;

  const errors: BaseError = [];
  const validations = [
    {
      field: 'enable',
      value: enable !== undefined,
      errorMessage: 'Enable flag is missing.',
    },
    {
      field: 'userId',
      value: userId !== undefined,
      errorMessage: 'User ID is missing.',
    },
    {
      field: 'sessionId',
      value: sessionId !== undefined,
      errorMessage: 'Session ID is missing.',
    },
    {
      field: 'accessToken',
      value: accessToken !== undefined,
      errorMessage: 'Access token is missing.',
    },
    {
      field: 'secret',
      value: secret !== undefined,
      errorMessage: '2FA Secret is missing.',
    },
    {
      field: 'token',
      value: token !== undefined,
      errorMessage: '2FA Token is missing.',
    },
  ];

  for (const { field, value, errorMessage } of validations) {
    if (!value) errors.push({ messages: [errorMessage], field });
  }

  if (errors.length > 0) return setError(set, 400, errors, null);

  if (enable !== 'true' && enable !== 'false') {
    return setFieldError(set, 400, 'enable', [
      'Invalid value for enable flag: must be either true or false.',
    ]);
  }

  const userResult = await userService.getUserById(userId);
  if (!isServiceMethodSuccess<User>(userResult)) {
    return setError(set, userResult.statusCode, userResult.errors, null);
  }

  const decodedAccessToken = await verifyJwtToken(accessToken!);
  if (!isVerifyJwtTokenSuccess(decodedAccessToken)) {
    return setFieldError(set, 401, 'accessToken', [decodedAccessToken.error]);
  }

  const userSessionData = await getSessionData(redis, sessionId!);
  if (!isGetSessionDataSuccess(userSessionData)) {
    return setError(
      set,
      userSessionData.statusCode,
      userSessionData.errors,
      null
    );
  }

  const enableTwoFactorAuth = enable === 'true';
  const verifyTwoFactorTokenResult = await verifyTwoFactorToken(secret, token);
  if (!verifyTwoFactorTokenResult) {
    return setFieldError(set, 401, 'token', [
      'Invalid two-factor authentication token.',
    ]);
  }

  const updatedUserResult = await userService.toggleTwoFactorAuth(
    userId,
    enableTwoFactorAuth,
    secret
  );
  if (!isServiceMethodSuccess<{ userId: number }>(updatedUserResult)) {
    return setError(
      set,
      updatedUserResult.statusCode,
      updatedUserResult.errors,
      null
    );
  }

  set.status = 200;

  return {
    success: true,
    message: `Two-factor authentication ${
      enableTwoFactorAuth ? 'enabled' : 'disabled'
    } successfully.`,
    links: {
      self: `/users/${userId}`,
      login: '/auth/login',
      logout: '/auth/logout',
      toggleTwoFactorAuth: '/auth/two-factor',
    },
  };
};

export const handleGetTwoFactorQR: HandleGetTwoFactorQR = async ({ set }) => {
  set.headers['content-type'] = 'application/json';

  const secret = generateTwoFactorSecret();
  const qrCode = await generateQRCode(secret.otpauth_url!);
  if (!isGenerateQRCodeSuccess(qrCode)) {
    return setError(set, 500, null, ['Failed to generate QR code.']);
  }

  set.status = 200;
  return {
    success: true,
    data: {
      qrCode: qrCode.qrCode,
      secret: secret.base32,
    },
    message: 'Two-factor authentication QR code generated successfully.',
    links: {
      self: `/auth/two-factor`,
      login: '/auth/login',
      logout: '/auth/logout',
      toggleTwoFactorAuth: '/auth/two-factor',
    },
  };
};

export const handleGoogleOAuth: HandleGoogleOAuth = async ({
  set,
  body,
  redis,
}) => {
  set.headers['content-type'] = 'application/json';
  set.headers['accept'] = 'application/json';

  if (!body) return setError(set, 400, null, ['Request body is missing.']);

  const { token } = body;
  if (!token) return setFieldError(set, 400, 'token', ['Token is missing.']);

  const googleUserResult = await getGoogleUser(token);
  if (!isFetchGoogleUserSuccess(googleUserResult)) {
    return setError(set, 401, googleUserResult, null);
  }

  const googleUser = googleUserResult;
  if (googleUser.email_verified === false) {
    return setError(set, 401, null, ['Email is not verified.']);
  }

  const userResult = await userService.getUserByEmail(googleUser.email);
  if (isServiceMethodSuccess<User>(userResult)) {
    const { password, ...userData } = userResult.data;

    const updateGoogleUserResult = await userService.updateGoogleUser(
      googleUser
    );
    if (!isServiceMethodSuccess<User>(updateGoogleUserResult)) {
      return setError(
        set,
        updateGoogleUserResult.statusCode,
        updateGoogleUserResult.errors,
        null
      );
    }

    if (userResult.data.twoFactorEnabled) {
      const { twoFAToken } = body;
      if (!twoFAToken) {
        return setFieldError(set, 400, 'twoFAToken', [
          'Two-factor authentication token is missing.',
        ]);
      }

      if (
        !(await verifyTwoFactorToken(
          userResult.data.twoFactorSecret!,
          twoFAToken
        ))
      ) {
        return setFieldError(set, 401, 'twoFAToken', [
          'Invalid two-factor authentication token.',
        ]);
      }
    }

    const sessionId = createSessionId(userResult.data.id!);
    const accessToken = await generateAccessToken({
      sessionId,
      userId: userResult.data.id,
    });
    const refreshToken = await generateRefreshToken({
      sessionId,
      userId: userResult.data.id,
    });

    const isSetRefreshTokenOnRedisSuccess = await setRefreshTokenOnRedis(
      redis,
      refreshToken,
      userResult.data.id!
    );
    if (!isSetRefreshTokenOnRedisSuccess) {
      return setError(set, 500, null, [
        'Failed to store refresh token in Redis.',
      ]);
    }

    const isSetSessionIdOnRedisSuccess = await setSessionId<User>(
      redis,
      sessionId,
      userResult.data
    );
    if (!isSetSessionIdOnRedisSuccess) {
      return setError(set, 500, null, ['Failed to store session ID in Redis.']);
    }

    set.status = 200;
    set.headers['authorization'] = `Bearer ${accessToken}`;
    set.headers['X-Refresh-Token'] = refreshToken;
    set.headers['X-Session-Id'] = sessionId;

    return {
      success: true,
      data: userData,
      message: 'User logged in successfully.',
      links: {
        self: `/users/${userResult.data.id}`,
        logout: '/auth/logout',
        tokenRefresh: '/auth/refresh',
        toggleTwoFactorAuth: '/auth/two-factor',
      },
    };
  }

  const totalUsersResult = await userService.getTotalUsers();
  if (!isServiceMethodSuccess<{ totalUser: number }>(totalUsersResult)) {
    return setError(
      set,
      totalUsersResult.statusCode,
      totalUsersResult.errors,
      null
    );
  }

  const totalUsers = totalUsersResult.data.totalUser;
  const newUser: User = {
    email: googleUser.email,
    firstName: googleUser.given_name,
    lastName: googleUser.family_name,
    totalScore: 0,
    currentRank: totalUsers + 1,
    notificationEnabled: false,
    twoFactorEnabled: false,
    profileImgUrl: googleUser.picture,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createResult = await userService.create(newUser);
  if (!isServiceMethodSuccess<User>(createResult)) {
    return setError(set, createResult.statusCode, createResult.errors, null);
  }

  const sessionId = createSessionId(createResult.data.id!);
  const accessToken = await generateAccessToken({
    sessionId,
    userId: createResult.data.id,
  });
  const refreshToken = await generateRefreshToken({
    sessionId,
    userId: createResult.data.id,
  });

  const isSetRefreshTokenOnRedisSuccess = await setRefreshTokenOnRedis(
    redis,
    refreshToken,
    createResult.data.id!
  );
  if (!isSetRefreshTokenOnRedisSuccess) {
    return setError(set, 500, null, [
      'Failed to store refresh token in Redis.',
    ]);
  }

  const isSetSessionIdOnRedisSuccess = await setSessionId<User>(
    redis,
    sessionId,
    createResult.data
  );
  if (!isSetSessionIdOnRedisSuccess) {
    return setError(set, 500, null, ['Failed to store session ID in Redis.']);
  }

  set.status = 200;
  set.headers['authorization'] = `Bearer ${accessToken}`;
  set.headers['X-Refresh-Token'] = refreshToken;
  set.headers['X-Session-Id'] = sessionId;
  const { password, ...userData } = createResult.data;

  return {
    success: true,
    data: userData,
    message: 'User logged in successfully.',
    links: {
      self: `/users/${createResult.data.id}`,
      logout: '/auth/logout',
      tokenRefresh: '/auth/refresh',
      toggleTwoFactorAuth: '/auth/two-factor',
    },
  };
};

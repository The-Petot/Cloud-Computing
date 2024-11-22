import userService from '../services/auth.service';
import {
  isEmailValid,
  isServiceMethodSuccess,
  isPasswordValid,
  hashPassword,
  isPasswordMatch,
} from '../utils';
import {
  HandleTokenRefresh,
  HandleUserLogout,
  HandleUserLogin,
  HandleUserRegister,
  User,
} from './controller.type';

export const handleUserRegister: HandleUserRegister = async ({
  body,
  set,
  jwt,
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

  set.status = 201;
  set.headers.authorization = `Bearer ${accessToken}`;
  set.headers['X-Refresh-Token'] = refreshToken;
  return {
    data: { userId: result.data.userId },
    message: 'User registered successfully',
  };
};

export const handleUserLogin: HandleUserLogin = async ({ jwt, body, set }) => {
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
  if (!isServiceMethodSuccess<{ id: number; password: string }>(user)) {
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

  const accessToken = await jwt.sign({
    userId: user.data.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  });

  const refreshToken = await jwt.sign({
    userId: user.data.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  });

  set.status = 200;
  set.headers['authorization'] = `Bearer ${accessToken}`;
  set.headers['X-Refresh-Token'] = refreshToken;

  return {
    data: { userId: 1 },
    message: 'User logged in successfully',
  };
};

export const handleUserLogout: HandleUserLogout = async () => {};

export const handleTokenRefresh: HandleTokenRefresh = async () => {};

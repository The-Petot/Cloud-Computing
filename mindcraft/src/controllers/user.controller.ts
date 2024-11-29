import userService from '../services/user.service';
import {
  Errors,
  getSessionData,
  isANumber,
  isGetSessionDataSuccess,
  isServiceMethodSuccess,
  isVerifyJwtTokenSuccess,
  setError,
  setFieldError,
  verifyJwtToken,
} from '../utils';
import {
  HandleDeleteUser,
  HandleGetUserById,
  HandleGetUserChallenges,
  HandleGetUsers,
  HandleUpdateUser,
  HandleGetUserParticipations,
} from '../types/user.type';

export const handleGetUserById: HandleGetUserById = async ({
  set,
  redis,
  accessToken,
  sessionId,
  params,
}) => {
  set.headers['content-type'] = 'application/json';

  if (!params) {
    return setError(
      set,
      400,
      [{ field: 'params', messages: ['params is missing.'] }],
      null
    );
  }

  const { userId } = params;
  const validations = [
    {
      field: 'userId',
      value: userId,
      messgae: 'userId is missing.',
    },
    {
      field: 'accessToken',
      value: accessToken,
      message: 'accessToken is missing.',
    },
    {
      field: 'sessionId',
      value: sessionId,
      message: 'sessionId is missing.',
    },
  ];

  const errors: Errors = [];
  for (const { field, value, message } of validations) {
    if (!value) {
      errors.push({ field, messages: [message!] });
    }
  }

  if (errors.length > 0) {
    return setError(set, 400, errors, null);
  }

  if (!isANumber(userId)) {
    return setFieldError(set, 400, 'userId', ['userId must be a number.']);
  }

  const userIdNumber = parseInt(userId);

  const decodedAccessToken = await verifyJwtToken(accessToken!);
  if (!isVerifyJwtTokenSuccess(decodedAccessToken)) {
    return setFieldError(set, 401, 'accessToken', [decodedAccessToken.error]);
  }

  const sessionData = await getSessionData(redis, sessionId!);
  if (!isGetSessionDataSuccess(sessionData)) {
    return setError(set, sessionData.statusCode, null, [sessionData.error]);
  }

  const user = await userService.getUserById(userIdNumber);
  if (!isServiceMethodSuccess(user)) {
    return setError(set, user.statusCode, user.errors, null);
  }

  set.status = 200;

  return {
    success: true,
    data: user.data,
    message: 'User data fetched successfully.',
    links: {
      self: `/users/${userId}`,
    },
  };
};

export const handleGetUsers: HandleGetUsers = async ({ set }) => {
  set.headers['content-type'] = 'application/json';

  const users = await userService.getUsers();
  if (!isServiceMethodSuccess(users)) {
    return setError(set, users.statusCode, users.errors, null);
  }

  set.status = 200;
  return {
    success: true,
    data: users.data,
    message: 'Users data fetched successfully.',
    links: {
      self: '/users',
      userDetails: '/users/:userId',
    },
  };
};

export const handleUpdateUser: HandleUpdateUser = async ({
  set,
  body,
  params,
  accessToken,
  sessionId,
  redis,
}) => {
  set.headers['content-type'] = 'application/json';
  set.headers['accept'] = 'application/json';

  if (!body) {
    return setError(
      set,
      400,
      [{ field: 'body', messages: ['body is missing.'] }],
      null
    );
  }

  if (!params) {
    return setError(
      set,
      400,
      [{ field: 'params', messages: ['params is missing.'] }],
      null
    );
  }

  const { newUserData } = body;
  const { userId } = params;

  const validations = [
    {
      field: 'userId',
      value: userId,
      message: 'userId is missing.',
    },
    {
      field: 'newUserData',
      value: Object.keys(newUserData).length > 0,
      message: 'newUserData is missing.',
    },
    {
      field: 'accessToken',
      value: accessToken,
      message: 'accessToken is missing.',
    },
    {
      field: 'sessionId',
      value: sessionId,
      message: 'sessionId is missing.',
    },
  ];

  const errors: Errors = [];
  for (const { field, value, message } of validations) {
    if (!value) {
      errors.push({ field, messages: [message!] });
    }
  }

  if (errors.length > 0) {
    return setError(set, 400, errors, null);
  }

  if (!isANumber(userId)) {
    return setFieldError(set, 400, 'userId', ['userId must be a number.']);
  }

  const decodedAccessToken = await verifyJwtToken(accessToken!);
  if (!isVerifyJwtTokenSuccess(decodedAccessToken)) {
    return setFieldError(set, 401, 'accessToken', [decodedAccessToken.error]);
  }

  const sessionData = await getSessionData(redis, sessionId!);
  if (!isGetSessionDataSuccess(sessionData)) {
    return setError(set, sessionData.statusCode, null, [sessionData.error]);
  }

  const userIdNumber = parseInt(userId);

  const user = await userService.updateUser(userIdNumber, newUserData);
  if (!isServiceMethodSuccess(user)) {
    return setError(set, user.statusCode, user.errors, null);
  }

  const { password, ...userData } = user.data;

  set.status = 200;
  return {
    success: true,
    data: userData,
    message: 'User data updated successfully.',
    links: {
      self: `/users/${userId}`,
    },
  };
};

export const handleDeleteUser: HandleDeleteUser = async ({
  set,
  accessToken,
  sessionId,
  redis,
  params,
}) => {
  set.headers['content-type'] = 'application/json';

  if (!params) {
    return setError(
      set,
      400,
      [{ field: 'params', messages: ['params is missing.'] }],
      null
    );
  }

  const { userId } = params;
  const validations = [
    {
      field: 'userId',
      value: userId,
      message: 'userId is missing.',
    },
    {
      field: 'accessToken',
      value: accessToken,
      message: 'accessToken is missing.',
    },
    {
      field: 'sessionId',
      value: sessionId,
      message: 'sessionId is missing.',
    },
  ];

  const errors: Errors = [];
  for (const { field, value, message } of validations) {
    if (!value) {
      errors.push({ field, messages: [message!] });
    }
  }

  if (errors.length > 0) {
    return setError(set, 400, errors, null);
  }

  if (!isANumber(userId)) {
    return setFieldError(set, 400, 'userId', ['userId must be a number.']);
  }

  const decodedAccessToken = await verifyJwtToken(accessToken!);
  if (!isVerifyJwtTokenSuccess(decodedAccessToken)) {
    return setFieldError(set, 401, 'accessToken', [decodedAccessToken.error]);
  }

  const sessionData = await getSessionData(redis, sessionId!);
  if (!isGetSessionDataSuccess(sessionData)) {
    return setError(set, sessionData.statusCode, null, [sessionData.error]);
  }

  const userIdNumber = parseInt(userId);
  const user = await userService.deleteUser(userIdNumber);
  if (!isServiceMethodSuccess(user)) {
    return setError(set, user.statusCode, user.errors, null);
  }

  set.status = 200;
  return {
    success: true,
    message: 'User deleted successfully.',
    links: {
      self: `/users/${userId}`,
    },
  };
};

export const handleGetUserChallenges: HandleGetUserChallenges = async ({
  set,
  params,
}) => {
  set.headers['content-type'] = 'application/json';

  if (!params) {
    return setError(
      set,
      400,
      [{ field: 'params', messages: ['params is missing.'] }],
      null
    );
  }

  const { userId } = params;
  if (!userId) {
    return setFieldError(set, 400, 'userId', ['userId is missing.']);
  }

  if (!isANumber(userId)) {
    return setFieldError(set, 400, 'userId', ['userId must be a number.']);
  }

  const userIdNumber = parseInt(userId);
  const userChallenges = await userService.getUserChallenges(userIdNumber);
  if (!isServiceMethodSuccess(userChallenges)) {
    return setError(
      set,
      userChallenges.statusCode,
      userChallenges.errors,
      null
    );
  }

  set.status = 200;
  return {
    success: true,
    data: userChallenges.data,
    message: 'User challenges fetched successfully.',
    links: {
      self: `/users/${userId}/challenges`,
    },
  };
};

export const handleGetUserParticipations: HandleGetUserParticipations = async ({
  set,
  params,
}) => {
  set.headers['content-type'] = 'application/json';

  if (!params) {
    return setError(
      set,
      400,
      [{ field: 'params', messages: ['params is missing.'] }],
      null
    );
  }

  const { userId } = params;
  if (!userId) {
    return setFieldError(set, 400, 'userId', ['userId is missing.']);
  }

  if (!isANumber(userId)) {
    return setFieldError(set, 400, 'userId', ['userId must be a number.']);
  }

  const userIdNumber = parseInt(userId);
  const userParticipations = await userService.getUserParticipations(
    userIdNumber
  );
  if (!isServiceMethodSuccess(userParticipations)) {
    return setError(
      set,
      userParticipations.statusCode,
      userParticipations.errors,
      null
    );
  }

  set.status = 200;
  return {
    success: true,
    data: userParticipations.data,
    message: 'User participations fetched successfully.',
    links: {
      self: `/users/${userId}/participations`,
    },
  };
};

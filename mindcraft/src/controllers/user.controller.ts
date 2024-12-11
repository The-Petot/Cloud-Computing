import userService from '../services/user.service';
import {
  Errors,
  hashPassword,
  isANumber,
  isServiceMethodSuccess,
  setError,
  setFieldError,
} from '../utils';
import {
  HandleDeleteUser,
  HandleGetUserById,
  HandleGetUserChallenges,
  HandleGetUsers,
  HandleUpdateUser,
  HandleGetUserParticipations,
  HandleCreateUserChallenge,
  HandleCreateUserParticipation,
  HandleDeleteUserChallenge,
  HandleUpdateUserChallenge,
} from '../types/user.type';
import { Challenge, User } from '../types/global.type';
import challengeService from '../services/challenge.service';
import {
  createMaterialSummary,
  generateQuestions,
  getSessionData,
  isCreateMaterialSummarySuccess,
  isGenerateQuestionsError,
  isGetSessionDataSuccess,
  isVerifyJwtTokenSuccess,
  setSessionId,
  verifyJwtToken,
} from '../lib';
import { isUploadFileSuccess, uploadFile } from '../storage/bucket';
import { isUndefined } from 'node:util';

export const handleGetUsers: HandleGetUsers = async ({ set, query }) => {
  set.headers['content-type'] = 'application/json';

  let limit = 100;
  let offset = 0;

  if (query) {
    if (query.limit && isANumber(query.limit)) {
      limit = parseInt(query.limit);
    }

    if (query.offset && isANumber(query.offset)) {
      offset = parseInt(query.offset);
    }
  }

  const users = await userService.getUsers(limit, offset);
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
      updateUser: '/users/:userId',
      updateUserChallenge: `/users/:userId/challenges/:challengeId`,
      deleteUser: '/users/:userId',
      userChallenges: '/users/:userId/challenges',
      userParticipations: '/users/:userId/participations',
      createUserChallenge: '/users/:userId/challenges',
      createUserParticipation: '/users/:userId/participations',
      deleteUserChallenge: '/users/:userId/challenges/:challengeId',
    },
  };
};

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
      value: userId !== undefined,
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
      users: '/users',
      updateUser: `/users/${userId}`,
      updateUserChallenge: `/users/${userIdNumber}/challenges/:challengeId`,
      deleteUser: `/users/${userId}`,
      userChallenges: `/users/${userId}/challenges`,
      userParticipations: `/users/${userId}/participations`,
      createUserChallenge: `/users/${userId}/challenges`,
      createUserParticipation: `/users/${userId}/participations`,
      deleteUserChallenge: `/users/${userId}/challenges/:challengeId`,
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
  set.headers['accept'] = 'multipart/form-data';

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

  const { profileImage, ...newUserData } = body;
  const { userId } = params;

  const validations = [
    {
      field: 'userId',
      value: userId !== undefined,
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
  if (profileImage) {
    const uploadResult = await uploadFile(profileImage, userIdNumber);
    if (!isUploadFileSuccess(uploadResult)) {
      return setError(set, 500, null, [uploadResult.error]);
    }

    newUserData.profileImgUrl = uploadResult.url;
  }

  if (newUserData.password) {
    newUserData.password = await hashPassword(newUserData.password);
  }

  const user = await userService.updateUser(userIdNumber, newUserData);
  if (!isServiceMethodSuccess(user)) {
    return setError(set, user.statusCode, user.errors, null);
  }

  const { password, ...userData } = user.data;

  try {
    await redis.del(sessionId!);
  } catch (error) {
    return setError(set, 500, null, [
      error instanceof Error ? error.message : 'Unknown error',
    ]);
  }

  const setSessionDataResult = await setSessionId<Omit<User, 'password'>>(
    redis,
    sessionId!,
    userData
  );
  if (!setSessionDataResult) {
    return setError(set, 500, null, ['Unable to set session data.']);
  }

  set.status = 200;
  return {
    success: true,
    data: userData,
    message: 'User data updated successfully.',
    links: {
      self: `/users/${userIdNumber}`,
      updateUserChallenge: `/users/${userIdNumber}/challenges/:challengeId`,
      users: '/users',
      userDetails: `/users/${userIdNumber}`,
      deleteUser: `/users/${userIdNumber}`,
      userChallenges: `/users/${userIdNumber}/challenges`,
      userParticipations: `/users/${userIdNumber}/participations`,
      createUserChallenge: `/users/${userIdNumber}/challenges`,
      createUserParticipation: `/users/${userIdNumber}/participations`,
      deleteUserChallenge: `/users/${userIdNumber}/challenges/:challengeId`,
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
      value: userId !== undefined,
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
      self: `/users/${userIdNumber}`,
      users: '/users',
      userDetails: `/users/${userIdNumber}`,
      updateUser: `/users/${userIdNumber}`,
      updateUserChallenge: `/users/${userIdNumber}/challenges/:challengeId`,
      userChallenges: `/users/${userIdNumber}/challenges`,
      userParticipations: `/users/${userIdNumber}/participations`,
      createUserChallenge: `/users/${userIdNumber}/challenges`,
      createUserParticipation: `/users/${userIdNumber}/participations`,
      deleteUserChallenge: `/users/${userIdNumber}/challenges/:challengeId`,
    },
  };
};

export const handleGetUserChallenges: HandleGetUserChallenges = async ({
  set,
  params,
  query,
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

  let limit = 100;
  let offset = 0;

  if (query) {
    if (query.limit && isANumber(query.limit)) {
      limit = parseInt(query.limit);
    }

    if (query.offset && isANumber(query.offset)) {
      offset = parseInt(query.offset);
    }
  }

  const userIdNumber = parseInt(userId);
  const userChallenges = await userService.getUserChallenges(
    userIdNumber,
    limit,
    offset
  );
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
      users: '/users',
      userDetails: `/users/${userId}`,
      updateUser: `/users/${userId}`,
      updateUserChallenge: `/users/${userIdNumber}/challenges/:challengeId`,
      deleteUser: `/users/${userId}`,
      userParticipations: `/users/${userId}/participations`,
      createUserChallenge: `/users/${userId}/challenges`,
      createUserParticipation: `/users/${userId}/participations`,
      deleteUserChallenge: `/users/${userId}/challenges/:challengeId`,
    },
  };
};

export const handleGetUserParticipations: HandleGetUserParticipations = async ({
  set,
  params,
  query,
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

  let limit = 100;
  let offset = 0;

  if (query) {
    if (query.limit && isANumber(query.limit)) {
      limit = parseInt(query.limit);
    }

    if (query.offset && isANumber(query.offset)) {
      offset = parseInt(query.offset);
    }
  }

  const userIdNumber = parseInt(userId);
  const userParticipations = await userService.getUserParticipations(
    userIdNumber,
    limit,
    offset
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
      users: '/users',
      userDetails: `/users/${userId}`,
      updateUser: `/users/${userId}`,
      updateUserChallenge: `/users/${userIdNumber}/challenges/:challengeId`,
      deleteUser: `/users/${userId}`,
      userChallenges: `/users/${userId}/challenges`,
      createUserChallenge: `/users/${userId}/challenges`,
      createUserParticipation: `/users/${userId}/participations`,
      deleteUserChallenge: `/users/${userId}/challenges/:challengeId`,
    },
  };
};

export const handleCreateUserChallenge: HandleCreateUserChallenge = async ({
  set,
  params,
  body,
  accessToken,
  sessionId,
  redis,
}) => {
  set.headers['content-type'] = 'application/json';
  set.headers['accept'] = 'application/json';

  if (!params) {
    return setError(
      set,
      400,
      [{ field: 'params', messages: ['params is missing.'] }],
      null
    );
  }

  if (!body) {
    return setError(
      set,
      400,
      [{ field: 'body', messages: ['body is missing.'] }],
      null
    );
  }

  const { title, description, material, timeSeconds, tags } = body;
  const { userId } = params;
  const errors: Errors = [];
  const validations = [
    {
      field: 'userId',
      value: userId !== undefined,
      message: 'userId is missing.',
    },
    {
      field: 'title',
      value: title,
      message: 'title is missing.',
    },
    {
      field: 'material',
      value: material,
      message: 'material is missing.',
    },
    {
      field: 'timeSeconds',
      value: timeSeconds !== undefined,
      message: 'timeSeconds is missing.',
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
  validations.forEach(({ field, value, message }) => {
    if (!value) errors.push({ field, messages: [message!] });
  });

  if (material.length > 3000) {
    errors.push({
      field: 'material',
      messages: ['material must not exceed 3000 characters.'],
    });
  }

  if (material.length < 100) {
    errors.push({
      field: 'material',
      messages: ['material must be at least 100 characters.'],
    });
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
  const generateResult = await generateQuestions(material);
  if (isGenerateQuestionsError(generateResult)) {
    return setError(set, 500, null, [generateResult.error]);
  }

  const challenge: Challenge = {
    title,
    timeSeconds,
    authorId: userIdNumber,
    createdAt: new Date(),
    updatedAt: new Date(),
    totalQuestions: generateResult.length,
  };

  if (tags) {
    challenge.tags = tags.join(',');
  }

  if (description) {
    challenge.description = description;
  }

  const materialSummaryResult = await createMaterialSummary(material);
  if (!isCreateMaterialSummarySuccess(materialSummaryResult)) {
    return setError(set, 500, null, [materialSummaryResult.error]);
  }

  challenge.summary = materialSummaryResult.summary;

  const challengeResult = await challengeService.createChallenge(challenge);
  if (!isServiceMethodSuccess(challengeResult)) {
    return setError(
      set,
      challengeResult.statusCode,
      challengeResult.errors,
      null
    );
  }

  const challengeQuestionsResult =
    await challengeService.createChallengeQuestions(
      challengeResult.data.id!,
      generateResult
    );
  if (!isServiceMethodSuccess(challengeQuestionsResult)) {
    return setError(
      set,
      challengeQuestionsResult.statusCode,
      challengeQuestionsResult.errors,
      null
    );
  }

  set.status = 201;
  return {
    success: true,
    data: {
      ...challengeResult.data,
      authorFirstName: sessionData.firstName,
      authorLastName: sessionData.lastName,
    },
    message: 'Challenge created successfully.',
    links: {
      self: `/users/${userIdNumber}/challenges/${challengeResult.data.id}`,
      users: '/users',
      userDetails: `/users/${userIdNumber}`,
      updateUser: `/users/${userIdNumber}`,
      updateUserChallenge: `/users/${userIdNumber}/challenges/:challengeId`,
      deleteUser: `/users/${userIdNumber}`,
      userChallenges: `/users/${userIdNumber}/challenges`,
      userParticipations: `/users/${userIdNumber}/participations`,
      createUserParticipation: `/users/${userIdNumber}/participations`,
      deleteUserChallenge: `/users/${userIdNumber}/challenges/:challengeId`,
    },
  };
};

export const handleCreateUserParticipation: HandleCreateUserParticipation =
  async ({ set, accessToken, sessionId, params, body, redis }) => {
    set.headers['content-type'] = 'application/json';
    set.headers['accept'] = 'application/json';

    if (!params) {
      return setError(
        set,
        400,
        [{ field: 'params', messages: ['params is missing.'] }],
        null
      );
    }

    if (!body) {
      return setError(
        set,
        400,
        [{ field: 'body', messages: ['body is missing.'] }],
        null
      );
    }

    const { userId } = params;
    const { challengeId, score } = body;

    const errors: Errors = [];
    const validations = [
      {
        field: 'userId',
        value: userId !== undefined,
        message: 'userId is missing.',
      },
      {
        field: 'challengeId',
        value: challengeId !== undefined,
        message: 'challengeId is missing.',
      },
      {
        field: 'score',
        value: score !== undefined,
        message: 'score is missing.',
      },
      {
        field: 'accessToken',
        value: accessToken !== undefined,
        message: 'accessToken is missing.',
      },
      {
        field: 'sessionId',
        value: sessionId !== undefined,
        message: 'sessionId is missing.',
      },
    ];

    validations.forEach(({ field, value, message }) => {
      if (!value) errors.push({ field, messages: [message!] });
    });

    if (errors.length > 0) {
      return setError(set, 400, errors, null);
    }

    if (!isANumber(userId)) {
      return setFieldError(set, 400, 'userId', ['userId must be a number.']);
    }

    if (!isANumber(challengeId)) {
      return setFieldError(set, 400, 'challengeId', [
        'challengeId must be a number.',
      ]);
    }

    if (!isANumber(score)) {
      return setFieldError(set, 400, 'score', ['score must be a number.']);
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

    const participation = await userService.createUserParticipation(
      userIdNumber,
      challengeId,
      score
    );
    if (!isServiceMethodSuccess(participation)) {
      return setError(
        set,
        participation.statusCode,
        participation.errors,
        null
      );
    }

    const updateUserScore = await userService.updateUserScore(
      userIdNumber,
      score
    );
    if (!isServiceMethodSuccess(updateUserScore)) {
      return setError(
        set,
        updateUserScore.statusCode,
        updateUserScore.errors,
        null
      );
    }

    set.status = 201;
    return {
      success: true,
      data: participation.data,
      message: 'Participation created successfully.',
      links: {
        self: `/users/${userId}/participations/${participation.data.id}`,
        users: '/users',
        userDetails: `/users/${userId}`,
        updateUser: `/users/${userId}`,
        updateUserChallenge: `/users/${userIdNumber}/challenges/:challengeId`,
        deleteUser: `/users/${userId}`,
        userChallenges: `/users/${userId}/challenges`,
        userParticipations: `/users/${userId}/participations`,
        createUserChallenge: `/users/${userId}/challenges`,
        deleteUserChallenge: `/users/${userId}/challenges/:challengeId`,
      },
    };
  };

export const handleDeleteUserChallenge: HandleDeleteUserChallenge = async ({
  set,
  accessToken,
  sessionId,
  params,
  redis,
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

  const { userId, challengeId } = params;
  const errors: Errors = [];
  const validations = [
    {
      field: 'userId',
      value: userId !== undefined,
      message: 'userId is missing.',
    },
    {
      field: 'challengeId',
      value: challengeId !== undefined,
      message: 'challengeId is missing.',
    },
    {
      field: 'accessToken',
      value: accessToken !== undefined,
      message: 'accessToken is missing.',
    },
    {
      field: 'sessionId',
      value: sessionId !== undefined,
      message: 'sessionId is missing.',
    },
  ];

  validations.forEach(({ field, value, message }) => {
    if (!value) errors.push({ field, messages: [message!] });
  });

  if (errors.length > 0) {
    return setError(set, 400, errors, null);
  }

  if (!isANumber(userId)) {
    return setFieldError(set, 400, 'userId', ['userId must be a number.']);
  }

  if (!isANumber(challengeId)) {
    return setFieldError(set, 400, 'challengeId', [
      'challengeId must be a number.',
    ]);
  }

  const userIdNumber = parseInt(userId);
  const challengeIdNumber = parseInt(challengeId);

  const decodedAccessToken = await verifyJwtToken(accessToken!);
  if (!isVerifyJwtTokenSuccess(decodedAccessToken)) {
    return setFieldError(set, 401, 'accessToken', [decodedAccessToken.error]);
  }

  const sessionData = await getSessionData(redis, sessionId!);
  if (!isGetSessionDataSuccess(sessionData)) {
    return setError(set, sessionData.statusCode, null, [sessionData.error]);
  }

  const deletedChallenge = await userService.deleteUserChallenge(
    userIdNumber,
    challengeIdNumber
  );
  if (!isServiceMethodSuccess(deletedChallenge)) {
    return setError(
      set,
      deletedChallenge.statusCode,
      deletedChallenge.errors,
      null
    );
  }

  set.status = 200;
  return {
    success: true,
    message: 'Challenge deleted successfully.',
    links: {
      self: `/users/${userIdNumber}/challenges/${challengeIdNumber}`,
      users: '/users',
      userDetails: `/users/${userIdNumber}`,
      updateUser: `/users/${userIdNumber}`,
      updateUserChallenge: `/users/${userIdNumber}/challenges/${challengeIdNumber}`,
      deleteUser: `/users/${userIdNumber}`,
      userChallenges: `/users/${userIdNumber}/challenges`,
      userParticipations: `/users/${userIdNumber}/participations`,
      createUserChallenge: `/users/${userIdNumber}/challenges`,
      createUserParticipation: `/users/${userIdNumber}/participations`,
    },
  };
};

export const handleUpdateUserChallenge: HandleUpdateUserChallenge = async ({
  set,
  params,
  body,
  accessToken,
  sessionId,
  redis,
}) => {
  set.headers['content-type'] = 'application/json';
  set.headers['accept'] = 'application/json';

  if (!params) {
    return setError(
      set,
      400,
      [{ field: 'params', messages: ['params is missing.'] }],
      null
    );
  }

  if (!body) {
    return setError(
      set,
      400,
      [{ field: 'body', messages: ['body is missing.'] }],
      null
    );
  }

  if (Object.keys(body).length === 0) {
    return setError(
      set,
      400,
      [{ field: 'body', messages: ['body is empty.'] }],
      null
    );
  }

  const { userId, challengeId } = params;
  const errors: Errors = [];
  const validations = [
    {
      field: 'userId',
      value: userId !== undefined,
      message: 'userId is missing.',
    },
    {
      field: 'challengeId',
      value: challengeId !== undefined,
      message: 'challengeId is missing.',
    },
    {
      field: 'accessToken',
      value: accessToken !== undefined,
      message: 'accessToken is missing.',
    },
    {
      field: 'sessionId',
      value: sessionId !== undefined,
      message: 'sessionId is missing.',
    },
  ];

  validations.forEach(({ field, value, message }) => {
    if (!value) errors.push({ field, messages: [message!] });
  });

  if (errors.length > 0) {
    return setError(set, 400, errors, null);
  }

  if (!isANumber(userId)) {
    return setFieldError(set, 400, 'userId', ['userId must be a number.']);
  }

  if (!isANumber(challengeId)) {
    return setFieldError(set, 400, 'challengeId', [
      'challengeId must be a number.',
    ]);
  }

  const userIdNumber = parseInt(userId);
  const challengeIdNumber = parseInt(challengeId);

  const decodedAccessToken = await verifyJwtToken(accessToken!);
  if (!isVerifyJwtTokenSuccess(decodedAccessToken)) {
    return setFieldError(set, 401, 'accessToken', [decodedAccessToken.error]);
  }

  const sessionData = await getSessionData(redis, sessionId!);
  if (!isGetSessionDataSuccess(sessionData)) {
    return setError(set, sessionData.statusCode, null, [sessionData.error]);
  }

  const updatedChallenge = await challengeService.updateChallenge(
    userIdNumber,
    challengeIdNumber,
    body
  );
  if (!isServiceMethodSuccess(updatedChallenge)) {
    return setError(
      set,
      updatedChallenge.statusCode,
      updatedChallenge.errors,
      null
    );
  }

  set.status = 200;
  return {
    success: true,
    data: updatedChallenge.data,
    message: 'Challenge updated successfully.',
    links: {
      self: `/users/${userIdNumber}/challenges/${challengeIdNumber}`,
      users: '/users',
      userDetails: `/users/${userIdNumber}`,
      updateUser: `/users/${userIdNumber}`,
      deleteUser: `/users/${userIdNumber}`,
      userChallenges: `/users/${userIdNumber}/challenges`,
      userParticipations: `/users/${userIdNumber}/participations`,
      createUserChallenge: `/users/${userIdNumber}/challenges`,
      createUserParticipation: `/users/${userIdNumber}/participations`,
      deleteUserChallenge: `/users/${userIdNumber}/challenges/:challengeId`,
    },
  };
};

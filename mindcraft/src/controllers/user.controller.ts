import userService from '../services/user.service';
import {
  Errors,
  generateQuestions,
  getSessionData,
  isANumber,
  isGenerateQuestionsError,
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
  HandleCreateUserChallenge,
  HandleCreateUserParticipation,
  HandleDeleteUserChallenge,
} from '../types/user.type';
import { Challenge } from '../types/global.type';
import challengeService from '../services/challenge.service';

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
      value: userId,
      message: 'userId is missing.',
    },
    {
      field: 'title',
      value: title,
      message: 'title is missing.',
    },
    {
      field: 'description',
      value: description,
      message: 'description is missing.',
    },
    {
      field: 'material',
      value: material,
      message: 'material is missing.',
    },
    {
      field: 'timeSeconds',
      value: timeSeconds,
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
    errors
      .find((error) => error.field === 'material')
      ?.messages.push('material is too long. Max: 3000 chars');
  }

  if (material.length < 100) {
    errors
      .find((error) => error.field === 'material')
      ?.messages.push('material is too short. Min: 100 chars');
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
    description,
    timeSeconds,
    authorId: userIdNumber,
    createdAt: new Date(),
    updatedAt: new Date(),
    totalQuestions: generateResult.length,
  };

  if (tags) {
    challenge.tags = tags.join(',');
  }

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
    data: challengeResult.data,
    message: 'Challenge created successfully.',
    links: {
      self: `/users/${userId}/challenges/${challengeResult.data.id}`,
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
        value: userId,
        message: 'userId is missing.',
      },
      {
        field: 'challengeId',
        value: challengeId,
        message: 'challengeId is missing.',
      },
      {
        field: 'score',
        value: score,
        message: 'score is missing.',
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

    set.status = 201;
    return {
      success: true,
      data: participation.data,
      message: 'Participation created successfully.',
      links: {
        self: `/users/${userId}/participations/${participation.data.id}`,
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
  set.headers['accept'] = 'application/json';

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
      value: userId,
      message: 'userId is missing.',
    },
    {
      field: 'challengeId',
      value: challengeId,
      message: 'challengeId is missing.',
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
      self: `/users/${userId}/challenges/${challengeId}`,
    },
  };
};

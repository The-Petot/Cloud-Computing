import challengeService from '../services/challenge.service';
import userService from '../services/user.service';
import {
  HandleGetChallenges,
  HandleGetChallengeById,
  HandleGetChallengeParticipants,
  HandleGetChallengeQuestions,
} from '../types/challenge.type';
import { Challenge, ServiceMethodReturnType, User } from '../types/global.type';
import { isANumber, isServiceMethodSuccess, setError } from '../utils';

export const handleGetChallenges: HandleGetChallenges = async ({
  set,
  query,
}) => {
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

  let challenges: ServiceMethodReturnType<{ challenges: Challenge; users: User }[]>;
  if (query?.search) {
    challenges = await challengeService.getChallenges(
      limit,
      offset,
      query.search
    );
  } else {
    challenges = await challengeService.getChallenges(limit, offset);
  }

  if (!isServiceMethodSuccess(challenges)) {
    return setError(set, challenges.statusCode, challenges.errors, null);
  }

  const result = challenges.data.map((data) => {
    const challenge = data.challenges;
    const author = data.users;
    return {
      ...challenge,
      authorFirstName: author.firstName,
      authorLastName: author.lastName,
    };
  })

  set.status = 200;
  return {
    success: true,
    data: result,
    message: 'Challenges fetched successfully.',
    links: {
      self: '/challenges',
      challengeDetails: '/challenges/:challengeId',
      challengeParticipants: '/challenges/:challengeId/participants',
      challengeQuestions: '/challenges/:challengeId/questions',
    },
  };
};

export const handleGetChallengeById: HandleGetChallengeById = async ({
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

  const { challengeId } = params;
  if (!challengeId) {
    return setError(
      set,
      400,
      [{ field: 'challengeId', messages: ['challengeId is missing.'] }],
      null
    );
  }

  if (!isANumber(challengeId)) {
    return setError(
      set,
      400,
      [{ field: 'challengeId', messages: ['challengeId must be a number.'] }],
      null
    );
  }

  const challengeIdNumber = parseInt(challengeId);
  const challenge = await challengeService.getChallengeById(challengeIdNumber);
  if (!isServiceMethodSuccess(challenge)) {
    return setError(set, challenge.statusCode, challenge.errors, null);
  }

  const author = await userService.getUserById(challenge.data.authorId);
  if (!isServiceMethodSuccess(author)) {
    return setError(set, author.statusCode, author.errors, null);
  }

  set.status = 200;
  return {
    success: true,
    data: {
      ...challenge.data,
      authorFirstName: author.data.firstName,
      authorLastName: author.data.lastName,
    },
    message: 'Challenge fetched successfully.',
    links: {
      self: `/challenges/${challengeId}`,
      challengeParticipants: `/challenges/${challengeId}/participants`,
      challengeQuestions: `/challenges/${challengeId}/questions`,
      challenges: '/challenges',
    },
  };
};

export const handleGetChallengeParticipants: HandleGetChallengeParticipants =
  async ({ set, params, query }) => {
    set.headers['content-type'] = 'application/json';

    if (!params) {
      return setError(
        set,
        400,
        [{ field: 'params', messages: ['params is missing.'] }],
        null
      );
    }

    const { challengeId } = params;
    if (!challengeId) {
      return setError(
        set,
        400,
        [{ field: 'challengeId', messages: ['challengeId is missing.'] }],
        null
      );
    }

    if (!isANumber(challengeId)) {
      return setError(
        set,
        400,
        [{ field: 'challengeId', messages: ['challengeId must be a number.'] }],
        null
      );
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

    const challengeIdNumber = parseInt(challengeId);
    const challengeParticipants =
      await challengeService.getChallengeParticipants(
        challengeIdNumber,
        limit,
        offset
      );
    if (!isServiceMethodSuccess(challengeParticipants)) {
      return setError(
        set,
        challengeParticipants.statusCode,
        challengeParticipants.errors,
        null
      );
    }

    set.status = 200;
    return {
      success: true,
      data: challengeParticipants.data,
      message: 'Challenge participants fetched successfully.',
      links: {
        self: `/challenges/${challengeId}/participants`,
        challengeDetails: `/challenges/${challengeId}`,
        challengeQuestions: `/challenges/${challengeId}/questions`,
        challenges: '/challenges',
      },
    };
  };

export const handleGetChallengeQuestions: HandleGetChallengeQuestions = async ({
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

  const { challengeId } = params;
  if (!challengeId) {
    return setError(
      set,
      400,
      [{ field: 'challengeId', messages: ['challengeId is missing.'] }],
      null
    );
  }

  if (!isANumber(challengeId)) {
    return setError(
      set,
      400,
      [{ field: 'challengeId', messages: ['challengeId must be a number.'] }],
      null
    );
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

  const challengeIdNumber = parseInt(challengeId);
  const challengeQuestions = await challengeService.getChallengeQuestions(
    challengeIdNumber,
    limit,
    offset
  );
  if (!isServiceMethodSuccess(challengeQuestions)) {
    return setError(
      set,
      challengeQuestions.statusCode,
      challengeQuestions.errors,
      null
    );
  }

  set.status = 200;
  return {
    success: true,
    data: challengeQuestions.data,
    message: 'Challenge questions fetched successfully.',
    links: {
      self: `/challenges/${challengeId}/questions`,
      challengeDetails: `/challenges/${challengeId}`,
      challengeParticipants: `/challenges/${challengeId}/participants`,
      challenges: '/challenges',
    },
  };
};

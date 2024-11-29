import challengeService from '../services/challenge.service';
import {
  HandleGetChallenges,
  HandleGetChallengeById,
  HandleGetChallengeParticipants,
  HandleGetChallengeQuestions,
} from '../types/challenge.type';
import { isANumber, isServiceMethodSuccess, setError } from '../utils';

export const handleGetChallenges: HandleGetChallenges = async ({ set }) => {
  set.headers['content-type'] = 'application/json';

  const challenges = await challengeService.getChallenges();
  if (!isServiceMethodSuccess(challenges)) {
    return setError(set, challenges.statusCode, challenges.errors, null);
  }

  set.status = 200;
  return {
    success: true,
    data: challenges.data,
    message: 'Challenges fetched successfully.',
    links: {
      self: '/challenges',
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

  set.status = 200;
  return {
    success: true,
    data: challenge.data,
    message: 'Challenge fetched successfully.',
    links: {
      self: `/challenges/${challengeId}`,
    },
  };
};

export const handleGetChallengeParticipants: HandleGetChallengeParticipants =
  async ({ set, params }) => {
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
    const challengeParticipants =
      await challengeService.getChallengeParticipants(challengeIdNumber);
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
      },
    };
  };

export const handleGetChallengeQuestions: HandleGetChallengeQuestions = async ({
  set,
  params
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
  const challengeQuestions =
    await challengeService.getChallengeQuestions(challengeIdNumber);
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
    },
  };
};

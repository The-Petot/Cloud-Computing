import participationsService from '../services/participation.service';
import { HandleGetParticipationById } from '../types/participation.type';
import { HandleGetUserParticipations } from '../types/user.type';
import {
  isANumber,
  isServiceMethodSuccess,
  setError,
  setFieldError,
} from '../utils';

export const handleGetParticipations: HandleGetUserParticipations = async ({
  set,
}) => {
  set.headers['content-type'] = 'application/json';

  const participationsResult = await participationsService.getParticipations();
  if (!isServiceMethodSuccess(participationsResult)) {
    return setError(
      set,
      participationsResult.statusCode,
      participationsResult.errors,
      null
    );
  }

  set.status = 200;
  return {
    success: true,
    message: 'Participations fetched successfully',
    data: participationsResult.data,
    links: {
      self: '/participations',
    },
  };
};

export const handleGetParticipationById: HandleGetParticipationById = async ({
  set,
  params,
}) => {
  set.headers['content-type'] = 'application/json';

  if (!params) {
    return setFieldError(set, 400, 'params', ['Params is missing.']);
  }

  const { participationId } = params;

  if (!participationId) {
    return setFieldError(set, 400, 'participationId', [
      'Participation ID is missing.',
    ]);
  }

  if (!isANumber(participationId)) {
    return setFieldError(set, 400, 'participationId', [
      'Participation ID must be a number.',
    ]);
  }

  const participationIdNumber = parseInt(participationId, 10);

  const participationResult = await participationsService.getParticipationById(
    participationIdNumber
  );
  if (!isServiceMethodSuccess(participationResult)) {
    return setError(
      set,
      participationResult.statusCode,
      participationResult.errors,
      null
    );
  }

  set.status = 200;
  return {
    success: true,
    message: 'Participation fetched successfully',
    data: participationResult.data,
    links: {
      self: `/participations/${participationId}`,
      participations: '/participations',
    },
  };
};

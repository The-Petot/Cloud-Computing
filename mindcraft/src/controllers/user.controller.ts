import { User } from '../types/global.type';
import userService from '../services/user.service';
import {
  Errors,
  getSessionData,
  isGetSessionDataSuccess,
  isServiceMethodSuccess,
  isVerifyJwtTokenSuccess,
  setError,
  setFieldError,
  verifyJwtToken,
} from '../utils';
import { HandleGetUserById } from '../types/user.type';

export const handleGetUserById: HandleGetUserById = async ({
  set,
  redis,
  accessToken,
  sessionId,
  params: { userId },
}) => {
  set.headers['Content-Type'] = 'application/json';
  set.headers['accept'] = 'application/json';

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


};

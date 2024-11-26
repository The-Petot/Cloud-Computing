import { User } from '../types/global.type';
import userService from '../services/user.service';
import { isServiceMethodSuccess } from '../utils';
import { HandleGetUserById, HandleGetUsers } from '../types/controller.type';
export const handleGetUserById: HandleGetUserById = async ({
  accessToken,
  refreshToken,
  sessionId,
  body,
  set,
}) => {
  if (!body) {
    set.status = 400;
    return {
        errors: [
          {
            field: 'body',
            messages: ['Request body is missing'],
          },
        ],
    };
  }

  const { userId } = body;
  if (!accessToken) {
    set.status = 401;
    return {
        errors: [
          {
            header: 'Authorization',
            messages: ['Access token is missing'],
          },
        ],
    };
  }

  if (!refreshToken) {
    set.status = 401;
    return {
        errors: [
          {
            header: 'X-Refresh-Token',
            messages: ['Refresh token is missing'],
          },
        ],
    };
  }

  if (!sessionId) {
    set.status = 401;
    return {
        errors: [
          {
            header: 'X-Session-ID',
            messages: ['Session ID is missing'],
          },
        ],
    };
  }

  const user = await userService.getUserById(userId);
  if (!isServiceMethodSuccess<Omit<User, 'password'>>(user)) {
    set.status = user.statusCode;
    return {
        errors: user.errors,
      }
  }

  set.status = 200;
  return {
    data: user.data!,
    message: 'User found',
    links: {
      self: `/users/${userId}`,
      update: `/users/${userId}`,
      challenges: `/users/${userId}/challenges`,
    }
  };
};


export const handleGetUsers: HandleGetUsers = async () => {

}
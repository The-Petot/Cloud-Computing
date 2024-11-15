import { HandleUserRegister } from './type';

export const handleUserRegister: HandleUserRegister = async ({ body, set }) => {
  const { email, password, lastName, firstName } = body;
  set.headers['content-type'] = 'application/json';

  if (!email || !password || !lastName || !firstName) {
    set.status = 400;
    return {
      error: 'Missing required fields',
      success: false,
    };
  }

  return "success"

};

import { Elysia } from 'elysia';
import {
  handleGetUserById,
  handleCreateUserChallenge,
  handleDeleteUser,
  handleGetUserChallenges,
  handleGetUserParticipations,
  handleGetUsers,
  handleUpdateUser,
  handleCreateUserParticipation,
  handleDeleteUserChallenge
} from '../controllers/user.controller';

const userRouter: Elysia = new Elysia()
  .get('/users', handleGetUsers)
  .get('/users/:userId', handleGetUserById)
  .get('/users/:userId/challenges', handleGetUserChallenges)
  .get('/users/:userId/participations', handleGetUserParticipations)
  .put('/users/:userId', handleUpdateUser)
  .post('/users/:userId/challenges', handleCreateUserChallenge)
  .post('/users/:userId/participations', handleCreateUserParticipation)
  .delete('/users/:userId', handleDeleteUser)
  .delete('/users/:userId/challenges/:challengeId', handleDeleteUserChallenge)

export default userRouter;

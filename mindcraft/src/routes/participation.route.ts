import Elysia from 'elysia';
import {
  handleGetParticipations,
  handleGetParticipationById,
} from '../controllers/participation.controller';

const participationRouter: Elysia = new Elysia()
  .get('/participation', handleGetParticipations)
  .get('/participation/:participationId', handleGetParticipationById);

export default participationRouter;

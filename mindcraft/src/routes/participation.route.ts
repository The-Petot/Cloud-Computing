import Elysia from 'elysia';
import {
  handleGetParticipations,
  handleGetParticipationById,
  
} from '../controllers/participation.controller';

const participationRouter: Elysia = new Elysia()
  .get('/participations', handleGetParticipations)
  .get('/participations/:participationId', handleGetParticipationById);

export default participationRouter;

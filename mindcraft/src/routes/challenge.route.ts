import Elysia from "elysia";
import {
  handleGetChallenges,
  handleGetChallengeById,
  handleGetChallengeParticipants,
  handleGetChallengeQuestions,
} from "../controllers/challenge.controller"

const challengeRouter: Elysia = new Elysia()
  .get('/challenges', handleGetChallenges)
  .get('/challenges/:challengeId', handleGetChallengeById)
  .get('/challenges/:challengeId/participants', handleGetChallengeParticipants)
  .get('/challenges/:challengeId/questions', handleGetChallengeQuestions)
  


export default challengeRouter;
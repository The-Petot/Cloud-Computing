import { eq } from 'drizzle-orm';
import db from '../database/db';
import {
  challengesTable,
  participantsTable,
  questionsTable,
} from '../database/schema';
import {
  Challenge,
  Participation,
  Question,
  ServiceMethodReturnType,
} from '../types/global.type';
import { handleDBError } from '../utils';

const challengeService = {
  async getChallenges(): Promise<ServiceMethodReturnType<Challenge[]>> {
    try {
      const challenges = await db.select().from(challengesTable);

      return {
        data: challenges,
      };
    } catch (error) {
      return handleDBError(error, 'Unable to get challenges');
    }
  },
  async getChallengeById(
    challengeId: number
  ): Promise<ServiceMethodReturnType<Challenge>> {
    try {
      const [challenge] = await db
        .select()
        .from(challengesTable)
        .where(eq(challengesTable.id, challengeId));

      if (!challenge) {
        return {
          statusCode: 404,
          errors: [
            {
              messages: ['Challenge not found'],
            },
          ],
        };
      }

      return {
        data: challenge,
      };
    } catch (error) {
      return handleDBError(error, 'Unable to get challenge');
    }
  },
  async getChallengeParticipants(
    challengeId: number
  ): Promise<ServiceMethodReturnType<Participation[]>> {
    try {
      const participants = await db
        .select()
        .from(participantsTable)
        .where(eq(participantsTable.challengeId, challengeId));
      return {
        data: participants,
      };
    } catch (error) {
      return handleDBError(error, 'Unable to get challenge participants');
    }
  },
  async getChallengeQuestions(
    challengeId: number
  ): Promise<ServiceMethodReturnType<Question[]>> {
    try {
      const questions = await db
        .select()
        .from(questionsTable)
        .where(eq(questionsTable.challengeId, challengeId));

      return {
        data: questions,
      };
    } catch (error) {
      return handleDBError(error, 'Unable to get challenge questions');
    }
  },
};

export default challengeService;

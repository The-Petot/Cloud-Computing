import { and, desc, eq, like, or } from 'drizzle-orm';
import db from '../database/db';
import {
  answersTable,
  challengesTable,
  participantsTable,
  questionsTable,
  usersTable,
} from '../database/schema';
import {
  Challenge,
  Participation,
  QuestionWithAnswers,
  ServiceMethodReturnType,
  User,
} from '../types/global.type';
import { Questions, handleDBError } from '../lib';

const challengeService = {
  async getChallenges(
    limit: number,
    offset: number,
    search?: string
  ): Promise<
    ServiceMethodReturnType<{ challenges: Challenge; users: User }[]>
  > {
    try {
      if (search) {
        const searchQuery = `%${search}%`;
        const challenges = await db
          .select()
          .from(challengesTable)
          .where(
            or(
              like(challengesTable.title, searchQuery),
              like(challengesTable.summary, searchQuery),
              like(challengesTable.tags, searchQuery),
              like(challengesTable.description, searchQuery)
            )
          )
          .innerJoin(usersTable, eq(challengesTable.authorId, usersTable.id))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(challengesTable.id));

        return {
          data: challenges,
        };
      }

      const challenges = await db
        .select()
        .from(challengesTable)
        .innerJoin(usersTable, eq(challengesTable.authorId, usersTable.id))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(challengesTable.id));

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
    challengeId: number,
    limit: number,
    offset: number
  ): Promise<ServiceMethodReturnType<Participation[]>> {
    try {
      const participants = await db
        .select()
        .from(participantsTable)
        .where(eq(participantsTable.challengeId, challengeId))
        .limit(limit)
        .offset(offset);

      return {
        data: participants,
      };
    } catch (error) {
      return handleDBError(error, 'Unable to get challenge participants');
    }
  },
  async getChallengeQuestions(
    challengeId: number,
    limit: number,
    offset: number
  ): Promise<ServiceMethodReturnType<QuestionWithAnswers[]>> {
    try {
      const questions: QuestionWithAnswers[] = await db
        .select()
        .from(questionsTable)
        .where(eq(questionsTable.challengeId, challengeId))
        .limit(limit)
        .offset(offset);

      for (let i = 0; i < questions.length; i++) {
        questions[i].answers = await db
          .select()
          .from(answersTable)
          .where(eq(answersTable.questionId, questions[i].id!));
      }

      return {
        data: questions,
      };
    } catch (error) {
      return handleDBError(error, 'Unable to get challenge questions');
    }
  },
  async createChallenge(
    challenge: Challenge
  ): Promise<ServiceMethodReturnType<Challenge>> {
    try {
      const [createdChallenge] = await db
        .insert(challengesTable)
        .values(challenge)
        .returning();

      return {
        data: createdChallenge,
      };
    } catch (error) {
      return handleDBError(error, 'Unable to create challenge');
    }
  },
  async createChallengeQuestions(
    challengeId: number,
    questions: Questions
  ): Promise<ServiceMethodReturnType<QuestionWithAnswers[]>> {
    try {
      const result = await db.transaction(async (tx) => {
        const questionPromises = questions.map(async (question) => {
          const [qs] = await tx
            .insert(questionsTable)
            .values({
              challengeId: challengeId,
              question: question.question,
              explanation: question.explanation,
              createdAt: new Date(),
            })
            .returning();

          const answerPromises = Object.entries(question.options).map(
            async ([key, value]) => {
              const [ans] = await tx
                .insert(answersTable)
                .values({
                  questionId: qs.id,
                  answer: value,
                  createdAt: new Date(),
                  correct: question.correct_answer === key,
                })
                .returning();

              return ans;
            }
          );

          const answers = await Promise.all(answerPromises);

          return {
            ...qs,
            answers,
          };
        });

        return await Promise.all(questionPromises);
      });

      return {
        data: result,
      };
    } catch (error) {
      return handleDBError(error, 'Unable to create questions');
    }
  },
  async updateChallenge(
    userId: number,
    challengeId: number,
    challenge: Omit<
      Challenge,
      | 'id'
      | 'updatedAt'
      | 'createdAt'
      | 'summary'
      | 'authorId'
      | 'totalQuestions'
      | 'createdAt'
      | 'updatedAt'
    >
  ): Promise<ServiceMethodReturnType<Challenge>> {
    try {
      const [updatedChallenge] = await db
        .update(challengesTable)
        .set({ ...challenge, updatedAt: new Date() })
        .where(
          and(
            eq(challengesTable.id, challengeId),
            eq(challengesTable.authorId, userId)
          )
        )
        .returning();

      return {
        data: updatedChallenge,
      };
    } catch (error) {
      return handleDBError(error, 'Unable to update challenge');
    }
  },
};

export default challengeService;

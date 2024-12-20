import { and, desc, eq } from 'drizzle-orm';
import db from '../database/db';
import {
  challengesTable,
  participantsTable,
  usersTable,
} from '../database/schema';
import {
  Challenge,
  Participation,
  ServiceMethodReturnType,
  User,
} from '../types/global.type';
import { handleDBError } from '../lib';

const userService = {
  async getUserById(
    userId: number
  ): Promise<ServiceMethodReturnType<Omit<User, 'password'>>> {
    try {
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId));

      if (!user) {
        return {
          statusCode: 404,
          errors: [
            {
              messages: ['User not found'],
            },
          ],
        };
      }
      const { password, ...userData } = user;

      return {
        data: userData,
      };
    } catch (error) {
      return handleDBError(error, 'Unable to get user');
    }
  },
  async getUsers(
    limit: number,
    offset: number
  ): Promise<
    ServiceMethodReturnType<
      {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        profileImgUrl: string;
        totalScore: number;
        currentRank: number;
      }[]
    >
  > {
    try {
      const users = await db
        .select({
          id: usersTable.id,
          firstName: usersTable.firstName,
          lastName: usersTable.lastName,
          email: usersTable.email,
          profileImgUrl: usersTable.profileImgUrl!,
          totalScore: usersTable.totalScore,
          currentRank: usersTable.currentRank,
        })
        .from(usersTable)
        .limit(limit)
        .offset(offset);

      return {
        data: users,
      };
    } catch (error) {
      return handleDBError(error, 'Unable to get users');
    }
  },
  async updateUser(
    userId: number,
    newUserData: Partial<User>
  ): Promise<ServiceMethodReturnType<User>> {
    try {
      const [user] = await db
        .update(usersTable)
        .set({ ...newUserData, updatedAt: new Date() })
        .where(eq(usersTable.id, userId))
        .returning();

      return {
        data: user,
      };
    } catch (error) {
      return handleDBError(error, 'Unable to update user');
    }
  },
  async deleteUser(
    userId: number
  ): Promise<ServiceMethodReturnType<{ message: string }>> {
    try {
      const deletedUser = await db
        .delete(usersTable)
        .where(eq(usersTable.id, userId))
        .returning();

      if (deletedUser.length === 0) {
        return {
          statusCode: 404,
          errors: [
            {
              messages: ['User not found'],
            },
          ],
        };
      }

      return {
        data: {
          message: 'User deleted successfully.',
        },
      };
    } catch (error) {
      return handleDBError(error, 'Unable to delete user');
    }
  },
  async getUserChallenges(
    userId: number,
    limit: number,
    offset: number
  ): Promise<ServiceMethodReturnType<Challenge[]>> {
    try {
      const challenges = await db
        .select()
        .from(challengesTable)
        .where(eq(challengesTable.authorId, userId))
        .limit(limit)
        .offset(offset);

      return {
        data: challenges,
      };
    } catch (error) {
      return handleDBError(error, 'Unable to get user challenges');
    }
  },
  async getUserParticipations(
    userId: number,
    limit: number,
    offset: number
  ): Promise<ServiceMethodReturnType<Participation[]>> {
    try {
      const participations = await db
        .select()
        .from(participantsTable)
        .where(eq(participantsTable.participantId, userId))
        .limit(limit)
        .offset(offset);

      return {
        data: participations,
      };
    } catch (error) {
      return handleDBError(error, 'Unable to get user participations');
    }
  },
  async createUserParticipation(
    userId: number,
    challengeId: number,
    score: number
  ): Promise<ServiceMethodReturnType<Participation>> {
    try {
      const [participation] = await db
        .insert(participantsTable)
        .values({
          participantId: userId,
          challengeId,
          score,
          createdAt: new Date(),
        })
        .returning();

      return {
        data: participation,
      };
    } catch (error) {
      return handleDBError(error, 'Unable to create user participation');
    }
  },
  async deleteUserChallenge(
    userId: number,
    challengeId: number
  ): Promise<ServiceMethodReturnType<{ message: string }>> {
    try {
      const deletedChallenge = await db
        .delete(challengesTable)
        .where(
          and(
            eq(challengesTable.authorId, userId),
            eq(challengesTable.id, challengeId)
          )
        )
        .returning();

      if (deletedChallenge.length === 0) {
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
        data: {
          message: 'Challenge deleted successfully.',
        },
      };
    } catch (error) {
      return handleDBError(error, 'Unable to delete user challenge');
    }
  },
  async updateUserScore(
    userId: number,
    score: number
  ): Promise<ServiceMethodReturnType<{ newScore: number }>> {
    try {
      const [user] = await db
        .select({ totalScore: usersTable.totalScore })
        .from(usersTable)
        .where(eq(usersTable.id, userId));

      const [updatedUserScore] = await db
        .update(usersTable)
        .set({ totalScore: user.totalScore + score, updatedAt: new Date() })
        .where(eq(usersTable.id, userId))
        .returning({ totalScore: usersTable.totalScore });

      const users = await db
        .select()
        .from(usersTable)
        .orderBy(desc(usersTable.totalScore));
      const userIndex = users.findIndex((u) => u.id === userId);

      let startIndex = 0;
      for (let i = 0; i < users.length; i++) {
        if (users[i].totalScore <= updatedUserScore.totalScore) {
          await db
            .update(usersTable)
            .set({ currentRank: i + 1, updatedAt: new Date() })
            .where(eq(usersTable.id, userId))
            .returning();
          startIndex = i + 1;
          break;
        }
      }

      await db.transaction(async (trx) => {
        for (let i = startIndex; i < users.length; i++) {
          await trx
            .update(usersTable)
            .set({ currentRank: i + 1, updatedAt: new Date() })
            .where(eq(usersTable.id, users[i].id))
            .returning();
        }
      });

      return {
        data: {
          newScore: updatedUserScore.totalScore,
        },
      };
    } catch (error) {
      return handleDBError(error, 'Unable to update user score');
    }
  },
};

export default userService;

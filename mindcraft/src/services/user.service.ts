import { and, eq } from 'drizzle-orm';
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
  async getUsers(): Promise<
    ServiceMethodReturnType<
      {
        firstName: string;
        lastName: string;
        email: string;
        profileImgUrl: string;
      }[]
    >
  > {
    try {
      const users = await db.select().from(usersTable);

      return {
        data: users.map((user) => ({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImgUrl: user.profileImgUrl!,
        })),
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
        .set(newUserData)
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
    userId: number
  ): Promise<ServiceMethodReturnType<Challenge[]>> {
    try {
      const challenges = await db
        .select()
        .from(challengesTable)
        .where(eq(challengesTable.authorId, userId));

      return {
        data: challenges,
      };
    } catch (error) {
      return handleDBError(error, 'Unable to get user challenges');
    }
  },
  async getUserParticipations(
    userId: number
  ): Promise<ServiceMethodReturnType<Participation[]>> {
    try {
      const participations = await db
        .select()
        .from(participantsTable)
        .where(eq(participantsTable.participantId, userId));

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
};

export default userService;

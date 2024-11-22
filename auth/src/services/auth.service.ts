import { eq } from 'drizzle-orm';
import db from '../database/db';
import { usersTable } from '../database/schema';
import { ServiceMethodReturnType } from './service.type';
import { User } from '../global.types';

const userService = {
  async create(
    user: User
  ): Promise<ServiceMethodReturnType<{ userId: number }>> {
    try {
      const previousUser = await db
        .select({ userId: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, user.email));

      if (previousUser.length > 0) {
        return { error: 'User already exists', statusCode: 409 };
      }

      const [newUser] = await db
        .insert(usersTable)
        .values(user)
        .returning({ userId: usersTable.id });

      if (newUser === undefined) {
        return { error: 'Failed to create user', statusCode: 500 };
      }

      return { data: { userId: newUser.userId } };
    } catch (error) {
      return { error: 'An unexpected error occurred', statusCode: 500 };
    }
  },
  async getTotalusers(): Promise<
    ServiceMethodReturnType<{ totalUser: number }>
  > {
    try {
      const users = await db.select().from(usersTable);

      if (users.length === 0) {
        return { data: { totalUser: 0 } };
      }

      return { data: { totalUser: users.length } };
    } catch (error) {
      return { error: 'An unexpected error occurred', statusCode: 500 };
    }
  },
  async getUserByEmail(email: string): Promise<
    ServiceMethodReturnType<{
      id: number;
      password: string;
      email: string;
      firstName: string;
      lastName: string;
      totalScore: number;
      currentRank: number;
    }>
  > {
    try {
      const [user] = await db
        .select({
          id: usersTable.id,
          password: usersTable.password,
          email: usersTable.email,
          firstName: usersTable.firstName,
          lastName: usersTable.lastName,
          totalScore: usersTable.totalScore,
          currentRank: usersTable.currentRank,
        })
        .from(usersTable)
        .where(eq(usersTable.email, email));

      if (user === undefined) {
        return { error: 'User not found', statusCode: 404 };
      }

      return { data: user };
    } catch (error) {
      return { error: 'An unexpected error occurred', statusCode: 500 };
    }
  },
  async getUserById(userId: number): Promise<
    ServiceMethodReturnType<{
      id: number;
      password: string;
      email: string;
      firstName: string;
      lastName: string;
      totalScore: number;
      currentRank: number;
    }>
  > {
    try {
      const [user] = await db
        .select({
          id: usersTable.id,
          password: usersTable.password,
          email: usersTable.email,
          firstName: usersTable.firstName,
          lastName: usersTable.lastName,
          totalScore: usersTable.totalScore,
          currentRank: usersTable.currentRank,
          createdAt: usersTable.createdAt,
          updatedAt: usersTable.updatedAt,
        })
        .from(usersTable)
        .where(eq(usersTable.id, userId));

      if (user === undefined) {
        return { error: 'User not found', statusCode: 404 };
      }

      return { data: user };
    } catch (error) {
      return { error: 'An unexpected error occurred', statusCode: 500 };
    }
  },
};

export default userService;

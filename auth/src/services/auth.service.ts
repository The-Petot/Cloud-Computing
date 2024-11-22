import { eq } from 'drizzle-orm';
import { User } from '../controllers/controller.type';
import db from '../database/db';
import { usersTable } from '../database/schema';
import { ServiceMethodReturnType } from './service.type';

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
  async getUserByEmail(
    email: string
  ): Promise<ServiceMethodReturnType<{ password: string; id: number }>> {
    try {
      const [user] = await db
        .select({ id: usersTable.id, password: usersTable.password })
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
};

export default userService;

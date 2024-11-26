import { eq } from 'drizzle-orm';
import db from '../database/db';
import { usersTable } from '../database/schema';
import { ServiceMethodReturnType, User } from '../types/global.type';

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
      return {
        statusCode: 500,
        errors: [
          {
            messages: [`Failed to get user: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`],
          },
        ],
      };
    }
  },
};

export default userService;

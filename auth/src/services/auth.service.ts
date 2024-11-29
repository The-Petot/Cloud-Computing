import { eq } from 'drizzle-orm';
import db from '../database/db';
import { usersTable } from '../database/schema';
import { ServiceMethodReturnType } from '../types/service.type';
import { User } from '../types/global.types';

const userService = {
  async create(user: User): Promise<ServiceMethodReturnType<User>> {
    try {
      const [existingUser] = await db
        .select({ userId: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, user.email));

      if (existingUser) return createError(409, 'User already exists');

      const [newUser] = await db.insert(usersTable).values(user).returning();

      return newUser
        ? { data: newUser }
        : createError(500, 'Error creating user');
    } catch (error) {
      return handleDbError(error);
    }
  },

  async getTotalUsers(): Promise<
    ServiceMethodReturnType<{ totalUser: number }>
  > {
    try {
      const userCount = await db.select().from(usersTable);

      return { data: { totalUser: userCount.length } };
    } catch (error) {
      return handleDbError(error);
    }
  },

  async getUserByEmail(email: string): Promise<ServiceMethodReturnType<User>> {
    try {
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email));

      return user ? { data: user } : createError(404, 'User not found');
    } catch (error) {
      return handleDbError(error);
    }
  },

  async getUserById(userId: number): Promise<ServiceMethodReturnType<User>> {
    try {
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId));

      return user ? { data: user } : createError(404, 'User not found');
    } catch (error) {
      return handleDbError(error);
    }
  },

  async toggleTwoFactorAuth(
    userId: number,
    enable: boolean,
    secret?: string
  ): Promise<ServiceMethodReturnType<{ userId: number }>> {
    try {
      const updateFields = enable
        ? { twoFactorEnabled: true, twoFactorSecret: secret }
        : { twoFactorEnabled: false, twoFactorSecret: null };

      const [updatedUser] = await db
        .update(usersTable)
        .set(updateFields)
        .where(eq(usersTable.id, userId))
        .returning({ userId: usersTable.id });

      return updatedUser
        ? { data: { userId: updatedUser.userId } }
        : createError(404, 'User not found');
    } catch (error) {
      return handleDbError(error);
    }
  },

  async upsert(user: User): Promise<ServiceMethodReturnType<User>> {
    try {
      const [newUser] = await db
        .insert(usersTable)
        .values(user)
        .onConflictDoUpdate({
          target: [usersTable.email],
          set: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImgUrl: user.profileImgUrl,
            updatedAt: new Date(),
          },
        })
        .returning();
      
      return {
        data: newUser,
      }
    } catch (error) {
      return handleDbError(error);
    }
  },
};

// Utility Functions
const createError = (statusCode: number, message: string) => ({
  errors: [{ messages: [message] }],
  statusCode,
});

const handleDbError = (error: unknown) => ({
  errors: [
    {
      messages: [
        `An unexpected error occurred: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      ],
    },
  ],
  statusCode: 500,
});

export default userService;

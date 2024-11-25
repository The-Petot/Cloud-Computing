import { eq } from 'drizzle-orm';
import db from '../database/db';
import { usersTable } from '../database/schema';
const userService = {
    async create (user) {
        try {
            const previousUser = await db.select({
                userId: usersTable.id
            }).from(usersTable).where(eq(usersTable.email, user.email));
            if (previousUser.length > 0) {
                return {
                    error: 'User already exists',
                    statusCode: 409
                };
            }
            const [newUser] = await db.insert(usersTable).values(user).returning({
                userId: usersTable.id
            });
            if (newUser === undefined) {
                return {
                    error: 'Failed to create user',
                    statusCode: 500
                };
            }
            return {
                data: {
                    userId: newUser.userId
                }
            };
        } catch (error) {
            return {
                error: 'An unexpected error occurred',
                statusCode: 500
            };
        }
    },
    async getTotalusers () {
        try {
            const users = await db.select().from(usersTable);
            if (users.length === 0) {
                return {
                    data: {
                        totalUser: 0
                    }
                };
            }
            return {
                data: {
                    totalUser: users.length
                }
            };
        } catch (error) {
            return {
                error: 'An unexpected error occurred',
                statusCode: 500
            };
        }
    },
    async getUserByEmail (email) {
        try {
            const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
            if (user === undefined) {
                return {
                    error: 'User not found',
                    statusCode: 404
                };
            }
            return {
                data: user
            };
        } catch (error) {
            return {
                error: 'An unexpected error occurred',
                statusCode: 500
            };
        }
    },
    async getUserById (userId) {
        try {
            const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
            if (user === undefined) {
                return {
                    error: 'User not found',
                    statusCode: 404
                };
            }
            return {
                data: user
            };
        } catch (error) {
            return {
                error: 'An unexpected error occurred',
                statusCode: 500
            };
        }
    },
    async enableTwoFactorAuth (userId, secret) {
        try {
            const [updatedUser] = await db.update(usersTable).set({
                twoFactorEnabled: true,
                twoFactorSecret: secret
            }).where(eq(usersTable.id, userId)).returning({
                userId: usersTable.id
            });
            if (updatedUser === undefined) {
                return {
                    error: 'User not found',
                    statusCode: 404
                };
            }
            return {
                data: {
                    userId: updatedUser.userId
                }
            };
        } catch (error) {
            return {
                error: 'An unexpected error occurred',
                statusCode: 500
            };
        }
    },
    async disableTwoFactorAuth (userId) {
        try {
            const [updatedUser] = await db.update(usersTable).set({
                twoFactorEnabled: false,
                twoFactorSecret: null
            }).where(eq(usersTable.id, userId)).returning({
                userId: usersTable.id
            });
            if (updatedUser === undefined) {
                return {
                    error: 'User not found',
                    statusCode: 404
                };
            }
            return {
                data: {
                    userId: updatedUser.userId
                }
            };
        } catch (error) {
            return {
                error: 'An unexpected error occurred',
                statusCode: 500
            };
        }
    }
};
export default userService;

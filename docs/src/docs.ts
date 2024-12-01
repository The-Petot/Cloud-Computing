import swagger from '@elysiajs/swagger';
import { Elysia, t } from 'elysia';

const app = new Elysia()

  .use(
    swagger({
      documentation: {
        info: {
          title: 'Mindcraft API',
          description: 'This is the API documentation for Mindcraft',
          version: '1.0.0',
        },
      },
    })
  )

  .group('/api/v1/auth', (auth) => {
    auth

      .post('/register', () => {}, {
        detail: {
          tags: ['Auth'],
          summary: 'User Registration',
          description: 'Registers a new user and returns the user ID.',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', example: 'user@example.com' },
                    password: {
                      type: 'string',
                      example: 'password123',
                      description: 'At least 8 characters long',
                    },
                    firstName: { type: 'string', example: 'John' },
                    lastName: { type: 'string', example: 'Doe' },
                  },
                  required: ['email', 'password', 'firstName', 'lastName'],
                },
              },
            },
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          userId: { type: 'number', example: 1 },
                        },
                        required: ['userId'],
                      },
                      message: {
                        type: 'string',
                        example: 'User registered successfully.',
                      },
                      links: {
                        type: 'object',
                        properties: {
                          self: { type: 'string', example: '/users/1' },
                          login: { type: 'string', example: '/auth/login' },
                          logout: { type: 'string', example: '/auth/logout' },
                          tokenRefresh: {
                            type: 'string',
                            example: '/auth/refresh',
                          },
                          toggleTwoFactorAuth: {
                            type: 'string',
                            example: '/auth/two-factor',
                          },
                        },
                        required: [
                          'self',
                          'login',
                          'logout',
                          'tokenRefresh',
                          'toggleTwoFactorAuth',
                        ],
                      },
                    },
                    required: ['success', 'data', 'message', 'links'],
                  },
                },
              },
            },
            400: {
              description: 'Bad Request',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            field: { type: 'string' },
                            messages: {
                              type: 'array',
                              items: { type: 'string' },
                            },
                          },
                          required: ['messages', 'field'],
                        },
                        example: [
                          {
                            field: 'email',
                            messages: ['Email is not valid.'],
                          },
                        ],
                      },
                    },
                    required: ['success', 'errors'],
                  },
                },
              },
            },
            409: {
              description: 'Conflict',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            messages: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['User already exists.'],
                            },
                            field: { type: 'string', example: 'email' },
                          },
                          required: ['messages'],
                        },
                      },
                    },
                    required: ['success', 'errors'],
                  },
                },
              },
            },
            500: {
              description: 'Internal Server Error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            messages: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['An unexpected error occurred.'],
                            },
                          },
                          required: ['messages'],
                        },
                      },
                    },
                    required: ['success', 'errors'],
                  },
                },
              },
            },
          },
        },
      })

      .post('/login', () => {}, {
        detail: {
          tags: ['Auth'],
          summary: 'User Login',
          description: 'Logs in a user and returns access and refresh tokens.',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', example: 'user@example.com' },
                    password: { type: 'string', example: 'password123' },
                    token: {
                      type: 'string',
                      example: '123456',
                      description:
                        "The user's two-factor authentication token from the authenticator app.",
                      nullable: true,
                    },
                  },
                  required: ['email', 'password'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'User logged in successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          id: { type: 'number', example: 1 },
                          email: {
                            type: 'string',
                            example: 'user@example.com',
                          },
                          firstName: { type: 'string', example: 'John' },
                          lastName: { type: 'string', example: 'Doe' },
                          totalScore: { type: 'number', example: 100 },
                          currentRank: { type: 'number', example: 100 },
                          profileImgUrl: {
                            type: 'string',
                            example: 'http://example.com/profile.jpg',
                          },
                          twoFactorSecret: {
                            type: 'string',
                            example: 'secret',
                            nullable: true,
                          },
                          twoFactorEnabled: { type: 'boolean', example: true },
                          notificationEnabled: {
                            type: 'boolean',
                            example: true,
                          },
                          createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2023-01-01 00:00:00',
                          },
                          updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2023-01-01 00:00:00',
                          },
                        },
                        required: [
                          'id',
                          'email',
                          'firstName',
                          'lastName',
                          'totalScore',
                          'currentRank',
                          'profileImgUrl',
                          'twoFactorEnabled',
                          'notificationEnabled',
                          'createdAt',
                          'updatedAt',
                        ],
                      },
                      message: {
                        type: 'string',
                        example: 'User logged in successfully.',
                      },
                      links: {
                        type: 'object',
                        properties: {
                          self: { type: 'string', example: '/users/1' },
                          logout: { type: 'string', example: '/auth/logout' },
                          tokenRefresh: {
                            type: 'string',
                            example: '/auth/refresh',
                          },
                          toggleTwoFactorAuth: {
                            type: 'string',
                            example: '/auth/two-factor',
                          },
                        },
                        required: [
                          'self',
                          'logout',
                          'toggleTwoFactorAuth',
                          'tokenRefresh',
                        ],
                      },
                    },
                    required: ['success', 'data', 'message', 'links'],
                  },
                },
              },
              headers: {
                Authorization: {
                  description: 'Access token',
                  schema: {
                    type: 'string',
                    example: 'Bearer accessToken123',
                  },
                  required: true,
                },
                'X-Refresh-Token': {
                  description: 'Refresh token',
                  schema: {
                    type: 'string',
                    example: 'refreshToken',
                  },
                },
                'X-Session-Id': {
                  description: 'Session ID',
                  schema: {
                    type: 'string',
                    example: 'sessionId',
                  },
                },
              },
            },
            400: {
              description: 'Bad Request',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            field: { type: 'string', example: 'password' },
                            messages: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['Password is missing.'],
                            },
                          },
                          required: ['field', 'messages'],
                        },
                        example: [
                          {
                            field: 'password',
                            messages: ['Password is missing.'],
                          },
                          {
                            field: 'email',
                            messages: ['Email is missing.'],
                          },
                        ],
                      },
                    },
                    required: ['success', 'errors'],
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            messages: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['Incorrect password.'],
                            },
                            field: { type: 'string', example: 'password' },
                          },
                          required: ['messages', 'field'],
                        },
                      },
                    },
                    required: ['success', 'errors'],
                  },
                },
              },
            },
            500: {
              description: 'Internal Server Error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            messages: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['An unexpected error occurred.'],
                            },
                          },
                          required: ['messages'],
                        },
                      },
                    },
                    required: ['success', 'errors'],
                  },
                },
              },
            },
          },
        },
      })

      .post('/logout', () => {}, {
        detail: {
          tags: ['Auth'],
          summary: 'User Logout',
          description: 'Logs out a user and invalidates the session.',
          parameters: [
            {
              in: 'header',
              name: 'Authorization',
              schema: {
                type: 'string',
                example: 'Bearer accessToken123',
              },
              required: true,
            },
            {
              in: 'header',
              name: 'X-Session-Id',
              schema: {
                type: 'string',
                example: 'sessionId',
              },
              required: true,
            },
          ],
          responses: {
            200: {
              description: 'User logged out successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: {
                        type: 'string',
                        example: 'User logged out successfully.',
                      },
                      links: {
                        type: 'object',
                        properties: {
                          login: { type: 'string', example: '/auth/login' },
                          register: {
                            type: 'string',
                            example: '/auth/register',
                          },
                          enableTwoFactorAuth: {
                            type: 'string',
                            example: '/auth/two-factor',
                          },
                          tokenRefresh: {
                            type: 'string',
                            example: '/auth/refresh',
                          },
                        },
                        required: [
                          'login',
                          'register',
                          'enableTwoFactorAuth',
                          'tokenRefresh',
                        ],
                      },
                    },
                    required: ['success', 'message', 'links'],
                  },
                },
              },
            },
            400: {
              description: 'Bad Request',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            messages: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['Access token is missing.'],
                            },
                            field: { type: 'string', example: 'accessToken' },
                          },
                          required: ['messages'],
                        },
                      },
                    },
                    required: ['success', 'errors'],
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            messages: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['Access token is not valid.'],
                            },
                            field: { type: 'string', example: 'accessToken' },
                          },
                          required: ['messages'],
                        },
                      },
                    },
                    required: ['success', 'errors'],
                  },
                },
              },
            },
            500: {
              description: 'Internal Server Error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            messages: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['An unexpected error occurred.'],
                            },
                          },
                          required: ['messages'],
                        },
                      },
                    },
                    required: ['success', 'errors'],
                  },
                },
              },
            },
          },
        },
      })

      .post('/refresh', () => {}, {
        detail: {
          tags: ['Auth'],
          summary: 'Token Refresh',
          description: 'Refreshes the access token using the refresh token.',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    userId: {
                      type: 'number',
                      example: 1,
                    },
                  },
                  required: ['userId'],
                },
              },
            },
          },
          parameters: [
            {
              in: 'header',
              name: 'X-Refresh-Token',
              schema: {
                type: 'string',
                example: 'refreshToken123',
              },
              required: true,
            },
            {
              in: 'header',
              name: 'X-Session-Id',
              schema: {
                type: 'string',
                example: 'sessionId',
              },
              required: true,
            },
          ],
          responses: {
            200: {
              description: 'Token refreshed successfully',
              headers: {
                Authorization: {
                  description: 'New access token',
                  schema: {
                    type: 'string',
                    example: 'Bearer newAccessToken',
                  },
                  required: true,
                },
                'X-Refresh-Token': {
                  description: 'New refresh token',
                  schema: {
                    type: 'string',
                    example: 'newRefreshToken',
                  },
                  required: true,
                },
                'X-Session-Id': {
                  description: 'New session ID',
                  schema: {
                    type: 'string',
                    example: 'sessionId',
                  },
                  required: true,
                },
              },
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },

                      message: {
                        type: 'string',
                        example: 'Token refreshed successfully.',
                      },
                      links: {
                        type: 'object',
                        properties: {
                          self: { type: 'string', example: '/users/1' },
                          logout: { type: 'string', example: '/auth/logout' },
                          tokenRefresh: {
                            type: 'string',
                            example: '/auth/refresh',
                          },
                          toggleTwoFactorAuth: {
                            type: 'string',
                            example: '/auth/two-factor',
                          },
                        },
                        required: [
                          'self',
                          'logout',
                          'tokenRefresh',
                          'toggleTwoFactorAuth',
                        ],
                      },
                    },
                    required: ['success', 'message'],
                  },
                },
              },
            },
            400: {
              description: 'Bad Request',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            messages: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['Refresh token is missing.'],
                            },
                            field: { type: 'string', example: 'refreshToken' },
                          },
                          required: ['messages', 'field'],
                        },
                      },
                    },
                    required: ['success', 'errors'],
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            messages: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['Refresh token is not valid.'],
                            },
                            field: { type: 'string', example: 'refreshToken' },
                          },
                          required: ['messages', 'field'],
                        },
                      },
                    },
                    required: ['success', 'errors'],
                  },
                },
              },
            },
            500: {
              description: 'Internal Server Error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            messages: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['An unexpected error occurred.'],
                            },
                          },
                          required: ['messages'],
                        },
                      },
                    },
                    required: ['success', 'errors'],
                  },
                },
              },
            },
          },
        },
      })

      .put('/two-factor', () => {}, {
        detail: {
          tags: ['Auth'],
          summary: 'Toggle Two-Factor Authentication',
          description:
            'Enables or disables two-factor authentication for a user.',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    userId: { type: 'number', example: 1 },
                  },
                  required: ['userId'],
                },
              },
            },
          },
          parameters: [
            {
              in: 'query',
              name: 'enable',
              schema: {
                type: 'boolean',
                example: true,
              },
              required: true,
            },
            {
              in: 'header',
              name: 'Authorization',
              schema: {
                type: 'string',
                example: 'Bearer accessToken123',
              },
              required: true,
            },
            {
              in: 'header',
              name: 'X-Session-Id',
              schema: {
                type: 'string',
                example: 'sessionId',
              },
              required: true,
            },
          ],
          responses: {
            200: {
              description:
                'Two-factor authentication status updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: {
                        type: 'string',
                        example:
                          'Two-factor authentication status updated successfully.',
                      },
                      links: {
                        type: 'object',
                        properties: {
                          self: { type: 'string', example: '/users/1' },
                          logout: { type: 'string', example: '/auth/logout' },
                          tokenRefresh: {
                            type: 'string',
                            example: '/auth/refresh',
                          },
                          toggleTwoFactorAuth: {
                            type: 'string',
                            example: '/auth/two-factor',
                          },
                        },
                        required: [
                          'self',
                          'logout',
                          'tokenRefresh',
                          'toggleTwoFactorAuth',
                        ],
                      },
                    },
                    required: ['success', 'message'],
                  },
                },
              },
            },
            400: {
              description: 'Bad Request',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            messages: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['User ID is missing.'],
                            },
                            field: { type: 'string', example: 'userId' },
                          },
                          required: ['messages', 'field'],
                        },
                      },
                    },
                    required: ['success', 'errors'],
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            messages: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['Access token is not valid.'],
                            },
                            field: { type: 'string', example: 'accessToken' },
                          },
                          required: ['messages', 'field'],
                        },
                      },
                    },
                    required: ['success', 'errors'],
                  },
                },
              },
            },
            500: {
              description: 'Internal Server Error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            messages: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['An unexpected error occurred.'],
                            },
                          },
                          required: ['messages'],
                        },
                      },
                    },
                    required: ['success', 'errors'],
                  },
                },
              },
            },
          },
        },
      })
      .post('/oauth/google', () => {}, {
        detail: {
          tags: ['Auth'],
          summary: 'Signin or Signup with Google',
          description:
            'Signin or Signup with Google and returns the user data.',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: {
                      type: 'number',
                      example: 1,
                      description: 'Google IdToken.',
                    },
                  },
                  required: ['token'],
                },
              },
            },
          },
          responses: {
            200: {
              description:
                'User logged in or registered successfully with Google',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          id: { type: 'number', example: 1 },
                          email: {
                            type: 'string',
                            example: 'user@example.com',
                          },
                          firstName: { type: 'string', example: 'John' },
                          lastName: { type: 'string', example: 'Doe' },
                          totalScore: { type: 'number', example: 100 },
                          currentRank: { type: 'number', example: 100 },
                          profileImgUrl: {
                            type: 'string',
                            example: 'http://example.com/profile.jpg',
                          },
                          twoFactorSecret: {
                            type: 'string',
                            example: 'secret',
                            nullable: true,
                          },
                          twoFactorEnabled: { type: 'boolean', example: true },
                          notificationEnabled: {
                            type: 'boolean',
                            example: true,
                          },
                          createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2023-01-01 00:00:00',
                          },
                          updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2023-01-01 00:00:00',
                          },
                        },
                        required: [
                          'id',
                          'email',
                          'firstName',
                          'lastName',
                          'totalScore',
                          'currentRank',
                          'profileImgUrl',
                          'twoFactorEnabled',
                          'notificationEnabled',
                          'createdAt',
                          'updatedAt',
                        ],
                      },
                      message: {
                        type: 'string',
                        example: 'User logged in successfully.',
                      },
                      links: {
                        type: 'object',
                        properties: {
                          self: { type: 'string', example: '/users/1' },
                          logout: { type: 'string', example: '/auth/logout' },
                          tokenRefresh: {
                            type: 'string',
                            example: '/auth/refresh',
                          },
                          toggleTwoFactorAuth: {
                            type: 'string',
                            example: '/auth/two-factor',
                          },
                        },
                        required: [
                          'self',
                          'logout',
                          'tokenRefresh',
                          'toggleTwoFactorAuth',
                        ],
                      },
                    },
                    required: ['success', 'message'],
                  },
                },
              },
              headers: {
                Authorization: {
                  description: 'Access token',
                  schema: {
                    type: 'string',
                    example: 'Bearer accessToken123',
                  },
                  required: true,
                },
                'X-Refresh-Token': {
                  description: 'Refresh token',
                  schema: {
                    type: 'string',
                    example: 'refreshToken',
                  },
                },
                'X-Session-Id': {
                  description: 'Session ID',
                  schema: {
                    type: 'string',
                    example: 'sessionId',
                  },
                },
              },
            },
            400: {
              description: 'Bad Request',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            messages: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['Token is missing.'],
                            },
                            field: { type: 'string', example: 'token' },
                          },
                          required: ['messages', 'field'],
                        },
                      },
                    },
                    required: ['success', 'errors'],
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            messages: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['Unable to get Google user.'],
                            },
                            field: { type: 'string', example: 'token' },
                          },
                          required: ['messages', 'field'],
                        },
                      },
                    },
                    required: ['success', 'errors'],
                  },
                },
              },
            },
            500: {
              description: 'Internal Server Error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      errors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            messages: {
                              type: 'array',
                              items: { type: 'string' },
                              example: ['An unexpected error occurred.'],
                            },
                          },
                          required: ['messages'],
                        },
                      },
                    },
                    required: ['success', 'errors'],
                  },
                },
              },
            },
          },
        },
      });
    return auth;
  })

  .group('/api/v1/users', (users) => {
    users
      .get('/', () => {}, {
        detail: {
          tags: ['Users'],
        },
      })
      .get('/:userId', () => {}, {
        detail: {
          tags: ['Users'],
        },
      })
      .get('/:userId/challenges', () => {}, {
        detail: {
          tags: ['Users'],
        },
      })
      .get('/:userId/participations', () => {}, {
        detail: {
          tags: ['Users'],
        },
      })
      .put('/:userId', () => {}, {
        detail: {
          tags: ['Users'],
        },
      })
      .delete('/:userId', () => {}, {
        detail: {
          tags: ['Users'],
        },
      })
      .delete('/:userId/challenges/:challengeId', () => {}, {
        detail: {
          tags: ['Users'],
        },
      });
    return users;
  })
  .group('/api/v1/challenges', (challenges) => {
    challenges
      .get('/', () => {}, {
        detail: {
          tags: ['Challenges'],
        },
      })
      .get('/:challengeId', () => {}, {
        detail: {
          tags: ['Challenges'],
        },
      })
      .get('/:challengeId/participants', () => {}, {
        detail: {
          tags: ['Challenges'],
        },
      })
      .get('/:challengeId/questions', () => {}, {
        detail: {
          tags: ['Challenges'],
        },
      })
      .put('/:challengeId', () => {}, {
        detail: {
          tags: ['Challenges'],
        },
      });
    return challenges;
  })
  .group('/api/v1/participations', (participations) => {
    participations
      .get('/', () => {}, {
        detail: {
          tags: ['Participations'],
        },
      })
      .get('/:participationId', () => {}, {
        detail: {
          tags: ['Participations'],
        },
      });
    return participations;
  })
  .listen(8080, () => {
    console.log('Server is running on port 8080');
  });

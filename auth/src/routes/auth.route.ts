import { Elysia } from 'elysia';
import {
  handleUserRegister,
  handleUserLogin,
  handleTokenRefresh,
  handleUserLogout,
} from '../controllers/auth.controller';

const authRouter: Elysia = new Elysia()
  .post('/register', handleUserRegister, {
    detail: {
      summary: 'User Registration',
      description: 'API endpoint for registering a new user.',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'user@example.com',
                  description: 'Email address of the new user',
                },
                password: {
                  type: 'string',
                  example: 'strongPassword123',
                  description:
                    'Password for the new user. Must be at least 8 characters long.',
                },
                firstName: {
                  type: 'string',
                  example: 'John',
                  description: 'First name of the user',
                },
                lastName: {
                  type: 'string',
                  example: 'Doe',
                  description: 'Last name of the user',
                },
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
                  data: {
                    type: 'object',
                    properties: {
                      userId: {
                        type: 'number',
                        example: 123,
                        description: 'Unique ID of the newly created user',
                      },
                    },
                  },
                  message: {
                    type: 'string',
                    example: 'User registered successfully',
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Validation error or missing required fields',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Missing required fields',
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'An unexpected error occurred',
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  .post('/login', handleUserLogin, {
    detail: {
      summary: 'User Login',
      description: 'API endpoint for user authentication and session creation.',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'user@example.com',
                  description: 'Registered email address of the user',
                },
                password: {
                  type: 'string',
                  example: 'userPassword123',
                  description: 'Password associated with the user account',
                },
              },
              required: ['email', 'password'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'User authenticated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'object',
                    properties: {
                      userId: {
                        type: 'number',
                        example: 123,
                        description: 'Unique ID of the authenticated user',
                      },
                    },
                  },
                  message: {
                    type: 'string',
                    example: 'User logged in successfully',
                  },
                },
              },
            },
          },
          headers: {
            authorization: {
              schema: {
                type: 'string',
                example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI...',
                description: 'Access token for user session',
              },
            },
            'X-Refresh-Token': {
              schema: {
                type: 'string',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                description: 'Refresh token for renewing access',
              },
            },
            'X-Session-Id': {
              schema: {
                type: 'string',
                example: 'session-id-12345',
                description: 'Unique session ID for the user',
              },
            },
          },
        },
        400: {
          description: 'Validation error or missing required fields',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Missing required fields',
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Authentication failed (e.g., wrong password)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Wrong password',
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'An unexpected error occurred',
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  .post('/refresh', handleTokenRefresh, {
    detail: {
      summary: 'Token Refresh',
      description:
        'API endpoint to refresh access and refresh tokens. Requires a valid refresh token and session ID.',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                userId: {
                  type: 'number',
                  example: 123,
                  description: 'ID of the user requesting token refresh.',
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
          required: true,
          schema: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI...',
          },
          description: 'Refresh token associated with the user session.',
        },
        {
          in: 'header',
          name: 'X-Session-Id',
          required: true,
          schema: {
            type: 'string',
            example: 'session-id-12345',
          },
          description: 'Session ID associated with the refresh token.',
        },
      ],
      responses: {
        200: {
          description: 'Token refreshed successfully',
          headers: {
            authorization: {
              schema: {
                type: 'string',
                example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI...',
                description: 'New access token for user session.',
              },
            },
            'X-Refresh-Token': {
              schema: {
                type: 'string',
                example: 'new-refresh-token-xyz',
                description: 'New refresh token for session renewal.',
              },
            },
            'X-Session-Id': {
              schema: {
                type: 'string',
                example: 'new-session-id-12345',
                description: 'New session ID for the user session.',
              },
            },
          },
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Token refreshed successfully',
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Validation error or missing required fields',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Missing session id',
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Unauthorized due to invalid or mismatched tokens',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Invalid refresh token',
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'An unexpected error occurred',
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  .post('/logout', handleUserLogout, {
    detail: {
      summary: 'User Logout',
      description:
        'API endpoint to log out a user. Requires valid session ID, refresh token, and access token.',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                userId: {
                  type: 'number',
                  example: 123,
                  description: 'ID of the user to log out.',
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
          name: 'X-Session-Id',
          required: true,
          schema: {
            type: 'string',
            example: 'session-id-12345',
          },
          description: 'Session ID associated with the user session.',
        },
        {
          in: 'header',
          name: 'X-Refresh-Token',
          required: true,
          schema: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI...',
          },
          description: 'Refresh token associated with the user session.',
        },
        {
          in: 'header',
          name: 'Authorization',
          required: true,
          schema: {
            type: 'string',
            example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI...',
          },
          description: 'Access token for the user session.',
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
                  message: {
                    type: 'string',
                    example: 'User logged out successfully',
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Validation error or missing required fields',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Missing session id',
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Unauthorized due to invalid or mismatched tokens',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Invalid access token',
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'An unexpected error occurred',
                  },
                },
              },
            },
          },
        },
      },
    },
  });

export default authRouter;

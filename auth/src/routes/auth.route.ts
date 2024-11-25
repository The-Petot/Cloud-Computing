import { Elysia } from 'elysia';
import {
  handleUserRegister,
  handleUserLogin,
  handleTokenRefresh,
  handleUserLogout,
  handleEnableTwoFactorAuth,
  handleDisableTwoFactorAuth,
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
                  description: 'Password for the new user. Must be at least 8 characters long.',
                },
                firstName: {
                  type: 'string',
                  example: 'John',
                  description: 'First name of the new user',
                },
                lastName: {
                  type: 'string',
                  example: 'Doe',
                  description: 'Last name of the new user',
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
                    required: ['userId'],
                  },
                  message: {
                    type: 'string',
                    example: 'User registered successfully',
                  },
                },
                required: ['data', 'message'],
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
                    example: 'Email is missing.',
                  },
                },
                required: ['error'],
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
                required: ['error'],
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
                token: {
                  type: 'string',
                  example: '123456',
                  description: 'Two-factor authentication token (if enabled)',
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
                    required: ['userId'],
                  },
                  message: {
                    type: 'string',
                    example: 'User logged in successfully',
                  },
                },
                required: ['data', 'message'],
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
                    example: 'Required fields: email and password are missing.',
                  },
                },
                required: ['error'],
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
                    example: 'Incorrect password.',
                  },
                },
                required: ['error'],
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
                required: ['error'],
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
      description: 'API endpoint to refresh access and refresh tokens. Requires a valid refresh token and session ID.',
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
          name: 'X-Session-Id',
          required: true,
          schema: {
            type: 'string',
            example: 'session-id-12345',
            description: 'Session ID associated with the refresh token.',
          },
        },
        {
          in: 'header',
          name: 'X-Refresh-Token',
          required: true,
          schema: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI...',
            description: 'Refresh token associated with the user session.',
          },
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
                required: ['message'],
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
                    example: 'User ID is missing.',
                  },
                },
                required: ['error'],
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
                    example: 'Invalid refresh token.',
                  },
                },
                required: ['error'],
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
                required: ['error'],
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
      description: 'API endpoint to log out a user. Requires valid session ID, refresh token, and access token.',
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
            description: 'Session ID associated with the user session.',
          },
        },
        {
          in: 'header',
          name: 'X-Refresh-Token',
          required: true,
          schema: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI...',
            description: 'Refresh token associated with the user session.',
          },
        },
        {
          in: 'header',
          name: 'Authorization',
          required: true,
          schema: {
            type: 'string',
            example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI...',
            description: 'Access token for the user session.',
          },
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
                required: ['message'],
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
                    example: 'Session ID is missing.',
                  },
                },
                required: ['error'],
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
                    example: 'Invalid access token.',
                  },
                },
                required: ['error'],
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
                required: ['error'],
              },
            },
          },
        },
      },
    },
  })
  .put('/enable-2fa', handleEnableTwoFactorAuth, {
    detail: {
      summary: 'Enable Two-Factor Authentication',
      description: 'API endpoint to enable two-factor authentication for a user. Requires a valid session ID, refresh token, and access token.',
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
                  description: 'ID of the user enabling two-factor authentication.',
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
            example: 'session-id-67890',
            description: 'Session ID associated with the user session.',
          },
        },
        {
          in: 'header',
          name: 'X-Refresh-Token',
          required: true,
          schema: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'Refresh token associated with the user session.',
          },
        },
        {
          in: 'header',
          name: 'Authorization',
          required: true,
          schema: {
            type: 'string',
            example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'Access token for the user session.',
          },
        },
      ],
      responses: {
        200: {
          description: 'Two-factor authentication enabled successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Two-factor authentication enabled successfully.',
                  },
                  data: {
                    type: 'object',
                    properties: {
                      qrCode: {
                        type: 'string',
                        example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
                        description: 'Base64-encoded QR code for two-factor authentication',
                      },
                    },
                    required: ['qrCode'],
                  },
                },
                required: ['message', 'data'],
              },
            },
          },
        },
        400: {
          description: 'Validation error or missing required fields.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'User ID is missing.',
                  },
                },
                required: ['error'],
              },
            },
          },
        },
        401: {
          description: 'Unauthorized due to invalid or mismatched tokens.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Invalid access token.',
                  },
                },
                required: ['error'],
              },
            },
          },
        },
        500: {
          description: 'Internal server error.',
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
                required: ['error'],
              },
            },
          },
        },
      },
    },
  })
  .put('/disable-2fa', handleDisableTwoFactorAuth, {
    detail: {
      summary: 'Disable Two-Factor Authentication',
      description: 'API endpoint to disable two-factor authentication for a user. Requires a valid session ID, refresh token, and access token.',
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
                  description: 'ID of the user disabling two-factor authentication.',
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
            example: 'session-id-67890',
            description: 'Session ID associated with the user session.',
          },
        },
        {
          in: 'header',
          name: 'X-Refresh-Token',
          required: true,
          schema: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'Refresh token associated with the user session.',
          },
        },
        {
          in: 'header',
          name: 'Authorization',
          required: true,
          schema: {
            type: 'string',
            example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'Access token for the user session.',
          },
        },
      ],
      responses: {
        200: {
          description: 'Two-factor authentication disabled successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Two-factor authentication disabled successfully.',
                  },
                },
                required: ['message'],
              },
            },
          },
        },
        400: {
          description: 'Validation error or missing required fields.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'User ID is missing.',
                  },
                },
                required: ['error'],
              },
            },
          },
        },
        401: {
          description: 'Unauthorized due to invalid or mismatched tokens.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Invalid access token.',
                  },
                },
                required: ['error'],
              },
            },
          },
        },
        500: {
          description: 'Internal server error.',
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
                required: ['error'],
              },
            },
          },
        },
      },
    },
  });

export default authRouter;

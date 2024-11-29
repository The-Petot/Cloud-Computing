import swagger from '@elysiajs/swagger';
import { Elysia } from 'elysia';

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
                            example: '2023-01-01T00:00:00Z',
                          },
                          updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2023-01-01T00:00:00Z',
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
                          toggleTwoFactorAuth: {
                            type: 'string',
                            example: '/auth/two-factor',
                          },
                        },
                        required: ['self', 'logout', 'toggleTwoFactorAuth'],
                      },
                    },
                    required: ['success', 'data', 'message', 'links'],
                  },
                },
              },
              headers: {
                'Authorization': {
                  description: 'Access'
                }
              }
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
                              example: ['Incorrect password.']
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
                              example: ['An unexpected error occurred.']
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
                    password: { type: 'string', example: 'password123' },
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
                          toggleTwoFactorAuth: {
                            type: 'string',
                            example: '/auth/two-factor',
                          },
                        },
                        required: [
                          'self',
                          'login',
                          'logout',
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
                            messages: {
                              type: 'array',
                              items: { type: 'string' },
                            },
                            field: { type: 'string' },
                          },
                          required: ['messages', 'field'],
                        },
                        example: [
                          {
                            field: 'email',
                            messages: ['Email is missing.'],
                          },
                          {
                            field: 'password',
                            messages: ['Password is missing.'],
                          },
                          {
                            field: 'firstName',
                            messages: ['First name is missing.'],
                          },
                          {
                            field: 'lastName',
                            messages: ['Last name is missing.'],
                          }
                        ]
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
                              example: ['User already exists.']
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
                              example: ['An unexpected error occurred.']
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
                    },
                    required: ['success', 'message'],
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
                    refreshToken: {
                      type: 'string',
                      example: 'refreshToken123',
                    },
                  },
                  required: ['refreshToken'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Token refreshed successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          accessToken: {
                            type: 'string',
                            example: 'newAccessToken123',
                          },
                        },
                        required: ['accessToken'],
                      },
                      message: {
                        type: 'string',
                        example: 'Token refreshed successfully.',
                      },
                    },
                    required: ['success', 'data', 'message'],
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
                    enable: { type: 'boolean', example: true },
                  },
                  required: ['enable'],
                },
              },
            },
          },
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
                            },
                            field: { type: 'string', example: 'enable' },
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
        detail: {},
      })
      .get('/:userId', () => {}, {
        detail: {},
      })
      .get('/:userId/challenges', () => {}, {
        detail: {},
      })
      .get('/:userId/participations', () => {}, {
        detail: {},
      })
      .post('/', () => {}, {
        detail: {},
      })
      .put('/:userId', () => {}, {
        detail: {},
      });
    return users;
  })
  .group('/api/v1/challenges', (challenges) => {
    challenges
      .get('/', () => {}, {
        detail: {},
      })
      .get('/:challengeId', () => {}, {
        detail: {},
      })
      .get('/:challengeId/participants', () => {}, {
        detail: {},
      })
      .post('/', () => {}, {
        detail: {},
      })
      .put('/:challengeId', () => {}, {
        detail: {},
      });
    return challenges;
  })
  .group('/api/v1/participations', (participations) => {
    participations
      .get('/', () => {}, {
        detail: {},
      })
      .get('/:participationId', () => {}, {
        detail: {},
      })
      .post('/', () => {}, {
        detail: {},
      });
    return participations;
  })
  .listen(8080, () => {
    console.log('Server is running on port 8080');
  });

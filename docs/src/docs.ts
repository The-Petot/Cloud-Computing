import swagger from "@elysiajs/swagger";
import { Elysia, t } from "elysia";

const app = new Elysia()

  .use(
    swagger({
      documentation: {
        info: {
          title: "Mindcraft API",
          description: "This is the API documentation for Mindcraft",
          version: "1.0.0",
        },
      },
      path: "/docs",
    })
  )

  .group("/api/v1/auth", (auth) => {
    auth

      .post("/register", () => {}, {
        detail: {
          tags: ["Auth"],
          summary: "User Registration",
          description: "Registers a new user and returns the user ID.",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string", example: "user@example.com" },
                    password: {
                      type: "string",
                      example: "password123",
                      description: "At least 8 characters long",
                    },
                    firstName: { type: "string", example: "John" },
                    lastName: { type: "string", example: "Doe" },
                  },
                  required: ["email", "password", "firstName", "lastName"],
                },
              },
            },
          },
          responses: {
            201: {
              description: "User registered successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          userId: { type: "number", example: 1 },
                        },
                        required: ["userId"],
                      },
                      message: {
                        type: "string",
                        example: "User registered successfully.",
                      },
                      links: {
                        type: "object",
                        properties: {
                          self: { type: "string", example: "/users/1" },
                          login: { type: "string", example: "/auth/login" },
                          logout: { type: "string", example: "/auth/logout" },
                          tokenRefresh: {
                            type: "string",
                            example: "/auth/refresh",
                          },
                          toggleTwoFactorAuth: {
                            type: "string",
                            example: "/auth/two-factor",
                          },
                        },
                        required: [
                          "self",
                          "login",
                          "logout",
                          "tokenRefresh",
                          "toggleTwoFactorAuth",
                        ],
                      },
                    },
                    required: ["success", "data", "message", "links"],
                  },
                },
              },
            },
            400: {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            field: { type: "string" },
                            messages: {
                              type: "array",
                              items: { type: "string" },
                            },
                          },
                          required: ["messages", "field"],
                        },
                        example: [
                          {
                            field: "email",
                            messages: ["Email is not valid."],
                          },
                        ],
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            409: {
              description: "Conflict",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["User already exists."],
                            },
                            field: { type: "string", example: "email" },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            500: {
              description: "Internal Server Error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["An unexpected error occurred."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      })

      .post("/login", () => {}, {
        detail: {
          tags: ["Auth"],
          summary: "User Login",
          description: "Logs in a user and returns access and refresh tokens.",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string", example: "user@example.com" },
                    password: { type: "string", example: "password123" },
                    token: {
                      type: "string",
                      example: "123456",
                      description:
                        "The user's two-factor authentication token from the authenticator app.",
                      nullable: true,
                    },
                  },
                  required: ["email", "password"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "User logged in successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "number", example: 1 },
                          email: {
                            type: "string",
                            example: "user@example.com",
                          },
                          firstName: { type: "string", example: "John" },
                          lastName: { type: "string", example: "Doe" },
                          totalScore: { type: "number", example: 100 },
                          currentRank: { type: "number", example: 100 },
                          profileImgUrl: {
                            type: "string",
                            example: "http://example.com/profile.jpg",
                          },
                          twoFactorSecret: {
                            type: "string",
                            example: "secret",
                            nullable: true,
                          },
                          twoFactorEnabled: { type: "boolean", example: true },
                          notificationEnabled: {
                            type: "boolean",
                            example: true,
                          },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2023-01-01 00:00:00",
                          },
                          updatedAt: {
                            type: "string",
                            format: "date-time",
                            example: "2023-01-01 00:00:00",
                          },
                        },
                        required: [
                          "id",
                          "email",
                          "firstName",
                          "lastName",
                          "totalScore",
                          "currentRank",
                          "profileImgUrl",
                          "twoFactorEnabled",
                          "notificationEnabled",
                          "createdAt",
                          "updatedAt",
                        ],
                      },
                      message: {
                        type: "string",
                        example: "User logged in successfully.",
                      },
                      links: {
                        type: "object",
                        properties: {
                          self: { type: "string", example: "/users/1" },
                          logout: { type: "string", example: "/auth/logout" },
                          tokenRefresh: {
                            type: "string",
                            example: "/auth/refresh",
                          },
                          toggleTwoFactorAuth: {
                            type: "string",
                            example: "/auth/two-factor",
                          },
                        },
                        required: [
                          "self",
                          "logout",
                          "toggleTwoFactorAuth",
                          "tokenRefresh",
                        ],
                      },
                    },
                    required: ["success", "data", "message", "links"],
                  },
                },
              },
              headers: {
                Authorization: {
                  description: "Access token",
                  schema: {
                    type: "string",
                    example: "Bearer accessToken123",
                  },
                  required: true,
                },
                "X-Refresh-Token": {
                  description: "Refresh token",
                  schema: {
                    type: "string",
                    example: "refreshToken",
                  },
                },
                "X-Session-Id": {
                  description: "Session ID",
                  schema: {
                    type: "string",
                    example: "sessionId",
                  },
                },
              },
            },
            400: {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            field: { type: "string", example: "password" },
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["Password is missing."],
                            },
                          },
                          required: ["field", "messages"],
                        },
                        example: [
                          {
                            field: "password",
                            messages: ["Password is missing."],
                          },
                          {
                            field: "email",
                            messages: ["Email is missing."],
                          },
                        ],
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["Incorrect password."],
                            },
                            field: { type: "string", example: "password" },
                          },
                          required: ["messages", "field"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            500: {
              description: "Internal Server Error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["An unexpected error occurred."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      })

      .post("/logout", () => {}, {
        detail: {
          tags: ['Auth'],
          summary: 'User Logout',
          description: 'Logs out a user and invalidates the session.',
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
              in: "header",
              name: "Authorization",
              schema: {
                type: "string",
                example: "Bearer accessToken123",
              },
              required: true,
            },
            {
              in: "header",
              name: "X-Session-Id",
              schema: {
                type: "string",
                example: "sessionId",
              },
              required: true,
            },
          ],
          responses: {
            200: {
              description: "User logged out successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: {
                        type: "string",
                        example: "User logged out successfully.",
                      },
                      links: {
                        type: "object",
                        properties: {
                          login: { type: "string", example: "/auth/login" },
                          register: {
                            type: "string",
                            example: "/auth/register",
                          },
                          enableTwoFactorAuth: {
                            type: "string",
                            example: "/auth/two-factor",
                          },
                          tokenRefresh: {
                            type: "string",
                            example: "/auth/refresh",
                          },
                        },
                        required: [
                          "login",
                          "register",
                          "enableTwoFactorAuth",
                          "tokenRefresh",
                        ],
                      },
                    },
                    required: ["success", "message", "links"],
                  },
                },
              },
            },
            400: {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["Access token is missing."],
                            },
                            field: { type: "string", example: "accessToken" },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["Access token is not valid."],
                            },
                            field: { type: "string", example: "accessToken" },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            500: {
              description: "Internal Server Error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["An unexpected error occurred."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      })

      .post("/refresh", () => {}, {
        detail: {
          tags: ["Auth"],
          summary: "Token Refresh",
          description: "Refreshes the access token using the refresh token.",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    userId: {
                      type: "number",
                      example: 1,
                    },
                  },
                  required: ["userId"],
                },
              },
            },
          },
          parameters: [
            {
              in: "header",
              name: "X-Refresh-Token",
              schema: {
                type: "string",
                example: "refreshToken123",
              },
              required: true,
            },
            {
              in: "header",
              name: "X-Session-Id",
              schema: {
                type: "string",
                example: "sessionId",
              },
              required: true,
            },
          ],
          responses: {
            200: {
              description: "Token refreshed successfully",
              headers: {
                Authorization: {
                  description: "New access token",
                  schema: {
                    type: "string",
                    example: "Bearer newAccessToken",
                  },
                  required: true,
                },
                "X-Refresh-Token": {
                  description: "New refresh token",
                  schema: {
                    type: "string",
                    example: "newRefreshToken",
                  },
                  required: true,
                },
                "X-Session-Id": {
                  description: "New session ID",
                  schema: {
                    type: "string",
                    example: "sessionId",
                  },
                  required: true,
                },
              },
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },

                      message: {
                        type: "string",
                        example: "Token refreshed successfully.",
                      },
                      links: {
                        type: "object",
                        properties: {
                          self: { type: "string", example: "/users/1" },
                          logout: { type: "string", example: "/auth/logout" },
                          tokenRefresh: {
                            type: "string",
                            example: "/auth/refresh",
                          },
                          toggleTwoFactorAuth: {
                            type: "string",
                            example: "/auth/two-factor",
                          },
                        },
                        required: [
                          "self",
                          "logout",
                          "tokenRefresh",
                          "toggleTwoFactorAuth",
                        ],
                      },
                    },
                    required: ["success", "message"],
                  },
                },
              },
            },
            400: {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["Refresh token is missing."],
                            },
                            field: { type: "string", example: "refreshToken" },
                          },
                          required: ["messages", "field"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["Refresh token is not valid."],
                            },
                            field: { type: "string", example: "refreshToken" },
                          },
                          required: ["messages", "field"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            500: {
              description: "Internal Server Error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["An unexpected error occurred."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      })

      .put("/two-factor", () => {}, {
        detail: {
          tags: ["Auth"],
          summary: "Toggle Two-Factor Authentication",
          description:
            "Enables or disables two-factor authentication for a user.",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    userId: { type: "number", example: 1 },
                  },
                  required: ["userId"],
                },
              },
            },
          },
          parameters: [
            {
              in: "query",
              name: "enable",
              schema: {
                type: "boolean",
                example: true,
              },
              required: true,
            },
            {
              in: "header",
              name: "Authorization",
              schema: {
                type: "string",
                example: "Bearer accessToken123",
              },
              required: true,
            },
            {
              in: "header",
              name: "X-Session-Id",
              schema: {
                type: "string",
                example: "sessionId",
              },
              required: true,
            },
          ],
          responses: {
            200: {
              description:
                "Two-factor authentication status updated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: {
                        type: "string",
                        example:
                          "Two-factor authentication status updated successfully.",
                      },
                      links: {
                        type: "object",
                        properties: {
                          self: { type: "string", example: "/users/1" },
                          logout: { type: "string", example: "/auth/logout" },
                          tokenRefresh: {
                            type: "string",
                            example: "/auth/refresh",
                          },
                          toggleTwoFactorAuth: {
                            type: "string",
                            example: "/auth/two-factor",
                          },
                        },
                        required: [
                          "self",
                          "logout",
                          "tokenRefresh",
                          "toggleTwoFactorAuth",
                        ],
                      },
                    },
                    required: ["success", "message"],
                  },
                },
              },
            },
            400: {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["User ID is missing."],
                            },
                            field: { type: "string", example: "userId" },
                          },
                          required: ["messages", "field"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["Access token is not valid."],
                            },
                            field: { type: "string", example: "accessToken" },
                          },
                          required: ["messages", "field"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            500: {
              description: "Internal Server Error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["An unexpected error occurred."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      })

      .get("/two-factor", () => {}, {
        detail: {
          tags: ["Auth"],
          summary: "Get Two-Factor Authentication QR Code",
          description:
            "Generates and retrieves the QR code for setting up two-factor authentication for a user.",
          responses: {
            200: {
              description:
                "Successfully generated two-factor authentication QR code.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: {
                        type: "string",
                        example:
                          "Two-factor authentication QR code generated successfully.",
                      },
                      data: {
                        type: "object",
                        properties: {
                          qrCode: { type: "string", example: "QR_CODE_STRING" },
                          secret: { type: "string", example: "BASE32_SECRET" },
                        },
                        required: ["qrCode", "secret"],
                      },
                      links: {
                        type: "object",
                        properties: {
                          self: { type: "string", example: "/auth/two-factor" },
                          login: { type: "string", example: "/auth/login" },
                          logout: { type: "string", example: "/auth/logout" },
                          toggleTwoFactorAuth: {
                            type: "string",
                            example: "/auth/two-factor",
                          },
                        },
                        required: [
                          "self",
                          "login",
                          "logout",
                          "toggleTwoFactorAuth",
                        ],
                      },
                    },
                    required: ["success", "message", "data"],
                  },
                },
              },
            },
            400: {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["User ID is missing."],
                            },
                            field: { type: "string", example: "userId" },
                          },
                          required: ["messages", "field"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["Access token is not valid."],
                            },
                            field: { type: "string", example: "accessToken" },
                          },
                          required: ["messages", "field"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            500: {
              description: "Internal Server Error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["Failed to generate QR code."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      })

      .post("/oauth/google", () => {}, {
        detail: {
          tags: ["Auth"],
          summary: "Signin or Signup with Google",
          description:
            "Signin or Signup with Google and returns the user data.",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: {
                      type: "number",
                      example: 1,
                      description: "Google IdToken.",
                    },
                  },
                  required: ["token"],
                },
              },
            },
          },
          responses: {
            200: {
              description:
                "User logged in or registered successfully with Google",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "number", example: 1 },
                          email: {
                            type: "string",
                            example: "user@example.com",
                          },
                          firstName: { type: "string", example: "John" },
                          lastName: { type: "string", example: "Doe" },
                          totalScore: { type: "number", example: 100 },
                          currentRank: { type: "number", example: 100 },
                          profileImgUrl: {
                            type: "string",
                            example: "http://example.com/profile.jpg",
                          },
                          twoFactorSecret: {
                            type: "string",
                            example: "secret",
                            nullable: true,
                          },
                          twoFactorEnabled: { type: "boolean", example: true },
                          notificationEnabled: {
                            type: "boolean",
                            example: true,
                          },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2023-01-01 00:00:00",
                          },
                          updatedAt: {
                            type: "string",
                            format: "date-time",
                            example: "2023-01-01 00:00:00",
                          },
                        },
                        required: [
                          "id",
                          "email",
                          "firstName",
                          "lastName",
                          "totalScore",
                          "currentRank",
                          "profileImgUrl",
                          "twoFactorEnabled",
                          "notificationEnabled",
                          "createdAt",
                          "updatedAt",
                        ],
                      },
                      message: {
                        type: "string",
                        example: "User logged in successfully.",
                      },
                      links: {
                        type: "object",
                        properties: {
                          self: { type: "string", example: "/users/1" },
                          logout: { type: "string", example: "/auth/logout" },
                          tokenRefresh: {
                            type: "string",
                            example: "/auth/refresh",
                          },
                          toggleTwoFactorAuth: {
                            type: "string",
                            example: "/auth/two-factor",
                          },
                        },
                        required: [
                          "self",
                          "logout",
                          "tokenRefresh",
                          "toggleTwoFactorAuth",
                        ],
                      },
                    },
                    required: ["success", "message"],
                  },
                },
              },
              headers: {
                Authorization: {
                  description: "Access token",
                  schema: {
                    type: "string",
                    example: "Bearer accessToken123",
                  },
                  required: true,
                },
                "X-Refresh-Token": {
                  description: "Refresh token",
                  schema: {
                    type: "string",
                    example: "refreshToken",
                  },
                },
                "X-Session-Id": {
                  description: "Session ID",
                  schema: {
                    type: "string",
                    example: "sessionId",
                  },
                },
              },
            },
            400: {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["Token is missing."],
                            },
                            field: { type: "string", example: "token" },
                          },
                          required: ["messages", "field"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["Unable to get Google user."],
                            },
                            field: { type: "string", example: "token" },
                          },
                          required: ["messages", "field"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            500: {
              description: "Internal Server Error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["An unexpected error occurred."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      });
    return auth;
  })

  .group("/api/v1/users", (users) => {
    users

      .get("/", () => {}, {
        detail: {
          tags: ["Users"],
          summary: "Get all users",
          description:
            "Retrieve a list of all users including their first name, last name, email, and profile image URL.",
          responses: {
            200: {
              description: "A list of users",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            firstName: { type: "string", example: "John" },
                            lastName: { type: "string", example: "Doe" },
                            email: {
                              type: "string",
                              example: "john.doe@example.com",
                            },
                            profileImgUrl: {
                              type: "string",
                              example: "https://example.com/john.jpg",
                            },
                          },
                          required: [
                            "firstName",
                            "lastName",
                            "email",
                            "profileImgUrl",
                          ],
                        },
                      },
                      message: {
                        type: "string",
                        example: "Users retrieved successfully.",
                      },
                      links: {
                        type: "object",
                        properties: {
                          self: { type: "string", example: "/users" },
                          userDetails: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          updateUser: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          deleteUser: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          userChallenges: {
                            type: "string",
                            example: "/users/:userId/challenges",
                          },
                          userParticipations: {
                            type: "string",
                            example: "/users/:userId/participations",
                          },
                          createUserChallenge: {
                            type: "string",
                            example: "/users/:userId/challenges",
                          },
                          createUserParticipation: {
                            type: "string",
                            example: "/users/:userId/participations",
                          },
                          deleteUserChallenge: {
                            type: "string",
                            example: "/users/:userId/challenges/:challengeId",
                          },
                        },
                        required: [
                          "self",
                          "userDetails",
                          "updateUser",
                          "deleteUser",
                          "userChallenges",
                          "userParticipations",
                          "createUserChallenge",
                          "createUserParticipation",
                          "deleteUserChallenge",
                        ],
                      },
                    },
                    required: ["success", "data", "message", "link"],
                  },
                },
              },
            },
            400: {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            field: { type: "string", example: "email" },
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["params is missing."],
                            },
                          },
                          required: ["field", "messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      message: {
                        type: "string",
                        example: "Authorization token is missing or invalid.",
                      },
                    },
                    required: ["success", "message"],
                  },
                },
              },
            },
            500: {
              description: "Internal Server Error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["An unexpected error occurred."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      })

      .get("/:userId", () => {}, {
        detail: {
          tags: ["Users"],
          summary: "Get a user by ID",
          description:
            "Retrieve a user’s details by their unique user ID, including their first name, last name, email, and profile image URL.",
          parameters: [
            {
              in: "path",
              name: "userId",
              required: true,
              description: "The unique ID of the user to retrieve.",
              schema: {
                type: "number",
                example: 1,
              },
            },
          ],
          responses: {
            200: {
              description: "User details retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "integer", example: 123 },
                          firstName: { type: "string", example: "John" },
                          lastName: { type: "string", example: "Doe" },
                          email: {
                            type: "string",
                            example: "john.doe@example.com",
                          },
                          profileImgUrl: {
                            type: "string",
                            example: "https://example.com/john.jpg",
                          },
                        },
                        required: [
                          "id",
                          "firstName",
                          "lastName",
                          "email",
                          "profileImgUrl",
                        ],
                      },
                      message: {
                        type: "string",
                        example: "User retrieved successfully.",
                      },
                      links: {
                        type: "object",
                        properties: {
                          self: { type: "string", example: "/users" },
                          userDetails: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          updateUser: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          deleteUser: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          userChallenges: {
                            type: "string",
                            example: "/users/:userId/challenges",
                          },
                          userParticipations: {
                            type: "string",
                            example: "/users/:userId/participations",
                          },
                          createUserChallenge: {
                            type: "string",
                            example: "/users/:userId/challenges",
                          },
                          createUserParticipation: {
                            type: "string",
                            example: "/users/:userId/participations",
                          },
                          deleteUserChallenge: {
                            type: "string",
                            example: "/users/:userId/challenges/:challengeId",
                          },
                        },
                        required: [
                          "self",
                          "userDetails",
                          "updateUser",
                          "deleteUser",
                          "userChallenges",
                          "userParticipations",
                          "createUserChallenge",
                          "createUserParticipation",
                          "deleteUserChallenge",
                        ],
                      },
                    },
                    required: ["success", "data", "message", "link"],
                  },
                },
              },
            },
            400: {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            field: { type: "string", example: "email" },
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["params is missing."],
                            },
                          },
                          required: ["field", "messages"],
                        },
                        example: [
                          {
                            field: "userId",
                            messages: ["userId is missing."],
                          },
                          {
                            field: "userId",
                            messages: ["userId must be a number."],
                          },
                          {
                            field: "accessToken",
                            messages: ["accessToken is missing."],
                          },
                          {
                            field: "sessionId",
                            messages: ["sessionId is missing."],
                          },
                        ],
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      message: {
                        type: "string",
                        example: "Authorization token is missing or invalid.",
                      },
                    },
                    required: ["success", "message"],
                  },
                },
              },
            },
            500: {
              description: "Internal Server Error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["An unexpected error occurred."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      })

      .get("/:userId/challenges", () => {}, {
        detail: {
          tags: ["Users"],
          summary: "Get challenges of a user",
          description:
            "Retrieve a list of challenges created by a user, identified by their unique user ID.",
          parameters: [
            {
              in: "path",
              name: "userId",
              required: true,
              description:
                "The unique ID of the user whose challenges you want to retrieve.",
              schema: {
                type: "number",
                example: 1,
              },
            },
          ],
          responses: {
            200: {
              description: "User challenges retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "integer", example: 1 },
                            title: {
                              type: "string",
                              example: "Coding Challenge 1",
                            },
                            description: {
                              type: "string",
                              example:
                                "Solve coding problems to improve your skills.",
                            },
                            createdAt: {
                              type: "string",
                              example: "2024-01-01T00:00:00Z",
                            },
                          },
                          required: ["id", "title", "description", "createdAt"],
                        },
                      },
                      message: {
                        type: "string",
                        example: "Challenges retrieved successfully.",
                      },
                      links: {
                        type: "object",
                        properties: {
                          self: { type: "string", example: "/users" },
                          userDetails: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          updateUser: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          deleteUser: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          userChallenges: {
                            type: "string",
                            example: "/users/:userId/challenges",
                          },
                          userParticipations: {
                            type: "string",
                            example: "/users/:userId/participations",
                          },
                          createUserChallenge: {
                            type: "string",
                            example: "/users/:userId/challenges",
                          },
                          createUserParticipation: {
                            type: "string",
                            example: "/users/:userId/participations",
                          },
                          deleteUserChallenge: {
                            type: "string",
                            example: "/users/:userId/challenges/:challengeId",
                          },
                        },
                        required: [
                          "self",
                          "userDetails",
                          "updateUser",
                          "deleteUser",
                          "userChallenges",
                          "userParticipations",
                          "createUserChallenge",
                          "createUserParticipation",
                          "deleteUserChallenge",
                        ],
                      },
                    },
                    required: ["success", "data", "message", "link"],
                  },
                },
              },
            },
            400: {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            field: { type: "string", example: "email" },
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["params is missing."],
                            },
                          },
                          required: ["field", "messages"],
                        },
                        example: [
                          {
                            field: "userId",
                            messages: ["userId is missing."],
                          },
                          {
                            field: "userId",
                            messages: ["userId must be a number."],
                          },
                        ],
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      message: {
                        type: "string",
                        example: "Authorization token is missing or invalid.",
                      },
                    },
                    required: ["success", "message"],
                  },
                },
              },
            },
            500: {
              description: "Internal Server Error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["An unexpected error occurred."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      })

      .get("/:userId/participations", () => {}, {
        detail: {
          tags: ["Users"],
          summary: "Get a user’s participations by user ID",
          description:
            "Retrieve a list of challenges the user has participated in, based on their unique user ID, including participation details such as challenge ID and score.",
          parameters: [
            {
              in: "path",
              name: "userId",
              required: true,
              description:
                "The unique ID of the user whose participations are to be retrieved.",
              schema: {
                type: "integer",
                example: 123,
              },
            },
          ],
          responses: {
            200: {
              description: "User’s participations retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            challengeId: { type: "integer", example: 456 },
                            score: { type: "integer", example: 90 },
                            createdAt: {
                              type: "string",
                              example: "2024-12-05T12:00:00Z",
                            },
                          },
                          required: ["challengeId", "score", "createdAt"],
                        },
                      },
                      message: {
                        type: "string",
                        example: "User participations retrieved successfully.",
                      },
                      links: {
                        type: "object",
                        properties: {
                          self: { type: "string", example: "/users" },
                          userDetails: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          updateUser: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          deleteUser: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          userChallenges: {
                            type: "string",
                            example: "/users/:userId/challenges",
                          },
                          userParticipations: {
                            type: "string",
                            example: "/users/:userId/participations",
                          },
                          createUserChallenge: {
                            type: "string",
                            example: "/users/:userId/challenges",
                          },
                          createUserParticipation: {
                            type: "string",
                            example: "/users/:userId/participations",
                          },
                          deleteUserChallenge: {
                            type: "string",
                            example: "/users/:userId/challenges/:challengeId",
                          },
                        },
                        required: [
                          "self",
                          "userDetails",
                          "updateUser",
                          "deleteUser",
                          "userChallenges",
                          "userParticipations",
                          "createUserChallenge",
                          "createUserParticipation",
                          "deleteUserChallenge",
                        ],
                      },
                    },
                    required: ["success", "data", "message", "link"],
                  },
                },
              },
            },
            400: {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            field: { type: "string", example: "email" },
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["params is missing."],
                            },
                          },
                          required: ["field", "messages"],
                        },
                        example: [
                          {
                            field: "userId",
                            messages: ["userId is missing."],
                          },
                          {
                            field: "userId",
                            messages: ["userId must be a number."],
                          },
                        ],
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      message: {
                        type: "string",
                        example: "Authorization token is missing or invalid.",
                      },
                    },
                    required: ["success", "message"],
                  },
                },
              },
            },
            500: {
              description: "Internal Server Error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["An unexpected error occurred."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      })

      .put("/:userId", () => {}, {
        detail: {
          tags: ["Users"],
          summary: "Update a user by ID",
          description:
            "Update a user’s details such as first name, last name, email, or profile image URL by their unique user ID.",
          parameters: [
            {
              in: "path",
              name: "userId",
              required: true,
              description: "The unique ID of the user to update.",
              schema: {
                type: "integer",
                example: 123,
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    firstName: { type: "string", example: "Jane" },
                    lastName: { type: "string", example: "Smith" },
                    email: {
                      type: "string",
                      example: "jane.smith@example.com",
                    },
                    profileImgUrl: {
                      type: "string",
                      example: "https://example.com/jane.jpg",
                    },
                  },
                  required: ["firstName", "lastName", "email"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "User details updated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "integer", example: 123 },
                          firstName: { type: "string", example: "Jane" },
                          lastName: { type: "string", example: "Smith" },
                          email: {
                            type: "string",
                            example: "jane.smith@example.com",
                          },
                          profileImgUrl: {
                            type: "string",
                            example: "https://example.com/jane.jpg",
                          },
                        },
                        required: [
                          "id",
                          "firstName",
                          "lastName",
                          "email",
                          "profileImgUrl",
                        ],
                      },
                      message: {
                        type: "string",
                        example: "User updated successfully.",
                      },
                      links: {
                        type: "object",
                        properties: {
                          self: { type: "string", example: "/users" },
                          userDetails: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          updateUser: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          deleteUser: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          userChallenges: {
                            type: "string",
                            example: "/users/:userId/challenges",
                          },
                          userParticipations: {
                            type: "string",
                            example: "/users/:userId/participations",
                          },
                          createUserChallenge: {
                            type: "string",
                            example: "/users/:userId/challenges",
                          },
                          createUserParticipation: {
                            type: "string",
                            example: "/users/:userId/participations",
                          },
                          deleteUserChallenge: {
                            type: "string",
                            example: "/users/:userId/challenges/:challengeId",
                          },
                        },
                        required: [
                          "self",
                          "userDetails",
                          "updateUser",
                          "deleteUser",
                          "userChallenges",
                          "userParticipations",
                          "createUserChallenge",
                          "createUserParticipation",
                          "deleteUserChallenge",
                        ],
                      },
                    },
                    required: ["success", "data", "message", "link"],
                  },
                },
              },
            },
            400: {
              description: "Bad Request (Invalid or missing user data)",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            field: { type: "string", example: "firstName" },
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["body is missing."],
                            },
                          },
                          required: ["field", "messages"],
                        },
                        example: [
                          {
                            field: "userId",
                            messages: ["userId is missing."],
                          },
                          {
                            field: "userId",
                            messages: ["must be a number."],
                          },
                          {
                            field: "newUserData",
                            messages: ["newUserData is missing."],
                          },
                          {
                            field: "accessToken",
                            messages: ["accessToken is missing."],
                          },
                          {
                            field: "sessionId",
                            messages: ["sessionId is missing."],
                          },
                        ],
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      message: {
                        type: "string",
                        example: "Authorization token is missing or invalid.",
                      },
                    },
                    required: ["success", "message"],
                  },
                },
              },
            },
            500: {
              description: "Internal Server Error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["An unexpected error occurred."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      })

      .delete("/:userId", () => {}, {
        detail: {
          tags: ["Users"],
          summary: "Delete a user by ID",
          description:
            "Delete a user from the system based on their unique user ID. The user will be removed permanently from the database.",
          parameters: [
            {
              in: "path",
              name: "userId",
              required: true,
              description: "The unique ID of the user to delete.",
              schema: {
                type: "integer",
                example: 123,
              },
            },
          ],
          responses: {
            200: {
              description: "User deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          message: {
                            type: "string",
                            example: "User deleted successfully.",
                          },
                        },
                        required: ["message"],
                      },
                      message: {
                        type: "string",
                        example: "User deleted successfully.",
                      },
                      links: {
                        type: "object",
                        properties: {
                          self: { type: "string", example: "/users" },
                          userDetails: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          updateUser: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          deleteUser: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          userChallenges: {
                            type: "string",
                            example: "/users/:userId/challenges",
                          },
                          userParticipations: {
                            type: "string",
                            example: "/users/:userId/participations",
                          },
                          createUserChallenge: {
                            type: "string",
                            example: "/users/:userId/challenges",
                          },
                          createUserParticipation: {
                            type: "string",
                            example: "/users/:userId/participations",
                          },
                          deleteUserChallenge: {
                            type: "string",
                            example: "/users/:userId/challenges/:challengeId",
                          },
                        },
                        required: [
                          "self",
                          "userDetails",
                          "updateUser",
                          "deleteUser",
                          "userChallenges",
                          "userParticipations",
                          "createUserChallenge",
                          "createUserParticipation",
                          "deleteUserChallenge",
                        ],
                      },
                    },
                    required: ["success", "data", "message", "link"],
                  },
                },
              },
            },
            400: {
              description: "Bad Request (Invalid or missing user data)",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            field: { type: "string", example: "firstName" },
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["params is missing."],
                            },
                          },
                          required: ["field", "messages"],
                        },
                        example: [
                          {
                            field: "userId",
                            messages: ["userId is missing."],
                          },
                          {
                            field: "userId",
                            messages: ["must be a number."],
                          },
                          {
                            field: "accessToken",
                            messages: ["accessToken is missing."],
                          },
                          {
                            field: "sessionId",
                            messages: ["sessionId is missing."],
                          },
                        ],
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      message: {
                        type: "string",
                        example: "Authorization token is missing or invalid.",
                      },
                    },
                    required: ["success", "message"],
                  },
                },
              },
            },
            500: {
              description: "Internal Server Error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["An unexpected error occurred."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      })

      .delete("/:userId/challenges/:challengeId", () => {}, {
        detail: {
          tags: ["Users"],
          summary: "Delete a user challenge by user ID and challenge ID",
          description:
            "Delete a specific challenge created by a user based on the user ID and challenge ID.",
          parameters: [
            {
              in: "path",
              name: "userId",
              required: true,
              description:
                "The unique ID of the user who created the challenge.",
              schema: {
                type: "number",
                example: 1,
              },
            },
            {
              in: "path",
              name: "challengeId",
              required: true,
              description: "The unique ID of the challenge to be deleted.",
              schema: {
                type: "number",
                example: 1,
              },
            },
          ],
          responses: {
            200: {
              description: "Challenge deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          message: {
                            type: "string",
                            example: "Challenge deleted successfully.",
                          },
                        },
                        required: ["message"],
                      },
                      message: {
                        type: "string",
                        example: "Challenge deleted successfully.",
                      },
                      links: {
                        type: "object",
                        properties: {
                          self: { type: "string", example: "/users" },
                          userDetails: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          users: {
                            type: "string",
                            example: "/users",
                          },
                          updateUser: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          deleteUser: {
                            type: "string",
                            example: "/users/:userId",
                          },
                          userChallenges: {
                            type: "string",
                            example: "/users/:userId/challenges",
                          },
                          userParticipations: {
                            type: "string",
                            example: "/users/:userId/participations",
                          },
                          createUserChallenge: {
                            type: "string",
                            example: "/users/:userId/challenges",
                          },
                          createUserParticipation: {
                            type: "string",
                            example: "/users/:userId/participations",
                          },
                        },
                        required: [
                          "self",
                          "userDetails",
                          "updateUser",
                          "deleteUser",
                          "userChallenges",
                          "userParticipations",
                          "createUserChallenge",
                          "createUserParticipation",
                          "deleteUserChallenge",
                        ],
                      },
                    },
                    required: ["success", "data", "message", "link"],
                  },
                },
              },
            },
            400: {
              description: "Bad Request (Invalid or missing user data)",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            field: { type: "string", example: "firstName" },
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["params is missing."],
                            },
                          },
                          required: ["field", "messages"],
                        },
                        example: [
                          {
                            field: "userId",
                            messages: ["userId is missing."],
                          },
                          {
                            field: "userId",
                            messages: ["must be a number."],
                          },
                          {
                            field: "accessToken",
                            messages: ["accessToken is missing."],
                          },
                          {
                            field: "sessionId",
                            messages: ["sessionId is missing."],
                          },
                        ],
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      message: {
                        type: "string",
                        example: "Authorization token is missing or invalid.",
                      },
                    },
                    required: ["success", "message"],
                  },
                },
              },
            },
            500: {
              description: "Internal Server Error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["An unexpected error occurred."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      });

    return users;
  })

  .group("/api/v1/challenges", (challenges) => {
    challenges

      .get("/", () => {}, {
        detail: {
          tags: ["Challenges"],
          summary: "Fetch all challenges",
          description: "Retrieves a list of all challenges.",
          responses: {
            200: {
              description: "Challenges fetched successfully.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "number", example: 1 },
                          title: {
                            type: "string",
                            example: "Soal Fisika Dasar",
                          },
                          description: {
                            type: "string",
                            example: "Soal soal mudah mengenai fisika dasar",
                            nullable: true,
                          },
                          summary: {
                            type: "string",
                            example:
                              "Fisika adalah ilmu pengetahuan yang menjelaskan ...",
                            nullable: true,
                          },
                          tags: {
                            type: "string",
                            example: "fisika",
                            nullable: true,
                          },
                          authorId: { type: "integer", example: 1 },
                          totalQuestions: { type: "integer", example: 5 },
                          timeSeconds: { type: "integer", example: 300 },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2023-01-01 00:00:00",
                          },
                          updatedAt: {
                            type: "string",
                            format: "date-time",
                            example: "2023-01-01 00:10:00",
                          },
                        },
                        required: [
                          "id",
                          "title",
                          "authorId",
                          "totalQuestions",
                          "timeSeconds",
                          "createdAt",
                        ],
                      },
                      message: {
                        type: "string",
                        example: "Challenges fetched successfully.",
                      },
                      links: {
                        type: "object",
                        properties: {
                          self: { type: "string", example: "/challenges" },
                          challengeDetails: {
                            type: "string",
                            example: "/challenges/:challengeId",
                          },
                          challengeParticipants: {
                            type: "string",
                            example: "/challenges/:challengeId/participants",
                          },
                          challengeQuestions: {
                            type: "string",
                            example: "/challenges/:challengeId/questions",
                          },
                        },
                        required: [
                          "self",
                          "challengeDetails",
                          "challengeParticipants",
                          "challengeQuestions",
                        ],
                      },
                    },
                    required: ["success", "data", "message", "links"],
                  },
                },
              },
            },
            400: {
              description: "Bad request, invalid query parameters.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            field: { type: "string", example: "params" },
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["Params is missing."],
                            },
                          },
                          required: ["field", "messages"],
                        },
                        example: [
                          {
                            field: "params",
                            messages: ["Params is missing."],
                          },
                          {
                            field: "challengeId",
                            messages: ["challengeId is missing."],
                          },
                          {
                            field: "challengeId",
                            messages: ["challengeId must be a number."],
                          },
                        ],
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            500: {
              description: "Internal server error.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["An unexpected error occurred."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      })

      .get("/:challengeId", () => {}, {
        detail: {
          tags: ["Challenges"],
          summary: "Fetch a specific challenge by ID",
          description:
            "Retrieves a specific challenge based on the given challenge ID.",
          parameters: [
            {
              name: "challengeId",
              in: "path",
              required: true,
              description: "The ID of the challenge to fetch.",
              schema: {
                type: "number",
                example: "1",
              },
            },
          ],
          responses: {
            200: {
              description: "Challenge fetched successfully.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "number", example: 1 },
                          title: {
                            type: "string",
                            example: "Soal Fisika Dasar",
                          },
                          description: {
                            type: "string",
                            example: "Soal soal mudah mengenai fisika dasar",
                            nullable: true,
                          },
                          summary: {
                            type: "string",
                            example:
                              "Fisika adalah ilmu pengetahuan yang menjelaskan ...",
                            nullable: true,
                          },
                          tags: {
                            type: "string",
                            example: "fisika",
                            nullable: true,
                          },
                          authorId: { type: "integer", example: 1 },
                          totalQuestions: { type: "integer", example: 5 },
                          timeSeconds: { type: "integer", example: 300 },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2023-01-01 00:00:00",
                          },
                          updatedAt: {
                            type: "string",
                            format: "date-time",
                            example: "2023-01-01 00:10:00",
                          },
                        },
                        required: [
                          "id",
                          "title",
                          "authorId",
                          "totalQuestions",
                          "timeSeconds",
                          "createdAt",
                        ],
                      },
                      message: {
                        type: "string",
                        example: "Challenge fetched successfully.",
                      },
                      links: {
                        type: "object",
                        properties: {
                          self: { type: "string", example: "/challenges/1" },
                          challengeParticipants: {
                            type: "string",
                            example: "/challenges/1/participants",
                          },
                          challengeQuestions: {
                            type: "string",
                            example: "/challenges/1/questions",
                          },
                          challenges: {
                            type: "string",
                            example: "/challenges",
                          },
                        },
                        required: [
                          "self",
                          "challengeParticipants",
                          "challengeQuestions",
                          "challenges",
                        ],
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Bad request, invalid query parameters.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            field: { type: "string", example: "params" },
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["Params is missing."],
                            },
                          },
                          required: ["field", "messages"],
                        },
                        example: [
                          {
                            field: "params",
                            messages: ["Params is missing."],
                          },
                          {
                            field: "challengeId",
                            messages: ["challengeId is missing."],
                          },
                          {
                            field: "challengeId",
                            messages: ["challengeId must be a number."],
                          },
                        ],
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            500: {
              description: "Internal server error.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["An unexpected error occurred."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      })

      .get("/:challengeId/participants", () => {}, {
        detail: {
          tags: ["Challenges"],
          summary: "Fetch participants of a specific challenge",
          description:
            "Retrieves all participants for a specific challenge based on the given challenge ID.",
          parameters: [
            {
              name: "challengeId",
              in: "path",
              required: true,
              description: "The ID of the challenge to fetch participants for.",
              schema: {
                type: "number",
                example: "1",
              },
            },
          ],
          responses: {
            200: {
              description: "Challenge participants fetched successfully.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "number", example: 1 },
                          participantId: { type: "integer", example: "15" },
                          challengeId: { type: "integer", example: "491" },
                          score: { type: "integer", example: 100 },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2023-01-01 00:00:00",
                          },
                        },
                        required: [
                          "id",
                          "participantId",
                          "challengeId",
                          "score",
                          "createdAt",
                        ],
                      },
                      message: {
                        type: "string",
                        example: "Challenge participants fetched successfully.",
                      },
                      links: {
                        type: "object",
                        properties: {
                          self: {
                            type: "string",
                            example: "/challenges/1/participants",
                          },
                          challengeDetails: {
                            type: "string",
                            example: "/challenges/1",
                          },
                          challengeQuestions: {
                            type: "string",
                            example: "/challenges/1/questions",
                          },
                          challenges: {
                            type: "string",
                            example: "/challenges",
                          },
                        },
                        required: [
                          "self",
                          "challengeDetails",
                          "challengeQuestions",
                          "challenges",
                        ],
                      },
                    },
                    required: ["success", "data", "message", "links"],
                  },
                },
              },
            },
            400: {
              description: "Bad request, invalid query parameters.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            field: { type: "string", example: "params" },
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["Params is missing."],
                            },
                          },
                          required: ["field", "messages"],
                        },
                        example: [
                          {
                            field: "params",
                            messages: ["Params is missing."],
                          },
                          {
                            field: "challengeId",
                            messages: ["challengeId is missing."],
                          },
                          {
                            field: "challengeId",
                            messages: ["challengeId must be a number."],
                          },
                        ],
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            500: {
              description: "Internal server error.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["An unexpected error occurred."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      })

      .get("/:challengeId/questions", () => {}, {
        detail: {
          tags: ["Challenges"],
          summary: "Fetch questions for a specific challenge",
          description:
            "Retrieves all questions for a specific challenge based on the given challenge ID.",
          parameters: [
            {
              name: "challengeId",
              in: "path",
              required: true,
              description: "The ID of the challenge to fetch questions for.",
              schema: {
                type: "number",
                example: "1",
              },
            },
          ],
          responses: {
            200: {
              description: "Challenge questions fetched successfully.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "number", example: 1 },
                          question: {
                            type: "string",
                            example: "Dimana ibukota Indonesia",
                          },
                          challengeId: { type: "integer", example: 10 },
                          explanation: {
                            type: "string",
                            example:
                              "Ibukota Indonesia adalah Jakarta, yang merupakan ...",
                          },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2023-01-01 00:00:00",
                          },
                        },
                        required: [
                          "id",
                          "question",
                          "challengeId",
                          "explanation",
                          "createdAt",
                        ],
                      },
                      message: {
                        type: "string",
                        example: "Challenge questions fetched successfully.",
                      },
                      links: {
                        type: "object",
                        properties: {
                          self: {
                            type: "string",
                            example: "/challenges/1/questions",
                          },
                          challengeDetails: {
                            type: "string",
                            example: "/challenges/1",
                          },
                          challengeParticipants: {
                            type: "string",
                            example: "/challenges/1/participants",
                          },
                          challenges: {
                            type: "string",
                            example: "/challenges",
                          },
                        },
                        required: [
                          "self",
                          "challengeDetails",
                          "challengeParticipants",
                          "challenges",
                        ],
                      },
                    },
                    required: ["success", "data", "message", "links"],
                  },
                },
              },
            },
            400: {
              description: "Bad request, invalid query parameters.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            field: { type: "string", example: "params" },
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["Params is missing."],
                            },
                          },
                          required: ["field", "messages"],
                        },
                        example: [
                          {
                            field: "params",
                            messages: ["Params is missing."],
                          },
                          {
                            field: "challengeId",
                            messages: ["challengeId is missing."],
                          },
                          {
                            field: "challengeId",
                            messages: ["challengeId must be a number."],
                          },
                        ],
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            500: {
              description: "Internal server error.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["An unexpected error occurred."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      })

      .put("/:challengeId", () => {}, {
        detail: {
          tags: ["Challenges"],
          summary: "Update a specific challenge",
          description:
            "Updates the details of a specific challenge based on the provided challenge ID.",
          parameters: [
            {
              name: "challengeId",
              in: "path",
              required: true,
              description: "The ID of the challenge to update.",
              schema: {
                type: "number",
                example: "1",
              },
            },
          ],
          requestBody: {
            description: "Updated challenge details.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string", example: "New Challenge title" },
                    description: {
                      type: "string",
                      example: "Updated description of the challenge.",
                    },
                  },
                  required: ["success", "data", "message", "links"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Challenge updated successfully.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "number", example: 1 },
                          title: {
                            type: "string",
                            example: "Soal Fisika Dasar",
                          },
                          description: {
                            type: "string",
                            example: "Soal soal mudah mengenai fisika dasar",
                            nullable: true,
                          },
                          summary: {
                            type: "string",
                            example:
                              "Fisika adalah ilmu pengetahuan yang menjelaskan ...",
                            nullable: true,
                          },
                          tags: {
                            type: "string",
                            example: "fisika",
                            nullable: true,
                          },
                          authorId: { type: "integer", example: 1 },
                          totalQuestions: { type: "integer", example: 5 },
                          timeSeconds: { type: "integer", example: 300 },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2023-01-01 00:00:00",
                          },
                          updatedAt: {
                            type: "string",
                            format: "date-time",
                            example: "2023-01-01 00:10:00",
                          },
                        },
                        required: [
                          "id",
                          "title",
                          "authorId",
                          "totalQuestions",
                          "timeSeconds",
                          "createdAt",
                        ],
                      },
                      message: {
                        type: "string",
                        example: "Challenge updated successfully.",
                      },
                      links: {
                        type: "object",
                        properties: {
                          self: {
                            type: "string",
                            example: "/challenges/1/questions",
                          },
                          challengeDetails: {
                            type: "string",
                            example: "/challenges/1",
                          },
                          challengeParticipants: {
                            type: "string",
                            example: "/challenges/1/participants",
                          },
                          challenges: {
                            type: "string",
                            example: "/challenges",
                          },
                        },
                        required: [
                          "self",
                          "challengeDetails",
                          "challengeParticipants",
                          "challenges",
                        ],
                      },
                    },
                    required: ["success", "data", "message", "links"],
                  },
                },
              },
            },
            400: {
              description: "Bad request, invalid query parameters.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            field: { type: "string", example: "params" },
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["Params is missing."],
                            },
                          },
                          required: ["field", "messages"],
                        },
                        example: [
                          {
                            field: "params",
                            messages: ["Params is missing."],
                          },
                          {
                            field: "challengeId",
                            messages: ["challengeId is missing."],
                          },
                          {
                            field: "challengeId",
                            messages: ["challengeId must be a number."],
                          },
                        ],
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            500: {
              description: "Internal server error.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["An unexpected error occurred."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      });

    return challenges;
  })

  .group("/api/v1/participations", (participations) => {
    participations

      .get("/", () => {}, {
        detail: {
          tags: ["Participations"],
          summary: "Get all participations",
          description: "Fetches all participations data.",
          responses: {
            200: {
              description: "Participations fetched successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "number", example: 1 },
                          participantId: { type: "integer", example: "15" },
                          challengeId: { type: "integer", example: "491" },
                          score: { type: "integer", example: 100 },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2023-01-01 00:00:00",
                          },
                        },
                        required: [
                          "id",
                          "participantId",
                          "challengeId",
                          "score",
                          "createdAt",
                        ],
                      },
                      message: {
                        type: "string",
                        example: "Participations fetched successfully",
                      },
                      links: {
                        type: "object",
                        properties: {
                          self: { type: "string", example: "/participations" },
                          participation: {
                            type: "string",
                            example: "/participations/{id}",
                          },
                        },
                        required: ["self", "participation"],
                      },
                    },
                    required: ["success", "data", "message", "links"],
                  },
                },
              },
            },
            400: {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            field: { type: "string", example: "params" },
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["Params is missing."],
                            },
                          },
                          required: ["field", "messages"],
                        },
                        example: [
                          {
                            field: "params",
                            messages: ["Params is missing."],
                          },
                          {
                            field: "participationId",
                            messages: ["Participation ID is missing."],
                          },
                          {
                            field: "participationId",
                            messages: ["Participation ID must be a number."],
                          },
                        ],
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            500: {
              description: "Internal Server Error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["An unexpected error occurred."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      })

      .get("/:participationId", () => {}, {
        detail: {
          tags: ["Participations"],
          summary: "Get participation by ID",
          description: "Fetches a single participation by its ID.",
          parameters: [
            {
              name: "participationId",
              in: "path",
              required: true,
              description: "The ID of the participation to retrieve.",
              schema: {
                type: "number",
                example: "1",
              },
            },
          ],
          responses: {
            200: {
              description: "Participation fetched successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: {
                        type: "string",
                        example: "Participation fetched successfully",
                      },
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "number", example: 1 },
                          participantId: { type: "integer", example: "15" },
                          challengeId: { type: "integer", example: "491" },
                          score: { type: "integer", example: 100 },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2023-01-01 00:00:00",
                          },
                        },
                        required: [
                          "id",
                          "participantId",
                          "challengeId",
                          "score",
                          "createdAt",
                        ],
                      },
                      links: {
                        type: "object",
                        properties: {
                          self: {
                            type: "string",
                            example: "/participations/1",
                          },
                          participations: {
                            type: "string",
                            example: "/participations",
                          },
                        },
                        required: ["self", "participations"],
                      },
                    },
                    required: ["success", "message", "data", "links"],
                  },
                },
              },
            },
            400: {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            field: { type: "string", example: "params" },
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["Params is missing."],
                            },
                          },
                          required: ["field", "messages"],
                        },
                        example: [
                          {
                            field: "params",
                            messages: ["Params is missing."],
                          },
                          {
                            field: "participationId",
                            messages: ["Participation ID is missing."],
                          },
                          {
                            field: "participationId",
                            messages: ["Participation ID must be a number."],
                          },
                        ],
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
            500: {
              description: "Internal Server Error",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      errors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            messages: {
                              type: "array",
                              items: { type: "string" },
                              example: ["An unexpected error occurred."],
                            },
                          },
                          required: ["messages"],
                        },
                      },
                    },
                    required: ["success", "errors"],
                  },
                },
              },
            },
          },
        },
      });

    return participations;
  })

  .listen(8080, () => {
    console.log("Server is running on port 8080");
  });

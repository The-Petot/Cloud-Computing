import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

/* 
=======================
TABLE DEFINITION
=======================
*/

export const usersTable = pgTable('users', {
  id: serial().primaryKey(),

  email: varchar({ length: 255 }).unique().notNull(),
  password: varchar({ length: 255 }),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  totalScore: integer().notNull().default(0),
  currentRank: integer('current_rank').notNull().default(-1),
  profileImgUrl: text('profile_url').notNull(),
  
  twoFactorSecret: text('two_factor_secret'),
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
  notificationEnabled: boolean('notification_enabled').notNull().default(true),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const suggestionsTable = pgTable('suggestions', {
  id: serial().primaryKey(),
  description: text().notNull(),
  userId: integer('user_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const challengesTable = pgTable('challenges', {
  id: serial().primaryKey(),

  title: varchar({ length: 255 }).notNull(),
  description: text(),
  summary: text(),
  tags: text(),

  authorId: integer('author_id').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  timeSeconds: integer('time_seconds').notNull(),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const participantsTable = pgTable('participants', {
  id: serial().primaryKey(),
  participantId: integer('participant_id').notNull(),
  challengeId: integer('challenge_id').notNull(),
  score: integer().notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const questionsTable = pgTable('questions', {
  id: serial().primaryKey(),
  question: text().notNull(),
  challengeId: integer('challenge_id').notNull(),
  explanation: text().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const answersTable = pgTable('answers', {
  id: serial().primaryKey(),
  answer: text().notNull(),
  questionId: integer('question_id').notNull(),
  correct: boolean().notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/* 
=======================
TABLE RELATIONSHIP
=======================
*/

export const usersSuggestionsRelation = relations(usersTable, ({ many }) => ({
  suggestions: many(suggestionsTable),
}));

export const suggestionsUsersRelation = relations(
  suggestionsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [suggestionsTable.userId],
      references: [usersTable.id],
    }),
  })
);

export const usersChallengesRelation = relations(usersTable, ({ many }) => ({
  challenges: many(challengesTable),
}));

export const challengesUsersRelation = relations(
  challengesTable,
  ({ one }) => ({
    author: one(usersTable, {
      fields: [challengesTable.authorId],
      references: [usersTable.id],
    }),
  })
);

export const challengesParticipantsRelation = relations(
  challengesTable,
  ({ many }) => ({
    participants: many(participantsTable),
  })
);

export const participantsChallengesRelation = relations(
  participantsTable,
  ({ one }) => ({
    challenge: one(challengesTable, {
      fields: [participantsTable.challengeId],
      references: [challengesTable.id],
    }),
  })
);

export const usersParticipantsRelation = relations(usersTable, ({ many }) => ({
  participations: many(participantsTable),
}));

export const participantsUsersRelation = relations(
  participantsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [participantsTable.participantId],
      references: [usersTable.id],
    }),
  })
);

export const challengesQuestionsRelation = relations(
  challengesTable,
  ({ many }) => ({
    questions: many(questionsTable),
  })
);

export const questionsChallengesRelation = relations(
  questionsTable,
  ({ one }) => ({
    challenge: one(challengesTable, {
      fields: [questionsTable.challengeId],
      references: [challengesTable.id],
    }),
  })
);

export const questionsAnswersRelation = relations(
  questionsTable,
  ({ many }) => ({
    answers: many(answersTable),
  })
);

export const answersQuestionsRelation = relations(answersTable, ({ one }) => ({
  question: one(questionsTable, {
    fields: [answersTable.questionId],
    references: [questionsTable.id],
  }),
}));

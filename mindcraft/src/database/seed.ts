import db from './db';
import {
  participantsTable,
  challengesTable,
  usersTable,
  questionsTable,
  answersTable,
} from './schema';
import { Challenge, User } from '../types/global.type';

function generateRandomString() {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 20;
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}

async function run() {
  const users = await db.transaction(async (trx) => {
    const createdUsers: number[] = [];
    for (let i = 0; i < 50; i++) {
      const [user] = await trx
        .insert(usersTable)
        .values({
          email: `test-${generateRandomString()}@example.com`,
          firstName: `test-${generateRandomString()}`,
          lastName: `test-${generateRandomString()}`,
          password: 'password',
          profileImgUrl: 'https://example.com/profile.jpg',
        })
        .returning({ id: usersTable.id });
      createdUsers.push(user.id);
    }
    return createdUsers;
  });

  const challenges = await db.transaction(async (trx) => {
    const createdChallenges = [];
    for (const userId of users) {
      for (let i = 0; i < 5; i++) {
        const [challenge] = await trx
          .insert(challengesTable)
          .values({
            authorId: userId,
            title: `Challenge ${generateRandomString()}`,
            description: `Description ${generateRandomString()}`,
            timeSeconds: 3600,
            totalQuestions: 10,
            tags: 'tag1,tag2,tag3',
            summary: `Summary ${generateRandomString()}`,
          })
          .returning({
            id: challengesTable.id,
            authorId: challengesTable.authorId,
          });
        createdChallenges.push(challenge);

        for (let j = 0; j < 10; j++) {
          const [participant] = await trx
            .insert(participantsTable)
            .values({
              challengeId: challenge.id,
              score: Math.floor(Math.random() * 100),
              participantId: users[j],
            })
            .returning({
              id: participantsTable.id,
            });
        }
      }
    }
    return createdChallenges;
  });

  const questions = await db.transaction(async (trx) => {
    const createdQuestions = [];
    for (const challenge of challenges) {
      for (let i = 0; i < 5; i++) {
        const [question] = await trx
          .insert(questionsTable)
          .values({
            challengeId: challenge.id,
            question: `Question ${generateRandomString()}`,
            explanation: `Explanation ${generateRandomString()}`,
          })
          .returning({
            id: questionsTable.id,
          });
        createdQuestions.push(question);
      }
    }
    return createdQuestions;
  });

  const answers = await db.transaction(async (trx) => {
    const createdAnswers = [];
    for (const question of questions) {
      for (let i = 0; i < 4; i++) {
        const [answer] = await trx
          .insert(answersTable)
          .values({
            questionId: question.id,
            answer: `Answer ${generateRandomString()}`,
            correct: i === 0,
          })
          .returning({
            id: answersTable.id,
          });
        createdAnswers.push(answer);
      }
    }
    return createdAnswers;
  })

}

run();

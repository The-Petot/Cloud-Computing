import { answersTable, challengesTable, participantsTable, questionsTable, refreshTokensTable, suggestionsTable, usersTable } from "./schema";

const NUMBER_OF_ENTRIES = 10;

export function seedAnswers(): void {
}
export function seedChallenges(): void {

}
export function seedParticipants(): void {

}
export function seedQuestions(): void {

}
export function seedRefreshTokens(): void {

}
export function seedSuggestions(): void {

}
export function seedUsers(): void {

}

export const seed = async (): Promise<void> => {
  try {
    await seedAnswers();
  await seedChallenges();
  await seedParticipants();
  await seedQuestions();
  await seedRefreshTokens();
  await seedSuggestions();
  await seedUsers();
  } catch (error) {
    console.error('Error seeding tables:', error);
  }
};

seed();
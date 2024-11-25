const NUMBER_OF_ENTRIES = 10;
export function seedAnswers() {}
export function seedChallenges() {}
export function seedParticipants() {}
export function seedQuestions() {}
export function seedRefreshTokens() {}
export function seedSuggestions() {}
export function seedUsers() {}
export const seed = async ()=>{
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

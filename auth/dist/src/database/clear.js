import db from "./db";
import { answersTable, challengesTable, participantsTable, questionsTable, suggestionsTable, usersTable } from "./schema";
const clearEntries = async ()=>{
    try {
        await db.delete(answersTable);
        await db.delete(questionsTable);
        await db.delete(participantsTable);
        await db.delete(challengesTable);
        await db.delete(suggestionsTable);
        await db.delete(usersTable);
        console.log('Tables truncated successfully');
    } catch (error) {
        console.error('Error truncating tables:', error);
    }
};
clearEntries();

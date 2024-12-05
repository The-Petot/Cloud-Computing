import { eq } from 'drizzle-orm';
import db from '../database/db';
import { participantsTable } from '../database/schema';
import { Participation, ServiceMethodReturnType } from '../types/global.type';
import { handleDBError } from '../lib';

const participationsService = {
  async getParticipations(): Promise<ServiceMethodReturnType<Participation[]>> {
    try {
      const participations = await db.select().from(participantsTable);
      return {
        data: participations,
      };
    } catch (error) {
      return handleDBError(error, 'Unable to get participations');
    }
  },
  async getParticipationById(
    participationId: number
  ): Promise<ServiceMethodReturnType<Participation>> {
    try {
      const [participation] = await db
        .select()
        .from(participantsTable)
        .where(eq(participantsTable.id, participationId));

      if (!participation) {
        return {
          statusCode: 404,
          errors: [
            {
              messages: ['Participation not found'],
            },
          ],
        };
      }

      return {
        data: participation,
      };
    } catch (error) {
      return handleDBError(error, 'Unable to get participation data');
    }
  },
};

export default participationsService;

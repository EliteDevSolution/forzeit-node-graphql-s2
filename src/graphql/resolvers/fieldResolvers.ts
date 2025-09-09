import { Session } from '../../shared/types';

// Field resolvers 
export const fieldResolvers = {
  Session: {
    // Compute duration in minutes from startedAt and endedAt
    durationMinutes: (session: Session) => {
      try {
        const start = new Date(session.startedAt);
        const end = new Date(session.endedAt);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.warn(`Invalid date format in session ${session.id}`);
          return 0;
        }
        
        if (end < start) {
          console.warn(`End tim before start time in session ${session.id}`);
          return 0;
        }
        
        const durationMs = end.getTime() - start.getTime();
        const durationMinutes = Math.floor(durationMs / (1000 * 60));
        
        return durationMinutes;
      } catch (error) {
        console.error(`Error calculating duration for session ${session.id}:`, error);
        return 0;
      }
    }
  }
};


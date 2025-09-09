import { GraphQLContext } from '../../shared/types';
import { dataService } from '../../shared/data/dataService';
import { avaService } from '../../domains/insights/avaService';
import { requireAuth, requireOwnership } from '../../shared/auth/authMiddleware';

export const queryResolvers = {
  Query: {
    // Get a specific week by ID
    week: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      const week = dataService.getWeekById(id);
      
      if (!week) {
        throw new Error(`Week with id ${id} not found`);
      }

      // 1
      requireOwnership(context, week.userId);

      return week;
    },

    // I use pagination
    weeksByUser: async (
      _: any, 
      { userId, limit, offset }: { userId: string; limit?: number; offset?: number },
      context: GraphQLContext
    ) => {
      // Users can only access their own weeks
      requireOwnership(context, userId);

      // reasonable defaults and limits
      const actualLimit = limit && limit > 0 ? Math.min(limit, 50) : 10; // max 50, default 10
      const actualOffset = offset && offset >= 0 ? offset : 0;

      return dataService.getWeeksByUserId(userId, actualLimit, actualOffset);
    },

    // insights for a specific week
    avaInsights: async (_: any, { weekId }: { weekId: string }, context: GraphQLContext) => {
      const week = dataService.getWeekById(weekId);
      
      if (!week) {
        throw new Error(`Week with id ${weekId} not found`);
      }
      requireOwnership(context, week.userId);

      // Check cache
      const { getCachedAvaInsights, cacheAvaInsights } = require('../../shared/cache/cacheMiddleware');
      const cachedInsights = getCachedAvaInsights(weekId, context.userId!);
      
      if (cachedInsights) {
        //  add header will be handled by middleware
        return cachedInsights;
      }

      // if not, calculate insights
      const insights = avaService.calculateInsights(weekId);
      
      // finally
      cacheAvaInsights(weekId, context.userId!, insights);
      
      return insights;
    }
  }
};


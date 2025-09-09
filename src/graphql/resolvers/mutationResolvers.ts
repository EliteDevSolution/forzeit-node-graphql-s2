import { GraphQLContext, CardStatus } from '../../shared/types';
import { dataService } from '../../shared/data/dataService';
import { requireAuth, requireOwnership } from '../../shared/auth/authMiddleware';

// Input validation helpers
const validateCreateCardInput = (input: any) => {
  if (!input.title || input.title.trim().length === 0) {
    throw new Error('Card title cannot be empty');
  }
  
  if (input.minutes < 0) {
    throw new Error('Minutes cannot be negative');
  }
  
  if (input.title.length > 200) {
    throw new Error('Card title is too long (max 200 characters)');
  }
};

const validateCardStatus = (status: string): CardStatus => {
  const validStatuses = Object.values(CardStatus);
  if (!validStatuses.includes(status as CardStatus)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }
  return status as CardStatus;
};

// Mutation resolvers
export const mutationResolvers = {
  Mutation: {
    // Create a new card
    createCard: async (
      _: any,
      { input }: { input: { weekId: string; title: string; minutes: number } },
      context: GraphQLContext
    ) => {
      // first
      requireAuth(context);

      // Validate input
      validateCreateCardInput(input);

      //chec if week exists
      const week = dataService.getWeekById(input.weekId);
      if (!week) {
        throw new Error(`Week with id ${input.weekId} not found`);
      }

      // check if user owns the week
      requireOwnership(context, week.userId);

      // create the card
      const newCard = dataService.createCard(
        input.weekId,
        input.title.trim(),
        input.minutes,
        context.userId!
      );

      // invalidate cache for this week since insights will change
      const { invalidateWeekCache } = require('../../shared/cache/cacheMiddleware');
      invalidateWeekCache(input.weekId, context.userId!);

      return newCard;
    },

    // Update card status
    updateCardStatus: async (
      _: any,
      { id, status }: { id: string; status: string },
      context: GraphQLContext
    ) => {
      requireAuth(context);
      const validatedStatus = validateCardStatus(status);

      const card = dataService.getCardById(id);
      if (!card) {
        throw new Error(`Card with id ${id} not found`);
      }
      requireOwnership(context, card.userId);
      const updatedCard = dataService.updateCardStatus(id, validatedStatus);
      
      if (!updatedCard) {
        throw new Error('Failed to update card status');
      }
      const { invalidateWeekCache } = require('../../shared/cache/cacheMiddleware');
      invalidateWeekCache(updatedCard.weekId, context.userId!);

      return updatedCard;
    }
  }
};


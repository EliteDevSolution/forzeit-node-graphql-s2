import { queryResolvers } from './queryResolvers';
import { mutationResolvers } from './mutationResolvers';
import { fieldResolvers } from './fieldResolvers';

// Combine resolvers
export const resolvers = {
  ...queryResolvers,
  ...mutationResolvers,
  ...fieldResolvers
};


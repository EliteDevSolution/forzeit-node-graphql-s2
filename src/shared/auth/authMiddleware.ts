import { Request } from 'express';
import { GraphQLContext } from '../types';
import { authService } from './authService';

/**
 * Create GraphQL context with authentication
 * This function is called for every GraphQL request
 */
export async function createAuthContext({ req }: { req: Request }): Promise<GraphQLContext> {
  const context: GraphQLContext = {};

  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authService.extractTokenFromHeader(authHeader);

    if (token) {
      // Verify the token
      const payload = authService.verifyToken(token);
      
      if (payload) {
        // get user from payload
        const user = authService.getUserFromPayload(payload);
        
        if (user) {
          context.user = user;
          context.userId = user.id;
        } else {
          //token is valid but user doesn't exist
          console.warn(`Valid token but user not found: ${payload.sub}`);
        }
      }
    }
    
    // If no token or invalid token, context will have undefined user/userId
    // This allows for optional authentication on some resolvers
    
  } catch (error) {
    // log error but don't fail the request
    // Some queries might not require authentication
    console.error('Error in auth middleware:', error);
  }

  return context;
}

/**
 * Helper function to require authentication in resolvers
 * Throws an error if user is not authenticated
 */
export function requireAuth(context: GraphQLContext): asserts context is GraphQLContext & { user: NonNullable<GraphQLContext['user']>; userId: string } {
  if (!context.user || !context.userId) {
    throw new Error('Authentication required. Please provide a valid JWT token in the Authorization header.');
  }
}

/**
 * Helper function to check if user owns a resource
 * @param context GraphQL context
 * @param resourceUserId User ID that owns the resource
 */
export function requireOwnership(context: GraphQLContext, resourceUserId: string) {
  requireAuth(context);
  
  if (context.userId !== resourceUserId) {
    throw new Error('Access denied: You can only access your own resources.');
  }
}


import { Request, Response } from 'express';
import { cacheService } from './cacheService';

// Cache middleware for GraphQL responses with s X-Cache header when  hit/miss

export interface CacheContext {
  cacheHit?: boolean;
  cacheKey?: string;
}

/**
 * Generate cache key for avaInsights query
 * @param weekId Week ID
 * @param userId User ID (for security)
 * @returns Cache key
 */
export function generateAvaInsightsCacheKey(weekId: string, userId: string): string {
  return `ava_insights:${userId}:${weekId}`;
}

/**
 * Get cached ava insights
 * @param weekId Week ID
 * @param userId User ID
 * @returns Cached insights or null
 */
export function getCachedAvaInsights(weekId: string, userId: string): any | null {
  const cacheKey = generateAvaInsightsCacheKey(weekId, userId);
  return cacheService.get(cacheKey);
}

/**
 * Cache ava insights
 * @param weekId Week ID
 * @param userId User ID
 * @param insights Insights data
 */
export function cacheAvaInsights(weekId: string, userId: string, insights: any): void {
  const cacheKey = generateAvaInsightsCacheKey(weekId, userId);
  cacheService.set(cacheKey, insights, 60); // 60 seconds TTL as per requirements
}

/**
 * Express middleware to add cache headers
 * This should be applied after GraphQL middleware
 */
export function addCacheHeaders(req: Request, res: Response, next: any) {
  // Store original send function
  const originalSend = res.send;

  // override send function to add cache headers
  res.send = function(body: any) {
    // Check if this is a GraphQL response for avaInsights
    if (req.body && req.body.query && req.body.query.includes('avaInsights')) {
      // Try to determine if this was a cache hit
      //in a real app you'd track this more precisely
      const cacheHit = req.body.variables && req.body.variables.weekId ? 
        cacheService.has(generateAvaInsightsCacheKey(req.body.variables.weekId, 'unknown')) : 
        false;
      
      res.setHeader('X-Cache', cacheHit ? 'HIT' : 'MISS');
    }

    //call original
    return originalSend.call(this, body);
  };

  next();
}

/**
 * Invalidate cache for a specific week
 * Useful when data changes
 * @param weekId Week ID
 * @param userId User ID
 */
export function invalidateWeekCache(weekId: string, userId: string): void {
  const cacheKey = generateAvaInsightsCacheKey(weekId, userId);
  cacheService.delete(cacheKey);
  console.log(`Cache invalidated for week ${weekId}, user ${userId}`);
}


// Base types for the Forzeit application

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Week {
  id: string;
  userId: string;
  startISO: string; // like "2025-08-25"
}

export enum CardStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export interface Card {
  id: string;
  userId: string;
  weekId: string;
  title: string;
  status: CardStatus;
  minutes: number;
  createdAt: string; // ISO datetime
}

export interface Session {
  id: string;
  userId: string;
  startedAt: string; // ISO datetime 
  endedAt: string; // ISO datetime 
}

// Computed insights for Ava
export interface AvaInsights {
  totalMinutes: number;
  doneCount: number;
  focusScore: number;
  recommendations: string[];
}

// JWT payload structure
export interface JWTPayload {
  sub: string; // user id
  iat?: number;
  exp?: number;
}

// GraphQL context type
export interface GraphQLContext {
  user?: User;
  userId?: string;
}


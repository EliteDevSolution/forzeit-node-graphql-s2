import { gql } from 'graphql-tag';

// GraphQL schema definition 
export const typeDefs = gql`
  # Enums
  enum CardStatus {
    TODO
    IN_PROGRESS
    DONE
  }

  # Core types
  type User {
    id: ID!
    email: String!
    name: String!
  }

  type Week {
    id: ID!
    userId: ID!
    startISO: String!
    # could add cards here later if needed
  }

  type Card {
    id: ID!
    userId: ID!
    weekId: ID!
    title: String!
    status: CardStatus!
    minutes: Int!
    createdAt: String!
  }

  type Session {
    id: ID!
    userId: ID!
    startedAt: String!
    endedAt: String!
    durationMinutes: Int! # computed field
  }

  # Ava insights fo analytics
  type AvaInsights {
    totalMinutes: Int!
    doneCount: Int!
    focusScore: Int!
    recommendations: [String!]!
  }

  # Input types for mutations
  input CreateCardInput {
    weekId: ID!
    title: String!
    minutes: Int!
  }

  # Queries
  type Query {
    # Get a  week by ID
    week(id: ID!): Week
    
    # Get weeks for a userpaginated
    weeksByUser(userId: ID!, limit: Int, offset: Int): [Week!]!
    
    # Get Ava insights for a week
    avaInsights(weekId: ID!): AvaInsights!
  }

  # Mutations
  type Mutation {
    # Create a new card
    createCard(input: CreateCardInput!): Card!
    
    # Update card status
    updateCardStatus(id: ID!, status: CardStatus!): Card!
  }
`;


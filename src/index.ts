import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { typeDefs } from './graphql/schemas/typeDefs';
import { resolvers } from './graphql/resolvers';
import { GraphQLContext } from './shared/types';
import { createAuthContext } from './shared/auth/authMiddleware';

// Express app
const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// Basic CORS setup for development
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}));

app.use(express.json());

async function startServer() {
  // Create Apollo Server
  const server = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    // Enable GraphQL Playground in development
    introspection: true,
    // plugins: [] // 
  });

  await server.start();

  // Apply GraphQL middleware
  app.use('/graphql', expressMiddleware(server, {
    context: createAuthContext
  }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'forzeit-stage2-api'
    });
  });

  // Test token generation endpoint (for development only)
  app.post('/auth/test-token', (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // mport authService here
    const { authService } = require('./shared/auth/authService');
    
    try {
      const token = authService.generateTestToken(userId);
      res.json({ 
        token,
        userId,
        message: 'Test token generated successfully. Use in Authorization header as: Bearer <token>'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate token' });
    }
  });

  // statistics endpoint (for development monitoring)
  app.get('/cache/stats', (req, res) => {
    const { cacheService } = require('./shared/cache/cacheService');
    const stats = cacheService.getStats();
    res.json({
      ...stats,
      timestamp: new Date().toISOString()
    });
  });

  // Start server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`📊 Health check at http://localhost:${PORT}/health`);
  });
}

// Start  server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});


import { EmotionsMcpServer } from './server';
import { EmotionsDbService } from './database';
import { Emotion, EmotionFilter, EmotionRecord, SourceType } from './types';

export {
  EmotionsMcpServer,
  EmotionsDbService,
  Emotion,
  EmotionFilter,
  EmotionRecord,
  SourceType
};

// Example of how to create and start the MCP server
// This code will only run if this file is executed directly
if (require.main === module) {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/emotions';
  
  const server = new EmotionsMcpServer(connectionString);
  
  server.start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down server...');
    try {
      await server.stop();
      console.log('Server stopped');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

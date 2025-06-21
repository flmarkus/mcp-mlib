#!/usr/bin/env node

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

if (require.main === module) {
  // Check if the connection string is provided as an argument
  let connectionString: string;
  
  if (process.argv.length > 2) {
    const arg = process.argv[2];
    if (arg.startsWith('env:')) {
      // Extract the environment variable name after 'env:'
      const envVarName = arg.substring(4);
      const envValue = process.env[envVarName];
      if (!envValue) {
        console.error(`Error: Environment variable "${envVarName}" not found`);
        process.exit(1);
      }
      connectionString = envValue;
    } else {
      // Direct connection string
      connectionString = arg;
    }
  } else {
    connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/emotions';
  }
  
  const server = new EmotionsMcpServer(connectionString);
  
  server.start()
    .catch(err => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });

  // Handle graceful shutdown
  const shutdown = async () => {
    try {
      await server.stop();
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
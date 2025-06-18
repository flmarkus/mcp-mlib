import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { EmotionsDbService } from './database';
import { z } from 'zod';

export class EmotionsMcpServer {
  private server: McpServer;
  private db: EmotionsDbService;
  private transport: StdioServerTransport | StreamableHTTPServerTransport | null = null;

  constructor(connectionString: string) {
    this.db = new EmotionsDbService(connectionString);
    this.server = new McpServer({
      name: 'EmotionsMcpServer',
      version: '1.0.0',
    });

    this.registerMethods();
  }

  private registerMethods() {
    // Method to check if the emotions table exists
    this.server.registerTool(
      'tableExists',
      {
        description: 'Check if the emotions table exists for a given user context',
        inputSchema: {}
      },
      async () => {
        try {
          const exists = await this.db.tableExists();
          return {
            content: [{ type: 'text', text: JSON.stringify({ exists }) }]
          };
        } catch (error: any) {
          return {
            content: [{ type: 'text', text: `Error: ${error.message}` }],
            status: 'error'
          };
        }
      }
    );

    // Method to create the emotions table
    this.server.registerTool(
      'createTable',
      {
        description: 'Create the emotions table in the database',
        inputSchema: {}
      },
      async () => {
        try {
          await this.db.createTable();
          return {
            content: [{ type: 'text', text: 'Table created successfully' }]
          };
        } catch (error: any) {
          return {
            content: [{ type: 'text', text: `Error: ${error.message}` }],
            status: 'error'
          };
        }
      }
    );

    // Method to insert a new emotion
    this.server.registerTool(
      'insertEmotion',
      {
        description: 'Insert a new emotion record into the database',
        inputSchema: {
          userContext: z.string().describe('User context for the emotion'),
          emotion: z.object({
            emotion: z.string(),
            nummer: z.number().optional(),
            datum: z.date().optional(),
            alter: z.number().optional(),
            quellenart: z.enum(['Eigene Emotion', 'Übernommene Emotion', 'Geerbte Emotion']).optional(),
            quelle: z.string().optional(),
            koerperteil: z.string().optional(),
            auswirkungen: z.string().optional(),
            bemerkungen: z.string().optional()
          }).describe('Emotion data')
        }
      },
      async ({ userContext, emotion }) => {
        try {
          if (!userContext) {
            return {
              content: [{ type: 'text', text: 'User context is required' }],
              status: 'error'
            };
          }

          if (!emotion) {
            return {
              content: [{ type: 'text', text: 'Emotion data is required' }],
              status: 'error'
            };
          }

          const result = await this.db.insertEmotion(userContext, emotion);
          return {
            content: [{ type: 'text', text: JSON.stringify(result) }]
          };
        } catch (error: any) {
          return {
            content: [{ type: 'text', text: `Error: ${error.message}` }],
            status: 'error'
          };
        }
      }
    );

    // Method to delete an emotion
    this.server.registerTool(
      'deleteEmotion',
      {
        description: 'Delete an emotion by ID',
        inputSchema: {
          userContext: z.string().describe('User context for the emotion'),
          emotionId: z.number().describe('ID of the emotion to delete')
        }
      },
      async ({ userContext, emotionId }) => {
        try {
          if (!userContext) {
            return {
              content: [{ type: 'text', text: 'User context is required' }],
              status: 'error'
            };
          }

          if (!emotionId) {
            return {
              content: [{ type: 'text', text: 'Emotion ID is required' }],
              status: 'error'
            };
          }

          const result = await this.db.deleteEmotion(userContext, emotionId);
          if (result) {
            return {
              content: [{ type: 'text', text: 'Emotion deleted successfully' }]
            };
          } else {
            return {
              content: [{ type: 'text', text: 'Emotion not found' }],
              status: 'error'
            };
          }
        } catch (error: any) {
          return {
            content: [{ type: 'text', text: `Error: ${error.message}` }],
            status: 'error'
          };
        }
      }
    );

    // Method to get emotions with filters
    this.server.registerTool(
      'getEmotions',
      {
        description: 'Get emotions based on filters',
        inputSchema: {
          userContext: z.string().describe('User context for the emotions'),
          filter: z.object({
            nummer: z.number().optional(),
            emotion: z.string().optional(),
            datumVon: z.date().optional(),
            datumBis: z.date().optional(),
            alterVon: z.number().optional(),
            alterBis: z.number().optional(),
            quellenart: z.enum(['Eigene Emotion', 'Übernommene Emotion', 'Geerbte Emotion']).optional(),
            quelle: z.string().optional(),
            koerperteil: z.string().optional(),
            auswirkungen: z.string().optional(),
            bemerkungen: z.string().optional()
          }).optional().describe('Filter criteria')
        }
      },
      async ({ userContext, filter = {} }) => {
        try {
          if (!userContext) {
            return {
              content: [{ type: 'text', text: 'User context is required' }],
              status: 'error'
            };
          }

          const emotions = await this.db.getEmotions(userContext, filter);
          return {
            content: [{ type: 'text', text: JSON.stringify(emotions) }]
          };
        } catch (error: any) {
          return {
            content: [{ type: 'text', text: `Error: ${error.message}` }],
            status: 'error'
          };
        }
      }
    );

    // Method to get a specific emotion by ID
    this.server.registerTool(
      'getEmotionById',
      {
        description: 'Get a specific emotion by ID',
        inputSchema: {
          userContext: z.string().describe('User context for the emotion'),
          emotionId: z.number().describe('ID of the emotion to retrieve')
        }
      },
      async ({ userContext, emotionId }) => {
        try {
          if (!userContext) {
            return {
              content: [{ type: 'text', text: 'User context is required' }],
              status: 'error'
            };
          }

          if (!emotionId) {
            return {
              content: [{ type: 'text', text: 'Emotion ID is required' }],
              status: 'error'
            };
          }

          const emotion = await this.db.getEmotionById(userContext, emotionId);
          if (emotion) {
            return {
              content: [{ type: 'text', text: JSON.stringify(emotion) }]
            };
          } else {
            return {
              content: [{ type: 'text', text: 'Emotion not found' }],
              status: 'error'
            };
          }
        } catch (error: any) {
          return {
            content: [{ type: 'text', text: `Error: ${error.message}` }],
            status: 'error'
          };
        }
      }
    );
  }

  async start(): Promise<void> {
    try {
      this.transport = new StdioServerTransport();
      await this.server.connect(this.transport);
      console.log('MCP Server started');
    } catch (error) {
      console.error('Failed to start MCP Server:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.transport) {
        await this.server.close();
      }
      await this.db.closeConnection();
      console.log('MCP Server stopped');
    } catch (error) {
      console.error('Error stopping MCP Server:', error);
      throw error;
    }
  }
}
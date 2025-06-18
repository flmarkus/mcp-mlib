import { Pool, PoolClient } from 'pg';
import { Emotion, EmotionFilter, EmotionRecord } from './types';

export class EmotionsDbService {
  private pool: Pool;
  private readonly tableName = 'emotions';

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
    });
  }

  async closeConnection(): Promise<void> {
    await this.pool.end();
  }

  async tableExists(): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [this.tableName]);
      
      return result.rows[0].exists;
    } finally {
      client.release();
    }
  }

  async createTable(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
          id SERIAL PRIMARY KEY,
          user_context TEXT NOT NULL,
          nummer INTEGER NOT NULL,
          emotion TEXT NOT NULL,
          datum DATE,
          alter INTEGER,
          quellenart TEXT CHECK (quellenart IN ('Eigene Emotion', 'Übernommene Emotion', 'Geerbte Emotion')),
          quelle TEXT,
          koerperteil TEXT,
          auswirkungen TEXT,
          bemerkungen TEXT,
          UNIQUE(user_context, nummer)
        )
      `);
    } finally {
      client.release();
    }
  }

  async insertEmotion(userContext: string, emotion: Emotion): Promise<EmotionRecord> {
    // Validate required fields
    if (!emotion.emotion) {
      throw new Error('Das Feld "emotion" ist erforderlich');
    }

    // Validate quelle field when necessary
    if ((emotion.quellenart === 'Übernommene Emotion' || emotion.quellenart === 'Geerbte Emotion') && !emotion.quelle) {
      throw new Error('Das Feld "quelle" ist erforderlich für übernommene oder geerbte Emotionen');
    }

    const client = await this.pool.connect();
    try {
      // Start a transaction
      await client.query('BEGIN');

      // Get the next nummer value for this user context if not provided
      let nummer = emotion.nummer;
      if (!nummer) {
        const nextNummerResult = await client.query(
          `SELECT COALESCE(MAX(nummer), 0) + 1 AS next_nummer FROM ${this.tableName} WHERE user_context = $1`,
          [userContext]
        );
        nummer = nextNummerResult.rows[0].next_nummer;
      } else {
        // Check if this nummer already exists for this user
        const existingCheck = await client.query(
          `SELECT 1 FROM ${this.tableName} WHERE user_context = $1 AND nummer = $2`,
          [userContext, nummer]
        );
        
        if (existingCheck.rows.length > 0) {
          throw new Error(`Eine Emotion mit der Nummer ${nummer} existiert bereits für diesen Benutzer`);
        }
      }

      const result = await client.query(
        `INSERT INTO ${this.tableName} (
          user_context, nummer, emotion, datum, alter, quellenart, quelle, koerperteil, auswirkungen, bemerkungen
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING id, user_context AS "userContext", nummer, emotion, datum, alter, quellenart, quelle, koerperteil, auswirkungen, bemerkungen`,
        [
          userContext,
          nummer,
          emotion.emotion,
          emotion.datum || null,
          emotion.alter || null,
          emotion.quellenart || null,
          emotion.quelle || null,
          emotion.koerperteil || null,
          emotion.auswirkungen || null,
          emotion.bemerkungen || null
        ]
      );

      // Commit the transaction
      await client.query('COMMIT');
      
      return result.rows[0] as EmotionRecord;
    } catch (error) {
      // Rollback in case of error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteEmotion(userContext: string, emotionId: number): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `DELETE FROM ${this.tableName} WHERE id = $1 AND user_context = $2 RETURNING id`,
        [emotionId, userContext]
      );
      
      return (result.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  }

  async getEmotionById(userContext: string, emotionId: number): Promise<EmotionRecord | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT 
          id, 
          user_context AS "userContext", 
          nummer, 
          emotion, 
          datum, 
          alter, 
          quellenart, 
          quelle, 
          koerperteil, 
          auswirkungen, 
          bemerkungen
        FROM ${this.tableName} 
        WHERE id = $1 AND user_context = $2`,
        [emotionId, userContext]
      );
      
      return result.rows.length > 0 ? result.rows[0] as EmotionRecord : null;
    } finally {
      client.release();
    }
  }

  private buildFilterQuery(filter: EmotionFilter): { query: string; params: any[]; } {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    // Add user_context as first parameter
    params.push(''); // Will be set in getEmotions method
    conditions.push(`user_context = $${paramIndex++}`);
    
    if (filter.nummer !== undefined) {
      conditions.push(`nummer = $${paramIndex++}`);
      params.push(filter.nummer);
    }
    
    if (filter.emotion) {
      conditions.push(`emotion ILIKE $${paramIndex++}`);
      params.push(`%${filter.emotion}%`);
    }
    
    if (filter.datumVon) {
      conditions.push(`datum >= $${paramIndex++}`);
      params.push(filter.datumVon);
    }
    
    if (filter.datumBis) {
      conditions.push(`datum <= $${paramIndex++}`);
      params.push(filter.datumBis);
    }
    
    if (filter.alterVon !== undefined) {
      conditions.push(`alter >= $${paramIndex++}`);
      params.push(filter.alterVon);
    }
    
    if (filter.alterBis !== undefined) {
      conditions.push(`alter <= $${paramIndex++}`);
      params.push(filter.alterBis);
    }
    
    if (filter.quellenart) {
      conditions.push(`quellenart = $${paramIndex++}`);
      params.push(filter.quellenart);
    }
    
    if (filter.quelle) {
      conditions.push(`quelle ILIKE $${paramIndex++}`);
      params.push(`%${filter.quelle}%`);
    }
    
    if (filter.koerperteil) {
      conditions.push(`koerperteil ILIKE $${paramIndex++}`);
      params.push(`%${filter.koerperteil}%`);
    }
    
    if (filter.auswirkungen) {
      conditions.push(`auswirkungen ILIKE $${paramIndex++}`);
      params.push(`%${filter.auswirkungen}%`);
    }
    
    if (filter.bemerkungen) {
      conditions.push(`bemerkungen ILIKE $${paramIndex++}`);
      params.push(`%${filter.bemerkungen}%`);
    }
    
    const query = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';
      
    return { query, params };
  }

  async getEmotions(userContext: string, filter: EmotionFilter = {}): Promise<EmotionRecord[]> {
    const { query, params } = this.buildFilterQuery(filter);
    params[0] = userContext; // Set the first parameter to userContext
    
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT 
          id, 
          user_context AS "userContext", 
          nummer, 
          emotion, 
          datum, 
          alter, 
          quellenart, 
          quelle, 
          koerperteil, 
          auswirkungen, 
          bemerkungen
        FROM ${this.tableName} 
        ${query}
        ORDER BY nummer ASC`,
        params
      );
      
      return result.rows as EmotionRecord[];
    } finally {
      client.release();
    }
  }
}

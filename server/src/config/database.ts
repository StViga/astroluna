import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}

// Database configuration from environment variables
export const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'astroluna',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? true : false
};

// Create PostgreSQL connection pool
export const pool = new Pool({
  ...dbConfig,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close clients after 30 seconds of inactivity
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
});

// Database connection helper
export class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    this.pool = pool;
    this.setupErrorHandlers();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private setupErrorHandlers() {
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client:', err);
    });

    this.pool.on('connect', (client) => {
      console.log('New client connected to database');
    });

    this.pool.on('remove', (client) => {
      console.log('Client removed from pool');
    });
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Database query executed', { 
        query: text.substring(0, 100), 
        duration: `${duration}ms`,
        rows: result.rowCount 
      });
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  public async getClient() {
    return await this.pool.connect();
  }

  public async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async close() {
    await this.pool.end();
  }

  public async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT NOW()');
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }
}

export default Database.getInstance();
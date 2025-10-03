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
  ssl: process.env.NODE_ENV === 'production'
};

// Create PostgreSQL connection pool
// Support both individual config and DATABASE_URL (for Railway)
let poolConfig: any;

if (process.env.DATABASE_URL) {
  // Railway provides DATABASE_URL
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  // Use individual config variables
  poolConfig = {
    ...dbConfig,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

export const pool = new Pool(poolConfig);

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
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });

    this.pool.on('connect', () => {
      console.log('🗄️ New client connected to PostgreSQL');
    });

    this.pool.on('remove', () => {
      console.log('🗄️ Client removed from pool');
    });
  }

  public async testConnection(): Promise<boolean> {
    try {
      console.log('🗄️ Testing database connection...');
      const result = await this.pool.query('SELECT NOW()');
      console.log('✅ Database connection successful:', result.rows[0]);
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('🗄️ Query executed', { text: text.substring(0, 50), duration, rows: result.rowCount });
      return result;
    } catch (error) {
      console.error('🗄️ Query error', { text: text.substring(0, 50), error: error.message });
      throw error;
    }
  }

  public async getClient() {
    return this.pool.connect();
  }

  public async close(): Promise<void> {
    console.log('🗄️ Closing database pool...');
    await this.pool.end();
    console.log('🗄️ Database pool closed');
  }

  public async validateSchema(): Promise<boolean> {
    try {
      // Check if required tables exist
      const tableCheck = await this.pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'credits');
      `);
      
      console.log('🗄️ Found tables:', tableCheck.rows.map(row => row.table_name));
      return tableCheck.rows.length >= 2; // At least users and credits tables
    } catch (error) {
      console.error('❌ Schema validation failed:', error);
      return false;
    }
  }
}

// Initialize database connection
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('🗄️ Initializing database connection...');
    const db = Database.getInstance();
    const connected = await db.testConnection();
    
    if (!connected) {
      throw new Error('Database connection failed');
    }

    // Validate schema or create tables if needed
    const schemaValid = await db.validateSchema();
    if (!schemaValid && process.env.NODE_ENV !== 'production') {
      console.log('⚠️ Database schema incomplete. Run migrations to set up tables.');
    }
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    if (process.env.NODE_ENV === 'production') {
      throw error; // Fail hard in production
    }
    console.log('⚠️ Continuing without database in development mode');
  }
};

export default Database;
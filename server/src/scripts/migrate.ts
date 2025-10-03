#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Database } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Migration {
  id: number;
  filename: string;
  sql: string;
}

async function runMigrations() {
  console.log('🔄 Starting database migrations...');
  
  try {
    const db = Database.getInstance();
    
    // Test connection
    const connected = await db.testConnection();
    if (!connected) {
      throw new Error('Cannot connect to database');
    }

    // Create migrations table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get migration files
    const migrationsDir = path.join(__dirname, '../../migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📂 Found ${sqlFiles.length} migration files`);

    // Get already executed migrations
    const executedResult = await db.query(
      'SELECT filename FROM schema_migrations ORDER BY filename'
    );
    const executed = new Set(executedResult.rows.map(row => row.filename));

    // Execute pending migrations
    for (const filename of sqlFiles) {
      if (executed.has(filename)) {
        console.log(`⏭️  Skipping ${filename} (already executed)`);
        continue;
      }

      console.log(`▶️  Executing migration: ${filename}`);
      
      try {
        const filePath = path.join(migrationsDir, filename);
        const sql = await fs.readFile(filePath, 'utf-8');
        
        // Execute migration in a transaction
        const client = await db.getClient();
        
        try {
          await client.query('BEGIN');
          
          // Execute the migration SQL
          await client.query(sql);
          
          // Record the migration as executed
          await client.query(
            'INSERT INTO schema_migrations (filename) VALUES ($1)',
            [filename]
          );
          
          await client.query('COMMIT');
          console.log(`✅ Successfully executed: ${filename}`);
          
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
        
      } catch (error) {
        console.error(`❌ Failed to execute ${filename}:`, error);
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully!');
    
    // Show current database state
    const tableResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📊 Current database tables:');
    tableResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      console.log('✨ Migrations complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Migration error:', error);
      process.exit(1);
    });
}

export default runMigrations;
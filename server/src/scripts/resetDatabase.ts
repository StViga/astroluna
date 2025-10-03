import { Pool } from 'pg';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function resetDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Resetting database...');

    // Drop all tables in correct order (respecting foreign keys)
    const dropQueries = [
      'DROP TABLE IF EXISTS transactions CASCADE;',
      'DROP TABLE IF EXISTS ai_generations CASCADE;', 
      'DROP TABLE IF EXISTS user_sessions CASCADE;',
      'DROP TABLE IF EXISTS user_profiles CASCADE;',
      'DROP TABLE IF EXISTS users CASCADE;',
      'DROP TABLE IF EXISTS migrations CASCADE;',
      'DROP EXTENSION IF EXISTS "uuid-ossp";'
    ];

    for (const query of dropQueries) {
      try {
        await client.query(query);
        console.log(`✅ Executed: ${query.split(' ')[2]}`);
      } catch (error) {
        console.log(`⚠️  Warning dropping ${query.split(' ')[2]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log('🗑️  All tables dropped');

    // Re-create database structure
    const schemaPath = join(__dirname, '../../migrations/001_initial_schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');

    // Execute schema creation
    await client.query(schema);
    console.log('📋 Schema recreated from migration');

    // Insert seed data if in development
    if (process.env.NODE_ENV !== 'production') {
      try {
        const seedPath = join(__dirname, 'seed.ts');
        const { seedDatabase } = await import('./seed.js');
        await seedDatabase();
        console.log('🌱 Seed data inserted');
      } catch (error) {
        console.log('⚠️  Could not run seeding (this is normal in production)');
      }
    }

    console.log('✅ Database reset completed successfully!');

  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  resetDatabase().catch(console.error);
}

export { resetDatabase };
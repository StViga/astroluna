#!/usr/bin/env tsx

import { Database } from '../config/database.js';
import { SystemLogger } from '../services/LoggingService.js';

async function setupDatabase() {
  console.log('🔧 Setting up database for Railway deployment...');
  
  try {
    const db = Database.getInstance();
    
    // Test connection first
    const connected = await db.testConnection();
    if (!connected) {
      console.log('❌ Cannot connect to database');
      // On Railway, PostgreSQL might take a moment to be ready
      console.log('⏳ Waiting for PostgreSQL to be ready...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const retryConnected = await db.testConnection();
      if (!retryConnected) {
        throw new Error('Database connection failed after retry');
      }
    }
    
    console.log('✅ Database connection established');
    
    // Create basic extensions if they don't exist
    try {
      await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('📦 UUID extension enabled');
    } catch (error) {
      console.log('ℹ️  UUID extension may already exist or not available');
    }
    
    try {
      await db.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
      console.log('🔐 Crypto extension enabled');
    } catch (error) {
      console.log('ℹ️  Crypto extension may already exist or not available');
    }
    
    // Create migrations table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('📋 Schema migrations table ready');
    
    // Check if basic tables exist
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log(`📊 Current database has ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    SystemLogger.error('Database setup failed', error);
    throw error;
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
    .then(() => {
      console.log('✨ Database setup complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Database setup error:', error);
      process.exit(1);
    });
}

export default setupDatabase;
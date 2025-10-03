#!/usr/bin/env tsx

import bcrypt from 'bcryptjs';
import { Database } from '../config/database.js';
import { SystemLogger } from '../services/LoggingService.js';

async function seedDatabase() {
  console.log('🌱 Seeding database with initial data...');
  
  try {
    const db = Database.getInstance();
    
    // Test connection
    const connected = await db.testConnection();
    if (!connected) {
      throw new Error('Cannot connect to database');
    }
    
    // Check if data already exists
    const userCheck = await db.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(userCheck.rows[0].count);
    
    if (userCount > 0) {
      console.log(`ℹ️  Database already has ${userCount} users, skipping seed`);
      return;
    }
    
    console.log('📝 Creating demo users...');
    
    // Create demo users
    const demoUsers = [
      {
        email: 'demo@astroluna.com',
        password: 'demo123456',
        full_name: 'Demo User',
        phone: '+1 (555) 123-4567',
        is_email_verified: true,
        language: 'en',
        currency: 'USD',
        credits: 125,
        subscription_type: 'pro'
      },
      {
        email: 'alice@example.com',
        password: 'password123',
        full_name: 'Alice Johnson',
        is_email_verified: true,
        language: 'en',
        currency: 'USD',
        credits: 50,
        subscription_type: 'starter'
      },
      {
        email: 'bob@example.com',
        password: 'password123',
        full_name: 'Bob Smith',
        is_email_verified: true,
        language: 'en',
        currency: 'EUR',
        credits: 200,
        subscription_type: 'master'
      }
    ];
    
    for (const userData of demoUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const userResult = await db.query(
        `INSERT INTO users (email, password_hash, full_name, phone, is_email_verified, 
         language, currency, credits, subscription_type) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING id`,
        [
          userData.email,
          hashedPassword,
          userData.full_name,
          userData.phone || null,
          userData.is_email_verified,
          userData.language,
          userData.currency,
          userData.credits,
          userData.subscription_type
        ]
      );
      
      const userId = userResult.rows[0].id;
      console.log(`✅ Created user: ${userData.email} (${userId})`);
      
      // Create user profile with sample astrological data
      if (userData.email === 'demo@astroluna.com') {
        await db.query(
          `INSERT INTO user_profiles (user_id, birth_date, birth_time, birth_place,
           birth_latitude, birth_longitude, time_zone, sun_sign, moon_sign, rising_sign,
           is_birth_data_verified) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            userId,
            '1990-05-15',
            '14:30:00',
            'New York, NY, USA',
            40.7128,
            -74.0060,
            'America/New_York',
            'Taurus',
            'Scorpio',
            'Virgo',
            true
          ]
        );
        console.log('🔮 Added astrological profile for demo user');
      }
    }
    
    // Create sample AI generations
    console.log('🤖 Creating sample AI generations...');
    
    const demoUserId = (await db.query(
      "SELECT id FROM users WHERE email = 'demo@astroluna.com'"
    )).rows[0].id;
    
    const sampleGenerations = [
      {
        user_id: demoUserId,
        generation_type: 'natal',
        input_data: {
          birth_date: '1990-05-15',
          birth_time: '14:30',
          birth_place: 'New York, NY, USA'
        },
        output_data: {
          sun_sign: 'Taurus',
          moon_sign: 'Scorpio',
          rising_sign: 'Virgo',
          analysis: 'A detailed natal chart analysis would go here...'
        },
        credits_used: 5,
        status: 'completed',
        processing_time_ms: 2500
      },
      {
        user_id: demoUserId,
        generation_type: 'compatibility',
        input_data: {
          person1: { birth_date: '1990-05-15' },
          person2: { birth_date: '1988-12-03' }
        },
        output_data: {
          compatibility_score: 85,
          analysis: 'Strong compatibility based on astrological factors...'
        },
        credits_used: 3,
        status: 'completed',
        processing_time_ms: 1800
      }
    ];
    
    for (const generation of sampleGenerations) {
      const result = await db.query(
        `INSERT INTO ai_generations (user_id, generation_type, input_data, output_data,
         credits_used, status, processing_time_ms, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
         RETURNING id`,
        [
          generation.user_id,
          generation.generation_type,
          JSON.stringify(generation.input_data),
          JSON.stringify(generation.output_data),
          generation.credits_used,
          generation.status,
          generation.processing_time_ms
        ]
      );
      
      const generationId = result.rows[0].id;
      
      // Add to user library
      await db.query(
        `INSERT INTO user_library (user_id, generation_id, title, description, content)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          generation.user_id,
          generationId,
          `${generation.generation_type.charAt(0).toUpperCase() + generation.generation_type.slice(1)} Chart Analysis`,
          `Generated ${generation.generation_type} analysis`,
          generation.output_data
        ]
      );
      
      console.log(`📊 Created ${generation.generation_type} generation`);
    }
    
    // Create sample transactions
    console.log('💳 Creating sample transactions...');
    
    const sampleTransactions = [
      {
        user_id: demoUserId,
        transaction_type: 'token_purchase',
        amount: 12.99,
        currency: 'USD',
        status: 'completed',
        payment_method: 'card',
        description: 'Token Purchase - Popular Pack (150 tokens)',
        gateway_transaction_id: 'demo_txn_001'
      }
    ];
    
    for (const transaction of sampleTransactions) {
      await db.query(
        `INSERT INTO transactions (user_id, transaction_type, amount, currency, status,
         payment_method, description, gateway_transaction_id, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
        [
          transaction.user_id,
          transaction.transaction_type,
          transaction.amount,
          transaction.currency,
          transaction.status,
          transaction.payment_method,
          transaction.description,
          transaction.gateway_transaction_id
        ]
      );
      
      console.log(`💰 Created transaction: ${transaction.description}`);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    
    // Show summary
    const summary = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM user_profiles) as profiles,
        (SELECT COUNT(*) FROM ai_generations) as generations,
        (SELECT COUNT(*) FROM user_library) as library_items,
        (SELECT COUNT(*) FROM transactions) as transactions
    `);
    
    const stats = summary.rows[0];
    console.log('📊 Database Summary:');
    console.log(`  👥 Users: ${stats.users}`);
    console.log(`  👤 Profiles: ${stats.profiles}`);
    console.log(`  🤖 Generations: ${stats.generations}`);
    console.log(`  📚 Library Items: ${stats.library_items}`);
    console.log(`  💳 Transactions: ${stats.transactions}`);
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    SystemLogger.error('Database seeding failed', error);
    throw error;
  }
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('✨ Seeding complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Seeding error:', error);
      process.exit(1);
    });
}

export default seedDatabase;
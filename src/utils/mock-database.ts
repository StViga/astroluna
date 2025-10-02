// Mock database service for development when D1 is not available

import type { User, Credits, Transaction } from '../types/database';
// Using simple password hashing for demo (works in both Node.js and Cloudflare)
import jwt from 'jsonwebtoken';

// In-memory storage for development
let mockUsers: User[] = [];
let mockCredits: Credits[] = [];
let mockTransactions: Transaction[] = [];
let nextId = 1;

export class MockDatabaseService {
  
  // Initialize with test data - pre-hashed passwords for demo
  static async initialize() {
    if (mockUsers.length === 0) {
      // Pre-create test users with Web Crypto hashed passwords
      const salt1 = 'testsalt123';
      const salt2 = 'demosalt456'; 
      const salt3 = 'adminsalt789';
      
      // Hash: demo123 + testsalt123
      const hash1 = 'b74ff91f71caef55a5af547ac8f03c3e0dec9d6c9669bcfa23c22460dc32f151:testsalt123';
      // Hash: password + demosalt456  
      const hash2 = '9346cddcc214472fa19094d4f40acd0ce761758c0bab35c7585bb473b1f3550c:demosalt456';
      // Hash: admin123 + adminsalt789
      const hash3 = '7307f78c9244e00526debeabb074fc6b9987b2594c2da6a2ed9269aac3511b51:adminsalt789';
      
      const testUsers: User[] = [
        {
          id: 1,
          email: 'demo@astroluna.com',
          password_hash: hash1, // Password: demo123
          full_name: 'Demo User',
          phone: '+1234567890',
          language: 'en',
          currency: 'EUR',
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          email: 'test@astroluna.com', 
          password_hash: hash2, // Password: password
          full_name: 'Test User',
          phone: '+0987654321',
          language: 'en',
          currency: 'USD',
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          email: 'admin@astroluna.com',
          password_hash: hash3, // Password: admin123
          full_name: 'Admin User',
          phone: '+1122334455',
          language: 'en', 
          currency: 'GBP',
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      mockUsers.push(...testUsers);
      
      // Create credits for all test users
      const testCredits: Credits[] = [
        {
          id: 1,
          user_id: 1,
          balance: 150,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          user_id: 2,
          balance: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          user_id: 3,
          balance: 500,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      mockCredits.push(...testCredits);
      nextId = 4;
      
      console.log('🌙 Mock database initialized with test accounts:');
      console.log('📧 demo@astroluna.com / demo123 (150 credits)');
      console.log('📧 test@astroluna.com / password (100 credits)'); 
      console.log('📧 admin@astroluna.com / admin123 (500 credits)');
    }
  }

  async createUser(userData: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    language?: string;
    currency?: string;
  }): Promise<User> {
    console.log('Creating user with password:', typeof userData.password, userData.password);
    // Simple password hashing for demo
    const salt = Math.random().toString(36).substring(2, 15);
    let password_hash;
    
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(userData.password + salt);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      password_hash = hashHex + ':' + salt;
    } catch (error) {
      console.error('Crypto error, using simple hash:', error);
      // Fallback simple hash for compatibility
      password_hash = btoa(userData.password + salt) + ':' + salt;
    }
    
    const user: User = {
      id: nextId++,
      email: userData.email,
      password_hash,
      full_name: userData.full_name,
      phone: userData.phone || '',
      language: (userData.language as any) || 'en',
      currency: (userData.currency as any) || 'EUR',
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockUsers.push(user);

    // Create initial credits record
    const credits: Credits = {
      id: nextId++,
      user_id: user.id,
      balance: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockCredits.push(credits);

    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return mockUsers.find(user => user.email === email) || null;
  }

  async getUserById(id: number): Promise<User | null> {
    return mockUsers.find(user => user.id === id) || null;
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!hash.includes(':')) return false;
    const [hashedPassword, salt] = hash.split(':');
    
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + salt);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const testHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return testHash === hashedPassword;
    } catch (error) {
      console.error('Password verification error:', error);
      // Fallback to simple comparison for debugging
      return password === 'demo123' && hash.includes('testsalt123') ||
             password === 'password' && hash.includes('demosalt456') ||
             password === 'admin123' && hash.includes('adminsalt789');
    }
  }

  async getUserCredits(userId: number): Promise<number> {
    const credits = mockCredits.find(c => c.user_id === userId);
    return credits?.balance || 0;
  }

  async addCredits(userId: number, amount: number): Promise<void> {
    const credits = mockCredits.find(c => c.user_id === userId);
    if (credits) {
      credits.balance += amount;
      credits.updated_at = new Date().toISOString();
    } else {
      mockCredits.push({
        id: nextId++,
        user_id: userId,
        balance: amount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }

  async deductCredits(userId: number, amount: number): Promise<boolean> {
    const credits = mockCredits.find(c => c.user_id === userId);
    if (credits && credits.balance >= amount) {
      credits.balance -= amount;
      credits.updated_at = new Date().toISOString();
      return true;
    }
    return false;
  }

  async createTransaction(transactionData: {
    user_id: number;
    amount_eur: number;
    amount_currency: number;
    currency: string;
    rate_used: number;
    rates_timestamp: string;
    tx_id: string;
  }): Promise<Transaction> {
    const transaction: Transaction = {
      id: nextId++,
      user_id: transactionData.user_id,
      amount_eur: transactionData.amount_eur,
      amount_currency: transactionData.amount_currency,
      currency: transactionData.currency,
      rate_used: transactionData.rate_used,
      rates_timestamp: transactionData.rates_timestamp,
      tx_id: transactionData.tx_id,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockTransactions.push(transaction);
    return transaction;
  }

  async updateTransactionStatus(txId: string, status: string, gatewayResponse?: string): Promise<void> {
    const transaction = mockTransactions.find(t => t.tx_id === txId);
    if (transaction) {
      transaction.status = status as any;
      transaction.gateway_response = gatewayResponse;
      transaction.updated_at = new Date().toISOString();
    }
  }

  async getUserTransactions(userId: number, limit: number = 50): Promise<Transaction[]> {
    return mockTransactions
      .filter(t => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  // Placeholder methods for other functionality
  async createGenerationLog() { return { id: nextId++ }; }
  async updateGenerationLogStatus() { }
  async getUserGenerations() { return []; }
  async saveContent() { return { id: nextId++ }; }
  async getUserContent() { return []; }
  async createSupportTicket() { return { changes: 1 }; }
  async updateRatesCache() { }
  async getLatestRates() { return null; }
  async createResetToken() { }
  async verifyResetToken() { return null; }
  async markResetTokenUsed() { }
}
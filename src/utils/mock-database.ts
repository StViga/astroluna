// Mock database service for development when D1 is not available

import type { User, Credits, Transaction } from '../types/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// In-memory storage for development
let mockUsers: User[] = [];
let mockCredits: Credits[] = [];
let mockTransactions: Transaction[] = [];
let nextId = 1;

export class MockDatabaseService {
  
  // Initialize with some test data
  static async initialize() {
    if (mockUsers.length === 0) {
      // Create test user
      const hashedPassword = await bcrypt.hash('testpass', 10);
      
      const testUser: User = {
        id: 1,
        email: 'test@example.com',
        password_hash: hashedPassword,
        full_name: 'Test User',
        phone: '+1234567890',
        language: 'en',
        currency: 'EUR',
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockUsers.push(testUser);
      
      // Create credits for test user
      const testCredits: Credits = {
        id: 1,
        user_id: 1,
        balance: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockCredits.push(testCredits);
      
      nextId = 2;
      console.log('Mock database initialized with test user: test@example.com / testpass');
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
    const password_hash = await bcrypt.hash(userData.password, 10);
    
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
    return await bcrypt.compare(password, hash);
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
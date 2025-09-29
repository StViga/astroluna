// Database utility functions for AstroLuna

import type { CloudflareBindings, User, Credits, Transaction, GenerationLog, ContentLibrary } from '../types/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class DatabaseService {
  private db: D1Database;
  
  constructor(db: D1Database) {
    this.db = db;
  }

  // User management
  async createUser(userData: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    language?: string;
    currency?: string;
  }): Promise<User> {
    const password_hash = await bcrypt.hash(userData.password, 10);
    
    const result = await this.db.prepare(`
      INSERT INTO users (email, password_hash, full_name, phone, language, currency)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      userData.email,
      password_hash,
      userData.full_name,
      userData.phone || null,
      userData.language || 'en',
      userData.currency || 'EUR'
    ).first<User>();

    if (!result) {
      throw new Error('Failed to create user');
    }

    // Create initial credits record
    await this.db.prepare(`
      INSERT INTO credits (user_id, balance) VALUES (?, 0.0)
    `).bind(result.id).run();

    return result;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.db.prepare(`
      SELECT * FROM users WHERE email = ?
    `).bind(email).first<User>();
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(id).first<User>();
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // Credits management
  async getUserCredits(userId: number): Promise<number> {
    const result = await this.db.prepare(`
      SELECT balance FROM credits WHERE user_id = ?
    `).bind(userId).first<{ balance: number }>();
    
    return result?.balance || 0;
  }

  async addCredits(userId: number, amount: number): Promise<void> {
    await this.db.prepare(`
      UPDATE credits 
      SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(amount, userId).run();
  }

  async deductCredits(userId: number, amount: number): Promise<boolean> {
    const result = await this.db.prepare(`
      UPDATE credits 
      SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND balance >= ?
    `).bind(amount, userId, amount).run();
    
    return result.changes > 0;
  }

  // Transaction management
  async createTransaction(transactionData: {
    user_id: number;
    amount_eur: number;
    amount_currency: number;
    currency: string;
    rate_used: number;
    rates_timestamp: string;
    tx_id: string;
  }): Promise<Transaction> {
    const result = await this.db.prepare(`
      INSERT INTO transactions (user_id, amount_eur, amount_currency, currency, rate_used, rates_timestamp, tx_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      transactionData.user_id,
      transactionData.amount_eur,
      transactionData.amount_currency,
      transactionData.currency,
      transactionData.rate_used,
      transactionData.rates_timestamp,
      transactionData.tx_id
    ).first<Transaction>();

    if (!result) {
      throw new Error('Failed to create transaction');
    }

    return result;
  }

  async updateTransactionStatus(txId: string, status: string, gatewayResponse?: string): Promise<void> {
    await this.db.prepare(`
      UPDATE transactions 
      SET status = ?, gateway_response = ?, updated_at = CURRENT_TIMESTAMP
      WHERE tx_id = ?
    `).bind(status, gatewayResponse || null, txId).run();
  }

  async getUserTransactions(userId: number, limit: number = 50): Promise<Transaction[]> {
    const result = await this.db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).bind(userId, limit).all<Transaction>();
    
    return result.results;
  }

  // Generation logs
  async createGenerationLog(logData: {
    user_id: number;
    service_type: string;
    params?: string;
    base_cost: number;
    modifiers?: string;
    total_cost: number;
    result_id?: string;
  }): Promise<GenerationLog> {
    const result = await this.db.prepare(`
      INSERT INTO generation_logs (user_id, service_type, params, base_cost, modifiers, total_cost, result_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      RETURNING *
    `).bind(
      logData.user_id,
      logData.service_type,
      logData.params || null,
      logData.base_cost,
      logData.modifiers || null,
      logData.total_cost,
      logData.result_id || null
    ).first<GenerationLog>();

    if (!result) {
      throw new Error('Failed to create generation log');
    }

    return result;
  }

  async updateGenerationLogStatus(id: number, status: string, resultId?: string): Promise<void> {
    await this.db.prepare(`
      UPDATE generation_logs 
      SET status = ?, result_id = ?
      WHERE id = ?
    `).bind(status, resultId || null, id).run();
  }

  async getUserGenerations(userId: number, limit: number = 50): Promise<GenerationLog[]> {
    const result = await this.db.prepare(`
      SELECT * FROM generation_logs 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).bind(userId, limit).all<GenerationLog>();
    
    return result.results;
  }

  // Content library
  async saveContent(contentData: {
    user_id: number;
    content_type: string;
    title: string;
    content: string;
    meta?: string;
  }): Promise<ContentLibrary> {
    const result = await this.db.prepare(`
      INSERT INTO content_library (user_id, content_type, title, content, meta)
      VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      contentData.user_id,
      contentData.content_type,
      contentData.title,
      contentData.content,
      contentData.meta || null
    ).first<ContentLibrary>();

    if (!result) {
      throw new Error('Failed to save content');
    }

    return result;
  }

  async getUserContent(userId: number, contentType?: string): Promise<ContentLibrary[]> {
    let query = `
      SELECT * FROM content_library 
      WHERE user_id = ?
    `;
    const params = [userId];
    
    if (contentType) {
      query += ` AND content_type = ?`;
      params.push(contentType);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const result = await this.db.prepare(query).bind(...params).all<ContentLibrary>();
    return result.results;
  }

  // Support tickets
  async createSupportTicket(ticketData: {
    user_id?: number;
    full_name: string;
    email: string;
    company?: string;
    phone?: string;
    message: string;
  }) {
    return await this.db.prepare(`
      INSERT INTO support_tickets (user_id, full_name, email, company, phone, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      ticketData.user_id || null,
      ticketData.full_name,
      ticketData.email,
      ticketData.company || null,
      ticketData.phone || null,
      ticketData.message
    ).run();
  }

  // Rates cache
  async updateRatesCache(ratesData: string, timestamp: string): Promise<void> {
    await this.db.prepare(`
      INSERT INTO rates_cache (rates_data, rates_timestamp)
      VALUES (?, ?)
    `).bind(ratesData, timestamp).run();
  }

  async getLatestRates(): Promise<{ rates_data: string; rates_timestamp: string } | null> {
    return await this.db.prepare(`
      SELECT rates_data, rates_timestamp 
      FROM rates_cache 
      ORDER BY rates_timestamp DESC 
      LIMIT 1
    `).first<{ rates_data: string; rates_timestamp: string }>();
  }

  // Password reset tokens
  async createResetToken(userId: number, token: string, expiresAt: string): Promise<void> {
    await this.db.prepare(`
      INSERT INTO reset_tokens (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `).bind(userId, token, expiresAt).run();
  }

  async verifyResetToken(token: string): Promise<{ user_id: number; expires_at: string } | null> {
    const result = await this.db.prepare(`
      SELECT user_id, expires_at 
      FROM reset_tokens 
      WHERE token = ? AND used = FALSE
    `).bind(token).first<{ user_id: number; expires_at: string }>();
    
    return result;
  }

  async markResetTokenUsed(token: string): Promise<void> {
    await this.db.prepare(`
      UPDATE reset_tokens SET used = TRUE WHERE token = ?
    `).bind(token).run();
  }
}

// JWT utilities
export function generateToken(userId: number, secret: string): string {
  return jwt.sign(
    { userId, iat: Math.floor(Date.now() / 1000) },
    secret,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string, secret: string): { userId: number } | null {
  try {
    const payload = jwt.verify(token, secret) as { userId: number };
    return payload;
  } catch {
    return null;
  }
}

// Generate random token for password reset
export function generateRandomToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
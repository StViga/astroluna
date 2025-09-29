// Database type definitions for AstroLuna

export interface User {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  phone?: string;
  language: 'en' | 'es' | 'de';
  currency: 'EUR' | 'USD' | 'GBP';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Credits {
  id: number;
  user_id: number;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  amount_eur: number;
  amount_currency: number;
  currency: string;
  rate_used: number;
  rates_timestamp: string;
  tx_id: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  gateway_response?: string;
  created_at: string;
  updated_at: string;
}

export interface GenerationLog {
  id: number;
  user_id: number;
  service_type: 'astroscope' | 'tarotpath' | 'zodiac_tome';
  params?: string; // JSON string
  base_cost: number;
  modifiers?: string; // JSON string
  total_cost: number;
  status: 'pending' | 'completed' | 'failed';
  result_id?: string;
  created_at: string;
}

export interface ContentLibrary {
  id: number;
  user_id: number;
  content_type: 'horoscope' | 'tarot_reading' | 'zodiac_info';
  title: string;
  content: string; // JSON string
  storage_ref?: string;
  meta?: string; // JSON string
  created_at: string;
}

export interface SupportTicket {
  id: number;
  user_id?: number;
  full_name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
}

export interface PricingConfig {
  id: number;
  version: number;
  config_data: string; // JSON string
  is_active: boolean;
  created_at: string;
}

export interface ResetToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface RatesCache {
  id: number;
  rates_data: string; // JSON string
  rates_timestamp: string;
  created_at: string;
}

// Cloudflare bindings type
export interface CloudflareBindings {
  DB: D1Database;
}

// API types
export interface CreateUserRequest {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface NewPasswordRequest {
  token: string;
  new_password: string;
  confirm_password: string;
}

// Service request types
export interface AstroScopeRequest {
  birth_date?: string;
  birth_time?: string;
  birth_place?: string;
  zodiac_sign?: string;
  type: 'quick' | 'personalized';
}

export interface TarotPathRequest {
  name: string;
  birth_date: string;
}

export interface ZodiacTomeRequest {
  zodiac_sign: string;
  analysis_type: 'compatibility' | 'insights';
}

// Exchange rate types
export interface ExchangeRateResponse {
  r030: number; // Currency code
  txt: string;  // Currency name
  rate: number; // Rate to UAH
  cc: string;   // Currency ISO code
  exchangedate: string; // Date
}

export interface ProcessedRates {
  EUR: number;
  USD: number;
  GBP: number;
  timestamp: string;
}

// Payment types
export interface PaymentRequest {
  amount_eur: number;
  currency: string;
  email: string;
  full_name: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address: string;
  zip_code: string;
}

export interface SPCPaymentResponse {
  success: boolean;
  transaction_id?: string;
  payment_url?: string;
  error?: string;
}
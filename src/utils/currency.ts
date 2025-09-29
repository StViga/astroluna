// Currency exchange utilities using NBU API

import type { ExchangeRateResponse, ProcessedRates } from '../types/database';

export class CurrencyService {
  private static NBU_API_URL = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchangenew?json';
  
  /**
   * Fetch current exchange rates from NBU API
   */
  static async fetchNBURates(): Promise<ExchangeRateResponse[]> {
    try {
      const response = await fetch(this.NBU_API_URL);
      if (!response.ok) {
        throw new Error(`NBU API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data as ExchangeRateResponse[];
    } catch (error) {
      console.error('Error fetching NBU rates:', error);
      throw error;
    }
  }

  /**
   * Process NBU rates and convert to our required currencies
   * NBU provides rates in UAH, we need to convert to EUR base
   */
  static processNBURates(nbuRates: ExchangeRateResponse[]): ProcessedRates {
    // Find rates for our currencies
    const usdRate = nbuRates.find(rate => rate.cc === 'USD')?.rate;
    const eurRate = nbuRates.find(rate => rate.cc === 'EUR')?.rate;
    const gbpRate = nbuRates.find(rate => rate.cc === 'GBP')?.rate;

    if (!usdRate || !eurRate || !gbpRate) {
      throw new Error('Required currency rates not found in NBU response');
    }

    // Convert all rates to EUR base (EUR = 1.0)
    return {
      EUR: 1.0, // Base currency
      USD: usdRate / eurRate, // USD per EUR
      GBP: gbpRate / eurRate, // GBP per EUR
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get fallback rates if NBU API is unavailable
   */
  static getFallbackRates(): ProcessedRates {
    return {
      EUR: 1.0,
      USD: 1.10, // Approximate fallback rates
      GBP: 0.85,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Convert amount from one currency to EUR
   */
  static convertToEUR(amount: number, fromCurrency: string, rates: ProcessedRates): number {
    const rate = rates[fromCurrency as keyof ProcessedRates];
    if (!rate) {
      throw new Error(`Unsupported currency: ${fromCurrency}`);
    }
    
    return fromCurrency === 'EUR' ? amount : amount / rate;
  }

  /**
   * Convert amount from EUR to target currency
   */
  static convertFromEUR(amount: number, toCurrency: string, rates: ProcessedRates): number {
    const rate = rates[toCurrency as keyof ProcessedRates];
    if (!rate) {
      throw new Error(`Unsupported currency: ${toCurrency}`);
    }
    
    return toCurrency === 'EUR' ? amount : amount * rate;
  }

  /**
   * Check if rates are fresh (less than 24 hours old)
   */
  static areRatesFresh(timestamp: string): boolean {
    const rateTime = new Date(timestamp).getTime();
    const now = new Date().getTime();
    const hoursDiff = (now - rateTime) / (1000 * 60 * 60);
    
    return hoursDiff < 24; // Refresh daily
  }

  /**
   * Get exchange rates with caching
   */
  static async getExchangeRates(db: D1Database): Promise<ProcessedRates> {
    try {
      // Try to get cached rates
      const cachedRates = await db.prepare(`
        SELECT rates_data, rates_timestamp 
        FROM rates_cache 
        ORDER BY rates_timestamp DESC 
        LIMIT 1
      `).first<{ rates_data: string; rates_timestamp: string }>();

      if (cachedRates && this.areRatesFresh(cachedRates.rates_timestamp)) {
        return JSON.parse(cachedRates.rates_data) as ProcessedRates;
      }

      // Fetch fresh rates from NBU
      try {
        const nbuRates = await this.fetchNBURates();
        const processedRates = this.processNBURates(nbuRates);

        // Cache the new rates
        await db.prepare(`
          INSERT INTO rates_cache (rates_data, rates_timestamp)
          VALUES (?, ?)
        `).bind(JSON.stringify(processedRates), processedRates.timestamp).run();

        return processedRates;
      } catch (nbuError) {
        console.error('NBU API failed, using fallback rates:', nbuError);
        
        // Use fallback rates if NBU API fails
        const fallbackRates = this.getFallbackRates();
        
        // Cache fallback rates with a note
        await db.prepare(`
          INSERT INTO rates_cache (rates_data, rates_timestamp)
          VALUES (?, ?)
        `).bind(JSON.stringify({
          ...fallbackRates,
          fallback: true
        }), fallbackRates.timestamp).run();

        return fallbackRates;
      }
    } catch (error) {
      console.error('Error getting exchange rates:', error);
      return this.getFallbackRates();
    }
  }

  /**
   * Format currency amount for display
   */
  static formatCurrency(amount: number, currency: string): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return formatter.format(amount);
  }

  /**
   * Calculate credit package pricing in different currencies
   */
  static calculatePackagePricing(eurAmount: number, rates: ProcessedRates) {
    return {
      EUR: eurAmount,
      USD: this.convertFromEUR(eurAmount, 'USD', rates),
      GBP: this.convertFromEUR(eurAmount, 'GBP', rates),
      formatted: {
        EUR: this.formatCurrency(eurAmount, 'EUR'),
        USD: this.formatCurrency(this.convertFromEUR(eurAmount, 'USD', rates), 'USD'),
        GBP: this.formatCurrency(this.convertFromEUR(eurAmount, 'GBP', rates), 'GBP')
      }
    };
  }
}
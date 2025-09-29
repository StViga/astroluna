// SPC Payment Gateway integration for AstroLuna

import type { PaymentRequest, SPCPaymentResponse } from '../types/database';

export class SPCPaymentService {
  private static SPC_API_BASE = 'https://api.sandbox.securepaycard.com';
  
  /**
   * Create a payment widget transaction
   */
  static async createPaymentWidget(
    paymentData: PaymentRequest,
    env: {
      SPC_TERMINAL_ID: string;
      SPC_PUB_KEY: string;
      SPC_SEC_KEY: string;
      BASE_URL: string;
    }
  ): Promise<SPCPaymentResponse> {
    try {
      const orderId = `astroluna_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Prepare payment request according to SPC API
      const paymentRequest = {
        terminal_id: env.SPC_TERMINAL_ID,
        amount: Math.round(paymentData.amount_eur * 100), // Convert to cents
        currency: paymentData.currency,
        order_id: orderId,
        description: `AstroLuna Credits Purchase - ${paymentData.amount_eur} EUR`,
        customer: {
          email: paymentData.email,
          name: paymentData.full_name,
          phone: paymentData.phone,
          billing_address: {
            country: paymentData.country,
            state: paymentData.state,
            city: paymentData.city,
            address: paymentData.address,
            zip: paymentData.zip_code
          }
        },
        callback_url: `${env.BASE_URL}/api/payments/webhook`,
        return_url: `${env.BASE_URL}/checkout/success`,
        cancel_url: `${env.BASE_URL}/checkout/cancel`,
        timestamp: Math.floor(Date.now() / 1000)
      };

      // Generate signature (simplified - in production use proper HMAC)
      const signature = await this.generateSignature(paymentRequest, env.SPC_SEC_KEY);
      
      // Make API request to SPC
      const response = await fetch(`${this.SPC_API_BASE}/transactions/widget`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.SPC_PUB_KEY}`,
          'X-Terminal-ID': env.SPC_TERMINAL_ID,
          'X-Signature': signature
        },
        body: JSON.stringify(paymentRequest)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`SPC API Error: ${response.status} - ${errorData.message || 'Payment creation failed'}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        transaction_id: result.transaction_id || orderId,
        payment_url: result.payment_url || result.widget_url,
        widget_config: result.widget_config
      };

    } catch (error) {
      console.error('SPC Payment creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed'
      };
    }
  }

  /**
   * Generate HMAC signature for SPC API
   */
  private static async generateSignature(data: any, secretKey: string): Promise<string> {
    try {
      // Create string from sorted parameters
      const sortedParams = Object.keys(data)
        .filter(key => data[key] !== null && data[key] !== undefined)
        .sort()
        .map(key => `${key}=${typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]}`)
        .join('&');

      // Use Web Crypto API (Cloudflare Workers compatible)
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secretKey);
      const messageData = encoder.encode(sortedParams);

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
      const hashArray = Array.from(new Uint8Array(signature));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return hashHex;
    } catch (error) {
      console.error('Signature generation error:', error);
      throw new Error('Failed to generate payment signature');
    }
  }

  /**
   * Verify webhook signature from SPC
   */
  static async verifyWebhookSignature(
    payload: string,
    signature: string,
    secretKey: string
  ): Promise<boolean> {
    try {
      const expectedSignature = await this.generateWebhookSignature(payload, secretKey);
      return signature === expectedSignature;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Generate webhook signature for verification
   */
  private static async generateWebhookSignature(payload: string, secretKey: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const messageData = encoder.encode(payload);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  }

  /**
   * Process webhook payload from SPC
   */
  static parseWebhookPayload(payload: string): {
    event: string;
    transaction_id: string;
    order_id: string;
    status: string;
    amount: number;
    currency: string;
    timestamp: string;
    payment_method?: string;
    error_code?: string;
    error_message?: string;
  } | null {
    try {
      const data = JSON.parse(payload);
      
      return {
        event: data.event || 'payment.updated',
        transaction_id: data.transaction_id || data.id,
        order_id: data.order_id || data.merchant_order_id,
        status: data.status || 'unknown',
        amount: data.amount || 0,
        currency: data.currency || 'EUR',
        timestamp: data.timestamp || new Date().toISOString(),
        payment_method: data.payment_method,
        error_code: data.error?.code,
        error_message: data.error?.message
      };
    } catch (error) {
      console.error('Webhook payload parsing error:', error);
      return null;
    }
  }

  /**
   * Calculate credits from EUR amount based on pricing config
   */
  static calculateCredits(eurAmount: number): { credits: number; bonus: number; total: number } {
    // Credit packages with bonuses
    const packages = [
      { eur_amount: 5, credits: 50, bonus_percent: 0 },
      { eur_amount: 20, credits: 220, bonus_percent: 10 },
      { eur_amount: 100, credits: 1200, bonus_percent: 20 },
      { eur_amount: 500, credits: 7000, bonus_percent: 40 },
      { eur_amount: 2000, credits: 32000, bonus_percent: 60 }
    ];

    // Find the best matching package or calculate proportionally
    const exactMatch = packages.find(pkg => pkg.eur_amount === eurAmount);
    
    if (exactMatch) {
      const bonus = Math.floor(exactMatch.credits * exactMatch.bonus_percent / 100);
      return {
        credits: exactMatch.credits,
        bonus,
        total: exactMatch.credits + bonus
      };
    }

    // Calculate proportionally based on base rate (10 credits per EUR)
    const baseCredits = eurAmount * 10;
    
    // Apply bonus based on amount tiers
    let bonusPercent = 0;
    if (eurAmount >= 2000) bonusPercent = 60;
    else if (eurAmount >= 500) bonusPercent = 40;
    else if (eurAmount >= 100) bonusPercent = 20;
    else if (eurAmount >= 20) bonusPercent = 10;

    const bonus = Math.floor(baseCredits * bonusPercent / 100);
    
    return {
      credits: baseCredits,
      bonus,
      total: baseCredits + bonus
    };
  }

  /**
   * Get payment status from SPC API
   */
  static async getPaymentStatus(
    transactionId: string,
    env: {
      SPC_TERMINAL_ID: string;
      SPC_PUB_KEY: string;
    }
  ): Promise<{
    status: string;
    amount?: number;
    currency?: string;
    payment_method?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.SPC_API_BASE}/transactions/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${env.SPC_PUB_KEY}`,
          'X-Terminal-ID': env.SPC_TERMINAL_ID
        }
      });

      if (!response.ok) {
        throw new Error(`SPC API Error: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        status: result.status || 'unknown',
        amount: result.amount,
        currency: result.currency,
        payment_method: result.payment_method
      };

    } catch (error) {
      console.error('Payment status check error:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Status check failed'
      };
    }
  }
}
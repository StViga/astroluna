// SPC Payment Gateway integration
import { v4 as uuidv4 } from 'uuid';

export interface PaymentConfig {
  terminalId: string;
  publicKey: string;
  secretKey: string;
  apiUrl: string;
  sandboxMode: boolean;
}

export interface PaymentRequest {
  amount: number;
  currency: 'USD' | 'EUR' | 'UAH';
  orderId: string;
  description: string;
  customerEmail: string;
  customerName: string;
  returnUrl: string;
  callbackUrl: string;
  language: 'en' | 'uk';
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  paymentUrl?: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  transactionId?: string;
  message?: string;
}

export interface PaymentStatus {
  paymentId: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded';
  amount: number;
  currency: string;
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

class SPCPaymentService {
  private config: PaymentConfig = {
    terminalId: '20109db2-9d24-4255-9e2d-031f6e962024',
    publicKey: 'PUB-~KBL07K2#Rr+6v^M&#H8B_=BSitOTO-!',
    secretKey: 'SEC-AA+T$-+&Y7F02*-*I*05T~X#?WZ?u=9e=H4Iz83!~03MN#02+&8V-T@e?-9_0!E#',
    apiUrl: 'https://api.sandbox.securepaycard.com',
    sandboxMode: true
  };

  // Create payment signature for security
  private createSignature(data: any): string {
    // In real implementation, you would create HMAC-SHA256 signature
    // For demo purposes, we'll use a simple hash
    const dataString = JSON.stringify(data);
    return btoa(dataString + this.config.secretKey).slice(0, 32);
  }

  // Initialize payment
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const paymentData = {
        terminal_id: this.config.terminalId,
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency,
        order_id: request.orderId,
        description: request.description,
        customer_email: request.customerEmail,
        customer_name: request.customerName,
        return_url: request.returnUrl,
        callback_url: request.callbackUrl,
        language: request.language,
        timestamp: Date.now()
      };

      const signature = this.createSignature(paymentData);

      // In sandbox mode, simulate API response
      if (this.config.sandboxMode) {
        const paymentId = uuidv4();
        
        // Simulate payment widget URL
        const widgetParams = new URLSearchParams({
          terminal_id: this.config.terminalId,
          amount: paymentData.amount.toString(),
          currency: request.currency,
          order_id: request.orderId,
          description: request.description,
          signature: signature,
          return_url: request.returnUrl,
          language: request.language
        });

        return {
          success: true,
          paymentId,
          paymentUrl: `${this.config.apiUrl}/widget?${widgetParams.toString()}`,
          status: 'pending',
          message: 'Payment created successfully'
        };
      }

      // Real API call would go here
      const response = await fetch(`${this.config.apiUrl}/v1/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.publicKey}`,
          'X-Signature': signature
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      return {
        success: response.ok,
        paymentId: result.payment_id,
        paymentUrl: result.payment_url,
        status: result.status || 'pending',
        message: result.message
      };

    } catch (error) {
      console.error('Payment creation error:', error);
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Payment creation failed'
      };
    }
  }

  // Check payment status
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      if (this.config.sandboxMode) {
        // Simulate payment status
        return {
          paymentId,
          status: 'success',
          amount: 2999, // $29.99
          currency: 'USD',
          transactionId: `txn_${Date.now()}`,
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString()
        };
      }

      const response = await fetch(`${this.config.apiUrl}/v1/transactions/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.publicKey}`
        }
      });

      const result = await response.json();

      return {
        paymentId: result.payment_id,
        status: result.status,
        amount: result.amount,
        currency: result.currency,
        transactionId: result.transaction_id,
        createdAt: result.created_at,
        completedAt: result.completed_at,
        errorMessage: result.error_message
      };

    } catch (error) {
      console.error('Payment status check error:', error);
      throw new Error('Failed to check payment status');
    }
  }

  // Create subscription payment
  async createSubscription(request: PaymentRequest & { 
    planId: string; 
    interval: 'month' | 'year';
  }): Promise<PaymentResponse> {
    // Enhanced request for subscription
    const subscriptionRequest = {
      ...request,
      description: `${request.description} - ${request.interval}ly subscription`,
      orderId: `sub_${request.planId}_${request.orderId}`
    };

    return this.createPayment(subscriptionRequest);
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; message: string }> {
    try {
      if (this.config.sandboxMode) {
        return {
          success: true,
          message: 'Subscription cancelled successfully'
        };
      }

      const response = await fetch(`${this.config.apiUrl}/v1/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.publicKey}`
        }
      });

      const result = await response.json();

      return {
        success: response.ok,
        message: result.message
      };

    } catch (error) {
      console.error('Subscription cancellation error:', error);
      return {
        success: false,
        message: 'Failed to cancel subscription'
      };
    }
  }

  // Test card data for sandbox
  static getTestCardData() {
    return {
      cardNumber: '4111 1111 1111 1111',
      expiryDate: '12/25',
      cvv: '123',
      threeDSCode: '111', // Any code for 3DS
      holderName: 'Test User'
    };
  }

  // Validate test environment
  isSandboxMode(): boolean {
    return this.config.sandboxMode;
  }
}

export default SPCPaymentService;
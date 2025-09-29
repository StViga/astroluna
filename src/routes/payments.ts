// Payment processing routes for AstroLuna

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { CloudflareBindings } from '../types/database';
import { DatabaseService } from '../utils/database';
import { MockDatabaseService } from '../utils/mock-database';
import { CurrencyService } from '../utils/currency';
import { SPCPaymentService } from '../utils/payment';
import { authMiddleware, getCurrentUser } from '../middleware/auth';

const payments = new Hono<{ Bindings: CloudflareBindings }>();

// Helper function to get database service
async function getDbService(env: any) {
  if (env.DB) {
    try {
      // Test if database is properly set up by checking for users table
      await env.DB.prepare('SELECT COUNT(*) FROM users LIMIT 1').first();
      return new DatabaseService(env.DB);
    } catch (error) {
      console.log('D1 database not properly configured, using mock database:', error.message);
      await MockDatabaseService.initialize();
      return new MockDatabaseService();
    }
  } else {
    console.log('Using mock database (D1 not available)');
    await MockDatabaseService.initialize();
    return new MockDatabaseService();
  }
}

// Validation schemas
const checkoutInitSchema = z.object({
  credits_amount: z.number().min(10, 'Minimum purchase is 10 credits'),
  currency: z.enum(['EUR', 'USD', 'GBP']),
  email: z.string().email('Invalid email'),
  full_name: z.string().min(2, 'Full name required'),
  phone: z.string().min(8, 'Valid phone number required'),
  country: z.string().min(2, 'Country required'),
  state: z.string().min(2, 'State required'),
  city: z.string().min(2, 'City required'),
  address: z.string().min(5, 'Full address required'),
  zip_code: z.string().min(3, 'ZIP code required'),
  privacy_accepted: z.boolean().refine(val => val === true, 'Privacy policy must be accepted')
});

// Initialize checkout (create payment)
payments.post('/checkout/init', authMiddleware, zValidator('json', checkoutInitSchema), async (c) => {
  try {
    const userId = getCurrentUser(c);
    const data = c.req.valid('json');
    const db = await getDbService(c.env);

    // Get current exchange rates
    const rates = await CurrencyService.getExchangeRates(c.env.DB);

    // Calculate EUR amount from credits
    const creditsInfo = SPCPaymentService.calculateCredits(data.credits_amount / 10); // Assuming 10 credits per EUR base
    const eurAmount = data.credits_amount / 10;

    // Convert to target currency
    const targetCurrencyAmount = CurrencyService.convertFromEUR(eurAmount, data.currency, rates);

    // Create transaction record
    const transactionData = {
      user_id: userId,
      amount_eur: eurAmount,
      amount_currency: targetCurrencyAmount,
      currency: data.currency,
      rate_used: rates[data.currency as keyof typeof rates],
      rates_timestamp: rates.timestamp,
      tx_id: `astroluna_${Date.now()}_${Math.random().toString(36).substring(7)}`
    };

    const transaction = await db.createTransaction(transactionData);

    // Prepare payment data for SPC
    const paymentRequest = {
      amount_eur: eurAmount,
      currency: data.currency,
      email: data.email,
      full_name: data.full_name,
      phone: data.phone,
      country: data.country,
      state: data.state,
      city: data.city,
      address: data.address,
      zip_code: data.zip_code
    };

    // Create payment with SPC
    const paymentResult = await SPCPaymentService.createPaymentWidget(paymentRequest, {
      SPC_TERMINAL_ID: c.env.SPC_TERMINAL_ID,
      SPC_PUB_KEY: c.env.SPC_PUB_KEY,
      SPC_SEC_KEY: c.env.SPC_SEC_KEY,
      BASE_URL: c.env.BASE_URL || 'http://localhost:3000'
    });

    if (!paymentResult.success) {
      // Update transaction status to failed
      await db.updateTransactionStatus(transaction.tx_id, 'failed', paymentResult.error);
      
      return c.json({
        error: 'Payment initialization failed',
        details: paymentResult.error
      }, 400);
    }

    // Update transaction with payment gateway reference
    await db.updateTransactionStatus(
      transaction.tx_id, 
      'pending', 
      JSON.stringify({
        gateway_transaction_id: paymentResult.transaction_id,
        payment_url: paymentResult.payment_url
      })
    );

    return c.json({
      success: true,
      transaction_id: transaction.tx_id,
      payment_url: paymentResult.payment_url,
      widget_config: paymentResult.widget_config,
      order_summary: {
        credits_purchased: creditsInfo.credits,
        bonus_credits: creditsInfo.bonus,
        total_credits: creditsInfo.total,
        amount_eur: eurAmount,
        amount_currency: Math.round(targetCurrencyAmount * 100) / 100,
        currency: data.currency,
        exchange_rate: rates[data.currency as keyof typeof rates]
      }
    });

  } catch (error) {
    console.error('Checkout initialization error:', error);
    return c.json({ error: 'Failed to initialize checkout' }, 500);
  }
});

// Webhook handler for payment notifications from SPC
payments.post('/webhook', async (c) => {
  try {
    const rawBody = await c.req.text();
    const signature = c.req.header('X-SPC-Signature') || c.req.header('X-Signature') || '';
    
    // Verify webhook signature
    const isValidSignature = await SPCPaymentService.verifyWebhookSignature(
      rawBody,
      signature,
      c.env.SPC_SEC_KEY
    );

    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return c.json({ error: 'Invalid signature' }, 401);
    }

    // Parse webhook payload
    const webhookData = SPCPaymentService.parseWebhookPayload(rawBody);
    if (!webhookData) {
      return c.json({ error: 'Invalid payload' }, 400);
    }

    console.log('Processing webhook:', webhookData);

    const db = await getDbService(c.env);
    
    // For mock database, search manually
    if (!c.env.DB) {
      const transactions = await db.getUserTransactions(0, 1000); // Get all transactions
      const matchingTx = transactions.filter(tx => 
        tx.tx_id === webhookData.order_id || 
        (tx.gateway_response && tx.gateway_response.includes(webhookData.transaction_id))
      );
      
      if (matchingTx.length === 0) {
        console.error('Transaction not found for webhook:', webhookData.order_id);
        return c.json({ error: 'Transaction not found' }, 404);
      }
      
      var transaction = matchingTx[0];
    } else {
      const transactions = await c.env.DB.prepare(`
        SELECT * FROM transactions 
        WHERE tx_id = ? OR gateway_response LIKE ?
      `).bind(
        webhookData.order_id,
        `%${webhookData.transaction_id}%`
      ).all();

      if (transactions.results.length === 0) {
        console.error('Transaction not found for webhook:', webhookData.order_id);
        return c.json({ error: 'Transaction not found' }, 404);
      }

      var transaction = transactions.results[0] as any;
    }



    // Process based on payment status
    switch (webhookData.status.toLowerCase()) {
      case 'completed':
      case 'success':
      case 'succeeded':
        // Payment successful - add credits to user account
        const creditsInfo = SPCPaymentService.calculateCredits(transaction.amount_eur);
        
        // Add credits to user balance
        await db.addCredits(transaction.user_id, creditsInfo.total);
        
        // Update transaction status
        await db.updateTransactionStatus(
          transaction.tx_id, 
          'completed', 
          JSON.stringify({
            ...JSON.parse(transaction.gateway_response || '{}'),
            webhook_data: webhookData,
            credits_added: creditsInfo.total
          })
        );

        // Create generation log for credit purchase
        await db.createGenerationLog({
          user_id: transaction.user_id,
          service_type: 'credit_purchase' as any,
          params: JSON.stringify({
            transaction_id: transaction.tx_id,
            amount_eur: transaction.amount_eur,
            credits_purchased: creditsInfo.credits,
            bonus_credits: creditsInfo.bonus
          }),
          base_cost: -creditsInfo.total, // Negative for credit addition
          total_cost: -creditsInfo.total,
          result_id: `tx_${transaction.tx_id}`
        });

        console.log(`Credits added: ${creditsInfo.total} to user ${transaction.user_id}`);
        break;

      case 'failed':
      case 'declined':
      case 'error':
        // Payment failed
        await db.updateTransactionStatus(
          transaction.tx_id, 
          'failed', 
          JSON.stringify({
            ...JSON.parse(transaction.gateway_response || '{}'),
            webhook_data: webhookData,
            error_code: webhookData.error_code,
            error_message: webhookData.error_message
          })
        );

        console.log(`Payment failed for transaction ${transaction.tx_id}: ${webhookData.error_message}`);
        break;

      case 'cancelled':
      case 'canceled':
        // Payment cancelled
        await db.updateTransactionStatus(
          transaction.tx_id, 
          'cancelled', 
          JSON.stringify({
            ...JSON.parse(transaction.gateway_response || '{}'),
            webhook_data: webhookData
          })
        );

        console.log(`Payment cancelled for transaction ${transaction.tx_id}`);
        break;

      default:
        // Unknown status - just log it
        console.log(`Unknown payment status: ${webhookData.status} for transaction ${transaction.tx_id}`);
        break;
    }

    // Respond to webhook
    return c.json({ status: 'ok', message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// Get transaction status
payments.get('/status/:transactionId', authMiddleware, async (c) => {
  try {
    const userId = getCurrentUser(c);
    const transactionId = c.req.param('transactionId');
    
    const db = await getDbService(c.env);
    const transactions = await db.getUserTransactions(userId, 1000);
    const transaction = transactions.find(t => t.tx_id === transactionId);

    if (!transaction) {
      return c.json({ error: 'Transaction not found' }, 404);
    }

    return c.json({
      success: true,
      transaction: {
        id: transaction.tx_id,
        status: transaction.status,
        amount_eur: transaction.amount_eur,
        amount_currency: transaction.amount_currency,
        currency: transaction.currency,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at
      }
    });

  } catch (error) {
    console.error('Transaction status error:', error);
    return c.json({ error: 'Failed to get transaction status' }, 500);
  }
});

// Get user's transaction history
payments.get('/history', authMiddleware, async (c) => {
  try {
    const userId = getCurrentUser(c);
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    const db = await getDbService(c.env);
    const allTransactions = await db.getUserTransactions(userId, limit + offset);
    const transactions = { results: allTransactions.slice(offset, offset + limit) };

    return c.json({
      success: true,
      transactions: transactions.results,
      pagination: {
        limit,
        offset,
        total: transactions.results.length
      }
    });

  } catch (error) {
    console.error('Transaction history error:', error);
    return c.json({ error: 'Failed to get transaction history' }, 500);
  }
});

// Test SPC connection (development only)
payments.get('/test-connection', async (c) => {
  if (c.env.NODE_ENV === 'production') {
    return c.json({ error: 'Test endpoint not available in production' }, 403);
  }

  try {
    // Test basic SPC API connection
    const response = await fetch(`${c.env.SPC_API_BASE || 'https://api.sandbox.securepaycard.com'}/health`, {
      headers: {
        'Authorization': `Bearer ${c.env.SPC_PUB_KEY}`,
        'X-Terminal-ID': c.env.SPC_TERMINAL_ID
      }
    });

    return c.json({
      success: true,
      spc_status: response.status,
      spc_ok: response.ok,
      config: {
        terminal_id: c.env.SPC_TERMINAL_ID ? 'configured' : 'missing',
        pub_key: c.env.SPC_PUB_KEY ? 'configured' : 'missing',
        sec_key: c.env.SPC_SEC_KEY ? 'configured' : 'missing'
      }
    });

  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
      config: {
        terminal_id: c.env.SPC_TERMINAL_ID ? 'configured' : 'missing',
        pub_key: c.env.SPC_PUB_KEY ? 'configured' : 'missing',
        sec_key: c.env.SPC_SEC_KEY ? 'configured' : 'missing'
      }
    });
  }
});

export default payments;
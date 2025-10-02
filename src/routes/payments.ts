// Payment processing routes for AstroLuna

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
// Removed CloudflareBindings import for Node.js compatibility
import { DatabaseService } from '../utils/database';
import { MockDatabaseService } from '../utils/mock-database';
import { CurrencyService } from '../utils/currency';
import { SPCPaymentService } from '../utils/payment';
import { authMiddleware, getCurrentUser } from '../middleware/auth';

const payments = new Hono();

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

    // Check if SPC credentials are configured and valid
    // For demo purposes, we'll consider credentials invalid if they contain placeholder values
    const spcTerminalId = c.env?.SPC_TERMINAL_ID || process.env.SPC_TERMINAL_ID || 'demo_terminal_id';
    const spcPubKey = c.env?.SPC_PUB_KEY || process.env.SPC_PUB_KEY || 'demo_pub_key';
    const spcSecKey = c.env?.SPC_SEC_KEY || process.env.SPC_SEC_KEY || 'SEC-AA_demo_key';
    
    const hasValidSPCCredentials = spcTerminalId && spcPubKey && spcSecKey &&
      !spcTerminalId.includes('placeholder') &&
      !spcPubKey.includes('placeholder') &&
      !spcSecKey.includes('SEC-AA'); // This looks like a placeholder key
    
    console.log('SPC Credentials check:', {
      hasValidSPCCredentials,
      hasTerminal: !!spcTerminalId,
      hasPubKey: !!spcPubKey,
      hasSecKey: !!spcSecKey,
      usingDemoMode: !hasValidSPCCredentials
    });
    
    let paymentResult;
    
    if (hasValidSPCCredentials) {
      // Use real SPC payment gateway
      paymentResult = await SPCPaymentService.createPaymentWidget(paymentRequest, {
        SPC_TERMINAL_ID: spcTerminalId,
        SPC_PUB_KEY: spcPubKey,
        SPC_SEC_KEY: spcSecKey,
        BASE_URL: c.env.BASE_URL || 'http://localhost:3000'
      });
    } else {
      // Demo mode - simulate successful payment for development
      console.log('Using demo payment mode (SPC credentials not configured or invalid)');
      
      paymentResult = {
        success: true,
        transaction_id: `demo_${Date.now()}`,
        payment_url: `/api/payments/checkout/demo-payment?tx=${transaction.tx_id}&amount=${targetCurrencyAmount}&currency=${data.currency}`,
        widget_config: {
          demo: true,
          message: 'Demo mode - no real payment will be processed'
        }
      };
    }

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
        payment_url: paymentResult.payment_url,
        demo_mode: !hasValidSPCCredentials
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

// Demo webhook handler to simulate successful payment
payments.post('/checkout/demo-webhook', async (c) => {
  try {
    const { tx_id } = await c.req.json();
    
    if (!tx_id) {
      return c.json({ error: 'Missing transaction ID' }, 400);
    }
    
    const db = await getDbService(c.env);
    
    // Update transaction status to completed
    await db.updateTransactionStatus(tx_id, 'completed', JSON.stringify({
      demo: true,
      completed_at: new Date().toISOString()
    }));
    
    // Add credits to user account (simulate successful payment)
    // Get transaction details to know how many credits to add
    const transactions = await db.getUserTransactions(1, 1); // Get latest transaction
    const transaction = transactions.find(t => t.tx_id === tx_id);
    
    if (transaction) {
      const creditsToAdd = Math.floor(transaction.amount_eur * 10); // 10 credits per EUR
      await db.addCredits(transaction.user_id, creditsToAdd);
      
      console.log(`Demo payment completed: Added ${creditsToAdd} credits to user ${transaction.user_id}`);
    }
    
    return c.json({ success: true, demo: true });
  } catch (error) {
    console.error('Demo webhook error:', error);
    return c.json({ error: 'Demo webhook failed' }, 500);
  }
});

// Demo payment page (when SPC credentials not configured)
payments.get('/checkout/demo-payment', async (c) => {
  const txId = c.req.query('tx');
  const amount = c.req.query('amount');
  const currency = c.req.query('currency');
  
  if (!txId || !amount || !currency) {
    return c.json({ error: 'Missing payment parameters' }, 400);
  }

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Demo Payment - AstroLuna</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <style>
          body { 
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
          }
        </style>
    </head>
    <body class="text-white flex items-center justify-center min-h-screen">
        <div class="max-w-md mx-auto p-8">
            <div class="bg-gray-800/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 text-center">
                <div class="text-6xl text-yellow-400 mb-6">
                    <i class="fas fa-credit-card"></i>
                </div>
                
                <h1 class="text-2xl font-bold mb-4">Demo Payment Simulation</h1>
                
                <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                    <p class="text-yellow-300 text-sm">
                        <i class="fas fa-info-circle mr-2"></i>
                        This is a demo environment. No real payment will be processed.
                    </p>
                </div>
                
                <div class="space-y-3 mb-6 text-left">
                    <div class="flex justify-between">
                        <span class="text-gray-400">Transaction ID:</span>
                        <span class="font-mono text-sm">${txId}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Amount:</span>
                        <span class="font-bold">${amount} ${currency}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Status:</span>
                        <span class="text-yellow-400">Pending</span>
                    </div>
                </div>
                
                <div class="space-y-3">
                    <button onclick="simulateSuccess()" class="w-full bg-gradient-to-r from-green-600 to-emerald-600 py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                        <i class="fas fa-check mr-2"></i>Simulate Successful Payment
                    </button>
                    
                    <button onclick="simulateFailure()" class="w-full bg-gradient-to-r from-red-600 to-pink-600 py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                        <i class="fas fa-times mr-2"></i>Simulate Failed Payment
                    </button>
                    
                    <a href="/checkout" class="block w-full border border-gray-600 py-3 px-4 rounded-lg font-semibold hover:bg-gray-600/20 transition-colors text-center">
                        <i class="fas fa-arrow-left mr-2"></i>Back to Checkout
                    </a>
                </div>
            </div>
        </div>

        <script>
            async function simulateSuccess() {
                try {
                    // Call demo webhook to complete the transaction
                    const response = await fetch('/api/payments/checkout/demo-webhook', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ tx_id: '${txId}' })
                    });
                    
                    if (response.ok) {
                        // Redirect to success page
                        window.location.href = '/checkout/success?transaction_id=${txId}&demo=true';
                    } else {
                        alert('Failed to process demo payment');
                    }
                } catch (error) {
                    console.error('Demo payment error:', error);
                    alert('Demo payment processing failed');
                }
            }
            
            function simulateFailure() {
                // Simulate failed payment - redirect to cancel page  
                window.location.href = '/checkout/cancel?transaction_id=${txId}&demo=true&reason=demo_failure';
            }
        </script>
    </body>
    </html>
  `);
});

export default payments;
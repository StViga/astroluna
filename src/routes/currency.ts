// Currency exchange routes for AstroLuna

import { Hono } from 'hono';
// Removed CloudflareBindings import for Node.js compatibility
import { CurrencyService } from '../utils/currency';

const currency = new Hono();

// Get current exchange rates
currency.get('/rates', async (c) => {
  try {
    const rates = await CurrencyService.getExchangeRates(c.env?.DB);
    
    return c.json({
      success: true,
      rates,
      timestamp: rates.timestamp
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Return fallback rates if there's an error
    const fallbackRates = CurrencyService.getFallbackRates();
    
    return c.json({
      success: true,
      rates: fallbackRates,
      timestamp: fallbackRates.timestamp,
      fallback: true
    });
  }
});

// Calculate pricing for credit packages in different currencies
currency.get('/pricing', async (c) => {
  try {
    const rates = await CurrencyService.getExchangeRates(c.env?.DB);
    
    // Define credit packages (EUR base prices)
    const packages = [
      { eur_amount: 5, credits: 50, bonus_percent: 0 },
      { eur_amount: 20, credits: 220, bonus_percent: 10 },
      { eur_amount: 100, credits: 1200, bonus_percent: 20 },
      { eur_amount: 500, credits: 7000, bonus_percent: 40 },
      { eur_amount: 2000, credits: 32000, bonus_percent: 60 }
    ];
    
    // Calculate pricing for each package in all currencies
    const pricing = packages.map(pkg => {
      const currencyPricing = CurrencyService.calculatePackagePricing(pkg.eur_amount, rates);
      
      return {
        credits: pkg.credits,
        bonus_percent: pkg.bonus_percent,
        prices: currencyPricing,
        cost_per_credit: {
          EUR: Number((pkg.eur_amount / pkg.credits).toFixed(4)),
          USD: Number((currencyPricing.USD / pkg.credits).toFixed(4)),
          GBP: Number((currencyPricing.GBP / pkg.credits).toFixed(4))
        }
      };
    });
    
    return c.json({
      success: true,
      pricing,
      rates,
      service_costs: {
        astroscope: 15,
        tarotpath: 20,
        zodiac_tome: 10
      }
    });
  } catch (error) {
    console.error('Error calculating pricing:', error);
    return c.json({ error: 'Failed to calculate pricing' }, 500);
  }
});

// Convert amount between currencies
currency.post('/convert', async (c) => {
  try {
    const { amount, from_currency, to_currency } = await c.req.json();
    
    if (!amount || !from_currency || !to_currency) {
      return c.json({ error: 'Missing required parameters: amount, from_currency, to_currency' }, 400);
    }
    
    const rates = await CurrencyService.getExchangeRates(c.env?.DB);
    
    // Convert to EUR first, then to target currency
    const eurAmount = CurrencyService.convertToEUR(amount, from_currency, rates);
    const convertedAmount = CurrencyService.convertFromEUR(eurAmount, to_currency, rates);
    
    return c.json({
      success: true,
      original_amount: amount,
      from_currency,
      to_currency,
      converted_amount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimal places
      exchange_rate: rates[to_currency as keyof typeof rates] / rates[from_currency as keyof typeof rates],
      formatted: CurrencyService.formatCurrency(convertedAmount, to_currency)
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    return c.json({ error: 'Currency conversion failed' }, 500);
  }
});

// Get supported currencies
currency.get('/supported', (c) => {
  return c.json({
    success: true,
    currencies: [
      { code: 'EUR', name: 'Euro', symbol: '€', is_base: true },
      { code: 'USD', name: 'US Dollar', symbol: '$', is_base: false },
      { code: 'GBP', name: 'British Pound', symbol: '£', is_base: false }
    ]
  });
});

// Calculate checkout quote (fixes exchange rate for transaction)
currency.post('/checkout/quote', async (c) => {
  try {
    const { amount_eur, target_currency } = await c.req.json();
    
    if (!amount_eur || !target_currency) {
      return c.json({ error: 'Missing required parameters: amount_eur, target_currency' }, 400);
    }
    
    const rates = await CurrencyService.getExchangeRates(c.env?.DB);
    const convertedAmount = CurrencyService.convertFromEUR(amount_eur, target_currency, rates);
    
    // Create quote snapshot for this transaction
    const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Store quote in database for 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
    
    await c.env.DB.prepare(`
      INSERT INTO rates_cache (rates_data, rates_timestamp)
      VALUES (?, ?)
    `).bind(JSON.stringify({
      quote_id: quoteId,
      amount_eur,
      target_currency,
      converted_amount: convertedAmount,
      rate_used: rates[target_currency as keyof typeof rates],
      expires_at: expiresAt,
      rates_snapshot: rates
    }), new Date().toISOString()).run();
    
    return c.json({
      success: true,
      quote_id: quoteId,
      amount_eur,
      target_currency,
      converted_amount: Math.round(convertedAmount * 100) / 100,
      rate_used: rates[target_currency as keyof typeof rates],
      formatted_amount: CurrencyService.formatCurrency(convertedAmount, target_currency),
      expires_at: expiresAt
    });
  } catch (error) {
    console.error('Error creating checkout quote:', error);
    return c.json({ error: 'Failed to create checkout quote' }, 500);
  }
});

export default currency;
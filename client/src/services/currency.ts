// NBU Exchange Rates API integration
export interface NBUExchangeRate {
  r030: number; // Цифровий код валюти
  txt: string; // Літерний код валюти
  rate: number; // Курс
  cc: string; // Код валюти
  exchangedate: string; // Дата курсу
}

export interface ConvertedPrice {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  convertedCurrency: string;
  exchangeRate: number;
  lastUpdated: string;
}

export interface CurrencyConfig {
  baseCurrency: 'USD' | 'EUR' | 'UAH';
  supportedCurrencies: string[];
  cacheTimeout: number; // minutes
}

class NBUCurrencyService {
  private config: CurrencyConfig = {
    baseCurrency: 'USD',
    supportedCurrencies: ['USD', 'EUR', 'UAH'],
    cacheTimeout: 30 // 30 minutes
  };

  private cache: Map<string, { rate: NBUExchangeRate; timestamp: number }> = new Map();
  private apiUrl = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange';

  // Get current exchange rates from NBU
  async getExchangeRates(date?: string): Promise<NBUExchangeRate[]> {
    try {
      const dateParam = date || this.formatDate(new Date());
      const url = `${this.apiUrl}?date=${dateParam}&json`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`NBU API error: ${response.status}`);
      }

      const rates: NBUExchangeRate[] = await response.json();
      
      // Add UAH as base currency (rate = 1)
      const uahRate: NBUExchangeRate = {
        r030: 980,
        txt: 'Українська гривня',
        rate: 1,
        cc: 'UAH',
        exchangedate: dateParam
      };
      
      return [uahRate, ...rates];
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      
      // Return fallback rates if API fails
      return this.getFallbackRates();
    }
  }

  // Get specific currency rate
  async getCurrencyRate(currencyCode: string, targetCurrency: string = 'UAH'): Promise<number> {
    const cacheKey = `${currencyCode}_${targetCurrency}`;
    const cached = this.cache.get(cacheKey);
    
    // Check if we have valid cached rate
    if (cached && (Date.now() - cached.timestamp) < this.config.cacheTimeout * 60 * 1000) {
      return cached.rate.rate;
    }

    try {
      const rates = await this.getExchangeRates();
      
      // Find source and target currency rates
      const sourceCurrency = rates.find(rate => rate.cc === currencyCode);
      const targetCurrencyRate = rates.find(rate => rate.cc === targetCurrency);
      
      if (!sourceCurrency) {
        throw new Error(`Currency ${currencyCode} not found`);
      }
      
      let exchangeRate: number;
      
      if (targetCurrency === 'UAH') {
        exchangeRate = sourceCurrency.rate;
      } else if (currencyCode === 'UAH') {
        exchangeRate = targetCurrencyRate ? 1 / targetCurrencyRate.rate : 1;
      } else {
        // Convert through UAH: source -> UAH -> target
        const sourceToUAH = sourceCurrency.rate;
        const targetToUAH = targetCurrencyRate ? targetCurrencyRate.rate : 1;
        exchangeRate = sourceToUAH / targetToUAH;
      }
      
      // Cache the result
      this.cache.set(cacheKey, {
        rate: { ...sourceCurrency, rate: exchangeRate },
        timestamp: Date.now()
      });
      
      return exchangeRate;
      
    } catch (error) {
      console.error(`Failed to get rate for ${currencyCode}:`, error);
      return this.getFallbackRate(currencyCode, targetCurrency);
    }
  }

  // Convert price between currencies
  async convertPrice(amount: number, fromCurrency: string, toCurrency: string): Promise<ConvertedPrice> {
    try {
      if (fromCurrency === toCurrency) {
        return {
          originalAmount: amount,
          originalCurrency: fromCurrency,
          convertedAmount: amount,
          convertedCurrency: toCurrency,
          exchangeRate: 1,
          lastUpdated: new Date().toISOString()
        };
      }

      const exchangeRate = await this.getCurrencyRate(fromCurrency, toCurrency);
      const convertedAmount = Math.round(amount * exchangeRate * 100) / 100;

      return {
        originalAmount: amount,
        originalCurrency: fromCurrency,
        convertedAmount,
        convertedCurrency: toCurrency,
        exchangeRate,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Price conversion failed:', error);
      throw new Error(`Failed to convert ${amount} ${fromCurrency} to ${toCurrency}`);
    }
  }

  // Convert multiple prices (for pricing tables)
  async convertPrices(prices: Array<{ amount: number; currency: string }>, targetCurrency: string) {
    const conversions = await Promise.all(
      prices.map(price => 
        this.convertPrice(price.amount, price.currency, targetCurrency)
      )
    );
    
    return conversions;
  }

  // Format currency for display
  formatCurrency(amount: number, currency: string, locale: string = 'en-US'): string {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      // Fallback formatting
      const symbols: Record<string, string> = {
        'USD': '$',
        'EUR': '€',
        'UAH': '₴'
      };
      
      const symbol = symbols[currency] || currency;
      return `${symbol}${amount.toFixed(2)}`;
    }
  }

  // Get user preferred currency from localStorage or detect from location
  getUserPreferredCurrency(): string {
    try {
      // Check localStorage first
      const saved = localStorage.getItem('astroluna_preferred_currency');
      if (saved && this.config.supportedCurrencies.includes(saved)) {
        return saved;
      }

      // Detect from browser locale
      const locale = navigator.language || navigator.languages[0];
      
      if (locale.includes('ua') || locale.includes('uk')) return 'UAH';
      if (locale.includes('eu') || locale.includes('de') || locale.includes('fr')) return 'EUR';
      
      return 'USD'; // Default
    } catch {
      return 'USD';
    }
  }

  // Set user preferred currency
  setUserPreferredCurrency(currency: string): void {
    if (this.config.supportedCurrencies.includes(currency)) {
      localStorage.setItem('astroluna_preferred_currency', currency);
    }
  }

  // Private helper methods
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }

  private getFallbackRates(): NBUExchangeRate[] {
    // Static fallback rates (approximate)
    return [
      { r030: 980, txt: 'Українська гривня', rate: 1, cc: 'UAH', exchangedate: this.formatDate(new Date()) },
      { r030: 840, txt: 'Долар США', rate: 37, cc: 'USD', exchangedate: this.formatDate(new Date()) },
      { r030: 978, txt: 'Євро', rate: 40, cc: 'EUR', exchangedate: this.formatDate(new Date()) }
    ];
  }

  private getFallbackRate(fromCurrency: string, toCurrency: string): number {
    // Simple fallback conversion rates
    const rates: Record<string, Record<string, number>> = {
      'USD': { 'UAH': 37, 'EUR': 0.92 },
      'EUR': { 'UAH': 40, 'USD': 1.08 },
      'UAH': { 'USD': 0.027, 'EUR': 0.025 }
    };

    return rates[fromCurrency]?.[toCurrency] || 1;
  }

  // Get supported currencies
  getSupportedCurrencies(): string[] {
    return [...this.config.supportedCurrencies];
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

export default NBUCurrencyService;
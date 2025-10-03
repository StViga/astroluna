import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  SubscriptionPlan, 
  Subscription, 
  Transaction, 
  PaymentMethod,
  Currency,
  PaymentStatus,
  TokenPackage,
  TokenPurchase,
  UserTokens
} from '@/types/payment';
import SPCPaymentService from '@/services/payment';
import NBUCurrencyService from '@/services/currency';
import { toast } from 'react-hot-toast';

interface PaymentState {
  // State
  subscriptionPlans: SubscriptionPlan[];
  currentSubscription: Subscription | null;
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  paymentHistory: Transaction[];
  selectedCurrency: Currency;
  exchangeRates: Record<string, number>;
  paymentStatus: PaymentStatus;
  paymentInProgress: boolean;
  paymentError: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Token system
  tokenPackages: TokenPackage[];
  userTokens: UserTokens;
  tokenPurchases: TokenPurchase[];

  // Actions
  loadSubscriptionPlans: () => Promise<void>;
  selectCurrency: (currency: Currency) => void;
  setSelectedCurrency: (currency: Currency) => void;
  updateExchangeRates: () => Promise<void>;
  createPayment: (planId: string, interval: 'monthly' | 'yearly') => Promise<string | null>;
  processPayment: (paymentId: string, paymentData: any) => Promise<boolean>;
  cancelSubscription: (subscriptionId: string) => Promise<boolean>;
  loadPaymentMethods: () => Promise<void>;
  addPaymentMethod: (paymentMethod: Omit<PaymentMethod, 'id'>) => Promise<void>;
  removePaymentMethod: (methodId: string) => Promise<void>;
  loadTransactions: () => Promise<void>;
  loadPaymentHistory: () => Promise<void>;
  getConvertedPrice: (amount: number, fromCurrency: Currency) => number;
  convertPrice: (amount: number, fromCurrency?: Currency) => number;
  formatPrice: (amount: number, currency: Currency) => string;
  
  // Token actions
  loadTokenPackages: () => Promise<void>;
  purchaseTokens: (packageId: string) => Promise<string | null>;
  processTokenPurchase: (purchaseId: string) => Promise<boolean>;
  loadUserTokens: () => Promise<void>;
  useTokens: (amount: number) => boolean;
  loadTokenPurchases: () => Promise<void>;
  
  // Utility actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

const paymentService = new SPCPaymentService();
const currencyService = new NBUCurrencyService();

// Default token packages
const defaultTokenPackages: TokenPackage[] = [
  {
    id: 'tokens_50',
    name: 'Starter Pack',
    description: 'Perfect for trying out AI analysis',
    tokens: 50,
    price: 4.99,
    currency: 'USD'
  },
  {
    id: 'tokens_150',
    name: 'Popular Pack',
    description: 'Great value for regular users',
    tokens: 150,
    price: 12.99,
    currency: 'USD',
    bonus: 25,
    popular: true,
    savings: 'Save 17%'
  },
  {
    id: 'tokens_350',
    name: 'Power Pack',
    description: 'Best for heavy users',
    tokens: 350,
    price: 24.99,
    currency: 'USD',
    bonus: 75,
    savings: 'Save 30%'
  },
  {
    id: 'tokens_750',
    name: 'Pro Pack',
    description: 'Maximum value for professionals',
    tokens: 750,
    price: 49.99,
    currency: 'USD',
    bonus: 200,
    savings: 'Save 35%'
  }
];

// Default subscription plans
const defaultPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Cosmic Starter',
    description: 'Perfect for astrology enthusiasts',
    features: [
      '50 AI generations per month',
      'Basic natal chart analysis',
      'Daily horoscope',
      'Email support',
      'Mobile app access'
    ],
    price: {
      monthly: 9.99,
      yearly: 99.99
    },
    currency: 'USD',
    maxGenerations: 50,
    priority: 'standard'
  },
  {
    id: 'pro',
    name: 'Astro Pro',
    description: 'For serious astrology practitioners',
    features: [
      '200 AI generations per month',
      'Advanced natal chart analysis',
      'Compatibility reports',
      'Transit predictions',
      'Priority support',
      'Custom chart themes',
      'Export to PDF'
    ],
    price: {
      monthly: 24.99,
      yearly: 249.99
    },
    currency: 'USD',
    popular: true,
    maxGenerations: 200,
    priority: 'high'
  },
  {
    id: 'master',
    name: 'Cosmic Master',
    description: 'Unlimited cosmic insights',
    features: [
      'Unlimited AI generations',
      'Professional-grade analysis',
      'Advanced compatibility tools',
      'Business astrology features',
      'White-label options',
      'API access',
      'Dedicated support',
      'Custom integrations'
    ],
    price: {
      monthly: 49.99,
      yearly: 499.99
    },
    currency: 'USD',
    maxGenerations: -1, // Unlimited
    priority: 'premium'
  }
];

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      // Initial state
      subscriptionPlans: defaultPlans,
      currentSubscription: {
        id: 'demo_sub_001',
        planId: 'pro',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        interval: 'month',
        price: 24.99,
        currency: 'USD',
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        billingPeriod: 'monthly',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        generationsUsed: 45,
        maxGenerations: 200
      },
      paymentMethods: [{
        id: 'demo_pm_001',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true
      }],
      transactions: [{
        id: 'demo_txn_001',
        type: 'subscription',
        status: 'completed',
        amount: 24.99,
        currency: 'USD',
        description: 'Astro Pro - Monthly subscription',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }],
      paymentHistory: [{
        id: 'demo_txn_001',
        type: 'subscription',
        status: 'completed',
        amount: 24.99,
        currency: 'USD',
        description: 'Astro Pro - Monthly subscription',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }],
      selectedCurrency: currencyService.getUserPreferredCurrency() as Currency,
      exchangeRates: { USD: 1, EUR: 1.08, UAH: 0.027 },
      paymentStatus: 'idle',
      paymentInProgress: false,
      paymentError: null,
      isLoading: false,
      error: null,
      
      // Token system initial state
      tokenPackages: defaultTokenPackages,
      userTokens: {
        balance: 125, // Demo tokens
        totalPurchased: 150,
        totalUsed: 25,
        lastUpdated: new Date().toISOString()
      },
      tokenPurchases: [
        {
          id: 'token_purchase_001',
          packageId: 'tokens_150',
          tokens: 150,
          amount: 12.99,
          currency: 'USD',
          status: 'completed',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],

      // Load subscription plans
      loadSubscriptionPlans: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // In real app, this would fetch from API
          // For now, we use the default plans with currency conversion
          const { selectedCurrency } = get();
          
          if (selectedCurrency !== 'USD') {
            await get().updateExchangeRates();
          }
          
          set({ 
            subscriptionPlans: defaultPlans,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to load subscription plans' 
          });
        }
      },

      // Select currency
      selectCurrency: (currency) => {
        set({ selectedCurrency: currency });
        currencyService.setUserPreferredCurrency(currency);
        get().updateExchangeRates();
      },

      // Update exchange rates
      updateExchangeRates: async () => {
        try {
          const rates: Record<string, number> = {};
          const currencies: Currency[] = ['USD', 'EUR', 'UAH'];
          
          for (const currency of currencies) {
            if (currency === 'UAH') {
              rates[currency] = 1;
            } else {
              rates[currency] = await currencyService.getCurrencyRate(currency, 'UAH');
            }
          }
          
          set({ exchangeRates: rates });
        } catch (error) {
          console.error('Failed to update exchange rates:', error);
          // Keep existing rates on error
        }
      },

      // Create payment
      createPayment: async (planId, interval) => {
        set({ isLoading: true, error: null, paymentStatus: 'processing' });
        
        try {
          const plan = get().subscriptionPlans.find(p => p.id === planId);
          if (!plan) {
            throw new Error('Subscription plan not found');
          }

          const amount = interval === 'yearly' ? plan.price.yearly : plan.price.monthly;
          const { selectedCurrency } = get();
          
          // Convert price if needed
          let finalAmount = amount;
          if (selectedCurrency !== plan.currency) {
            const converted = await currencyService.convertPrice(amount, plan.currency, selectedCurrency);
            finalAmount = converted.convertedAmount;
          }

          const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          const paymentRequest = {
            amount: finalAmount,
            currency: selectedCurrency,
            orderId,
            description: `${plan.name} - ${interval} subscription`,
            customerEmail: 'user@example.com', // Should come from auth store
            customerName: 'Demo User', // Should come from auth store
            returnUrl: `${window.location.origin}/billing/success`,
            callbackUrl: `${window.location.origin}/api/payment/callback`,
            language: 'en' as const
          };

          const result = await paymentService.createPayment(paymentRequest);
          
          if (result.success && result.paymentUrl) {
            set({ paymentStatus: 'processing', isLoading: false });
            
            // Setup payment window message handler
            const handlePaymentMessage = (event: MessageEvent) => {
              if (event.data.type === 'PAYMENT_SUCCESS') {
                // Process the successful payment
                get().processPayment(result.paymentId, {
                  planId,
                  interval,
                  amount: event.data.amount,
                  currency: event.data.currency
                });
                window.removeEventListener('message', handlePaymentMessage);
              } else if (event.data.type === 'PAYMENT_CANCELLED') {
                set({ paymentStatus: 'failed', paymentInProgress: false });
                toast.error('Payment was cancelled');
                window.removeEventListener('message', handlePaymentMessage);
              }
            };
            
            window.addEventListener('message', handlePaymentMessage);
            
            // Open payment widget in new window
            const paymentWindow = window.open(
              result.paymentUrl, 
              'payment', 
              'width=800,height=700,scrollbars=yes,resizable=yes,centerscreen=yes'
            );
            
            if (!paymentWindow) {
              toast.error('Please allow pop-ups to complete payment');
              set({ paymentStatus: 'failed', isLoading: false });
              return null;
            }
            
            toast.success('Payment window opened. Complete the payment to continue.');
            return result.paymentId;
          } else {
            throw new Error(result.message || 'Payment creation failed');
          }
          
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Payment creation failed',
            paymentStatus: 'failed'
          });
          toast.error(error.message || 'Payment creation failed');
          return null;
        }
      },

      // Process payment
      processPayment: async (paymentId, paymentData) => {
        set({ isLoading: true, error: null, paymentStatus: 'processing' });
        
        try {
          // Check payment status
          const status = await paymentService.getPaymentStatus(paymentId);
          
          if (status.status === 'success') {
            // Create mock subscription
            const plan = get().subscriptionPlans.find(p => p.id === paymentData.planId);
            const newSubscription: Subscription = {
              id: `sub_${Date.now()}`,
              planId: paymentData.planId,
              status: 'active',
              currentPeriodStart: new Date().toISOString(),
              currentPeriodEnd: new Date(Date.now() + (paymentData.interval === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
              cancelAtPeriodEnd: false,
              interval: paymentData.interval === 'yearly' ? 'year' : 'month',
              price: status.amount / 100,
              currency: status.currency,
              nextPaymentDate: new Date(Date.now() + (paymentData.interval === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
              // Additional required fields
              startDate: new Date().toISOString(),
              billingPeriod: paymentData.interval,
              nextBillingDate: new Date(Date.now() + (paymentData.interval === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
              generationsUsed: 0,
              maxGenerations: plan?.maxGenerations || 0
            };

            // Create transaction record
            const transaction: Transaction = {
              id: status.transactionId || `txn_${Date.now()}`,
              type: 'subscription',
              status: 'completed',
              amount: status.amount / 100,
              currency: status.currency,
              description: `Subscription payment - ${paymentData.planId}`,
              createdAt: status.createdAt,
              completedAt: status.completedAt || new Date().toISOString()
            };

            set({ 
              currentSubscription: newSubscription,
              transactions: [transaction, ...get().transactions],
              paymentStatus: 'succeeded',
              isLoading: false 
            });

            toast.success('Payment successful! Your subscription is now active.');
            return true;
          } else {
            throw new Error('Payment not completed');
          }
          
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Payment processing failed',
            paymentStatus: 'failed'
          });
          toast.error(error.message || 'Payment processing failed');
          return false;
        }
      },

      // Cancel subscription
      cancelSubscription: async (subscriptionId) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await paymentService.cancelSubscription(subscriptionId);
          
          if (result.success) {
            set({ 
              currentSubscription: null,
              isLoading: false 
            });
            toast.success('Subscription cancelled successfully');
            return true;
          } else {
            throw new Error(result.message);
          }
          
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to cancel subscription' 
          });
          toast.error(error.message || 'Failed to cancel subscription');
          return false;
        }
      },

      // Load payment methods (mock implementation)
      loadPaymentMethods: async () => {
        set({ isLoading: true });
        
        try {
          // Mock payment methods
          const methods: PaymentMethod[] = [
            {
              id: 'pm_1',
              type: 'card',
              last4: '4242',
              brand: 'visa',
              expiryMonth: 12,
              expiryYear: 2025,
              isDefault: true
            }
          ];
          
          set({ paymentMethods: methods, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
        }
      },

      // Add payment method (mock implementation)
      addPaymentMethod: async (paymentMethod) => {
        const newMethod: PaymentMethod = {
          ...paymentMethod,
          id: `pm_${Date.now()}`
        };
        
        set({ 
          paymentMethods: [...get().paymentMethods, newMethod] 
        });
        toast.success('Payment method added successfully');
      },

      // Remove payment method
      removePaymentMethod: async (methodId) => {
        set({ 
          paymentMethods: get().paymentMethods.filter(method => method.id !== methodId) 
        });
        toast.success('Payment method removed');
      },

      // Load transactions (mock implementation)
      loadTransactions: async () => {
        set({ isLoading: true });
        
        try {
          // Mock transactions
          const transactions: Transaction[] = [
            {
              id: 'txn_1',
              type: 'payment',
              status: 'completed',
              amount: 24.99,
              currency: 'USD',
              description: 'Astro Pro subscription',
              createdAt: new Date().toISOString(),
              completedAt: new Date().toISOString()
            }
          ];
          
          set({ transactions, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
        }
      },

      // Get converted price
      getConvertedPrice: (amount, fromCurrency) => {
        const { selectedCurrency, exchangeRates } = get();
        
        if (fromCurrency === selectedCurrency) {
          return amount;
        }
        
        // Convert through UAH
        const fromRate = exchangeRates[fromCurrency] || 1;
        const toRate = exchangeRates[selectedCurrency] || 1;
        
        return Math.round(amount * (fromRate / toRate) * 100) / 100;
      },

      // Format price
      formatPrice: (amount, currency) => {
        return currencyService.formatCurrency(amount, currency);
      },

      // Additional methods for compatibility
      setSelectedCurrency: (currency) => {
        set({ selectedCurrency: currency });
        currencyService.setUserPreferredCurrency(currency);
        get().updateExchangeRates();
      },

      convertPrice: (amount, fromCurrency) => {
        return get().getConvertedPrice(amount, fromCurrency || get().selectedCurrency);
      },

      loadPaymentHistory: async () => {
        set({ isLoading: true });
        try {
          const history = get().transactions; // Use same data as transactions
          set({ paymentHistory: history, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
        }
      },

      // Token management methods
      loadTokenPackages: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // In real app, this would fetch from API
          const { selectedCurrency } = get();
          
          if (selectedCurrency !== 'USD') {
            await get().updateExchangeRates();
          }
          
          set({ 
            tokenPackages: defaultTokenPackages,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to load token packages' 
          });
        }
      },

      purchaseTokens: async (packageId) => {
        set({ isLoading: true, error: null, paymentStatus: 'processing' });
        
        try {
          const tokenPackage = get().tokenPackages.find(p => p.id === packageId);
          if (!tokenPackage) {
            throw new Error('Token package not found');
          }

          const { selectedCurrency } = get();
          
          // Convert price if needed
          let finalAmount = tokenPackage.price;
          if (selectedCurrency !== tokenPackage.currency) {
            const converted = await currencyService.convertPrice(tokenPackage.price, tokenPackage.currency, selectedCurrency);
            finalAmount = converted.convertedAmount;
          }

          const orderId = `token_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          const paymentRequest = {
            amount: finalAmount,
            currency: selectedCurrency,
            orderId,
            description: `${tokenPackage.name} - ${tokenPackage.tokens} tokens`,
            customerEmail: 'user@example.com', // Should come from auth store
            customerName: 'Demo User', // Should come from auth store
            returnUrl: `${window.location.origin}/billing/token-success`,
            callbackUrl: `${window.location.origin}/api/payment/token-callback`,
            language: 'en' as const
          };

          const result = await paymentService.createPayment(paymentRequest);
          
          if (result.success && result.paymentUrl) {
            set({ paymentStatus: 'processing', isLoading: false });
            
            // Setup payment window message handler
            const handleTokenPaymentMessage = (event: MessageEvent) => {
              if (event.data.type === 'PAYMENT_SUCCESS') {
                // Process the successful token purchase
                get().processTokenPurchase(result.paymentId);
                window.removeEventListener('message', handleTokenPaymentMessage);
              } else if (event.data.type === 'PAYMENT_CANCELLED') {
                set({ paymentStatus: 'failed', paymentInProgress: false });
                toast.error('Token purchase was cancelled');
                window.removeEventListener('message', handleTokenPaymentMessage);
              }
            };
            
            window.addEventListener('message', handleTokenPaymentMessage);
            
            // Open payment widget in new window
            const paymentWindow = window.open(
              result.paymentUrl, 
              'payment', 
              'width=800,height=700,scrollbars=yes,resizable=yes,centerscreen=yes'
            );
            
            if (!paymentWindow) {
              toast.error('Please allow pop-ups to complete payment');
              set({ paymentStatus: 'failed', isLoading: false });
              return null;
            }
            
            toast.success('Token purchase window opened. Complete the payment to continue.');
            return result.paymentId;
          } else {
            throw new Error(result.message || 'Token purchase failed');
          }
          
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Token purchase failed',
            paymentStatus: 'failed'
          });
          toast.error(error.message || 'Token purchase failed');
          return null;
        }
      },

      processTokenPurchase: async (purchaseId) => {
        set({ isLoading: true, error: null, paymentStatus: 'processing' });
        
        try {
          // Check payment status
          const status = await paymentService.getPaymentStatus(purchaseId);
          
          if (status.status === 'success') {
            // Find the package from the description or store packageId in metadata
            const packageId = 'tokens_150'; // In real app, this would come from payment metadata
            const tokenPackage = get().tokenPackages.find(p => p.id === packageId);
            
            if (tokenPackage) {
              // Create token purchase record
              const tokenPurchase: TokenPurchase = {
                id: `token_purchase_${Date.now()}`,
                packageId: packageId,
                tokens: tokenPackage.tokens + (tokenPackage.bonus || 0),
                amount: status.amount / 100,
                currency: status.currency,
                status: 'completed',
                createdAt: status.createdAt,
                completedAt: status.completedAt || new Date().toISOString()
              };

              // Update user tokens
              const currentTokens = get().userTokens;
              const updatedTokens: UserTokens = {
                balance: currentTokens.balance + tokenPurchase.tokens,
                totalPurchased: currentTokens.totalPurchased + tokenPurchase.tokens,
                totalUsed: currentTokens.totalUsed,
                lastUpdated: new Date().toISOString()
              };

              // Create transaction record
              const transaction: Transaction = {
                id: status.transactionId || `txn_token_${Date.now()}`,
                type: 'payment',
                status: 'completed',
                amount: status.amount / 100,
                currency: status.currency,
                description: `Token purchase - ${tokenPackage.name}`,
                createdAt: status.createdAt,
                completedAt: status.completedAt || new Date().toISOString()
              };

              set({ 
                userTokens: updatedTokens,
                tokenPurchases: [tokenPurchase, ...get().tokenPurchases],
                transactions: [transaction, ...get().transactions],
                paymentStatus: 'succeeded',
                isLoading: false 
              });

              toast.success(`Token purchase successful! ${tokenPurchase.tokens} tokens added to your account.`);
              return true;
            } else {
              throw new Error('Token package not found');
            }
          } else {
            throw new Error('Payment not completed');
          }
          
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Token purchase processing failed',
            paymentStatus: 'failed'
          });
          toast.error(error.message || 'Token purchase processing failed');
          return false;
        }
      },

      loadUserTokens: async () => {
        set({ isLoading: true });
        
        try {
          // In real app, this would fetch from API
          // For now, we use the existing state
          set({ isLoading: false });
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
        }
      },

      useTokens: (amount) => {
        const currentTokens = get().userTokens;
        
        if (currentTokens.balance >= amount) {
          const updatedTokens: UserTokens = {
            balance: currentTokens.balance - amount,
            totalPurchased: currentTokens.totalPurchased,
            totalUsed: currentTokens.totalUsed + amount,
            lastUpdated: new Date().toISOString()
          };
          
          set({ userTokens: updatedTokens });
          return true;
        }
        
        return false;
      },

      loadTokenPurchases: async () => {
        set({ isLoading: true });
        
        try {
          // In real app, this would fetch from API
          // For now, we use the existing state
          set({ isLoading: false });
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
        }
      },

      // Utility actions
      clearError: () => set({ error: null }),
      setLoading: (loading) => set({ isLoading: loading })
    }),
    {
      name: 'astroluna-payment-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedCurrency: state.selectedCurrency,
        currentSubscription: state.currentSubscription,
        paymentMethods: state.paymentMethods,
        transactions: state.transactions,
        userTokens: state.userTokens,
        tokenPurchases: state.tokenPurchases
      })
    }
  )
);

// Utility hook
export const usePayment = () => {
  const store = usePaymentStore();
  
  return {
    ...store,
    hasActiveSubscription: !!store.currentSubscription && store.currentSubscription.status === 'active',
    isTrialUser: !store.currentSubscription,
    getActivePlan: () => {
      if (!store.currentSubscription) return null;
      return store.subscriptionPlans.find(plan => plan.id === store.currentSubscription!.planId);
    }
  };
};
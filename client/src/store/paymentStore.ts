import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  SubscriptionPlan, 
  Subscription, 
  Transaction, 
  PaymentMethod,
  Currency,
  PaymentStatus 
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
  selectedCurrency: Currency;
  exchangeRates: Record<string, number>;
  paymentStatus: PaymentStatus;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSubscriptionPlans: () => Promise<void>;
  selectCurrency: (currency: Currency) => void;
  updateExchangeRates: () => Promise<void>;
  createPayment: (planId: string, interval: 'monthly' | 'yearly') => Promise<string | null>;
  processPayment: (paymentId: string, paymentData: any) => Promise<boolean>;
  cancelSubscription: (subscriptionId: string) => Promise<boolean>;
  loadPaymentMethods: () => Promise<void>;
  addPaymentMethod: (paymentMethod: Omit<PaymentMethod, 'id'>) => Promise<void>;
  removePaymentMethod: (methodId: string) => Promise<void>;
  loadTransactions: () => Promise<void>;
  getConvertedPrice: (amount: number, fromCurrency: Currency) => number;
  formatPrice: (amount: number, currency: Currency) => string;
  
  // Utility actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

const paymentService = new SPCPaymentService();
const currencyService = new NBUCurrencyService();

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
      currentSubscription: null,
      paymentMethods: [],
      transactions: [],
      selectedCurrency: currencyService.getUserPreferredCurrency() as Currency,
      exchangeRates: { USD: 1, EUR: 1.08, UAH: 0.027 },
      paymentStatus: 'idle',
      isLoading: false,
      error: null,

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
            set({ paymentStatus: 'succeeded', isLoading: false });
            
            // Open payment widget in new window or redirect
            window.open(result.paymentUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
            
            toast.success('Payment created! Complete the payment in the new window.');
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
              nextPaymentDate: new Date(Date.now() + (paymentData.interval === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
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
              completedAt: status.completedAt
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
        transactions: state.transactions
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
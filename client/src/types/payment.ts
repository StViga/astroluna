// Payment and subscription related types

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: {
    monthly: number;
    yearly: number;
  };
  currency: 'USD' | 'EUR' | 'UAH';
  popular?: boolean;
  maxGenerations: number;
  priority: 'standard' | 'high' | 'premium';
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'subscription';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  description: string;
  paymentMethodId?: string;
  createdAt: string;
  completedAt?: string;
  receiptUrl?: string;
}

export interface Subscription {
  id: string;
  planId: string;
  status: 'active' | 'past_due' | 'cancelled' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  interval: 'month' | 'year';
  price: number;
  currency: string;
  paymentMethodId?: string;
  nextPaymentDate?: string;
  // Additional fields needed by BillingPage
  startDate: string;
  billingPeriod: 'monthly' | 'yearly';
  nextBillingDate: string;
  generationsUsed: number;
  maxGenerations: number;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret: string;
  paymentMethodTypes: string[];
  description: string;
  metadata: Record<string, string>;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  billingAddress?: BillingAddress;
  defaultPaymentMethodId?: string;
  subscriptions: Subscription[];
  transactions: Transaction[];
}

export interface Invoice {
  id: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  dueDate: string;
  paidAt?: string;
  invoiceNumber: string;
  invoiceUrl: string;
  receiptUrl?: string;
  lines: InvoiceLine[];
}

export interface InvoiceLine {
  description: string;
  amount: number;
  quantity: number;
  unitPrice: number;
}

// Form data types
export interface PaymentFormData {
  paymentMethodId?: string;
  billingAddress: BillingAddress;
  savePaymentMethod: boolean;
}

export interface CheckoutData {
  planId: string;
  interval: 'monthly' | 'yearly';
  currency: string;
  paymentMethodData?: {
    type: 'card';
    card: {
      number: string;
      expMonth: number;
      expYear: number;
      cvc: string;
    };
  };
  billingDetails: {
    name: string;
    email: string;
    phone?: string;
    address: BillingAddress;
  };
}

// API Response types
export interface PaymentApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface SubscriptionApiResponse {
  subscription: Subscription;
  paymentIntent?: PaymentIntent;
}

// Webhook types
export interface WebhookEvent {
  id: string;
  type: 'payment.succeeded' | 'payment.failed' | 'subscription.created' | 'subscription.updated' | 'subscription.cancelled' | 'invoice.payment_succeeded' | 'invoice.payment_failed';
  data: {
    object: any;
  };
  created: number;
}

// Pricing configuration
export interface PricingConfig {
  plans: SubscriptionPlan[];
  currencies: Array<{
    code: 'USD' | 'EUR' | 'UAH';
    symbol: string;
    name: string;
  }>;
  features: {
    [key: string]: {
      name: string;
      description: string;
      icon: string;
    };
  };
}

// Payment widget configuration
export interface PaymentWidgetConfig {
  terminalId: string;
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  returnUrl: string;
  callbackUrl: string;
  language: 'en' | 'uk';
  customerEmail: string;
  customerName: string;
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    borderRadius?: string;
  };
}

// Analytics and metrics
export interface PaymentAnalytics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
  conversionRate: number;
  topPlans: Array<{
    planId: string;
    subscribers: number;
    revenue: number;
  }>;
}

// Error types
export interface PaymentError {
  code: 'card_declined' | 'insufficient_funds' | 'expired_card' | 'invalid_cvc' | 'processing_error' | 'network_error' | 'validation_error';
  message: string;
  param?: string;
  decline_code?: string;
}

// Validation schemas
export interface CardValidation {
  number: {
    isValid: boolean;
    brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';
  };
  expiry: {
    isValid: boolean;
    isPastDate: boolean;
  };
  cvc: {
    isValid: boolean;
    requiredLength: number;
  };
}

export type PaymentStatus = 'idle' | 'processing' | 'succeeded' | 'failed';
export type SubscriptionInterval = 'month' | 'year';
export type Currency = 'USD' | 'EUR' | 'UAH';
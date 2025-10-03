import React, { useState, useEffect } from 'react';
import { usePayment } from '@/store/paymentStore';
import { useAuth } from '@/store/authStore';
import Button from '@/components/ui/Button';
import CheckoutForm from '@/components/payment/CheckoutForm';
import {
  CreditCardIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  XMarkIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const BillingPage: React.FC = () => {
  const { user } = useAuth();
  const {
    subscriptionPlans,
    currentSubscription,
    paymentHistory,
    selectedCurrency,
    convertPrice,
    cancelSubscription,
    loadPaymentHistory,
    paymentInProgress
  } = usePayment();

  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    planId: string;
    billingPeriod: 'monthly' | 'yearly';
  } | null>(null);

  const [billingToggle, setBillingToggle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    loadPaymentHistory();
  }, [loadPaymentHistory]);

  const handlePlanSelect = (planId: string, billingPeriod: 'monthly' | 'yearly') => {
    setSelectedPlan({ planId, billingPeriod });
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
    // Refresh subscription data
    loadPaymentHistory();
  };

  const handleCheckoutCancel = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
  };

  const handleCancelSubscription = async () => {
    if (currentSubscription && confirm('Are you sure you want to cancel your subscription?')) {
      await cancelSubscription(currentSubscription.id);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch(planId) {
      case 'starter': return SparklesIcon;
      case 'pro': return StarIcon;
      case 'master': return TrophyIcon;
      default: return SparklesIcon;
    }
  };

  const getPlanColor = (planId: string) => {
    switch(planId) {
      case 'starter': return 'from-blue-500 to-indigo-600';
      case 'pro': return 'from-purple-500 to-pink-600';
      case 'master': return 'from-yellow-500 to-orange-600';
      default: return 'from-blue-500 to-indigo-600';
    }
  };

  const formatPrice = (plan: any, billing: 'monthly' | 'yearly') => {
    if (plan.id === 'free') return 'Free';
    
    const price = convertPrice(plan.price[billing], plan.currency);
    return `${selectedCurrency} ${price.toFixed(2)}`;
  };

  const getDiscountPercent = (plan: any) => {
    if (plan.id === 'free') return 0;
    const monthly = plan.price.monthly * 12;
    const yearly = plan.price.yearly;
    return Math.round(((monthly - yearly) / monthly) * 100);
  };

  if (showCheckout && selectedPlan) {
    return (
      <div className="bg-zodiac-constellations bg-cover bg-center bg-fixed min-h-screen relative">
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        <div className="relative z-10 py-12">
          <CheckoutForm
            planId={selectedPlan.planId}
            billingPeriod={selectedPlan.billingPeriod}
            onSuccess={handleCheckoutSuccess}
            onCancel={handleCheckoutCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
        <p className="text-gray-300">
          Manage your subscription plan and payment methods
        </p>
      </div>

      {/* Current Subscription Card */}
      {currentSubscription && (
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 border border-white border-opacity-20 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Current Subscription</h2>
                <p className="text-gray-300">Active since {new Date(currentSubscription.startDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">
                {(() => {
                  const plan = subscriptionPlans.find(p => p.id === currentSubscription.planId);
                  return plan ? formatPrice(plan, currentSubscription.billingPeriod) : `${selectedCurrency} ${currentSubscription.price || 0}`;
                })()}
              </div>
              <div className="text-sm text-gray-300">
                per {currentSubscription.billingPeriod.replace('ly', '')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white bg-opacity-10 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CalendarIcon className="h-5 w-5 text-blue-400" />
                <span className="text-white font-medium">Next Billing</span>
              </div>
              <div className="text-lg text-yellow-300">
                {new Date(currentSubscription.nextBillingDate).toLocaleDateString()}
              </div>
            </div>

            <div className="bg-white bg-opacity-10 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ChartBarIcon className="h-5 w-5 text-purple-400" />
                <span className="text-white font-medium">Generations Used</span>
              </div>
              <div className="text-lg text-yellow-300">
                {currentSubscription.generationsUsed} / {
                  currentSubscription.maxGenerations === -1 
                    ? 'Unlimited' 
                    : currentSubscription.maxGenerations
                }
              </div>
            </div>

            <div className="bg-white bg-opacity-10 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCardIcon className="h-5 w-5 text-green-400" />
                <span className="text-white font-medium">Status</span>
              </div>
              <div className={`text-lg font-medium ${
                currentSubscription.status === 'active' ? 'text-green-400' : 'text-red-400'
              }`}>
                {currentSubscription.status === 'active' ? 'Active' : 'Cancelled'}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
              onClick={() => {/* Open change plan modal */}}
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Change Plan
            </Button>
            {currentSubscription.status === 'active' && (
              <Button
                variant="outline"
                className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                onClick={handleCancelSubscription}
                disabled={paymentInProgress}
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Cancel Subscription
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Available Plans */}
      {(!currentSubscription || currentSubscription.status !== 'active') && (
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 border border-white border-opacity-20 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Choose Your Plan</h2>
            
            {/* Billing Toggle */}
            <div className="inline-flex bg-white bg-opacity-10 rounded-xl p-1">
              <button
                onClick={() => setBillingToggle('monthly')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  billingToggle === 'monthly'
                    ? 'bg-yellow-400 text-black'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingToggle('yearly')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  billingToggle === 'yearly'
                    ? 'bg-yellow-400 text-black'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-1 text-xs bg-green-400 text-black px-2 py-0.5 rounded-full">
                  Save up to 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {subscriptionPlans.filter(plan => plan.id !== 'free').map((plan) => {
              const Icon = getPlanIcon(plan.id);
              const color = getPlanColor(plan.id);
              const discount = getDiscountPercent(plan);

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 hover:scale-105 ${
                    plan.popular 
                      ? 'border-yellow-300 bg-opacity-15' 
                      : 'border-white border-opacity-20 hover:border-opacity-40'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-full text-xs font-bold">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${color} mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-300 mb-4 text-sm">{plan.description}</p>
                    
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-white">
                        {formatPrice(plan, billingToggle)}
                      </div>
                      <div className="text-sm text-gray-300">
                        per {billingToggle.replace('ly', '')}
                      </div>
                      {billingToggle === 'yearly' && discount > 0 && (
                        <div className="text-xs text-green-400 mt-1">
                          Save {discount}%
                        </div>
                      )}
                    </div>

                    <div className="mb-6">
                      <div className="text-yellow-300 font-bold">
                        {plan.maxGenerations === -1 ? 'Unlimited' : plan.maxGenerations} Generations
                      </div>
                      <div className="text-xs text-gray-400">Monthly allocation</div>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm">
                        <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                        <span className="text-gray-200">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400' 
                        : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                    }`}
                    onClick={() => handlePlanSelect(plan.id, billingToggle)}
                  >
                    Choose Plan
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 border border-white border-opacity-20 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6">Payment History</h2>
        
        {paymentHistory.length === 0 ? (
          <div className="text-center py-12">
            <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">No payment history yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentHistory.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 bg-white bg-opacity-10 rounded-xl border border-white border-opacity-20"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    payment.status === 'succeeded' 
                      ? 'bg-green-500 bg-opacity-20 text-green-400'
                      : payment.status === 'failed'
                      ? 'bg-red-500 bg-opacity-20 text-red-400'
                      : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                  }`}>
                    {payment.status === 'succeeded' ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      <ExclamationTriangleIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-white font-medium">{payment.description}</div>
                    <div className="text-sm text-gray-300">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">
                    {payment.currency.toUpperCase()} {(payment.amount / 100).toFixed(2)}
                  </div>
                  <div className={`text-sm capitalize ${
                    payment.status === 'succeeded' 
                      ? 'text-green-400'
                      : payment.status === 'failed'
                      ? 'text-red-400'
                      : 'text-yellow-400'
                  }`}>
                    {payment.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingPage;
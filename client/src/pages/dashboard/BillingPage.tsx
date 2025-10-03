import React, { useState, useEffect } from 'react';
import { usePaymentStore } from '@/store/paymentStore';
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
  TrophyIcon,
  BoltIcon,
  GiftIcon,
  FireIcon
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
    paymentInProgress,
    // Token system
    tokenPackages,
    userTokens,
    tokenPurchases,
    purchaseTokens,
    loadTokenPackages,
    loadUserTokens
  } = usePaymentStore();

  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    planId: string;
    billingPeriod: 'monthly' | 'yearly';
  } | null>(null);
  const [showTokenCheckout, setShowTokenCheckout] = useState(false);
  const [selectedTokenPackage, setSelectedTokenPackage] = useState<string | null>(null);

  const [billingToggle, setBillingToggle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    loadPaymentHistory();
    loadTokenPackages();
    loadUserTokens();
  }, [loadPaymentHistory, loadTokenPackages, loadUserTokens]);

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

  const handleTokenPurchase = async (packageId: string) => {
    const paymentId = await purchaseTokens(packageId);
    if (paymentId) {
      setSelectedTokenPackage(packageId);
      setShowTokenCheckout(true);
    }
  };

  const handleTokenCheckoutSuccess = () => {
    setShowTokenCheckout(false);
    setSelectedTokenPackage(null);
    loadUserTokens();
    loadPaymentHistory();
  };

  const handleTokenCheckoutCancel = () => {
    setShowTokenCheckout(false);
    setSelectedTokenPackage(null);
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

  const getTokenPackageIcon = (packageId: string) => {
    switch(packageId) {
      case 'tokens_50': return SparklesIcon;
      case 'tokens_150': return BoltIcon;
      case 'tokens_350': return FireIcon;
      case 'tokens_750': return GiftIcon;
      default: return BoltIcon;
    }
  };

  const getTokenPackageColor = (packageId: string) => {
    switch(packageId) {
      case 'tokens_50': return 'from-blue-500 to-cyan-600';
      case 'tokens_150': return 'from-purple-500 to-pink-600';
      case 'tokens_350': return 'from-orange-500 to-red-600';
      case 'tokens_750': return 'from-yellow-500 to-orange-600';
      default: return 'from-blue-500 to-cyan-600';
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

  if (showTokenCheckout && selectedTokenPackage) {
    return (
      <div className="bg-zodiac-constellations bg-cover bg-center bg-fixed min-h-screen relative">
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        <div className="relative z-10 py-12">
          {/* Token checkout form - for now just show success message */}
          <div className="max-w-md mx-auto bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 border border-white border-opacity-20 shadow-xl">
            <div className="text-center">
              <div className="p-4 rounded-full bg-green-500 bg-opacity-20 inline-flex mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Token Purchase Processing</h2>
              <p className="text-gray-300 mb-6">Your token purchase is being processed. Tokens will be added to your account shortly.</p>
              <Button 
                onClick={handleTokenCheckoutSuccess}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
              >
                Continue
              </Button>
            </div>
          </div>
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

      {/* Token Balance Card */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 border border-white border-opacity-20 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 shadow-lg">
              <BoltIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Token Balance</h2>
              <p className="text-gray-300">Use tokens for AI-powered astrological analysis</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-yellow-400">
              {userTokens.balance.toLocaleString()}
            </div>
            <div className="text-sm text-gray-300">Available Tokens</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white bg-opacity-10 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ChartBarIcon className="h-5 w-5 text-blue-400" />
              <span className="text-white font-medium">Total Purchased</span>
            </div>
            <div className="text-lg text-yellow-300">
              {userTokens.totalPurchased.toLocaleString()}
            </div>
          </div>

          <div className="bg-white bg-opacity-10 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <SparklesIcon className="h-5 w-5 text-purple-400" />
              <span className="text-white font-medium">Total Used</span>
            </div>
            <div className="text-lg text-yellow-300">
              {userTokens.totalUsed.toLocaleString()}
            </div>
          </div>

          <div className="bg-white bg-opacity-10 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CalendarIcon className="h-5 w-5 text-green-400" />
              <span className="text-white font-medium">Last Updated</span>
            </div>
            <div className="text-lg text-yellow-300">
              {new Date(userTokens.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-300 mb-4">Need more tokens? Purchase individual token packages below</p>
        </div>
      </div>

      {/* Token Packages */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 border border-white border-opacity-20 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Purchase Tokens</h2>
          <p className="text-gray-300">Buy tokens individually for AI astrological analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {tokenPackages.map((tokenPackage) => {
            const Icon = getTokenPackageIcon(tokenPackage.id);
            const color = getTokenPackageColor(tokenPackage.id);
            const totalTokens = tokenPackage.tokens + (tokenPackage.bonus || 0);
            const pricePerToken = tokenPackage.price / tokenPackage.tokens;

            return (
              <div
                key={tokenPackage.id}
                className={`relative bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 hover:scale-105 ${
                  tokenPackage.popular 
                    ? 'border-yellow-300 bg-opacity-15' 
                    : 'border-white border-opacity-20 hover:border-opacity-40'
                }`}
              >
                {tokenPackage.popular && (
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
                  
                  <h3 className="text-xl font-bold text-white mb-2">{tokenPackage.name}</h3>
                  <p className="text-gray-300 mb-4 text-sm">{tokenPackage.description}</p>
                  
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-white">
                      {selectedCurrency} {convertPrice(tokenPackage.price, tokenPackage.currency).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-300">
                      {selectedCurrency} {(convertPrice(pricePerToken, tokenPackage.currency)).toFixed(3)} per token
                    </div>
                    {tokenPackage.savings && (
                      <div className="text-xs text-green-400 mt-1">
                        {tokenPackage.savings}
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="text-yellow-300 font-bold text-2xl">
                      {tokenPackage.tokens.toLocaleString()}
                    </div>
                    {tokenPackage.bonus ? (
                      <div>
                        <div className="text-green-400 text-sm">+ {tokenPackage.bonus} bonus</div>
                        <div className="text-xs text-gray-400">= {totalTokens} total tokens</div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">Total tokens</div>
                    )}
                  </div>
                </div>

                <Button
                  className={`w-full ${
                    tokenPackage.popular 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400' 
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                  onClick={() => handleTokenPurchase(tokenPackage.id)}
                  disabled={paymentInProgress}
                >
                  {paymentInProgress ? (
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Purchase Tokens
                </Button>
              </div>
            );
          })}
        </div>
      </div>

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
                    payment.status === 'completed' 
                      ? 'bg-green-500 bg-opacity-20 text-green-400'
                      : payment.status === 'failed'
                      ? 'bg-red-500 bg-opacity-20 text-red-400'
                      : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                  }`}>
                    {payment.status === 'completed' ? (
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
                    payment.status === 'completed' 
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
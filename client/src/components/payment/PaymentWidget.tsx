import React, { useState } from 'react';
import { usePayment } from '@/store/paymentStore';
import Button from '@/components/ui/Button';
import { 
  CreditCardIcon,
  ChevronRightIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface PaymentWidgetProps {
  planId: string;
  billingPeriod?: 'monthly' | 'yearly';
  onInitiatePayment: (planId: string, billingPeriod: 'monthly' | 'yearly') => void;
  className?: string;
}

const PaymentWidget: React.FC<PaymentWidgetProps> = ({
  planId,
  billingPeriod = 'monthly',
  onInitiatePayment,
  className = ''
}) => {
  const { 
    subscriptionPlans, 
    selectedCurrency, 
    convertPrice,
    currentSubscription 
  } = usePayment();

  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>(billingPeriod);

  const plan = subscriptionPlans.find(p => p.id === planId);
  
  if (!plan || plan.id === 'free') {
    return null;
  }

  const monthlyPrice = convertPrice(plan.price.monthly, plan.currency, selectedCurrency);
  const yearlyPrice = convertPrice(plan.price.yearly, plan.currency, selectedCurrency);
  const yearlyMonthlyPrice = yearlyPrice / 12;
  const savings = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100);

  const currentPrice = selectedBilling === 'monthly' ? monthlyPrice : yearlyPrice;
  const isCurrentPlan = currentSubscription?.planId === planId;

  const handlePayment = () => {
    onInitiatePayment(planId, selectedBilling);
  };

  return (
    <div className={`bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-lg ${className}`}>
      <div className="p-6">
        {/* Plan Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
            <p className="text-sm text-gray-300">{plan.description}</p>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="mb-6">
          <div className="bg-white bg-opacity-10 rounded-xl p-1 mb-4">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setSelectedBilling('monthly')}
                className={`py-2 px-3 text-sm font-medium rounded-lg transition-all ${
                  selectedBilling === 'monthly'
                    ? 'bg-yellow-400 text-black'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedBilling('yearly')}
                className={`py-2 px-3 text-sm font-medium rounded-lg transition-all relative ${
                  selectedBilling === 'yearly'
                    ? 'bg-yellow-400 text-black'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Yearly
                {savings > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-400 text-black text-xs px-1.5 py-0.5 rounded-full">
                    -{savings}%
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Price Display */}
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {selectedCurrency} {currentPrice.toFixed(2)}
            </div>
            <div className="text-sm text-gray-300">
              per {selectedBilling === 'monthly' ? 'month' : 'year'}
            </div>
            {selectedBilling === 'yearly' && savings > 0 && (
              <div className="text-sm text-green-400 mt-1">
                That's {selectedCurrency} {yearlyMonthlyPrice.toFixed(2)}/month
              </div>
            )}
          </div>
        </div>

        {/* Features Highlight */}
        <div className="mb-6">
          <div className="bg-white bg-opacity-10 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <span className="text-white font-medium">
                {plan.maxGenerations === -1 ? 'Unlimited' : plan.maxGenerations} Generations
              </span>
            </div>
            {plan.features.slice(0, 2).map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 mb-1">
                <CheckCircleIcon className="h-4 w-4 text-green-400" />
                <span className="text-gray-200 text-sm">{feature}</span>
              </div>
            ))}
            {plan.features.length > 2 && (
              <div className="text-xs text-gray-400 mt-2">
                +{plan.features.length - 2} more features
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {isCurrentPlan ? (
          <div className="bg-green-400 bg-opacity-20 border border-green-400 border-opacity-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <span className="text-green-200 font-medium">Current Plan</span>
            </div>
          </div>
        ) : (
          <Button
            onClick={handlePayment}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400 shadow-lg"
            size="lg"
          >
            <div className="flex items-center justify-center space-x-2">
              <CreditCardIcon className="h-5 w-5" />
              <span>Subscribe Now</span>
              <ChevronRightIcon className="h-4 w-4" />
            </div>
          </Button>
        )}

        {/* Security Note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Secure payment powered by SPC Gateway
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentWidget;
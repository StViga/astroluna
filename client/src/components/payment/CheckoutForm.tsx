import React, { useState } from 'react';
import { usePayment } from '@/store/paymentStore';
import Button from '@/components/ui/Button';
import { 
  CreditCardIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface CheckoutFormProps {
  planId: string;
  billingPeriod: 'monthly' | 'yearly';
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  planId,
  billingPeriod,
  onSuccess,
  onCancel
}) => {
  const { 
    subscriptionPlans, 
    selectedCurrency, 
    convertPrice, 
    processPayment, 
    paymentInProgress, 
    paymentError 
  } = usePayment();

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    email: '',
    phone: ''
  });

  const [useTestCard, setUseTestCard] = useState(false);

  const plan = subscriptionPlans.find(p => p.id === planId);
  if (!plan || plan.id === 'free') {
    return null;
  }

  const price = convertPrice(plan.price[billingPeriod], plan.currency);
  const currency = selectedCurrency;

  // Test card data
  const testCardData = {
    cardNumber: '4111 1111 1111 1111',
    expiryMonth: '12',
    expiryYear: '25',
    cvv: '123',
    cardholderName: 'Test User',
    email: 'test@example.com',
    phone: '+380501234567'
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'cardNumber') {
      // Format card number with spaces
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    }
    
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestCardToggle = () => {
    if (!useTestCard) {
      setPaymentData(testCardData);
    } else {
      setPaymentData({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
        email: '',
        phone: ''
      });
    }
    setUseTestCard(!useTestCard);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const paymentRequest = {
        amount: price * 100, // Convert to cents
        currency: currency.toLowerCase() as 'usd' | 'eur' | 'uah',
        description: `AstroLuna ${plan.name} - ${billingPeriod}`,
        customerData: {
          name: paymentData.cardholderName,
          email: paymentData.email,
          phone: paymentData.phone
        },
        cardData: {
          number: paymentData.cardNumber.replace(/\s/g, ''),
          expiryMonth: paymentData.expiryMonth,
          expiryYear: paymentData.expiryYear,
          cvv: paymentData.cvv
        },
        planId,
        billingPeriod
      };

      const result = await processPayment('mock_payment_id', paymentRequest);
      
      if (result) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const isFormValid = () => {
    return paymentData.cardNumber && 
           paymentData.expiryMonth && 
           paymentData.expiryYear && 
           paymentData.cvv && 
           paymentData.cardholderName && 
           paymentData.email;
  };

  return (
    <div className="max-w-2xl mx-auto bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 border border-white border-opacity-20 shadow-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 mb-4 shadow-lg">
          <CreditCardIcon className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Complete Your Purchase</h2>
        <p className="text-gray-200">Subscribe to {plan.name} plan</p>
      </div>

      {/* Order Summary */}
      <div className="bg-white bg-opacity-10 rounded-2xl p-6 mb-8 border border-white border-opacity-20">
        <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-200">{plan.name} - {billingPeriod}</span>
            <span className="text-white font-medium">{currency} {price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-200">Generations included</span>
            <span className="text-white">{plan.maxGenerations === -1 ? 'Unlimited' : plan.maxGenerations}</span>
          </div>
          <div className="border-t border-white border-opacity-20 pt-3">
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-white">Total</span>
              <span className="text-yellow-400">{currency} {price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Card Toggle */}
      <div className="mb-6">
        <div className="bg-yellow-400 bg-opacity-20 border border-yellow-400 border-opacity-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-200 font-medium">Test Mode</span>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useTestCard}
                onChange={handleTestCardToggle}
                className="rounded border-yellow-400 bg-transparent text-yellow-400 focus:ring-yellow-400"
              />
              <span className="text-yellow-200 text-sm">Use test card</span>
            </label>
          </div>
          {useTestCard && (
            <div className="mt-3 text-xs text-yellow-200">
              Test card: 4111 1111 1111 1111 | Exp: 12/25 | CVV: 123 | 3DS: 111
            </div>
          )}
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Information */}
        <div>
          <h4 className="text-lg font-medium text-white mb-4">Card Information</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Card Number
              </label>
              <input
                type="text"
                value={paymentData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Month
                </label>
                <input
                  type="text"
                  value={paymentData.expiryMonth}
                  onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                  placeholder="12"
                  maxLength={2}
                  className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Year
                </label>
                <input
                  type="text"
                  value={paymentData.expiryYear}
                  onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                  placeholder="25"
                  maxLength={2}
                  className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  value={paymentData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  placeholder="123"
                  maxLength={3}
                  className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div>
          <h4 className="text-lg font-medium text-white mb-4">Billing Information</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                value={paymentData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email
              </label>
              <input
                type="email"
                value={paymentData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={paymentData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+380501234567"
                className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-green-400 bg-opacity-20 border border-green-400 border-opacity-50 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="h-5 w-5 text-green-400" />
            <span className="text-green-200 text-sm font-medium">
              Your payment is secured with SSL encryption
            </span>
          </div>
        </div>

        {/* Error Display */}
        {paymentError && (
          <div className="bg-red-400 bg-opacity-20 border border-red-400 border-opacity-50 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <span className="text-red-200 text-sm">{paymentError}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-6">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1 border-white text-white hover:bg-white hover:text-gray-800"
            onClick={onCancel || (() => {})}
            disabled={paymentInProgress}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400 disabled:opacity-50"
            disabled={!isFormValid() || paymentInProgress}
          >
            {paymentInProgress ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5" />
                <span>Complete Purchase</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import {
  CheckCircleIcon,
  HomeIcon,
  CreditCardIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const paymentType = searchParams.get('type') || 'subscription';
  const amount = searchParams.get('amount') || '0';
  const currency = searchParams.get('currency') || 'USD';
  
  useEffect(() => {
    // Mark payment as successful in parent window if opened in popup
    if (window.opener) {
      window.opener.postMessage({ 
        type: 'PAYMENT_SUCCESS',
        paymentType,
        amount: parseInt(amount),
        currency
      }, '*');
      
      // Close popup after delay
      setTimeout(() => {
        window.close();
      }, 3000);
    }
  }, [paymentType, amount, currency]);

  const getSuccessMessage = () => {
    if (paymentType === 'token') {
      return {
        title: 'Tokens Purchased Successfully!',
        description: 'Your tokens have been added to your account and are ready to use.',
        icon: '🪙'
      };
    }
    
    return {
      title: 'Subscription Activated!',
      description: 'Your subscription is now active and you can enjoy all premium features.',
      icon: '⭐'
    };
  };

  const successInfo = getSuccessMessage();

  return (
    <div className="bg-cosmic-nebula-1 bg-cover bg-center bg-fixed min-h-screen relative">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white bg-opacity-10 backdrop-blur-md rounded-3xl shadow-xl border border-white border-opacity-20 overflow-hidden">
          
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6 text-center">
            <CheckCircleIcon className="h-16 w-16 text-white mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Payment Successful!
            </h1>
            <p className="text-green-100">
              Transaction completed securely
            </p>
          </div>

          {/* Payment Details */}
          <div className="px-8 py-6 text-center">
            <div className="text-4xl mb-4">{successInfo.icon}</div>
            
            <h2 className="text-xl font-bold text-white mb-2">
              {successInfo.title}
            </h2>
            
            <p className="text-gray-300 mb-6">
              {successInfo.description}
            </p>

            {/* Transaction Info */}
            <div className="bg-white bg-opacity-10 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center text-white">
                <span>Amount Paid:</span>
                <span className="font-bold text-yellow-300">
                  {currency} {(parseInt(amount) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-white mt-2">
                <span>Payment Type:</span>
                <span className="capitalize text-yellow-300">
                  {paymentType === 'token' ? 'Token Purchase' : 'Subscription'}
                </span>
              </div>
              <div className="flex justify-between items-center text-white mt-2">
                <span>Status:</span>
                <span className="text-green-400 font-medium">Completed</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link to="/dashboard">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
                  <HomeIcon className="h-5 w-5 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              
              <Link to="/dashboard/billing">
                <Button variant="outline" className="w-full border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-10">
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  View Billing
                </Button>
              </Link>
            </div>

            {/* Auto-close notice for popups */}
            {window.opener && (
              <div className="mt-6 text-sm text-gray-400">
                This window will close automatically in a few seconds...
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="bg-white bg-opacity-5 px-8 py-4 text-center">
            <p className="text-xs text-gray-400">
              🔒 Payment processed securely by SPC Gateway
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
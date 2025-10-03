import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { 
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  CalendarIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

interface PaymentSuccessProps {
  subscription: {
    id: string;
    planId: string;
    planName: string;
    amount: number;
    currency: string;
    billingPeriod: 'monthly' | 'yearly';
    nextBillingDate: string;
    maxGenerations: number;
  };
  onClose?: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ subscription, onClose }) => {
  return (
    <div className="bg-zodiac-constellations bg-cover bg-center bg-fixed min-h-screen relative">
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      
      <div className="relative z-10 py-12">
        <div className="max-w-2xl mx-auto bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 border border-white border-opacity-20 shadow-2xl">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex p-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 mb-6 shadow-lg">
              <CheckCircleIcon className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-lg text-gray-200">
              Welcome to your cosmic journey with AstroLuna
            </p>
          </div>

          {/* Subscription Details */}
          <div className="bg-white bg-opacity-10 rounded-2xl p-6 mb-8 border border-white border-opacity-20">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <SparklesIcon className="h-6 w-6 mr-2 text-yellow-400" />
              Subscription Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-1">Plan</label>
                  <div className="text-lg font-semibold text-white">
                    {subscription.planName}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-300 block mb-1">Billing</label>
                  <div className="text-lg font-semibold text-white">
                    {subscription.currency} {subscription.amount.toFixed(2)} / {subscription.billingPeriod.replace('ly', '')}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-1">Generations Included</label>
                  <div className="text-lg font-semibold text-yellow-400">
                    {subscription.maxGenerations === -1 ? 'Unlimited' : subscription.maxGenerations.toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-300 block mb-1">Next Billing Date</label>
                  <div className="text-lg font-semibold text-white flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-blue-400" />
                    {new Date(subscription.nextBillingDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 bg-opacity-20 rounded-2xl p-6 mb-8 border border-purple-400 border-opacity-30">
            <h3 className="text-xl font-semibold text-white mb-4">What's Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-3">
                  <SparklesIcon className="h-8 w-8 text-yellow-400 mx-auto" />
                </div>
                <h4 className="font-medium text-white mb-1">Generate Charts</h4>
                <p className="text-sm text-gray-300">Start creating personalized astrological insights</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-3">
                  <CreditCardIcon className="h-8 w-8 text-green-400 mx-auto" />
                </div>
                <h4 className="font-medium text-white mb-1">Manage Billing</h4>
                <p className="text-sm text-gray-300">View usage and manage your subscription</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-3">
                  <CheckCircleIcon className="h-8 w-8 text-blue-400 mx-auto" />
                </div>
                <h4 className="font-medium text-white mb-1">Explore Features</h4>
                <p className="text-sm text-gray-300">Discover all your new plan benefits</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/dashboard/generate" className="flex-1">
              <Button 
                size="lg"
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400 shadow-lg"
              >
                <div className="flex items-center justify-center space-x-2">
                  <SparklesIcon className="h-5 w-5" />
                  <span>Start Generating</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </div>
              </Button>
            </Link>
            
            <Link to="/dashboard/billing" className="flex-1">
              <Button 
                variant="outline"
                size="lg"
                className="w-full border-white text-white hover:bg-white hover:text-gray-800"
              >
                <div className="flex items-center justify-center space-x-2">
                  <CreditCardIcon className="h-5 w-5" />
                  <span>Manage Billing</span>
                </div>
              </Button>
            </Link>
          </div>

          {/* Close Button */}
          {onClose && (
            <div className="text-center mt-6">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-sm"
              >
                Close this message
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white border-opacity-20">
            <div className="text-center text-sm text-gray-400">
              <p>
                Questions? Contact our support team at{' '}
                <a href="mailto:support@astroluna.com" className="text-yellow-400 hover:text-yellow-300">
                  support@astroluna.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
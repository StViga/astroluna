import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import {
  CreditCardIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const MockPaymentWidget: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  
  // Extract payment parameters
  const amount = searchParams.get('amount') || '0';
  const currency = searchParams.get('currency') || 'USD';
  const description = searchParams.get('description') || 'Payment';
  const returnUrl = searchParams.get('return_url') || '/dashboard/billing';
  const orderId = searchParams.get('order_id') || '';
  
  const formattedAmount = (parseInt(amount) / 100).toFixed(2);
  
  const [cardData, setCardData] = useState({
    number: '4111 1111 1111 1111',
    expiry: '12/25',
    cvv: '123',
    name: 'Demo User'
  });

  useEffect(() => {
    // Auto-redirect after successful payment
    if (paymentStatus === 'success') {
      const timer = setTimeout(() => {
        toast.success('Payment completed successfully!');
        
        // Determine payment type from description
        const isTokenPurchase = description.toLowerCase().includes('token');
        const paymentType = isTokenPurchase ? 'token' : 'subscription';
        
        // Redirect to success page with payment info
        const successUrl = `${window.location.origin}${returnUrl}?type=${paymentType}&amount=${amount}&currency=${currency}&order_id=${orderId}`;
        
        if (window.opener) {
          // For popup windows, redirect parent and close popup
          window.opener.location.href = successUrl;
          window.close();
        } else {
          // For direct navigation
          window.location.href = successUrl;
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, returnUrl, amount, currency, description, orderId]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    
    // Simulate payment processing
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        setPaymentStatus('success');
        // Store payment success for parent window
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'PAYMENT_SUCCESS', 
            paymentId: `pay_${Date.now()}`,
            amount: parseInt(amount),
            currency,
            orderId
          }, '*');
        }
      } else {
        setPaymentStatus('failed');
        setIsProcessing(false);
        toast.error('Payment failed. Please try again.');
      }
    }, 3000);
  };

  const handleCancel = () => {
    if (window.opener) {
      window.opener.postMessage({ type: 'PAYMENT_CANCELLED' }, '*');
      window.close();
    } else {
      navigate(returnUrl);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">
              Your payment of {currency} {formattedAmount} has been processed successfully.
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-green-800">
              <div>Transaction ID: {orderId}</div>
              <div>Amount: {currency} {formattedAmount}</div>
              <div>Status: Completed</div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            Redirecting you back to the application...
          </p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600">
              We couldn't process your payment. Please try again or use a different payment method.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button onClick={() => setPaymentStatus('idle')} className="w-full">
              Try Again
            </Button>
            <Button variant="outline" onClick={handleCancel} className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center text-white">
            <ShieldCheckIcon className="h-6 w-6 mr-2" />
            <h2 className="text-xl font-bold">Secure Payment</h2>
          </div>
          <p className="text-blue-100 text-sm mt-1">SPC Payment Gateway - Sandbox Mode</p>
        </div>

        {/* Payment Details */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Amount:</span>
            <span className="text-xl font-bold text-gray-900">{currency} {formattedAmount}</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">{description}</div>
        </div>

        {/* Payment Form */}
        <div className="px-6 py-6">
          {isProcessing ? (
            <div className="text-center py-8">
              <ClockIcon className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Payment...</h3>
              <p className="text-gray-600">Please wait while we process your payment securely.</p>
              <div className="mt-4 bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  🔒 Your payment is being processed through our secure gateway
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <div className="relative">
                    <CreditCardIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={cardData.number}
                      onChange={(e) => setCardData(prev => ({ ...prev, number: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardData.expiry}
                      onChange={(e) => setCardData(prev => ({ ...prev, expiry: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cardData.cvv}
                      onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardData.name}
                    onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Test Card Info */}
              <div className="mt-6 bg-yellow-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">
                  🧪 Sandbox Mode - Test Cards
                </h4>
                <div className="text-xs text-yellow-700 space-y-1">
                  <div>Success: 4111 1111 1111 1111</div>
                  <div>Decline: 4000 0000 0000 0002</div>
                  <div>3DS: Any 3-digit code (e.g., 111)</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <Button 
                  onClick={handlePayment} 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  size="lg"
                >
                  Pay {currency} {formattedAmount}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  className="w-full"
                >
                  Cancel Payment
                </Button>
              </div>

              {/* Security Notice */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  🔒 Secured by 256-bit SSL encryption
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MockPaymentWidget;
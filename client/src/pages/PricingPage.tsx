import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { useAuth } from '@/store/authStore';
import { usePayment } from '@/store/paymentStore';
import {
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  CurrencyEuroIcon,
  GlobeEuropeAfricaIcon
} from '@heroicons/react/24/outline';

const PricingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { subscriptionPlans, selectedCurrency, setSelectedCurrency, convertPrice } = usePayment();
  const [isLoading, setIsLoading] = useState(true);

  // Currency options with icons
  const currencies = [
    { code: 'USD' as const, symbol: '$', name: 'US Dollar', icon: CurrencyDollarIcon },
    { code: 'EUR' as const, symbol: '€', name: 'Euro', icon: CurrencyEuroIcon },
    { code: 'UAH' as const, symbol: '₴', name: 'Ukrainian Hryvnia', icon: GlobeEuropeAfricaIcon }
  ];

  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Get pricing data from payment store
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
    
    const price = convertPrice(plan.price[billing], plan.currency, selectedCurrency);
    const currency = currencies.find(c => c.code === selectedCurrency);
    return `${currency?.symbol}${price.toFixed(2)}`;
  };

  const getPeriod = (billing: 'monthly' | 'yearly') => {
    return billing === 'monthly' ? '/month' : '/year';
  };

  const faqItems = [
    {
      question: 'What are credits and how do they work?',
      answer: 'Credits are used to generate astrological analyses. Each service requires a specific number of credits: natal charts (8 credits), compatibility reports (12 credits), and forecasts (6 credits).'
    },
    {
      question: 'Can I change my plan at any time?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and unused credits roll over to the next billing cycle.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, contact our support team for a full refund.'
    },
    {
      question: 'How accurate are the AI predictions?',
      answer: 'Our AI is trained on thousands of astrological patterns and continuously learns from user feedback. While astrology is interpretive, our accuracy rates are consistently high based on user satisfaction.'
    },
    {
      question: 'Is my personal data secure?',
      answer: 'Absolutely. We use bank-level encryption and never share your personal information. Your birth data and analyses are completely private and secure.'
    },
    {
      question: 'Can I use AstroLuna for commercial purposes?',
      answer: 'The Master plan includes commercial usage rights and API access. Please contact our sales team for enterprise solutions and bulk pricing.'
    }
  ];

  const testimonials = [
    {
      text: "AstroLuna's AI predictions have been incredibly accurate. The Explorer plan gives me everything I need for my personal practice.",
      author: "Sarah Chen",
      role: "Astrology Enthusiast",
      plan: "Explorer"
    },
    {
      text: "As a professional astrologer, the Master plan's unlimited charts and API access have transformed my business.",
      author: "Michael Rodriguez",
      role: "Professional Astrologer", 
      plan: "Master"
    },
    {
      text: "Started with the free plan and was so impressed that I upgraded immediately. Great value for money!",
      author: "Emma Thompson",
      role: "Beginner",
      plan: "Starter → Explorer"
    }
  ];

  return (
    <div className="bg-zodiac-constellations bg-cover bg-center bg-fixed min-h-screen relative">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      
      <div className="relative z-10">
        {/* Header Section */}
        <div className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl drop-shadow-lg">
                Choose Your <span className="text-yellow-300">Cosmic Journey</span>
              </h1>
              <p className="mt-6 text-xl leading-8 text-gray-200 max-w-3xl mx-auto drop-shadow-md">
                Select the perfect plan for your astrological needs. All plans include access to our 
                AI-powered insights and growing library of cosmic wisdom.
              </p>
              
              {/* Currency Selector */}
              <div className="mt-8 flex justify-center">
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-4 border border-white border-opacity-20">
                  <div className="flex items-center space-x-4">
                    <span className="text-white font-medium">Currency:</span>
                    <div className="flex space-x-2">
                      {currencies.map((currency) => {
                        const Icon = currency.icon;
                        return (
                          <button
                            key={currency.code}
                            onClick={() => setSelectedCurrency(currency.code)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                              selectedCurrency === currency.code
                                ? 'bg-yellow-400 text-black'
                                : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{currency.code}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {subscriptionPlans.map((plan) => {
                  const Icon = getPlanIcon(plan.id);
                  const color = getPlanColor(plan.id);
                  
                  return (
                    <div
                      key={plan.id}
                      className={`relative bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 border-2 shadow-2xl transition-all duration-300 hover:scale-105 ${
                        plan.popular 
                          ? 'border-yellow-300 bg-opacity-15' 
                          : 'border-white border-opacity-20 hover:border-opacity-40'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                            Most Popular
                          </div>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${color} mb-6 shadow-lg`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">{plan.name}</h3>
                        <p className="text-gray-200 mb-6 drop-shadow-sm">{plan.description}</p>
                        
                        {/* Pricing Toggles */}
                        <div className="mb-6">
                          <div className="bg-white bg-opacity-10 rounded-xl p-1 mb-4">
                            <div className="grid grid-cols-2 gap-1">
                              <button className="bg-yellow-400 text-black rounded-lg py-2 text-sm font-medium">
                                Monthly
                              </button>
                              <button className="text-gray-300 py-2 text-sm font-medium hover:text-white">
                                Yearly (Save 20%)
                              </button>
                            </div>
                          </div>
                          
                          <span className="text-4xl font-bold text-white drop-shadow-lg">
                            {formatPrice(plan, 'monthly')}
                          </span>
                          {plan.id !== 'free' && (
                            <span className="text-gray-200 ml-1 drop-shadow-sm">{getPeriod('monthly')}</span>
                          )}
                        </div>
                        
                        <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-8">
                          <div className="text-yellow-300 font-bold text-lg drop-shadow-md">
                            {plan.maxGenerations === -1 ? 'Unlimited' : plan.maxGenerations} Generations
                          </div>
                          <div className="text-gray-200 text-sm drop-shadow-sm">
                            {plan.maxGenerations === 10 ? 'One-time bonus' : 'Monthly allocation'}
                          </div>
                        </div>
                      </div>
                      
                      <ul className="space-y-4 mb-8">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center">
                            <CheckIcon className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                            <span className="text-white drop-shadow-sm">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                      
                      <Link to={isAuthenticated ? "/dashboard/billing" : "/register"}>
                        <Button 
                          className={`w-full ${
                            plan.popular 
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400' 
                              : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                          } transition-all duration-300 shadow-lg`}
                          size="lg"
                        >
                          {plan.id === 'free' ? 'Get Started Free' : 'Choose Plan'}
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">What Our Users Say</h2>
              <p className="mt-4 text-lg text-gray-200 drop-shadow-md">
                Join thousands of satisfied users who trust AstroLuna
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 shadow-xl">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-200 mb-6 italic drop-shadow-sm">"{testimonial.text}"</p>
                  <div>
                    <div className="font-bold text-white drop-shadow-md">{testimonial.author}</div>
                    <div className="text-sm text-gray-300 drop-shadow-sm">{testimonial.role}</div>
                    <div className="text-xs text-yellow-300 mt-1 drop-shadow-sm">Plan: {testimonial.plan}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">Frequently Asked Questions</h2>
              <p className="mt-4 text-lg text-gray-200 drop-shadow-md">
                Everything you need to know about AstroLuna pricing
              </p>
            </div>

            <div className="space-y-6">
              {faqItems.map((item, index) => (
                <div key={index} className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-3 drop-shadow-md">{item.question}</h3>
                  <p className="text-gray-200 drop-shadow-sm">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-24">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="bg-mystical-space bg-cover bg-center rounded-3xl p-12 relative overflow-hidden">
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-cosmic bg-opacity-80 rounded-3xl"></div>
              
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
                  Still Have Questions?
                </h2>
                <p className="text-xl text-gray-100 mb-8 drop-shadow-md">
                  Our support team is here to help you choose the perfect plan for your cosmic journey
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact">
                    <Button size="lg" className="bg-white bg-opacity-90 text-gray-800 hover:bg-opacity-100 shadow-xl">
                      Contact Support
                    </Button>
                  </Link>
                  {!isAuthenticated && (
                    <Link to="/register">
                      <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-800">
                        Start Free Trial
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
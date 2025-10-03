import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { useAuth } from '@/store/authStore';
import {
  SparklesIcon,
  ChartBarIcon,
  ClockIcon,
  BookOpenIcon,
  CpuChipIcon,
  StarIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const ServicesPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const mainServices = [
    {
      name: 'Natal Chart Analysis',
      description: 'Comprehensive birth chart analysis revealing your personality, strengths, challenges, and life path.',
      icon: SparklesIcon,
      features: [
        'Detailed planetary positions',
        'House interpretations',
        'Aspect analysis',
        'Life purpose insights'
      ],
      credits: 8,
      color: 'from-purple-500 to-indigo-600'
    },
    {
      name: 'Compatibility Reports',
      description: 'Discover relationship dynamics and compatibility with partners, friends, or business associates.',
      icon: ChartBarIcon,
      features: [
        'Synastry analysis',
        'Composite charts',
        'Love compatibility',
        'Friendship potential'
      ],
      credits: 12,
      color: 'from-pink-500 to-rose-600'
    },
    {
      name: 'Future Forecasts',
      description: 'AI-powered predictions for upcoming periods based on planetary transits and progressions.',
      icon: ClockIcon,
      features: [
        'Monthly predictions',
        'Yearly overviews',
        'Transit analysis',
        'Important dates'
      ],
      credits: 6,
      color: 'from-amber-500 to-orange-600'
    }
  ];

  const additionalServices = [
    {
      name: 'Personal Library',
      description: 'Store and organize all your astrological analyses',
      icon: BookOpenIcon
    },
    {
      name: 'AI Insights',
      description: 'Advanced AI interpretations and personalized guidance',
      icon: CpuChipIcon
    },
    {
      name: 'Premium Support',
      description: '24/7 customer support and consultation services',
      icon: StarIcon
    },
    {
      name: 'Community Access',
      description: 'Connect with fellow astrology enthusiasts',
      icon: UserGroupIcon
    },
    {
      name: 'Multi-Language',
      description: 'Available in multiple languages worldwide',
      icon: GlobeAltIcon
    },
    {
      name: 'Data Security',
      description: 'Bank-level security for your personal information',
      icon: ShieldCheckIcon
    }
  ];

  const processSteps = [
    {
      step: '01',
      title: 'Create Account',
      description: 'Sign up for free and get welcome credits to start your astrological journey.'
    },
    {
      step: '02',
      title: 'Choose Service',
      description: 'Select from our range of AI-powered astrological analysis services.'
    },
    {
      step: '03',
      title: 'Provide Details',
      description: 'Enter your birth information or relationship details for accurate analysis.'
    },
    {
      step: '04',
      title: 'Get Insights',
      description: 'Receive detailed, personalized astrological insights within minutes.'
    }
  ];

  return (
    <div className="bg-cosmic-stars bg-cover bg-center bg-fixed min-h-screen relative">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      
      <div className="relative z-10">
        {/* Header Section */}
        <div className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl drop-shadow-lg">
                Our <span className="text-yellow-300">Services</span>
              </h1>
              <p className="mt-6 text-xl leading-8 text-gray-200 max-w-3xl mx-auto drop-shadow-md">
                Unlock the secrets of the stars with our AI-powered astrological services. 
                Discover your true potential and navigate life's journey with cosmic wisdom.
              </p>
            </div>
          </div>
        </div>

        {/* Main Services */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">Core Services</h2>
              <p className="mt-4 text-lg text-gray-200 drop-shadow-md">
                Professional astrological analyses powered by artificial intelligence
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {mainServices.map((service) => (
                <div key={service.name} className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 shadow-2xl hover:bg-opacity-15 hover:scale-105 transition-all duration-300">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${service.color} mb-6`}>
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-md">{service.name}</h3>
                  <p className="text-gray-200 mb-6 drop-shadow-sm">{service.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center text-gray-200">
                        <span className="text-yellow-300 mr-3">✨</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <span className="text-2xl font-bold text-yellow-300">{service.credits}</span>
                      <span className="text-sm ml-1">credits</span>
                    </div>
                    <Link to={isAuthenticated ? "/dashboard/generate" : "/register"}>
                      <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-800">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">How It Works</h2>
              <p className="mt-4 text-lg text-gray-200 drop-shadow-md">
                Get started with your astrological journey in just four simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <div key={step.step} className="text-center">
                  <div className="bg-gradient-cosmic rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 drop-shadow-md">{step.title}</h3>
                  <p className="text-gray-200 drop-shadow-sm">{step.description}</p>
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full">
                      <div className="w-8 h-0.5 bg-gradient-to-r from-white to-transparent"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Services */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">Additional Features</h2>
              <p className="mt-4 text-lg text-gray-200 drop-shadow-md">
                Everything you need for a complete astrological experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {additionalServices.map((service) => (
                <div key={service.name} className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20 shadow-xl hover:bg-opacity-15 transition-all duration-300">
                  <service.icon className="h-8 w-8 text-yellow-300 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2 drop-shadow-md">{service.name}</h3>
                  <p className="text-gray-200 text-sm drop-shadow-sm">{service.description}</p>
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
                  Ready to Explore Your Cosmic Blueprint?
                </h2>
                <p className="text-xl text-gray-100 mb-8 drop-shadow-md">
                  Join thousands of users who have discovered their astrological potential with AstroLuna
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!isAuthenticated && (
                    <>
                      <Link to="/register">
                        <Button size="lg" className="bg-white bg-opacity-90 text-gray-800 hover:bg-opacity-100 shadow-xl">
                          Start Free Trial
                        </Button>
                      </Link>
                      <Link to="/pricing">
                        <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-800">
                          View Pricing
                        </Button>
                      </Link>
                    </>
                  )}
                  {isAuthenticated && (
                    <Link to="/dashboard">
                      <Button size="lg" className="bg-white bg-opacity-90 text-gray-800 hover:bg-opacity-100 shadow-xl">
                        Go to Dashboard
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

export default ServicesPage;
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { useAuth } from '@/store/authStore';
import {
  SparklesIcon,
  ChartBarIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      name: 'AI Astrology',
      description: 'Get personalized astrological predictions powered by advanced AI algorithms.',
      icon: CpuChipIcon,
    },
    {
      name: 'Natal Charts',
      description: 'Detailed analysis of your birth chart with precise interpretations of planetary positions.',
      icon: SparklesIcon,
    },
    {
      name: 'Compatibility Analysis',
      description: 'Discover compatibility with partners in love, friendship, and business relationships.',
      icon: ChartBarIcon,
    },
    {
      name: 'Content Library',
      description: 'Save and organize all your astrological analyses in your personal library.',
      icon: BookOpenIcon,
    },
    {
      name: 'Data Security',
      description: 'Your personal data is protected with modern encryption methods.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Multi-language',
      description: 'Support for multiple languages for enhanced user experience.',
      icon: GlobeAltIcon,
    },
  ];

  const testimonials = [
    {
      content: 'AstroLuna provides incredibly accurate predictions! The AI analysis exceeded all my expectations.',
      author: 'Anna K.',
      role: 'User',
    },
    {
      content: 'The best astrology platform I\'ve ever used. The interface is simple and the results are profound.',
      author: 'Maria S.',
      role: 'Astrologer',
    },
    {
      content: 'Compatibility analysis helped me understand my relationships better. Highly recommended!',
      author: 'John P.',
      role: 'User',
    },
  ];

  return (
    <div className="bg-cosmic-nebula-1 bg-cover bg-center bg-fixed min-h-screen relative">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center">
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl drop-shadow-lg">
                <span className="text-yellow-300">🌟 AstroLuna</span>
              </h1>
              <p className="mt-6 text-xl leading-8 text-gray-200 max-w-3xl mx-auto drop-shadow-md">
                Artificial Intelligence meets ancient stellar wisdom. 
                Get personalized astrological insights, natal charts, and predictions.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button size="lg" className="bg-white bg-opacity-90 text-gray-800 hover:bg-opacity-100 shadow-xl">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <Button size="lg" className="bg-gradient-cosmic hover:shadow-xl shadow-lg">
                        Start Free
                      </Button>
                    </Link>
                    <Link to="/services">
                      <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-800 transition-all">
                        Learn More
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl drop-shadow-lg">
                Platform Features
              </h2>
              <p className="mt-4 text-xl text-gray-200 drop-shadow-md">
                Everything you need for deep astrological analysis
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white border-opacity-30 hover:bg-opacity-95 hover:scale-105 transition-all duration-300">
                  <div>
                    <feature.icon className="h-10 w-10 text-primary-600" />
                  </div>
                  <div className="mt-6">
                    <h3 className="text-xl font-bold text-gray-900">{feature.name}</h3>
                    <p className="mt-3 text-gray-700">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl drop-shadow-lg">
                Try It Right Now
              </h2>
              <p className="mt-4 text-xl text-gray-200 drop-shadow-md">
                Create a free natal chart in just a few minutes
              </p>
            </div>

            <div className="bg-mystical-space bg-cover bg-center rounded-3xl p-12 text-white text-center shadow-2xl relative overflow-hidden">
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-cosmic bg-opacity-80 rounded-3xl"></div>
              
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-6 drop-shadow-lg">🌟 Free Natal Chart</h3>
                <p className="text-xl opacity-90 mb-8 drop-shadow-md">
                  Enter your birth date, time, and location to get a basic personality analysis
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-10">
                  <input
                    type="date"
                    placeholder="Birth Date"
                    className="px-6 py-4 rounded-xl text-gray-900 border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 shadow-lg"
                  />
                  <input
                    type="time"
                    placeholder="Birth Time"
                    className="px-6 py-4 rounded-xl text-gray-900 border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 shadow-lg"
                  />
                  <input
                    type="text"
                    placeholder="Birth Location"
                    className="px-6 py-4 rounded-xl text-gray-900 border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 shadow-lg"
                  />
                </div>

                <Button variant="secondary" size="lg" className="bg-white bg-opacity-90 text-gray-800 hover:bg-opacity-100 shadow-xl">
                  Create Natal Chart
                </Button>
                
                <p className="text-sm opacity-75 mt-6 drop-shadow-sm">
                  * Registration required for full analysis
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl drop-shadow-lg">
                User Reviews
              </h2>
              <p className="mt-4 text-xl text-gray-200 drop-shadow-md">
                See what our users are saying
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white border-opacity-30 hover:bg-opacity-95 transition-all duration-300">
                  <div className="flex mb-6">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 text-lg">{testimonial.content}</p>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl drop-shadow-lg">
              Ready to start your astrological journey?
            </h2>
            <p className="mt-6 text-xl text-gray-200 drop-shadow-md">
              Join thousands of users who have already discovered their potential
            </p>
            <div className="mt-10 flex justify-center gap-6">
              {!isAuthenticated && (
                <>
                  <Link to="/register">
                    <Button size="lg" className="bg-gradient-cosmic hover:shadow-xl shadow-lg">
                      Create Account
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-800 transition-all">
                      View Pricing
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
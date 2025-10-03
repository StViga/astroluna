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
  GlobeAltIcon,
  MoonIcon,
  RectangleStackIcon,
  StarIcon,
  ArrowRightIcon,
  PlayIcon,
  ChevronDownIcon
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
                    <button
                      onClick={() => {
                        const servicesSection = document.getElementById('services-section');
                        servicesSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 text-lg font-medium text-white border-2 border-white rounded-xl hover:bg-white hover:text-gray-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent shadow-lg"
                    >
                      Learn More
                      <ChevronDownIcon className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Services Section */}
        <div id="services-section" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-bold tracking-tight text-white sm:text-6xl drop-shadow-lg">
                Three Unique AI Services
              </h2>
              <p className="mt-6 text-xl text-gray-200 drop-shadow-md max-w-3xl mx-auto">
                Discover your lunar forecast, card readings, and zodiac characteristics with our AI-powered astrological services
              </p>
            </div>

            {/* Service Cards */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-16">
              {/* AstroScope Card */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 border border-white border-opacity-20 shadow-2xl hover:bg-opacity-15 hover:scale-105 transition-all duration-300">
                <div className="text-center">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 mb-6 shadow-lg">
                    <MoonIcon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-md">AstroScope</h3>
                  <p className="text-gray-200 mb-6 drop-shadow-sm">
                    Personal monthly horoscope with key events and favorable dates
                  </p>
                  
                  <div className="bg-white bg-opacity-10 rounded-xl p-4 mb-6">
                    <h4 className="text-white font-semibold mb-3">Key Features:</h4>
                    <ul className="space-y-2 text-gray-200 text-sm">
                      <li>• Personalization by birth date</li>
                      <li>• Forecasts for love, career, health</li>
                      <li>• Monthly favorable dates calendar</li>
                    </ul>
                  </div>
                  
                  <Link
                    to="/services/astroscope"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-400 hover:to-indigo-500 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent"
                  >
                    Go
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* TarotPath Card */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 border border-white border-opacity-20 shadow-2xl hover:bg-opacity-15 hover:scale-105 transition-all duration-300 relative">
                {/* Most Popular Badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 mb-6 shadow-lg">
                    <RectangleStackIcon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-md">TarotPath</h3>
                  <p className="text-gray-200 mb-6 drop-shadow-sm">
                    Discover your lunar path through AI-created Tarot card readings
                  </p>
                  
                  <div className="bg-white bg-opacity-10 rounded-xl p-4 mb-6">
                    <h4 className="text-white font-semibold mb-3">Key Features:</h4>
                    <ul className="space-y-2 text-gray-200 text-sm">
                      <li>• Interactive virtual deck</li>
                      <li>• Monthly forecast in 5 positions</li>
                      <li>• AI-powered interpretations</li>
                    </ul>
                  </div>
                  
                  <Link
                    to="/services/tarotpath"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-xl hover:from-purple-400 hover:to-pink-500 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent"
                  >
                    Go
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* ZodiacTome Card */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 border border-white border-opacity-20 shadow-2xl hover:bg-opacity-15 hover:scale-105 transition-all duration-300">
                <div className="text-center">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-600 mb-6 shadow-lg">
                    <StarIcon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-md">ZodiacTome</h3>
                  <p className="text-gray-200 mb-6 drop-shadow-sm">
                    Detailed knowledge base of zodiac signs, their characteristics and compatibility
                  </p>
                  
                  <div className="bg-white bg-opacity-10 rounded-xl p-4 mb-6">
                    <h4 className="text-white font-semibent mb-3">Key Features:</h4>
                    <ul className="space-y-2 text-gray-200 text-sm">
                      <li>• AI Insights for each sign</li>
                      <li>• Interactive compatibility</li>
                      <li>• Comprehensive knowledge base</li>
                    </ul>
                  </div>
                  
                  <Link
                    to="/services/zodiactome"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-medium rounded-xl hover:from-yellow-400 hover:to-orange-500 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-transparent"
                  >
                    Go
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* CTA Block */}
            <div className="bg-mystical-space bg-cover bg-center rounded-3xl p-12 text-white text-center shadow-2xl relative overflow-hidden mb-16">
              <div className="absolute inset-0 bg-gradient-cosmic bg-opacity-80 rounded-3xl"></div>
              
              <div className="relative z-10">
                <h3 className="text-4xl font-bold mb-6 drop-shadow-lg">
                  Try Now and Discover What Awaits You This Week
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
                  <Link
                    to="/services/astroscope#form"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-400 hover:to-indigo-500 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent"
                  >
                    <MoonIcon className="h-5 w-5" />
                    Create Horoscope
                  </Link>
                  
                  <Link
                    to="/services/tarotpath#form"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-xl hover:from-purple-400 hover:to-pink-500 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent"
                  >
                    <RectangleStackIcon className="h-5 w-5" />
                    Tarot Reading
                  </Link>
                  
                  <Link
                    to="/services/zodiactome#circle"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-medium rounded-xl hover:from-yellow-400 hover:to-orange-500 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-transparent"
                  >
                    <StarIcon className="h-5 w-5" />
                    Open ZodiacTome
                  </Link>
                </div>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-white mb-16 drop-shadow-lg">
                How It Works
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="group cursor-pointer" onClick={() => {
                  const section = document.getElementById('services-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 hover:bg-opacity-20 transition-all duration-300">
                    <div className="text-4xl mb-4">🤖</div>
                    <h4 className="text-lg font-semibold text-white mb-2">AI Analyzes Your Data</h4>
                    <p className="text-gray-300 text-sm">Our AI processes your birth information and astrological patterns</p>
                  </div>
                </div>
                
                <div className="group cursor-pointer" onClick={() => {
                  const section = document.getElementById('services-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 hover:bg-opacity-20 transition-all duration-300">
                    <div className="text-4xl mb-4">🔮</div>
                    <h4 className="text-lg font-semibold text-white mb-2">Forms Forecast & Interpretation</h4>
                    <p className="text-gray-300 text-sm">Generate personalized predictions and detailed interpretations</p>
                  </div>
                </div>
                
                <div className="group cursor-pointer" onClick={() => {
                  const section = document.getElementById('dashboard');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                  else window.location.href = '/dashboard/library';
                }}>
                  <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 hover:bg-opacity-20 transition-all duration-300">
                    <div className="text-4xl mb-4">💾</div>
                    <h4 className="text-lg font-semibold text-white mb-2">Save & Download Results</h4>
                    <p className="text-gray-300 text-sm">Keep your readings in your personal library and download PDFs</p>
                  </div>
                </div>
                
                <div className="group cursor-pointer" onClick={() => {
                  const section = document.getElementById('services-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 hover:bg-opacity-20 transition-all duration-300">
                    <div className="text-4xl mb-4">✨</div>
                    <h4 className="text-lg font-semibold text-white mb-2">Simple & Personalized</h4>
                    <p className="text-gray-300 text-sm">Easy to use interface with personalized insights just for you</p>
                  </div>
                </div>
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
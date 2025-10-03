import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { useAuth } from '@/store/authStore';
import { usePayment } from '@/store/paymentStore';
import {
  MoonIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  SparklesIcon,
  ArrowDownIcon,
  HeartIcon,
  BriefcaseIcon,
  UserIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

interface QuickFormData {
  zodiacSign: string;
}

interface PersonalizedFormData {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
}

interface HoroscopeResult {
  type: 'quick' | 'personalized';
  love: string;
  career: string;
  health: string;
  personal: string;
  keyDates: Array<{ date: string; description: string }>;
  generatedAt: string;
}

const AstroScopePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { currentSubscription } = usePayment();
  
  const [mode, setMode] = useState<'quick' | 'personalized'>('quick');
  const [quickForm, setQuickForm] = useState<QuickFormData>({ zodiacSign: '' });
  const [personalizedForm, setPersonalizedForm] = useState<PersonalizedFormData>({
    birthDate: '',
    birthTime: '',
    birthLocation: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<HoroscopeResult | null>(null);
  const [showInsufficientCredits, setShowInsufficientCredits] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requiredCredits = 15;
  const availableCredits = currentSubscription?.maxGenerations === -1 
    ? Infinity 
    : Math.max(0, (currentSubscription?.maxGenerations || 0) - (currentSubscription?.generationsUsed || 0));

  const zodiacSigns = [
    { name: 'Aries', dates: 'Mar 21 - Apr 19', icon: '♈' },
    { name: 'Taurus', dates: 'Apr 20 - May 20', icon: '♉' },
    { name: 'Gemini', dates: 'May 21 - Jun 20', icon: '♊' },
    { name: 'Cancer', dates: 'Jun 21 - Jul 22', icon: '♋' },
    { name: 'Leo', dates: 'Jul 23 - Aug 22', icon: '♌' },
    { name: 'Virgo', dates: 'Aug 23 - Sep 22', icon: '♍' },
    { name: 'Libra', dates: 'Sep 23 - Oct 22', icon: '♎' },
    { name: 'Scorpio', dates: 'Oct 23 - Nov 21', icon: '♏' },
    { name: 'Sagittarius', dates: 'Nov 22 - Dec 21', icon: '♐' },
    { name: 'Capricorn', dates: 'Dec 22 - Jan 19', icon: '♑' },
    { name: 'Aquarius', dates: 'Jan 20 - Feb 18', icon: '♒' },
    { name: 'Pisces', dates: 'Feb 19 - Mar 20', icon: '♓' }
  ];

  const canGenerate = () => {
    if (mode === 'quick') {
      return quickForm.zodiacSign !== '';
    } else {
      return personalizedForm.birthDate !== '';
    }
  };

  const hasEnoughCredits = () => {
    return availableCredits >= requiredCredits;
  };

  const generateHoroscope = async () => {
    if (!canGenerate()) return;

    if (!hasEnoughCredits()) {
      setShowInsufficientCredits(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock result generation
      const mockResult: HoroscopeResult = {
        type: mode,
        love: "Venus influences suggest new romantic opportunities this month. For partnered individuals, deeper emotional connections await. Trust your intuition in matters of the heart.",
        career: "Professional advancement is highlighted mid-month. A project you've been working on gains recognition. Financial stability improves through careful planning.",
        health: "Energy levels peak around the full moon. Focus on maintaining balance between activity and rest. Pay attention to your digestive system this month.",
        personal: "This month brings clarity to long-standing questions. Personal growth accelerates through introspection. Creative pursuits offer unexpected insights.",
        keyDates: [
          { date: "September 12", description: "Day of new opportunities" },
          { date: "September 18", description: "Favorable for important decisions" },
          { date: "September 25", description: "Excellent for relationships" },
          { date: "September 30", description: "Financial breakthrough possible" }
        ],
        generatedAt: new Date().toISOString()
      };

      setResult(mockResult);
      
      // Would deduct credits here
      console.log(`Deducting ${requiredCredits} credits`);
      
    } catch (err) {
      setError('Horoscope generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const scrollToForm = () => {
    const formSection = document.getElementById('form');
    formSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const downloadPDF = () => {
    // Mock PDF download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `astroscope-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-zodiac-constellations bg-cover bg-center bg-fixed min-h-screen relative">
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex p-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 mb-8 shadow-lg">
                <MoonIcon className="h-12 w-12 text-white" />
              </div>
              
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl drop-shadow-lg">
                Your Personal Horoscope for This Month
              </h1>
              <p className="mt-6 text-xl leading-8 text-gray-200 max-w-3xl mx-auto drop-shadow-md">
                AI astrologer will reveal the main events and favorable dates for you
              </p>
              
              <div className="mt-10">
                <button
                  onClick={scrollToForm}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg font-medium rounded-xl hover:from-blue-400 hover:to-indigo-500 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent"
                >
                  Get Your Predictions Now
                  <ArrowDownIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div id="form" className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Mode Selector */}
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 border border-white border-opacity-20 shadow-xl mb-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">Choose Your Reading Type</h2>
                <div className="inline-flex bg-white bg-opacity-10 rounded-xl p-1">
                  <button
                    onClick={() => setMode('quick')}
                    className={`px-6 py-3 text-lg font-medium rounded-lg transition-all ${
                      mode === 'quick'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Quick Horoscope
                  </button>
                  <button
                    onClick={() => setMode('personalized')}
                    className={`px-6 py-3 text-lg font-medium rounded-lg transition-all ${
                      mode === 'personalized'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Personalized Horoscope
                  </button>
                </div>
              </div>

              {/* Quick Mode Form */}
              {mode === 'quick' && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6 text-center">
                    Select Your Zodiac Sign
                  </h3>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                    {zodiacSigns.map((sign) => (
                      <button
                        key={sign.name}
                        onClick={() => setQuickForm({ zodiacSign: sign.name })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          quickForm.zodiacSign === sign.name
                            ? 'border-blue-400 bg-blue-400 bg-opacity-20 text-white'
                            : 'border-white border-opacity-20 bg-white bg-opacity-10 text-gray-300 hover:border-opacity-40 hover:text-white'
                        }`}
                      >
                        <div className="text-2xl mb-2">{sign.icon}</div>
                        <div className="font-medium">{sign.name}</div>
                        <div className="text-xs opacity-75">{sign.dates}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Personalized Mode Form */}
              {mode === 'personalized' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      <CalendarDaysIcon className="h-4 w-4 inline mr-2" />
                      Birth Date *
                    </label>
                    <input
                      type="date"
                      value={personalizedForm.birthDate}
                      onChange={(e) => setPersonalizedForm({ ...personalizedForm, birthDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      <ClockIcon className="h-4 w-4 inline mr-2" />
                      Birth Time (Optional)
                    </label>
                    <input
                      type="time"
                      value={personalizedForm.birthTime}
                      onChange={(e) => setPersonalizedForm({ ...personalizedForm, birthTime: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      <MapPinIcon className="h-4 w-4 inline mr-2" />
                      Birth Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={personalizedForm.birthLocation}
                      onChange={(e) => setPersonalizedForm({ ...personalizedForm, birthLocation: e.target.value })}
                      placeholder="City, Country"
                      className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Credits Info */}
              <div className="bg-yellow-400 bg-opacity-20 border border-yellow-400 border-opacity-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <SparklesIcon className="h-5 w-5 text-yellow-400" />
                    <span className="text-yellow-200 font-medium">
                      One personal forecast = {requiredCredits} generations
                    </span>
                  </div>
                  <div className="text-yellow-200">
                    Available: {availableCredits === Infinity ? 'Unlimited' : availableCredits}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <Button
                  onClick={generateHoroscope}
                  disabled={!canGenerate() || isGenerating}
                  className="px-8 py-4 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 disabled:opacity-50"
                  size="lg"
                >
                  {isGenerating ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating Forecast...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <MoonIcon className="h-5 w-5" />
                      <span>Generate Forecast</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="py-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Here's What Awaits You This Month
                </h2>
                <p className="text-gray-300">
                  {result.type === 'personalized' ? 'Personalized forecast' : 'Based on your zodiac sign'}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Love & Relationships */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20">
                  <div className="flex items-center mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500 to-red-600 mr-4">
                      <HeartIcon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Love & Relationships</h3>
                  </div>
                  <p className="text-gray-200 leading-relaxed">{result.love}</p>
                </div>

                {/* Career & Finance */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20">
                  <div className="flex items-center mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 mr-4">
                      <BriefcaseIcon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Career & Finance</h3>
                  </div>
                  <p className="text-gray-200 leading-relaxed">{result.career}</p>
                </div>

                {/* Health & Energy */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20">
                  <div className="flex items-center mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 mr-4">
                      <SparklesIcon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Health & Energy</h3>
                  </div>
                  <p className="text-gray-200 leading-relaxed">{result.health}</p>
                </div>

                {/* Personal Development */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20">
                  <div className="flex items-center mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 mr-4">
                      <UserIcon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Personal Development</h3>
                  </div>
                  <p className="text-gray-200 leading-relaxed">{result.personal}</p>
                </div>
              </div>

              {/* Key Dates Calendar */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 mb-8">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  Calendar of Key Dates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.keyDates.map((dateInfo, index) => (
                    <div key={index} className="bg-white bg-opacity-10 rounded-xl p-4">
                      <div className="text-yellow-400 font-bold">{dateInfo.date}</div>
                      <div className="text-gray-200">{dateInfo.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Download Actions */}
              <div className="text-center">
                <Button
                  onClick={downloadPDF}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 mr-4"
                >
                  <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                  Download PDF
                </Button>
                {isAuthenticated && (
                  <span className="text-green-400 text-sm">
                    ✓ Saved to your library
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-3xl font-bold text-white mb-12">
              Your Personal AI Astrologer
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6">
                <div className="text-4xl mb-4">📊</div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Collect Your Data
                </h4>
                <p className="text-gray-300 text-sm">
                  Zodiac sign or natal chart information
                </p>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6">
                <div className="text-4xl mb-4">🔮</div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  AI Analyzes Transits
                </h4>
                <p className="text-gray-300 text-sm">
                  Process astrological movements and patterns
                </p>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6">
                <div className="text-4xl mb-4">📖</div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Create Clear Forecast
                </h4>
                <p className="text-gray-300 text-sm">
                  Generate understandable monthly predictions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h3>
            
            <div className="space-y-6">
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20">
                <h4 className="text-lg font-semibold text-white mb-2">
                  What's the difference between quick and personal forecast?
                </h4>
                <p className="text-gray-200">
                  Quick forecast is based on your zodiac sign, while personal forecast takes into account your birth date and optionally time and location for more accurate predictions.
                </p>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Is my birth date saved?
                </h4>
                <p className="text-gray-200">
                  Yes, with your explicit consent and only for generating forecasts. Your data is securely encrypted and never shared.
                </p>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20">
                <h4 className="text-lg font-semibold text-white mb-2">
                  How often can I get new forecasts?
                </h4>
                <p className="text-gray-200">
                  Not more than once per calendar day for the same month, but new requests are allowed when adding personal parameters.
                </p>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Can I create horoscopes for friends?
                </h4>
                <p className="text-gray-200">
                  Yes, with their explicit consent and by entering their data. Each forecast requires the same amount of generations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insufficient Credits Modal */}
      {showInsufficientCredits && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-95 backdrop-blur-md rounded-2xl p-8 max-w-md mx-4 border border-white border-opacity-20">
            <div className="text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Insufficient Generations
              </h3>
              <p className="text-gray-700 mb-6">
                You need {requiredCredits} generations to create a forecast. 
                {availableCredits > 0 && ` You have ${availableCredits} generations remaining.`}
              </p>
              <div className="flex space-x-4">
                <Button
                  onClick={() => setShowInsufficientCredits(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Link to="/dashboard/billing" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500">
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-500 bg-opacity-90 text-white px-6 py-3 rounded-xl shadow-lg">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-2 hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AstroScopePage;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { useAuth } from '@/store/authStore';
import { usePayment } from '@/store/paymentStore';
import {
  StarIcon,
  SparklesIcon,
  ArrowDownIcon,
  HeartIcon,
  BriefcaseIcon,
  UserIcon,
  SunIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface ZodiacSign {
  name: string;
  dates: string;
  element: string;
  planet: string;
  icon: string;
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  description: string;
}

interface CompatibilityResult {
  rating: 'excellent' | 'good' | 'moderate' | 'challenging';
  percentage: number;
  comment: string;
}

interface AIInsight {
  career: string;
  love: string;
  health: string;
  spirituality: string;
}

const ZodiacTomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { currentSubscription } = usePayment();
  
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [compatibilitySign1, setCompatibilitySign1] = useState<string>('');
  const [compatibilitySign2, setCompatibilitySign2] = useState<string>('');
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null);
  const [aiInsights, setAIInsights] = useState<AIInsight | null>(null);
  const [isGeneratingCompatibility, setIsGeneratingCompatibility] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [showInsufficientCredits, setShowInsufficientCredits] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requiredCredits = 10;
  const availableCredits = currentSubscription?.maxGenerations === -1 
    ? Infinity 
    : Math.max(0, (currentSubscription?.maxGenerations || 0) - (currentSubscription?.generationsUsed || 0));

  const zodiacSigns: ZodiacSign[] = [
    {
      name: 'Aries',
      dates: 'March 21 - April 19',
      element: 'Fire',
      planet: 'Mars',
      icon: '♈',
      traits: ['Energetic', 'Confident', 'Impulsive', 'Leadership'],
      strengths: ['Natural leader', 'Courageous', 'Enthusiastic', 'Independent'],
      weaknesses: ['Impatient', 'Aggressive', 'Selfish', 'Impulsive'],
      description: 'Aries are natural-born leaders who charge ahead with enthusiasm and confidence. Their fiery energy and pioneering spirit make them excellent at starting new projects and inspiring others.'
    },
    {
      name: 'Taurus',
      dates: 'April 20 - May 20',
      element: 'Earth',
      planet: 'Venus',
      icon: '♉',
      traits: ['Reliable', 'Patient', 'Stubborn', 'Practical'],
      strengths: ['Dependable', 'Patient', 'Loyal', 'Hardworking'],
      weaknesses: ['Stubborn', 'Possessive', 'Materialistic', 'Slow to change'],
      description: 'Taurus individuals are known for their reliability and practical approach to life. They value stability, comfort, and beauty, making them excellent at creating lasting foundations.'
    },
    {
      name: 'Gemini',
      dates: 'May 21 - June 20',
      element: 'Air',
      planet: 'Mercury',
      icon: '♊',
      traits: ['Curious', 'Adaptable', 'Witty', 'Inconsistent'],
      strengths: ['Intelligent', 'Communicative', 'Versatile', 'Charming'],
      weaknesses: ['Inconsistent', 'Superficial', 'Restless', 'Indecisive'],
      description: 'Geminis are the communicators of the zodiac, with quick wit and endless curiosity. Their adaptability and intelligence make them excellent at learning new things and connecting with others.'
    },
    {
      name: 'Cancer',
      dates: 'June 21 - July 22',
      element: 'Water',
      planet: 'Moon',
      icon: '♋',
      traits: ['Emotional', 'Nurturing', 'Protective', 'Intuitive'],
      strengths: ['Caring', 'Loyal', 'Intuitive', 'Protective'],
      weaknesses: ['Moody', 'Overly sensitive', 'Clingy', 'Pessimistic'],
      description: 'Cancers are the nurturers of the zodiac, deeply emotional and caring. Their strong intuition and protective nature make them excellent caregivers and loyal friends.'
    },
    {
      name: 'Leo',
      dates: 'July 23 - August 22',
      element: 'Fire',
      planet: 'Sun',
      icon: '♌',
      traits: ['Dramatic', 'Confident', 'Generous', 'Creative'],
      strengths: ['Charismatic', 'Creative', 'Generous', 'Optimistic'],
      weaknesses: ['Arrogant', 'Stubborn', 'Self-centered', 'Dramatic'],
      description: 'Leos shine brightly with their natural charisma and creativity. They are generous leaders who love to be in the spotlight and inspire others with their confidence and warmth.'
    },
    {
      name: 'Virgo',
      dates: 'August 23 - September 22',
      element: 'Earth',
      planet: 'Mercury',
      icon: '♍',
      traits: ['Analytical', 'Perfectionist', 'Practical', 'Detail-oriented'],
      strengths: ['Analytical', 'Reliable', 'Hardworking', 'Practical'],
      weaknesses: ['Overly critical', 'Perfectionist', 'Worrying', 'Shy'],
      description: 'Virgos are the perfectionists of the zodiac, with keen attention to detail and analytical minds. Their practical approach and reliability make them excellent problem-solvers.'
    },
    {
      name: 'Libra',
      dates: 'September 23 - October 22',
      element: 'Air',
      planet: 'Venus',
      icon: '♎',
      traits: ['Diplomatic', 'Balanced', 'Social', 'Indecisive'],
      strengths: ['Diplomatic', 'Fair-minded', 'Social', 'Cooperative'],
      weaknesses: ['Indecisive', 'Superficial', 'Vain', 'Avoids confrontation'],
      description: 'Libras are the diplomats of the zodiac, seeking balance and harmony in all things. Their social nature and sense of justice make them excellent mediators and partners.'
    },
    {
      name: 'Scorpio',
      dates: 'October 23 - November 21',
      element: 'Water',
      planet: 'Pluto',
      icon: '♏',
      traits: ['Intense', 'Passionate', 'Mysterious', 'Determined'],
      strengths: ['Passionate', 'Resourceful', 'Brave', 'Loyal'],
      weaknesses: ['Jealous', 'Secretive', 'Vengeful', 'Controlling'],
      description: 'Scorpios are the most intense sign of the zodiac, with deep passion and mysterious nature. Their determination and loyalty make them powerful allies and transformative leaders.'
    },
    {
      name: 'Sagittarius',
      dates: 'November 22 - December 21',
      element: 'Fire',
      planet: 'Jupiter',
      icon: '♐',
      traits: ['Adventurous', 'Optimistic', 'Philosophical', 'Restless'],
      strengths: ['Optimistic', 'Freedom-loving', 'Honest', 'Intellectual'],
      weaknesses: ['Impatient', 'Tactless', 'Overconfident', 'Inconsistent'],
      description: 'Sagittarians are the adventurers of the zodiac, always seeking new horizons and experiences. Their optimism and philosophical nature make them inspiring teachers and explorers.'
    },
    {
      name: 'Capricorn',
      dates: 'December 22 - January 19',
      element: 'Earth',
      planet: 'Saturn',
      icon: '♑',
      traits: ['Ambitious', 'Disciplined', 'Practical', 'Conservative'],
      strengths: ['Responsible', 'Disciplined', 'Self-controlled', 'Ambitious'],
      weaknesses: ['Pessimistic', 'Fatalistic', 'Miserly', 'Grudging'],
      description: 'Capricorns are the achievers of the zodiac, with strong discipline and ambition. Their practical approach and determination make them excellent at reaching long-term goals.'
    },
    {
      name: 'Aquarius',
      dates: 'January 20 - February 18',
      element: 'Air',
      planet: 'Uranus',
      icon: '♒',
      traits: ['Independent', 'Innovative', 'Humanitarian', 'Eccentric'],
      strengths: ['Original', 'Independent', 'Humanitarian', 'Inventive'],
      weaknesses: ['Unpredictable', 'Detached', 'Stubborn', 'Aloof'],
      description: 'Aquarians are the innovators of the zodiac, with unique perspectives and humanitarian values. Their independence and originality make them excellent reformers and visionaries.'
    },
    {
      name: 'Pisces',
      dates: 'February 19 - March 20',
      element: 'Water',
      planet: 'Neptune',
      icon: '♓',
      traits: ['Intuitive', 'Compassionate', 'Artistic', 'Escapist'],
      strengths: ['Compassionate', 'Artistic', 'Intuitive', 'Gentle'],
      weaknesses: ['Overly trusting', 'Escapist', 'Idealistic', 'Secretive'],
      description: 'Pisceans are the dreamers of the zodiac, with deep intuition and artistic souls. Their compassion and creativity make them excellent healers and artists.'
    }
  ];

  const selectedSignData = selectedSign ? zodiacSigns.find(s => s.name === selectedSign) : null;

  const hasEnoughCredits = () => {
    return availableCredits >= requiredCredits;
  };

  const generateCompatibility = async () => {
    if (!compatibilitySign1 || !compatibilitySign2) return;

    if (!hasEnoughCredits()) {
      setShowInsufficientCredits(true);
      return;
    }

    setIsGeneratingCompatibility(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock compatibility result
      const mockResult: CompatibilityResult = {
        rating: 'good',
        percentage: 78,
        comment: `Your relationship with ${compatibilitySign2} can be passionate but will require compromises. Both signs bring unique strengths that complement each other when balanced properly.`
      };

      setCompatibilityResult(mockResult);
      
      // Would deduct credits here
      console.log(`Deducting ${requiredCredits} credits for compatibility`);
      
    } catch (err) {
      setError('Compatibility generation failed. Please try again.');
    } finally {
      setIsGeneratingCompatibility(false);
    }
  };

  const generateAIInsights = async () => {
    if (!selectedSign) return;

    if (!hasEnoughCredits()) {
      setShowInsufficientCredits(true);
      return;
    }

    setIsGeneratingInsights(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock AI insights
      const mockInsights: AIInsight = {
        career: `${selectedSign} individuals excel in leadership roles and creative fields. Your natural confidence and energy make you well-suited for entrepreneurial ventures or positions requiring innovation and decisiveness.`,
        love: `In relationships, ${selectedSign} needs partners who can match their intensity and independence. You value honesty and direct communication, and thrive with someone who supports your ambitious nature.`,
        health: `Your active lifestyle serves you well, but remember to balance intense periods with adequate rest. Pay attention to stress management and maintain consistent exercise routines to channel your abundant energy.`,
        spirituality: `Your spiritual journey involves learning patience and developing deeper emotional intelligence. Meditation and mindfulness practices can help you connect with your inner wisdom and find balance.`
      };

      setAIInsights(mockInsights);
      
      // Would deduct credits here
      console.log(`Deducting ${requiredCredits} credits for AI insights`);
      
    } catch (err) {
      setError('AI insights generation failed. Please try again.');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const scrollToCircle = () => {
    const circleSection = document.getElementById('circle');
    circleSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const getCompatibilityColor = (rating: string) => {
    switch(rating) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'moderate': return 'text-yellow-400';
      case 'challenging': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getCompatibilityBg = (rating: string) => {
    switch(rating) {
      case 'excellent': return 'bg-green-400 bg-opacity-20 border-green-400';
      case 'good': return 'bg-blue-400 bg-opacity-20 border-blue-400';
      case 'moderate': return 'bg-yellow-400 bg-opacity-20 border-yellow-400';
      case 'challenging': return 'bg-red-400 bg-opacity-20 border-red-400';
      default: return 'bg-gray-400 bg-opacity-20 border-gray-400';
    }
  };

  return (
    <div className="bg-zodiac-constellations bg-cover bg-center bg-fixed min-h-screen relative">
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex p-6 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 mb-8 shadow-lg">
                <StarIcon className="h-12 w-12 text-white" />
              </div>
              
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl drop-shadow-lg">
                Unlock the Secrets of Your Sign
              </h1>
              <p className="mt-6 text-xl leading-8 text-gray-200 max-w-3xl mx-auto drop-shadow-md">
                ZodiacTome reveals character traits, compatibility and strengths of each zodiac sign
              </p>
              
              <div className="mt-10">
                <button
                  onClick={scrollToCircle}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-lg font-medium rounded-xl hover:from-yellow-400 hover:to-orange-500 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-transparent"
                >
                  Explore Your Sign
                  <ArrowDownIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Zodiac Circle */}
        <div id="circle" className="py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-6">Interactive Zodiac Circle</h2>
              <p className="text-gray-300">Click on any sign to explore its characteristics</p>
            </div>

            {/* Zodiac Grid */}
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
              {zodiacSigns.map((sign) => (
                <button
                  key={sign.name}
                  onClick={() => setSelectedSign(sign.name)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    selectedSign === sign.name
                      ? 'border-yellow-400 bg-yellow-400 bg-opacity-20 text-white scale-105'
                      : 'border-white border-opacity-20 bg-white bg-opacity-10 text-gray-300 hover:border-opacity-40 hover:text-white hover:scale-105'
                  }`}
                >
                  <div className="text-4xl mb-3">{sign.icon}</div>
                  <div className="font-bold text-lg">{sign.name}</div>
                  <div className="text-xs opacity-75">{sign.dates}</div>
                </button>
              ))}
            </div>

            {/* Selected Sign Profile */}
            {selectedSignData && (
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 border border-white border-opacity-20 shadow-xl mb-12">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">{selectedSignData.icon}</div>
                  <h3 className="text-3xl font-bold text-white mb-2">{selectedSignData.name}</h3>
                  <p className="text-yellow-300 text-lg">{selectedSignData.dates}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Element & Ruler</h4>
                      <div className="bg-white bg-opacity-10 rounded-xl p-4">
                        <div className="text-yellow-300">Element: <span className="text-white">{selectedSignData.element}</span></div>
                        <div className="text-yellow-300">Ruling Planet: <span className="text-white">{selectedSignData.planet}</span></div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Key Traits</h4>
                      <div className="bg-white bg-opacity-10 rounded-xl p-4">
                        <div className="flex flex-wrap gap-2">
                          {selectedSignData.traits.map((trait, index) => (
                            <span key={index} className="bg-yellow-400 bg-opacity-20 text-yellow-300 px-3 py-1 rounded-full text-sm">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Strengths</h4>
                      <div className="bg-white bg-opacity-10 rounded-xl p-4">
                        <ul className="space-y-1">
                          {selectedSignData.strengths.map((strength, index) => (
                            <li key={index} className="text-green-300 text-sm">
                              <CheckCircleIcon className="h-4 w-4 inline mr-2" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Challenges</h4>
                      <div className="bg-white bg-opacity-10 rounded-xl p-4">
                        <ul className="space-y-1">
                          {selectedSignData.weaknesses.map((weakness, index) => (
                            <li key={index} className="text-orange-300 text-sm">
                              • {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 bg-opacity-20 rounded-2xl p-6 border border-yellow-400 border-opacity-30">
                  <h4 className="text-lg font-semibold text-white mb-3">What Makes {selectedSignData.name} Unique</h4>
                  <p className="text-gray-200 leading-relaxed">
                    {selectedSignData.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compatibility Module */}
        <div className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 border border-white border-opacity-20 shadow-xl">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-4">Compatibility Analysis</h3>
                <p className="text-gray-300">Discover how well two signs harmonize together</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Your Sign</label>
                  <select
                    value={compatibilitySign1}
                    onChange={(e) => setCompatibilitySign1(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  >
                    <option value="">Select your sign</option>
                    {zodiacSigns.map((sign) => (
                      <option key={sign.name} value={sign.name} className="text-gray-900">
                        {sign.icon} {sign.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Partner's Sign</label>
                  <select
                    value={compatibilitySign2}
                    onChange={(e) => setCompatibilitySign2(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  >
                    <option value="">Select partner's sign</option>
                    {zodiacSigns.map((sign) => (
                      <option key={sign.name} value={sign.name} className="text-gray-900">
                        {sign.icon} {sign.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Credits Info */}
              <div className="bg-yellow-400 bg-opacity-20 border border-yellow-400 border-opacity-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <SparklesIcon className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-200">
                      Compatibility analysis = {requiredCredits} generations
                    </span>
                  </div>
                  <div className="text-yellow-200">
                    Available: {availableCredits === Infinity ? 'Unlimited' : availableCredits}
                  </div>
                </div>
              </div>

              <div className="text-center mb-8">
                <Button
                  onClick={generateCompatibility}
                  disabled={!compatibilitySign1 || !compatibilitySign2 || isGeneratingCompatibility}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-400 hover:to-red-500 disabled:opacity-50"
                >
                  {isGeneratingCompatibility ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <HeartIcon className="h-4 w-4" />
                      <span>Generate Compatibility</span>
                    </div>
                  )}
                </Button>
              </div>

              {/* Compatibility Result */}
              {compatibilityResult && (
                <div className={`rounded-2xl p-6 border border-opacity-50 ${getCompatibilityBg(compatibilityResult.rating)}`}>
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold text-white mb-2">
                      {compatibilitySign1} + {compatibilitySign2}
                    </h4>
                    <div className={`text-3xl font-bold ${getCompatibilityColor(compatibilityResult.rating)}`}>
                      {compatibilityResult.percentage}% {compatibilityResult.rating}
                    </div>
                  </div>
                  <p className="text-gray-200 text-center leading-relaxed">
                    {compatibilityResult.comment}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Insights Module */}
        {selectedSign && (
          <div className="py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 border border-white border-opacity-20 shadow-xl">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-white mb-4">AI Insights for {selectedSign}</h3>
                  <p className="text-gray-300">Get personalized insights powered by AI</p>
                </div>

                {/* Credits Info */}
                <div className="bg-blue-400 bg-opacity-20 border border-blue-400 border-opacity-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <SparklesIcon className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-200">
                        AI insights = {requiredCredits} generations
                      </span>
                    </div>
                    <div className="text-blue-200">
                      Available: {availableCredits === Infinity ? 'Unlimited' : availableCredits}
                    </div>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <Button
                    onClick={generateAIInsights}
                    disabled={isGeneratingInsights}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 disabled:opacity-50"
                  >
                    {isGeneratingInsights ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Generating Insights...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <SunIcon className="h-4 w-4" />
                        <span>Generate AI Insights</span>
                      </div>
                    )}
                  </Button>
                </div>

                {/* AI Insights Results */}
                {aiInsights && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-400 bg-opacity-20 rounded-2xl p-6 border border-green-400 border-opacity-50">
                      <div className="flex items-center mb-3">
                        <BriefcaseIcon className="h-5 w-5 text-green-400 mr-2" />
                        <h4 className="text-lg font-semibold text-white">Career</h4>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        {aiInsights.career}
                      </p>
                    </div>

                    <div className="bg-pink-400 bg-opacity-20 rounded-2xl p-6 border border-pink-400 border-opacity-50">
                      <div className="flex items-center mb-3">
                        <HeartIcon className="h-5 w-5 text-pink-400 mr-2" />
                        <h4 className="text-lg font-semibold text-white">Love & Relationships</h4>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        {aiInsights.love}
                      </p>
                    </div>

                    <div className="bg-blue-400 bg-opacity-20 rounded-2xl p-6 border border-blue-400 border-opacity-50">
                      <div className="flex items-center mb-3">
                        <UserIcon className="h-5 w-5 text-blue-400 mr-2" />
                        <h4 className="text-lg font-semibold text-white">Health & Wellness</h4>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        {aiInsights.health}
                      </p>
                    </div>

                    <div className="bg-purple-400 bg-opacity-20 rounded-2xl p-6 border border-purple-400 border-opacity-50">
                      <div className="flex items-center mb-3">
                        <SunIcon className="h-5 w-5 text-purple-400 mr-2" />
                        <h4 className="text-lg font-semibold text-white">Spirituality</h4>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        {aiInsights.spirituality}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
                You need {requiredCredits} generations for this feature. 
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
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500">
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

export default ZodiacTomePage;
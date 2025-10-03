import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { useAuth } from '@/store/authStore';
import { usePayment } from '@/store/paymentStore';
import {
  RectangleStackIcon,
  UserIcon,
  CalendarDaysIcon,
  SparklesIcon,
  ArrowDownIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  PlayIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface TarotFormData {
  name: string;
  birthDate: string;
}

interface TarotCard {
  name: string;
  position: string;
  meaning: string;
  image: string;
}

interface TarotResult {
  cards: TarotCard[];
  overallMeaning: string;
  generatedAt: string;
}

const TarotPathPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { currentSubscription } = usePayment();
  
  const [formData, setFormData] = useState<TarotFormData>({
    name: '',
    birthDate: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [result, setResult] = useState<TarotResult | null>(null);
  const [showInsufficientCredits, setShowInsufficientCredits] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<string | null>(null);

  const requiredCredits = 20;
  const availableCredits = currentSubscription?.maxGenerations === -1 
    ? Infinity 
    : Math.max(0, (currentSubscription?.maxGenerations || 0) - (currentSubscription?.generationsUsed || 0));

  const canGenerate = () => {
    return formData.name.trim() !== '' && formData.birthDate !== '';
  };

  const hasEnoughCredits = () => {
    return availableCredits >= requiredCredits;
  };

  const isRateLimited = () => {
    const today = new Date().toDateString();
    const requestKey = `${formData.name}-${formData.birthDate}-${today}`;
    return lastRequest === requestKey;
  };

  const generateReading = async () => {
    if (!canGenerate()) return;

    if (!hasEnoughCredits()) {
      setShowInsufficientCredits(true);
      return;
    }

    if (isRateLimited()) {
      setError('You can only generate one reading per day with the same parameters.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setShowCards(true);

    try {
      // Simulate card shuffling animation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock tarot reading result
      const mockCards: TarotCard[] = [
        {
          name: "The Moon",
          position: "Past Influences",
          meaning: "Hidden emotions and intuitive insights from your past are influencing your current path. Trust your inner wisdom.",
          image: "🌙"
        },
        {
          name: "Three of Cups",
          position: "Present Situation",
          meaning: "You're in a period of celebration and community. Friendships and social connections bring joy to your life.",
          image: "🍷"
        },
        {
          name: "The Star",
          position: "Hidden Factors",
          meaning: "Hope and inspiration guide you even when you can't see the way forward. Your dreams are more achievable than you think.",
          image: "⭐"
        },
        {
          name: "Ten of Pentacles",
          position: "Near Future",
          meaning: "Material security and family harmony are approaching. Your efforts will lead to lasting prosperity.",
          image: "💰"
        },
        {
          name: "The Sun",
          position: "Outcome",
          meaning: "Success, vitality, and joy await you. This month brings clarity and positive energy to all aspects of your life.",
          image: "☀️"
        }
      ];

      const mockResult: TarotResult = {
        cards: mockCards,
        overallMeaning: `${formData.name || 'Dear seeker'}, your lunar path this month reveals a beautiful journey from intuitive wisdom to material and emotional fulfillment. The cards indicate that past experiences have prepared you for current celebrations, while hidden hopes guide you toward a bright, prosperous future. Trust in the process and embrace the positive energy flowing into your life.`,
        generatedAt: new Date().toISOString()
      };

      setResult(mockResult);
      
      // Mark request to prevent duplicates
      const today = new Date().toDateString();
      const requestKey = `${formData.name}-${formData.birthDate}-${today}`;
      setLastRequest(requestKey);
      
      // Would deduct credits here
      console.log(`Deducting ${requiredCredits} credits`);
      
    } catch (err) {
      setError('Reading generation failed. Please try again.');
      setShowCards(false);
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
    link.download = `tarot-reading-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-mystical-space bg-cover bg-center bg-fixed min-h-screen relative">
      <div className="absolute inset-0 bg-black bg-opacity-80"></div>
      
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex p-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 mb-8 shadow-lg">
                <RectangleStackIcon className="h-12 w-12 text-white" />
              </div>
              
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl drop-shadow-lg">
                Your Path to the Moon Through Tarot Cards
              </h1>
              <p className="mt-6 text-xl leading-8 text-gray-200 max-w-3xl mx-auto drop-shadow-md">
                AI oracle will reveal what awaits you in the coming weeks
              </p>
              
              <div className="mt-10">
                <button
                  onClick={scrollToForm}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-lg font-medium rounded-xl hover:from-purple-400 hover:to-pink-500 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent"
                >
                  Create Reading Now
                  <ArrowDownIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div id="form" className="py-24">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 border border-white border-opacity-20 shadow-xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">Begin Your Tarot Journey</h2>
                <p className="text-gray-300">Share your details for a personalized reading</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    <UserIcon className="h-4 w-4 inline mr-2" />
                    Name for Personal Address
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    <CalendarDaysIcon className="h-4 w-4 inline mr-2" />
                    Birth Date for Context
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Credits Info */}
              <div className="bg-purple-400 bg-opacity-20 border border-purple-400 border-opacity-50 rounded-xl p-4 my-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <SparklesIcon className="h-5 w-5 text-purple-400" />
                    <span className="text-purple-200 font-medium">
                      One reading = {requiredCredits} generations
                    </span>
                  </div>
                  <div className="text-purple-200">
                    Available: {availableCredits === Infinity ? 'Unlimited' : availableCredits}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <Button
                  onClick={generateReading}
                  disabled={!canGenerate() || isGenerating}
                  className="px-8 py-4 text-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:opacity-50"
                  size="lg"
                >
                  {isGenerating ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Shuffling Cards...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <RectangleStackIcon className="h-5 w-5" />
                      <span>Begin Reading</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Card Animation */}
        {showCards && isGenerating && (
          <div className="py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="mb-8">
                <div className="inline-flex items-center space-x-4 bg-white bg-opacity-10 backdrop-blur-md rounded-2xl px-8 py-6">
                  <div className="animate-pulse text-4xl">🔮</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Shuffling the Cosmic Deck</h3>
                    <p className="text-gray-300">The cards are choosing themselves for you...</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-20 h-32 bg-gradient-to-b from-purple-600 to-indigo-800 rounded-lg shadow-lg animate-bounce border border-white border-opacity-20"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  >
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🎴
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="py-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Your Tarot Reading
                </h2>
                <p className="text-gray-300">
                  Generated on {new Date(result.generatedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Cards Display */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
                {result.cards.map((card, index) => (
                  <div key={index} className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 text-center hover:bg-opacity-15 transition-all duration-300">
                    <div className="text-6xl mb-4">{card.image}</div>
                    <h4 className="text-lg font-bold text-white mb-2">{card.name}</h4>
                    <div className="text-purple-300 text-sm font-medium mb-3">{card.position}</div>
                    <p className="text-gray-200 text-sm leading-relaxed">{card.meaning}</p>
                  </div>
                ))}
              </div>

              {/* Overall Meaning */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 bg-opacity-20 rounded-2xl p-8 border border-purple-400 border-opacity-30 mb-8">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  What This Reading Means for You Overall
                </h3>
                <p className="text-gray-200 text-lg leading-relaxed text-center">
                  {result.overallMeaning}
                </p>
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

        {/* FAQ Section */}
        <div className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h3>
            
            <div className="space-y-6">
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Which deck is used?
                </h4>
                <p className="text-gray-200">
                  We use a digital interpretation of the traditional Rider-Waite Tarot deck, enhanced with AI-powered interpretations tailored to your personal context.
                </p>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Are the cards random?
                </h4>
                <p className="text-gray-200">
                  Yes, our generator distributes cards randomly for each new reading, ensuring authentic and unique insights every time.
                </p>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Can I do multiple readings per month?
                </h4>
                <p className="text-gray-200">
                  Yes, but not more than once per day for identical parameters to prevent duplicate readings and ensure meaningful insights.
                </p>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Do readings vary for different users?
                </h4>
                <p className="text-gray-200">
                  Yes, readings and interpretations consider your entered data and personal context, making each reading unique to the individual.
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
                You need {requiredCredits} generations for a Tarot reading. 
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
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500">
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

export default TarotPathPage;
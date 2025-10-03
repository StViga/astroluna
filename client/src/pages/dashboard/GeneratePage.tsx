import React, { useState, useEffect } from 'react';
import { useAuth } from '@/store/authStore';
import { useProfile } from '@/store/profileStore';
import Button from '@/components/ui/Button';
import { 
  SparklesIcon, 
  ClockIcon, 
  CreditCardIcon,
  StarIcon,
  GlobeAltIcon,
  HeartIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface GenerationRequest {
  type: 'natal' | 'compatibility' | 'forecast';
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  partnerBirthDate?: string;
  partnerBirthTime?: string;
  partnerBirthPlace?: string;
}

interface GeneratedAnalysis {
  id: string;
  type: 'natal' | 'compatibility' | 'forecast';
  title: string;
  summary: string;
  sections: {
    title: string;
    content: string;
    icon?: string;
  }[];
  birthData: {
    date: string;
    time: string;
    place: string;
  };
  partnerData?: {
    date: string;
    time: string;
    place: string;
  } | undefined;
  createdAt: string;
}

const GeneratePage: React.FC = () => {
  const { user } = useAuth();
  const { astrologicalProfile, birthData, hasBirthData, savedPartners } = useProfile();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedType, setSelectedType] = useState<'natal' | 'compatibility' | 'forecast'>('natal');
  const [generatedAnalysis, setGeneratedAnalysis] = useState<GeneratedAnalysis | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [formData, setFormData] = useState<GenerationRequest>({
    type: 'natal',
    birthDate: '',
    birthTime: '',
    birthPlace: ''
  });

  // Auto-fill form with saved birth data
  useEffect(() => {
    if (birthData) {
      setFormData(prev => ({
        ...prev,
        birthDate: birthData.date,
        birthTime: birthData.time,
        birthPlace: birthData.place
      }));
    }
  }, [birthData]);

  // Auto-fill partner data if available
  const fillPartnerData = (partnerIndex: number) => {
    if (savedPartners[partnerIndex]) {
      const partner = savedPartners[partnerIndex];
      setFormData(prev => ({
        ...prev,
        partnerBirthDate: partner.birthDate,
        partnerBirthTime: partner.birthTime,
        partnerBirthPlace: partner.birthPlace
      }));
    }
  };

  // Simulate AI generation process
  const handleGenerate = async () => {
    if (!user || user.credits < 1) {
      alert('Insufficient credits! Please purchase more credits.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setShowResult(false);

    // Simulate progress with steps
    const steps = [
      { label: 'Analyzing planetary positions...', progress: 20 },
      { label: 'Calculating astrological houses...', progress: 40 },
      { label: 'Interpreting celestial influences...', progress: 60 },
      { label: 'Generating personalized insights...', progress: 80 },
      { label: 'Finalizing your analysis...', progress: 100 }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setGenerationProgress(step.progress);
    }

    // Generate actual analysis content
    const analysis = generateAnalysisContent(selectedType, formData);
    
    // Complete generation
    setTimeout(() => {
      setIsGenerating(false);
      setGenerationProgress(0);
      setGeneratedAnalysis(analysis);
      setShowResult(true);
      toast.success('🌟 Your astrological analysis has been generated successfully!');
    }, 1000);
  };

  // Generate mock analysis content based on type
  const generateAnalysisContent = (type: string, data: GenerationRequest): GeneratedAnalysis => {
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (type === 'natal') {
      return {
        id: analysisId,
        type: 'natal',
        title: 'Your Cosmic Blueprint - Complete Natal Chart Analysis',
        summary: 'Discover the celestial influences that shaped your personality, life path, and spiritual journey through the stars.',
        sections: [
          {
            title: 'Sun Sign - Your Core Essence',
            icon: '☉',
            content: `With your Sun in Taurus, you embody the steady, reliable energy of the Earth. You are naturally drawn to beauty, comfort, and stability. Your determination is legendary - once you set your mind to something, you see it through with unwavering persistence. Venus, your ruling planet, blesses you with an appreciation for life's finer things and a magnetic charm that draws others to you.

Your Taurus Sun gives you a practical approach to life, preferring to build something lasting rather than chase fleeting opportunities. You have an innate understanding of value - both material and emotional - and you invest your time and energy wisely. Your patience is one of your greatest strengths, allowing you to cultivate relationships and projects that flourish over time.`
          },
          {
            title: 'Moon Sign - Your Emotional Landscape',
            icon: '☽',
            content: `Your Moon in Pisces reveals a deeply intuitive and empathetic emotional nature. You feel everything intensely and have a natural ability to understand the unspoken feelings of others. This placement gives you an almost psychic sensitivity to the emotional currents around you, making you a natural healer and counselor.

Dreams, creativity, and spirituality play a significant role in your emotional wellbeing. You may find that your moods ebb and flow like the tides, influenced by both seen and unseen forces. Your compassionate nature means you often put others' needs before your own, but learning to honor your own emotional needs is crucial for your happiness.`
          },
          {
            title: 'Rising Sign - Your Public Persona',
            icon: '↗',
            content: `With Leo Rising, you naturally command attention wherever you go. There's something regal about your presence - a confident, warm energy that draws people to you like moths to a flame. You're likely to have a dramatic flair in your appearance and presentation, and you're not afraid to stand out from the crowd.

This rising sign gives you natural leadership abilities and a generous heart. People see you as confident, creative, and charismatic. You have a talent for making others feel special and appreciated, and your optimistic outlook is contagious. However, you also need regular recognition and appreciation to feel your best.`
          },
          {
            title: 'Life Purpose & Destiny',
            icon: '⭐',
            content: `Your unique combination of Taurus Sun, Pisces Moon, and Leo Rising suggests a life purpose centered around bringing beauty, healing, and inspiration to the world. You're here to build something lasting that touches people's hearts and souls.

Your path likely involves combining practical skills with creative expression and emotional intelligence. Whether through art, healing, teaching, or leadership, you have the ability to create positive change in a way that is both grounded and inspiring. Trust your intuition, embrace your creativity, and don't be afraid to shine your light brightly.`
          }
        ],
        birthData: {
          date: data.birthDate,
          time: data.birthTime,
          place: data.birthPlace
        },
        createdAt: new Date().toISOString()
      };
    } else if (type === 'compatibility') {
      return {
        id: analysisId,
        type: 'compatibility',
        title: 'Cosmic Connection - Love Compatibility Analysis',
        summary: 'Explore the celestial dance between your souls and discover the strengths, challenges, and potential of your relationship.',
        sections: [
          {
            title: 'Sun Sign Compatibility',
            icon: '💫',
            content: `Your Taurus Sun harmoniously aligns with their Sagittarius Sun, creating a fascinating dynamic between stability and adventure. While you prefer to build secure foundations, they inspire you to expand your horizons and embrace new experiences.

This pairing brings together the Earth and Fire elements, creating a relationship that can be both grounding and energizing. Your steady presence provides them with a safe harbor, while their adventurous spirit encourages you to step outside your comfort zone. The key to success lies in appreciating these differences rather than trying to change each other.`
          },
          {
            title: 'Emotional Connection',
            icon: '💝',
            content: `Your Pisces Moon creates a deep emotional connection with their placement, fostering intuitive understanding and compassion. You both value emotional authenticity and are willing to be vulnerable with each other.

There's a natural flow of empathy between you - you can sense each other's moods and needs without words. This creates a safe space where both of you can express your deepest feelings. Your emotional bond is likely one of the strongest aspects of your relationship, providing a foundation of trust and understanding.`
          },
          {
            title: 'Communication & Daily Life',
            icon: '🗣️',
            content: `Your Leo Rising brings warmth and generosity to your interactions, while their communication style complements your expressive nature. You both enjoy sharing ideas and experiences, though you may express yourselves differently.

In daily life, you'll need to find balance between your need for routine and their desire for variety. Your appreciation for beauty and comfort can enhance their experiences, while their spontaneity can add excitement to your world. Creating shared rituals and traditions will strengthen your bond.`
          },
          {
            title: 'Relationship Potential',
            icon: '🌟',
            content: `This relationship has strong potential for long-term happiness if you both embrace and celebrate your differences. Your grounding influence helps them focus their energy, while their inspirational nature helps you grow and evolve.

The key challenges will involve finding balance between security and freedom, routine and adventure. However, these differences can also be your greatest strengths if you approach them with love and understanding. Together, you can create a relationship that is both stable and dynamic, offering the best of both worlds.`
          }
        ],
        birthData: {
          date: data.birthDate,
          time: data.birthTime,
          place: data.birthPlace
        },
        partnerData: data.partnerBirthDate ? {
          date: data.partnerBirthDate,
          time: data.partnerBirthTime || '',
          place: data.partnerBirthPlace || ''
        } : undefined,
        createdAt: new Date().toISOString()
      };
    } else { // forecast
      return {
        id: analysisId,
        type: 'forecast',
        title: 'November 2024 - Your Cosmic Forecast',
        summary: 'Navigate the celestial energies ahead with personalized insights into upcoming opportunities, challenges, and transformations.',
        sections: [
          {
            title: 'Overall Energy This Month',
            icon: '🌙',
            content: `November 2024 brings a powerful period of transformation and growth for you. With Mars entering your career sector, you'll feel a surge of motivation and ambition. This is an excellent time to pursue professional goals and assert yourself in leadership roles.

The New Moon in Scorpio on November 1st activates your sector of transformation, encouraging you to release what no longer serves you and embrace profound change. This is particularly powerful for your Taurus Sun, as it encourages you to step beyond your comfort zone and trust the process of renewal.`
          },
          {
            title: 'Career & Financial Opportunities',
            icon: '💼',
            content: `Jupiter's continued journey through your money sector brings expanded opportunities for financial growth. A significant opportunity may present itself around the 15th, possibly involving a business partnership or investment opportunity.

Your natural Taurus instincts for value and stability will serve you well during this time. Trust your practical judgment, but don't be afraid to take calculated risks. The Full Moon on November 27th illuminates your career sector, potentially bringing recognition or a new professional direction.`
          },
          {
            title: 'Relationships & Love',
            icon: '💕',
            content: `Venus, your ruling planet, dances through multiple signs this month, creating varied romantic energies. Early November favors deep, meaningful connections and intimate conversations. Your Pisces Moon will be particularly sensitive to emotional undercurrents.

If you're in a relationship, this is a time for deepening your bond through shared experiences and emotional honesty. Single? The period around November 20th looks particularly promising for meeting someone who shares your values and long-term vision.`
          },
          {
            title: 'Health & Personal Growth',
            icon: '🌱',
            content: `Your Pisces Moon suggests paying extra attention to your emotional and spiritual well-being this month. The intense Scorpio energy may stir up deep emotions that need processing. Consider meditation, journaling, or therapy as tools for inner work.

Physically, focus on activities that combine movement with mindfulness. Your Taurus Sun appreciates routine, so establishing a consistent self-care practice will be especially beneficial. The solar eclipse energy later in the month supports releasing old patterns and embracing new, healthier habits.`
          }
        ],
        birthData: {
          date: data.birthDate,
          time: data.birthTime,
          place: data.birthPlace
        },
        createdAt: new Date().toISOString()
      };
    }
  };

  const analysisTypes = [
    {
      id: 'natal',
      title: 'Natal Chart',
      description: 'Complete birth chart analysis revealing your cosmic blueprint',
      icon: StarIcon,
      cost: 3,
      color: 'from-purple-600 to-blue-600'
    },
    {
      id: 'compatibility',
      title: 'Love Compatibility',
      description: 'Discover relationship dynamics and cosmic connections',
      icon: HeartIcon,
      cost: 5,
      color: 'from-pink-600 to-red-600'
    },
    {
      id: 'forecast',
      title: 'Future Forecast',
      description: 'Upcoming planetary influences and opportunities',
      icon: CalendarIcon,
      cost: 4,
      color: 'from-amber-600 to-orange-600'
    }
  ];

  const selectedAnalysis = analysisTypes.find(type => type.id === selectedType);

  return (
    <div className="min-h-screen bg-gradient-cosmic relative overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-6 shadow-xl border border-white border-opacity-30">
              <SparklesIcon className="w-16 h-16 text-yellow-300" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Generate Astrological Analysis
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto drop-shadow-md">
            Unlock the secrets of the cosmos with AI-powered astrological insights
          </p>
        </div>

        {/* Credits Display */}
        <div className="flex justify-center mb-8">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl border border-white border-opacity-30">
            <div className="flex items-center space-x-3">
              <CreditCardIcon className="w-6 h-6 text-yellow-300" />
              <span className="text-white font-semibold text-lg">
                Available Credits: {user?.credits || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Generation Status */}
        {isGenerating ? (
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white border-opacity-50 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-pulse"></div>
                  <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <SparklesIcon className="w-8 h-8 text-purple-600 animate-bounce" />
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Generating Your Cosmic Analysis...
              </h3>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              
              <p className="text-gray-600 text-lg font-medium mb-2">
                {generationProgress === 0 ? 'Initializing cosmic connection...' :
                 generationProgress === 20 ? 'Analyzing planetary positions...' :
                 generationProgress === 40 ? 'Calculating astrological houses...' :
                 generationProgress === 60 ? 'Interpreting celestial influences...' :
                 generationProgress === 80 ? 'Generating personalized insights...' :
                 'Finalizing your analysis...'}
              </p>
              
              <div className="flex items-center justify-center space-x-2 text-purple-600">
                <ClockIcon className="w-5 h-5" />
                <span className="text-sm">
                  Estimated time: {Math.max(1, Math.ceil((100 - generationProgress) / 20))} minutes
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Analysis Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {analysisTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                
                return (
                  <div
                    key={type.id}
                    onClick={() => setSelectedType(type.id as any)}
                    className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      isSelected ? 'ring-4 ring-yellow-400 ring-opacity-60' : ''
                    }`}
                  >
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white border-opacity-30 hover:bg-opacity-30 transition-all">
                      <div className="text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${type.color} rounded-full mb-4 shadow-lg`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {type.title}
                        </h3>
                        <p className="text-gray-200 text-sm mb-4">
                          {type.description}
                        </p>
                        <div className="inline-flex items-center px-3 py-1 bg-yellow-400 bg-opacity-90 rounded-full">
                          <span className="text-gray-800 font-semibold text-sm">
                            {type.cost} credits
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg">
                        <StarIcon className="w-5 h-5 text-gray-800" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Generation Form */}
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white border-opacity-50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Form */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {selectedAnalysis?.title} Analysis
                    </h3>
                    
                    {hasBirthData && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (birthData) {
                            setFormData(prev => ({
                              ...prev,
                              birthDate: birthData.date,
                              birthTime: birthData.time,
                              birthPlace: birthData.place
                            }));
                            toast.success('Auto-filled from your profile!');
                          }
                        }}
                        className="text-purple-600 border-purple-300 hover:bg-purple-50"
                      >
                        <StarIcon className="w-4 h-4 mr-1" />
                        Use My Data
                      </Button>
                    )}
                  </div>

                  {/* Profile Status */}
                  {!hasBirthData && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-amber-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h4 className="text-amber-800 font-medium text-sm">Complete Your Profile</h4>
                          <p className="text-amber-700 text-sm mt-1">
                            Save your birth data in your profile to auto-fill future analyses.{' '}
                            <a href="/dashboard/profile" className="underline hover:text-amber-900">
                              Go to Profile →
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Birth Date
                      </label>
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Birth Time
                      </label>
                      <input
                        type="time"
                        value={formData.birthTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthTime: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <GlobeAltIcon className="w-4 h-4 inline mr-2" />
                        Birth Place
                      </label>
                      <input
                        type="text"
                        placeholder="Enter city, country"
                        value={formData.birthPlace}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthPlace: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    {/* Partner fields for compatibility */}
                    {selectedType === 'compatibility' && (
                      <>
                        <div className="border-t pt-6 mt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-800">
                              Partner's Information
                            </h4>
                            
                            {savedPartners.length > 0 && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Saved partners:</span>
                                {savedPartners.slice(0, 3).map((partner, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="xs"
                                    onClick={() => {
                                      fillPartnerData(index);
                                      toast.success(`Auto-filled ${partner.name || `Partner ${index + 1}`} data!`);
                                    }}
                                    className="text-pink-600 border-pink-300 hover:bg-pink-50"
                                  >
                                    {partner.name || `Partner ${index + 1}`}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Partner's Birth Date
                          </label>
                          <input
                            type="date"
                            value={formData.partnerBirthDate || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, partnerBirthDate: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Partner's Birth Time
                          </label>
                          <input
                            type="time"
                            value={formData.partnerBirthTime || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, partnerBirthTime: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Partner's Birth Place
                          </label>
                          <input
                            type="text"
                            placeholder="Enter city, country"
                            value={formData.partnerBirthPlace || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, partnerBirthPlace: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Column - Preview & Generate */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Analysis Preview
                    </h4>
                    
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Analysis Type:</span>
                        <span className="font-semibold text-purple-600">
                          {selectedAnalysis?.title}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Credit Cost:</span>
                        <span className="font-semibold text-purple-600">
                          {selectedAnalysis?.cost} credits
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Generation Time:</span>
                        <span className="font-semibold text-purple-600">
                          ~5 minutes
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button
                      onClick={handleGenerate}
                      disabled={!formData.birthDate || !formData.birthTime || !formData.birthPlace || (user?.credits || 0) < (selectedAnalysis?.cost || 1)}
                      fullWidth
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 shadow-xl"
                    >
                      <SparklesIcon className="w-5 h-5 mr-2" />
                      Generate Analysis ({selectedAnalysis?.cost} credits)
                    </Button>
                    
                    <div className="text-xs text-gray-500 text-center">
                      By generating, you agree to our Terms of Service
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Analysis Result */}
        {showResult && generatedAnalysis && (
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white border-opacity-50 mt-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-4 shadow-xl">
                  <StarIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{generatedAnalysis.title}</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">{generatedAnalysis.summary}</p>
            </div>

            {/* Birth Data Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Birth Date</div>
                  <div className="font-semibold text-purple-800">
                    {new Date(generatedAnalysis.birthData.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Birth Time</div>
                  <div className="font-semibold text-purple-800">{generatedAnalysis.birthData.time}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Birth Place</div>
                  <div className="font-semibold text-purple-800">{generatedAnalysis.birthData.place}</div>
                </div>
              </div>
              
              {generatedAnalysis.partnerData && (
                <>
                  <hr className="my-4 border-purple-200" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Partner's Birth Date</div>
                      <div className="font-semibold text-pink-800">
                        {new Date(generatedAnalysis.partnerData.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Partner's Birth Time</div>
                      <div className="font-semibold text-pink-800">{generatedAnalysis.partnerData.time}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Partner's Birth Place</div>
                      <div className="font-semibold text-pink-800">{generatedAnalysis.partnerData.place}</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Analysis Sections */}
            <div className="space-y-8">
              {generatedAnalysis.sections.map((section, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center mb-4">
                    {section.icon && (
                      <div className="text-3xl mr-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full w-16 h-16 flex items-center justify-center">
                        {section.icon}
                      </div>
                    )}
                    <h3 className="text-2xl font-bold text-gray-800">{section.title}</h3>
                  </div>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => {
                  setShowResult(false);
                  setGeneratedAnalysis(null);
                }}
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                Generate Another Analysis
              </Button>
              
              <Button
                onClick={() => {
                  toast.success('Analysis saved to your library!');
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              >
                Save to Library
              </Button>
              
              <Button
                onClick={() => {
                  toast.success('Download feature coming soon!');
                }}
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </Button>
              
              <Button
                onClick={() => {
                  navigator.share?.({
                    title: generatedAnalysis.title,
                    text: generatedAnalysis.summary,
                    url: window.location.href
                  }) || toast.success('Share feature coming soon!');
                }}
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for animated stars */}
      <style>{`
        .stars {
          width: 1px;
          height: 1px;
          background: transparent;
          box-shadow: 
            378px 1676px #fff, 1400px 1245px #fff, 635px 1271px #fff,
            1866px 1068px #fff, 356px 1074px #fff, 1058px 1039px #fff;
          animation: animStar 50s linear infinite;
        }
        .stars:after {
          content: " ";
          position: absolute;
          top: 2000px;
          width: 1px;
          height: 1px;
          background: transparent;
          box-shadow: 
            378px 1676px #fff, 1400px 1245px #fff, 635px 1271px #fff,
            1866px 1068px #fff, 356px 1074px #fff, 1058px 1039px #fff;
        }
        .twinkling {
          width: 2px;
          height: 2px;
          background: transparent;
          box-shadow:
            1920px 1200px #fff, 1170px 300px #fff, 1340px 450px #fff;
          animation: animStar 100s linear infinite;
        }
        .twinkling:after {
          content: " ";
          position: absolute;
          top: 2000px;
          width: 2px;
          height: 2px;
          background: transparent;
          box-shadow:
            1920px 1200px #fff, 1170px 300px #fff, 1340px 450px #fff;
        }
        @keyframes animStar {
          from {
            transform: translateY(0px);
          }
          to {
            transform: translateY(-2000px);
          }
        }
      `}</style>
    </div>
  );
};

export default GeneratePage;
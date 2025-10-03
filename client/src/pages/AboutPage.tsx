import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { useAuth } from '@/store/authStore';
import {
  CpuChipIcon,
  LightBulbIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  SparklesIcon,
  BookOpenIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const AboutPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const values = [
    {
      name: 'Innovation',
      description: 'Combining cutting-edge AI technology with ancient astrological wisdom to create unprecedented insights.',
      icon: CpuChipIcon,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      name: 'Accuracy',
      description: 'Our AI models are trained on vast datasets to provide the most precise astrological interpretations possible.',
      icon: LightBulbIcon,
      color: 'from-yellow-500 to-orange-600'
    },
    {
      name: 'Accessibility',
      description: 'Making professional-quality astrology available to everyone, regardless of their experience level.',
      icon: GlobeAltIcon,
      color: 'from-green-500 to-emerald-600'
    },
    {
      name: 'Privacy',
      description: 'Your personal data and birth information are completely secure and never shared with third parties.',
      icon: ShieldCheckIcon,
      color: 'from-purple-500 to-violet-600'
    }
  ];

  const teamMembers = [
    {
      name: 'Dr. Sarah Cosmos',
      role: 'Founder & Chief Astrologer',
      description: 'With 20+ years in traditional astrology and AI research, Sarah bridges ancient wisdom with modern technology.',
      image: '👩‍🔬',
      expertise: ['Traditional Astrology', 'AI Development', 'Pattern Recognition']
    },
    {
      name: 'Alex Starfield',
      role: 'Lead AI Engineer',
      description: 'Former NASA data scientist specializing in machine learning and astronomical pattern analysis.',
      image: '👨‍💻',
      expertise: ['Machine Learning', 'Data Science', 'Astronomical Computing']
    },
    {
      name: 'Luna Martinez',
      role: 'UX Design Director',
      description: 'Award-winning designer focused on making complex astrological data intuitive and beautiful.',
      image: '👩‍🎨',
      expertise: ['User Experience', 'Visual Design', 'Data Visualization']
    },
    {
      name: 'Prof. Michael Stellar',
      role: 'Research Director',
      description: 'Academic researcher in computational astrology and author of several papers on AI interpretation methods.',
      image: '👨‍🏫',
      expertise: ['Academic Research', 'Computational Astrology', 'Statistical Analysis']
    }
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Foundation',
      description: 'AstroLuna was founded with a vision to democratize professional astrology using AI technology.'
    },
    {
      year: '2021',
      title: 'AI Development',
      description: 'Our first AI model was trained on over 100,000 natal charts and traditional astrological texts.'
    },
    {
      year: '2022',
      title: 'Beta Launch',
      description: 'Successful beta testing with 1,000+ users provided valuable feedback for platform refinement.'
    },
    {
      year: '2023',
      title: 'Public Release',
      description: 'Official launch with enhanced AI models and comprehensive astrological service offerings.'
    },
    {
      year: '2024',
      title: 'Global Expansion',
      description: 'Reached 50,000+ users worldwide with multi-language support and advanced features.'
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Active Users' },
    { number: '500,000+', label: 'Charts Generated' },
    { number: '99.2%', label: 'Satisfaction Rate' },
    { number: '24/7', label: 'Support Available' }
  ];

  return (
    <div className="bg-cosmic-nebula-2 bg-cover bg-center bg-fixed min-h-screen relative">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl drop-shadow-lg">
                About <span className="text-yellow-300">AstroLuna</span>
              </h1>
              <p className="mt-6 text-xl leading-8 text-gray-200 max-w-3xl mx-auto drop-shadow-md">
                We're pioneering the future of astrology by combining artificial intelligence 
                with thousands of years of celestial wisdom to unlock your cosmic potential.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">Our Mission</h2>
              <p className="mt-4 text-lg text-gray-200 drop-shadow-md max-w-3xl mx-auto">
                To make professional-quality astrological insights accessible to everyone through 
                the power of artificial intelligence, helping people understand themselves and 
                navigate their life's journey with cosmic guidance.
              </p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-12 border border-white border-opacity-20 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-6 drop-shadow-lg">
                    Bridging Ancient Wisdom with Modern Technology
                  </h3>
                  <p className="text-gray-200 text-lg mb-6 drop-shadow-sm">
                    For millennia, humans have looked to the stars for guidance. Today, we're using 
                    advanced AI to interpret these celestial patterns with unprecedented accuracy 
                    and accessibility.
                  </p>
                  <p className="text-gray-200 text-lg drop-shadow-sm">
                    Our platform combines traditional astrological knowledge with machine learning 
                    algorithms to provide personalized, detailed insights that were once available 
                    only to professional astrologers.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-8xl mb-6">🌌</div>
                  <div className="text-2xl font-bold text-yellow-300 drop-shadow-lg">
                    Where Stars Meet Science
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">Our Values</h2>
              <p className="mt-4 text-lg text-gray-200 drop-shadow-md">
                The principles that guide everything we do at AstroLuna
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => (
                <div key={value.name} className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 shadow-xl text-center hover:bg-opacity-15 transition-all duration-300">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${value.color} mb-6 shadow-lg`}>
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 drop-shadow-md">{value.name}</h3>
                  <p className="text-gray-200 drop-shadow-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-cosmic rounded-3xl p-12 text-center shadow-2xl">
              <h2 className="text-4xl font-bold text-white mb-12 drop-shadow-lg">
                AstroLuna by the Numbers
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-4xl font-bold text-yellow-300 mb-2 drop-shadow-lg">
                      {stat.number}
                    </div>
                    <div className="text-white drop-shadow-md">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">Meet Our Team</h2>
              <p className="mt-4 text-lg text-gray-200 drop-shadow-md">
                The passionate experts behind AstroLuna's innovative approach
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {teamMembers.map((member) => (
                <div key={member.name} className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 shadow-xl hover:bg-opacity-15 transition-all duration-300">
                  <div className="flex items-start space-x-6">
                    <div className="text-5xl">{member.image}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">{member.name}</h3>
                      <p className="text-yellow-300 font-medium mb-3 drop-shadow-sm">{member.role}</p>
                      <p className="text-gray-200 mb-4 drop-shadow-sm">{member.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {member.expertise.map((skill) => (
                          <span key={skill} className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white drop-shadow-lg">Our Journey</h2>
              <p className="mt-4 text-lg text-gray-200 drop-shadow-md">
                Key milestones in AstroLuna's development
              </p>
            </div>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className="flex items-start space-x-8">
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-cosmic rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">{milestone.year}</span>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20 shadow-xl flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 drop-shadow-md">{milestone.title}</h3>
                    <p className="text-gray-200 drop-shadow-sm">{milestone.description}</p>
                  </div>
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
                  Join Our Cosmic Community
                </h2>
                <p className="text-xl text-gray-100 mb-8 drop-shadow-md">
                  Become part of a growing community of astrology enthusiasts exploring 
                  the universe through AI-powered insights
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!isAuthenticated && (
                    <>
                      <Link to="/register">
                        <Button size="lg" className="bg-white bg-opacity-90 text-gray-800 hover:bg-opacity-100 shadow-xl">
                          Start Your Journey
                        </Button>
                      </Link>
                      <Link to="/services">
                        <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-800">
                          Explore Services
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

export default AboutPage;
import React, { useState } from 'react';
import { useAuth } from '@/store/authStore';
import Button from '@/components/ui/Button';
import {
  BookOpenIcon,
  StarIcon,
  HeartIcon,
  CalendarIcon,
  EyeIcon,
  ArrowDownTrayIcon as DownloadIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Analysis {
  id: string;
  type: 'natal' | 'compatibility' | 'forecast';
  title: string;
  description: string;
  createdAt: string;
  status: 'completed' | 'processing' | 'failed';
  birthData: {
    date: string;
    time: string;
    place: string;
  };
  partnerData?: {
    date: string;
    time: string;
    place: string;
  };
  preview: string;
  tags: string[];
  rating?: number;
}

const LibraryPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'natal' | 'compatibility' | 'forecast'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  // Mock library data
  const analyses: Analysis[] = [
    {
      id: '1',
      type: 'natal',
      title: 'Your Cosmic Blueprint',
      description: 'Complete natal chart analysis revealing your cosmic blueprint and life path',
      createdAt: '2024-10-01T14:30:00Z',
      status: 'completed',
      birthData: {
        date: '1990-05-15',
        time: '14:30',
        place: 'New York, USA'
      },
      preview: 'With your Sun in Taurus and Moon in Pisces, you possess a unique combination of earthly determination and intuitive wisdom. Your Ascendant in Leo gives you natural charisma...',
      tags: ['Sun Sign', 'Moon Sign', 'Rising Sign', 'Life Path'],
      rating: 4.9
    },
    {
      id: '2',
      type: 'compatibility',
      title: 'Love Connection Analysis',
      description: 'Relationship compatibility with your partner based on astrological synastry',
      createdAt: '2024-09-28T10:15:00Z',
      status: 'completed',
      birthData: {
        date: '1990-05-15',
        time: '14:30',
        place: 'New York, USA'
      },
      partnerData: {
        date: '1988-11-22',
        time: '09:45',
        place: 'Los Angeles, USA'
      },
      preview: 'Your Taurus Sun harmoniously aligns with their Sagittarius Sun, creating a dynamic balance of stability and adventure. The Moon-Venus conjunction suggests...',
      tags: ['Synastry', 'Love', 'Compatibility', 'Relationship'],
      rating: 4.7
    },
    {
      id: '3',
      type: 'forecast',
      title: 'November 2024 Forecast',
      description: 'Monthly astrological forecast and planetary influences',
      createdAt: '2024-09-25T16:45:00Z',
      status: 'completed',
      birthData: {
        date: '1990-05-15',
        time: '14:30',
        place: 'New York, USA'
      },
      preview: 'This month brings transformative energy with Mars entering your career sector. Jupiter\'s trine to your natal Sun suggests opportunities for growth and expansion...',
      tags: ['Transit', 'Forecast', 'Career', 'Growth'],
      rating: 4.8
    },
    {
      id: '4',
      type: 'natal',
      title: 'Career & Life Purpose',
      description: 'Focused analysis on your professional path and life calling',
      createdAt: '2024-09-20T11:20:00Z',
      status: 'processing',
      birthData: {
        date: '1990-05-15',
        time: '14:30',
        place: 'New York, USA'
      },
      preview: 'Analysis in progress...',
      tags: ['Career', 'Life Purpose', 'Midheaven'],
    },
    {
      id: '5',
      type: 'compatibility',
      title: 'Family Dynamics',
      description: 'Understanding family relationships through astrological lens',
      createdAt: '2024-09-15T13:10:00Z',
      status: 'completed',
      birthData: {
        date: '1990-05-15',
        time: '14:30',
        place: 'New York, USA'
      },
      partnerData: {
        date: '1965-03-08',
        time: '07:20',
        place: 'Chicago, USA'
      },
      preview: 'The generational planets reveal interesting patterns in your family dynamics. Your Saturn return coincides with their Chiron return...',
      tags: ['Family', 'Generational', 'Healing'],
      rating: 4.6
    }
  ];

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'natal': return StarIcon;
      case 'compatibility': return HeartIcon;
      case 'forecast': return CalendarIcon;
      default: return BookOpenIcon;
    }
  };

  const getAnalysisColor = (type: string) => {
    switch (type) {
      case 'natal': return 'from-purple-600 to-blue-600';
      case 'compatibility': return 'from-pink-600 to-red-600';
      case 'forecast': return 'from-amber-600 to-orange-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAnalyses = analyses
    .filter(analysis => {
      if (filterType !== 'all' && analysis.type !== filterType) return false;
      if (searchTerm && !analysis.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !analysis.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !analysis.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-cosmic relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-6 shadow-xl border border-white border-opacity-30">
              <BookOpenIcon className="w-16 h-16 text-yellow-300" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Your Astrological Library
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto drop-shadow-md">
            Access all your personalized astrological analyses and insights
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white border-opacity-30">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{analyses.length}</div>
              <div className="text-gray-200 text-sm">Total Analyses</div>
            </div>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white border-opacity-30">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300 mb-2">
                {analyses.filter(a => a.type === 'natal').length}
              </div>
              <div className="text-gray-200 text-sm">Natal Charts</div>
            </div>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white border-opacity-30">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-300 mb-2">
                {analyses.filter(a => a.type === 'compatibility').length}
              </div>
              <div className="text-gray-200 text-sm">Compatibility</div>
            </div>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white border-opacity-30">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-300 mb-2">
                {analyses.filter(a => a.type === 'forecast').length}
              </div>
              <div className="text-gray-200 text-sm">Forecasts</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white border-opacity-50 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search analyses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="all">All Types</option>
                <option value="natal">Natal Charts</option>
                <option value="compatibility">Compatibility</option>
                <option value="forecast">Forecasts</option>
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Analyses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAnalyses.map((analysis) => {
            const Icon = getAnalysisIcon(analysis.type);
            const colorClass = getAnalysisColor(analysis.type);
            
            return (
              <div
                key={analysis.id}
                className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white border-opacity-50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${colorClass} rounded-full shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {analysis.status === 'processing' ? (
                      <div className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mr-1"></div>
                        Processing
                      </div>
                    ) : analysis.status === 'failed' ? (
                      <div className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Failed</div>
                    ) : (
                      <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Complete</div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">{analysis.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{analysis.description}</p>
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{analysis.preview}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {analysis.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {analysis.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      +{analysis.tags.length - 3} more
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    {formatDate(analysis.createdAt)}
                  </div>
                  <div className="flex items-center space-x-2">
                    {analysis.rating && (
                      <div className="flex items-center">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{analysis.rating}</span>
                      </div>
                    )}
                    <div className="flex space-x-1">
                      <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                        <DownloadIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                        <ShareIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAnalyses.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white border-opacity-30 max-w-md mx-auto">
              <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No analyses found</h3>
              <p className="text-gray-200 mb-6">Try adjusting your search or filters</p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-gray-800"
              >
                Clear Filters
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
          from { transform: translateY(0px); }
          to { transform: translateY(-2000px); }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default LibraryPage;
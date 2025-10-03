import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import {
  SparklesIcon,
  BookOpenIcon,
  CreditCardIcon,
  ChartBarIcon,
  ClockIcon,
  StarIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

const DashboardHome: React.FC = () => {
  const { user } = useAuth();

  // Mock data for demonstration
  const stats = [
    {
      name: 'Total Generations',
      value: '24',
      change: '+12%',
      changeType: 'increase' as const,
      icon: SparklesIcon,
    },
    {
      name: 'Library Items',
      value: '18',
      change: '+2',
      changeType: 'increase' as const,
      icon: BookOpenIcon,
    },
    {
      name: 'Credits Spent',
      value: '156',
      change: '+23',
      changeType: 'increase' as const,
      icon: CreditCardIcon,
    },
    {
      name: 'Average Rating',
      value: '4.8',
      change: '+0.1',
      changeType: 'increase' as const,
      icon: StarIcon,
    },
  ];

  const recentGenerations = [
    {
      id: 1,
      type: 'Natal Chart',
      title: 'Analysis for Anna S.',
      date: '2024-01-15',
      status: 'completed',
      creditsUsed: 8,
    },
    {
      id: 2,
      type: 'Compatibility',
      title: 'Compatibility John & Maria',
      date: '2024-01-14',
      status: 'completed',
      creditsUsed: 12,
    },
    {
      id: 3,
      type: 'Forecast',
      title: 'Monthly Forecast',
      date: '2024-01-14',
      status: 'completed',
      creditsUsed: 6,
    },
  ];

  const quickActions = [
    {
      name: 'Create Natal Chart',
      description: 'Get detailed personality analysis',
      href: '/dashboard/generate?type=natal_chart',
      icon: SparklesIcon,
      color: 'bg-primary-500',
      credits: 8,
    },
    {
      name: 'Compatibility Analysis',
      description: 'Discover partner compatibility',
      href: '/dashboard/generate?type=compatibility',
      icon: ChartBarIcon,
      color: 'bg-secondary-500',
      credits: 12,
    },
    {
      name: 'Astrological Forecast',
      description: 'Get predictions for any period',
      href: '/dashboard/generate?type=forecast',
      icon: ClockIcon,
      color: 'bg-accent-500',
      credits: 6,
    },
  ];

  const needsVerification = user && !user.is_verified;
  const lowCredits = user && user.credits < 10;

  return (
    <div className="space-y-8 min-h-screen bg-cosmic-nebula-1 bg-cover bg-center bg-fixed relative">
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40 pointer-events-none"></div>
      
      <div className="relative z-10 space-y-8">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
          Welcome back, {user?.full_name}! 👋
        </h1>
        <p className="text-lg text-gray-200 drop-shadow-md">
          Here's an overview of your astrological activity
        </p>
      </div>

      {/* Alerts */}
      {(needsVerification || lowCredits) && (
        <div className="space-y-4">
          {needsVerification && (
            <div className="rounded-md bg-warning-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-warning-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-warning-800">
                    Verify your email address
                  </h3>
                  <div className="mt-2 text-sm text-warning-700">
                    <p>
                      Please verify your email address to access all features.
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="-mx-2 -my-1.5 flex">
                      <Button variant="outline" size="sm">
                        Resend verification
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {lowCredits && (
            <div className="rounded-md bg-error-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CreditCardIcon className="h-5 w-5 text-error-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-error-800">
                    Low credits
                  </h3>
                  <div className="mt-2 text-sm text-error-700">
                    <p>
                      You have {user?.credits} credits remaining. Top up your balance to continue generating content.
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="-mx-2 -my-1.5 flex">
                      <Link to="/dashboard/billing">
                        <Button variant="primary" size="sm">
                          Add credits
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 px-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white bg-opacity-90 backdrop-blur-sm overflow-hidden shadow-lg rounded-lg border border-white border-opacity-20 hover:bg-opacity-95 transition-all duration-300"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-success-600' : 'text-error-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="px-6">
        <h2 className="text-2xl font-bold text-white mb-8 text-center drop-shadow-lg">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="group relative bg-white bg-opacity-90 backdrop-blur-sm p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-xl border border-white border-opacity-30 hover:bg-opacity-95 hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <div>
                <span className={`rounded-lg inline-flex p-3 ${action.color} text-white`}>
                  <action.icon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                  {action.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {action.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-gray-900 font-medium">
                    {action.credits} credits
                  </span>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Generations */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">Recent Generations</h2>
          <Link to="/dashboard/library">
            <Button variant="outline" size="sm" className="bg-white bg-opacity-90 hover:bg-opacity-100 transition-all">
              View all
            </Button>
          </Link>
        </div>
        
        <div className="bg-white bg-opacity-90 backdrop-blur-sm shadow-xl overflow-hidden sm:rounded-xl border border-white border-opacity-30">
          <ul className="divide-y divide-gray-200">
            {recentGenerations.map((generation) => (
              <li key={generation.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <SparklesIcon className="h-5 w-5 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {generation.title}
                        </p>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {generation.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{generation.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      -{generation.creditsUsed} credits
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                      Completed
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Credits Status */}
      <div className="mx-6 bg-mystical-space bg-cover bg-center rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-cosmic bg-opacity-80 rounded-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold drop-shadow-lg">Credit Balance</h3>
              <p className="text-white mt-2 drop-shadow-md">
                Current balance: <span className="font-bold text-3xl text-yellow-300 drop-shadow-lg">{user?.credits || 0}</span> credits
              </p>
            </div>
            <Link to="/dashboard/billing">
              <Button variant="secondary" className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm border-white border-opacity-30 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                Add credits
              </Button>
            </Link>
          </div>
          
          <div className="mt-6 bg-white bg-opacity-20 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-yellow-300 to-amber-400 h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${Math.min(((user?.credits || 0) / 100) * 100, 100)}%` }}
            />
          </div>
          
          <p className="text-white text-sm mt-3 drop-shadow-md">
            We recommend maintaining a balance of at least 50 credits
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default DashboardHome;
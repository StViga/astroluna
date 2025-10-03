import React, { useState, useEffect } from 'react';
import { useAuth } from '@/store/authStore';
import { useProfile } from '@/store/profileStore';
import Button from '@/components/ui/Button';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import {
  UserCircleIcon,
  MapPinIcon,
  ClockIcon,
  CalendarIcon,
  StarIcon,
  GlobeAltIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  EyeIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface ProfileData {
  // Basic Info
  fullName: string;
  email: string;
  phone?: string;
  
  // Astrological Data
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  timeZone: string;
  
  // Preferences
  language: 'en' | 'uk';
  currency: 'USD' | 'EUR' | 'UAH';
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    shareUsageData: boolean;
  };
}

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { 
    astrologicalProfile, 
    updateAstrologicalProfile, 
    isLoading: profileLoading,
    hasBirthData 
  } = useProfile();
  
  const [activeTab, setActiveTab] = useState<'personal' | 'astrological' | 'preferences' | 'security'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    birthDate: astrologicalProfile?.birthDate || '1990-05-15',
    birthTime: astrologicalProfile?.birthTime || '14:30',
    birthPlace: astrologicalProfile?.birthPlace || 'New York, NY, USA',
    timeZone: astrologicalProfile?.timeZone || 'America/New_York',
    language: user?.language || 'en',
    currency: user?.currency || 'USD',
    notifications: {
      email: true,
      push: true,
      marketing: false
    },
    privacy: {
      profileVisibility: 'private',
      shareUsageData: true
    }
  });

  // Update form data when astrological profile changes
  useEffect(() => {
    if (astrologicalProfile) {
      setProfileData(prev => ({
        ...prev,
        birthDate: astrologicalProfile.birthDate || prev.birthDate,
        birthTime: astrologicalProfile.birthTime || prev.birthTime,
        birthPlace: astrologicalProfile.birthPlace || prev.birthPlace,
        timeZone: astrologicalProfile.timeZone || prev.timeZone
      }));
    }
  }, [astrologicalProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Update personal info
      await updateProfile({
        full_name: profileData.fullName,
        phone: profileData.phone,
        language: profileData.language,
        currency: profileData.currency
      });

      // Update astrological profile
      await updateAstrologicalProfile({
        birthDate: profileData.birthDate,
        birthTime: profileData.birthTime,
        birthPlace: profileData.birthPlace,
        timeZone: profileData.timeZone
      });
      
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: UserCircleIcon },
    { id: 'astrological', label: 'Birth Data', icon: StarIcon },
    { id: 'preferences', label: 'Preferences', icon: CogIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon }
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            disabled={!isEditing}
            value={profileData.fullName}
            onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              !isEditing ? 'bg-gray-50' : ''
            }`}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            disabled
            value={profileData.email}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            disabled={!isEditing}
            value={profileData.phone}
            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              !isEditing ? 'bg-gray-50' : ''
            }`}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            disabled={!isEditing}
            value={profileData.language}
            onChange={(e) => setProfileData(prev => ({ ...prev, language: e.target.value as 'en' | 'uk' }))}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              !isEditing ? 'bg-gray-50' : ''
            }`}
          >
            <option value="en">English</option>
            <option value="uk">Українська</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderAstrologicalData = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          <StarIcon className="w-5 h-5 inline mr-2" />
          Your Birth Information
        </h3>
        <p className="text-gray-600 text-sm">
          This data is used to generate accurate astrological analyses and natal charts.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CalendarIcon className="w-4 h-4 inline mr-2" />
            Birth Date
          </label>
          <input
            type="date"
            disabled={!isEditing}
            value={profileData.birthDate}
            onChange={(e) => setProfileData(prev => ({ ...prev, birthDate: e.target.value }))}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              !isEditing ? 'bg-gray-50' : ''
            }`}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ClockIcon className="w-4 h-4 inline mr-2" />
            Birth Time
          </label>
          <input
            type="time"
            disabled={!isEditing}
            value={profileData.birthTime}
            onChange={(e) => setProfileData(prev => ({ ...prev, birthTime: e.target.value }))}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              !isEditing ? 'bg-gray-50' : ''
            }`}
          />
          <p className="text-xs text-gray-500 mt-1">Exact time is crucial for accurate analysis</p>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPinIcon className="w-4 h-4 inline mr-2" />
            Birth Place
          </label>
          <input
            type="text"
            disabled={!isEditing}
            placeholder="City, State/Province, Country"
            value={profileData.birthPlace}
            onChange={(e) => setProfileData(prev => ({ ...prev, birthPlace: e.target.value }))}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              !isEditing ? 'bg-gray-50' : ''
            }`}
          />
          <p className="text-xs text-gray-500 mt-1">Include city and country for accurate coordinates</p>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <GlobeAltIcon className="w-4 h-4 inline mr-2" />
            Time Zone
          </label>
          <select
            disabled={!isEditing}
            value={profileData.timeZone}
            onChange={(e) => setProfileData(prev => ({ ...prev, timeZone: e.target.value }))}
            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              !isEditing ? 'bg-gray-50' : ''
            }`}
          >
            <option value="America/New_York">Eastern Time (UTC-5/-4)</option>
            <option value="America/Chicago">Central Time (UTC-6/-5)</option>
            <option value="America/Denver">Mountain Time (UTC-7/-6)</option>
            <option value="America/Los_Angeles">Pacific Time (UTC-8/-7)</option>
            <option value="Europe/London">London (UTC+0/+1)</option>
            <option value="Europe/Kiev">Kyiv (UTC+2/+3)</option>
            <option value="Europe/Moscow">Moscow (UTC+3)</option>
          </select>
        </div>
      </div>
      
      {/* Birth Chart Preview */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-800">Quick Chart Preview</h4>
          {hasBirthData && astrologicalProfile?.isVerified && (
            <div className="flex items-center text-green-600 text-sm">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Calculated
            </div>
          )}
        </div>
        
        {hasBirthData && astrologicalProfile ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl mb-1">☉</div>
              <div className="text-xs text-gray-600">Sun Sign</div>
              <div className="font-semibold text-sm">
                {astrologicalProfile.sunSign || 'Calculating...'}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl mb-1">☽</div>
              <div className="text-xs text-gray-600">Moon Sign</div>
              <div className="font-semibold text-sm">
                {astrologicalProfile.moonSign || 'Calculating...'}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl mb-1">↗</div>
              <div className="text-xs text-gray-600">Rising</div>
              <div className="font-semibold text-sm">
                {astrologicalProfile.risingSign || 'Calculating...'}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <StarIcon className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Complete your birth information to see your astrological chart
            </p>
            {!hasBirthData && (
              <div className="text-xs text-gray-400">
                Missing: {!profileData.birthDate ? 'Birth Date ' : ''}
                {!profileData.birthTime ? 'Birth Time ' : ''}
                {!profileData.birthPlace ? 'Birth Place' : ''}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-8">
      {/* Notifications */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          <BellIcon className="w-5 h-5 inline mr-2" />
          Notification Preferences
        </h3>
        <div className="space-y-4 bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">Email Notifications</div>
              <div className="text-sm text-gray-600">Receive updates via email</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                disabled={!isEditing}
                checked={profileData.notifications.email}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, email: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">Push Notifications</div>
              <div className="text-sm text-gray-600">Get instant alerts</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                disabled={!isEditing}
                checked={profileData.notifications.push}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, push: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>
      
      {/* Privacy */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          <EyeIcon className="w-5 h-5 inline mr-2" />
          Privacy Settings
        </h3>
        <div className="space-y-4 bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">Profile Visibility</div>
              <div className="text-sm text-gray-600">Who can see your profile</div>
            </div>
            <select
              disabled={!isEditing}
              value={profileData.privacy.profileVisibility}
              onChange={(e) => setProfileData(prev => ({
                ...prev,
                privacy: { ...prev.privacy, profileVisibility: e.target.value as 'public' | 'private' }
              }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">Share Usage Data</div>
              <div className="text-sm text-gray-600">Help improve our services</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                disabled={!isEditing}
                checked={profileData.privacy.shareUsageData}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, shareUsageData: e.target.checked }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>
      
      {/* Currency */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Currency & Region
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <LanguageSwitcher className="" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Currency
            </label>
            <select
              disabled={!isEditing}
              value={profileData.currency}
              onChange={(e) => setProfileData(prev => ({ ...prev, currency: e.target.value as 'USD' | 'EUR' | 'UAH' }))}
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                !isEditing ? 'bg-gray-50' : ''
              }`}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="UAH">UAH - Ukrainian Hryvnia</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          <ShieldCheckIcon className="w-5 h-5 inline mr-2" />
          Account Security
        </h3>
        <p className="text-gray-600 text-sm">
          Manage your account security settings and authentication methods.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <KeyIcon className="w-6 h-6 text-gray-400 mr-3" />
              <div>
                <div className="font-medium text-gray-800">Password</div>
                <div className="text-sm text-gray-600">Last changed 2 months ago</div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast('Password change coming soon!')}
            >
              Change Password
            </Button>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ShieldCheckIcon className="w-6 h-6 text-green-500 mr-3" />
              <div>
                <div className="font-medium text-gray-800">Two-Factor Authentication</div>
                <div className="text-sm text-gray-600">Not enabled</div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast('2FA setup coming soon!')}
            >
              Enable 2FA
            </Button>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BellIcon className="w-6 h-6 text-blue-500 mr-3" />
              <div>
                <div className="font-medium text-gray-800">Login Notifications</div>
                <div className="text-sm text-gray-600">Get notified of new logins</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-cosmic relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-6 shadow-xl border border-white border-opacity-30">
              <UserCircleIcon className="w-16 h-16 text-yellow-300" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Profile Settings
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto drop-shadow-md">
            Manage your personal information and astrological preferences
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white border-opacity-50 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h2>
              
              <div className="flex items-center space-x-3">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="ghost"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      loading={isSaving}
                    >
                      Save Changes
                    </Button>
                  </>
                )}
              </div>
            </div>

            {activeTab === 'personal' && renderPersonalInfo()}
            {activeTab === 'astrological' && renderAstrologicalData()}
            {activeTab === 'preferences' && renderPreferences()}
            {activeTab === 'security' && renderSecurity()}
          </div>
        </div>
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
      `}</style>
    </div>
  );
};

export default ProfilePage;
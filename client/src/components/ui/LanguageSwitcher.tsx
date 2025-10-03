import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, LanguageIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { classNames } from '@/utils/classNames';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'EN', name: 'English', flag: '🇺🇸' },
  { code: 'ES', name: 'Español', flag: '🇪🇸' },
  { code: 'DE', name: 'Deutsch', flag: '🇩🇪' }
];

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'sidebar';
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'default',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setIsOpen(false);
    // TODO: Implement actual language switching logic
    console.log(`Language switched to: ${language.code}`);
  };

  // Compact variant for navbar/header
  if (variant === 'compact') {
    return (
      <div className={classNames('relative inline-block text-left', className)} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center px-3 py-2 border border-white border-opacity-20 rounded-xl bg-white bg-opacity-10 backdrop-blur-md text-white hover:bg-opacity-20 transition-all duration-200 group"
        >
          <GlobeAltIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">{selectedLanguage.code}</span>
          <ChevronDownIcon 
            className={classNames(
              'h-4 w-4 ml-1 transition-transform duration-200',
              isOpen ? 'rotate-180' : ''
            )} 
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 origin-top-right bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="py-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language)}
                  className={classNames(
                    'w-full px-4 py-3 text-left text-sm hover:bg-white hover:bg-opacity-10 transition-colors duration-200 flex items-center space-x-3',
                    selectedLanguage.code === language.code
                      ? 'bg-white bg-opacity-10 text-yellow-300'
                      : 'text-white'
                  )}
                >
                  <span className="text-lg">{language.flag}</span>
                  <div>
                    <div className="font-medium">{language.name}</div>
                    <div className="text-xs text-gray-300">{language.code}</div>
                  </div>
                  {selectedLanguage.code === language.code && (
                    <div className="ml-auto w-2 h-2 bg-yellow-400 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Sidebar variant
  if (variant === 'sidebar') {
    return (
      <div className={classNames('relative', className)} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center px-3 py-2 border border-white border-opacity-20 rounded-xl bg-white bg-opacity-5 backdrop-blur-md text-white hover:bg-opacity-10 transition-all duration-200 group"
        >
          <LanguageIcon className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium">{selectedLanguage.name}</div>
            <div className="text-xs text-gray-400">{selectedLanguage.code}</div>
          </div>
          <ChevronDownIcon 
            className={classNames(
              'h-4 w-4 transition-transform duration-200',
              isOpen ? 'rotate-180' : ''
            )} 
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-2 w-full origin-top bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="py-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language)}
                  className={classNames(
                    'w-full px-4 py-3 text-left text-sm hover:bg-white hover:bg-opacity-10 transition-colors duration-200 flex items-center space-x-3',
                    selectedLanguage.code === language.code
                      ? 'bg-white bg-opacity-10 text-yellow-300'
                      : 'text-white'
                  )}
                >
                  <span className="text-lg">{language.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{language.name}</div>
                    <div className="text-xs text-gray-300">{language.code}</div>
                  </div>
                  {selectedLanguage.code === language.code && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default variant for profile page
  return (
    <div className={classNames('relative', className)} ref={dropdownRef}>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Language
        </label>
      </div>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm hover:border-purple-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200"
      >
        <div className="flex items-center space-x-3">
          <span className="text-lg">{selectedLanguage.flag}</span>
          <div className="text-left">
            <div className="font-medium text-gray-900">{selectedLanguage.name}</div>
            <div className="text-sm text-gray-500">{selectedLanguage.code}</div>
          </div>
        </div>
        <ChevronDownIcon 
          className={classNames(
            'h-5 w-5 text-gray-400 transition-transform duration-200',
            isOpen ? 'rotate-180' : ''
          )} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full origin-top bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="py-2">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language)}
                className={classNames(
                  'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3',
                  selectedLanguage.code === language.code
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-900'
                )}
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{language.name}</div>
                  <div className="text-sm text-gray-500">{language.code}</div>
                </div>
                {selectedLanguage.code === language.code && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon
} from '@heroicons/react/24/outline';

const RegisterPageNew: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();
  
  // ALWAYS empty initial state
  const getEmptyFormData = () => ({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    subscribeNewsletter: true
  });

  const [formData, setFormData] = useState(getEmptyFormData());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Nuclear option: clear everything aggressively
  useEffect(() => {
    // Reset form data
    setFormData(getEmptyFormData());
    
    // Clear DOM inputs after delay
    const timers: NodeJS.Timeout[] = [];

    // Multiple attempts to clear autofill
    [100, 500, 1000, 2000].forEach(delay => {
      const timer = setTimeout(() => {
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
        inputs.forEach((input) => {
          if (input instanceof HTMLInputElement) {
            input.value = '';
            input.setAttribute('value', '');
            // Force React to re-render
            const event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);
          }
        });
      }, delay);
      timers.push(timer);
    });

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        subscribeNewsletter: formData.subscribeNewsletter
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleChange = (field: string) => (value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Mobile branding (when right panel is hidden) */}
      <div className="xl:hidden text-center py-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          <span className="text-3xl mr-2">🌟</span>
          AstroLuna
        </h1>
        <p className="text-primary-600 font-medium">AI-Powered Astrology Platform</p>
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Create Your Account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Join AstroLuna and discover your cosmic potential
        </p>
      </div>

      <form 
        className="space-y-6" 
        onSubmit={handleSubmit} 
        autoComplete="off"
        data-lpignore="true"
      >
        {error && (
          <div className="rounded-md bg-error-50 p-4">
            <div className="text-sm text-error-700">
              {error}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Full Name <span className="text-error-500 ml-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName')(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 pl-10 py-2.5 text-sm placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500"
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
            />
          </div>
          {validationErrors.fullName && (
            <p className="text-sm text-error-600 mt-1.5">{validationErrors.fullName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email Address <span className="text-error-500 ml-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleChange('email')(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 pl-10 py-2.5 text-sm placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500"
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
            />
          </div>
          {validationErrors.email && (
            <p className="text-sm text-error-600 mt-1.5">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Password <span className="text-error-500 ml-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => handleChange('password')(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2.5 text-sm placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500"
              autoComplete="new-password"
              data-lpignore="true"
              data-form-type="other"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1.5">Must be at least 8 characters long</p>
          {validationErrors.password && (
            <p className="text-sm text-error-600 mt-1.5">{validationErrors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirm Password <span className="text-error-500 ml-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword')(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2.5 text-sm placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500"
              autoComplete="new-password"
              data-lpignore="true"
              data-form-type="other"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {validationErrors.confirmPassword && (
            <p className="text-sm text-error-600 mt-1.5">{validationErrors.confirmPassword}</p>
          )}
        </div>

        {/* Optional newsletter signup */}
        <div className="flex items-start">
          <input
            id="subscribe-newsletter"
            name="subscribe-newsletter"
            type="checkbox"
            checked={formData.subscribeNewsletter}
            onChange={(e) => handleChange('subscribeNewsletter')(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
          />
          <label htmlFor="subscribe-newsletter" className="ml-3 block text-sm text-gray-900">
            Send me astrological insights and platform updates (optional)
          </label>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={!formData.email || !formData.password || !formData.fullName}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="text-primary-600 hover:text-primary-500 underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-primary-600 hover:text-primary-500 underline">
            Privacy Policy
          </Link>
        </div>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
};

export default RegisterPageNew;
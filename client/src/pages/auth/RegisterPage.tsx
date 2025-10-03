import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    agreeTerms: false,
    subscribeNewsletter: true
  });

  // Force re-render with empty values to combat autofill
  const [forceRender, setForceRender] = useState(0);

  // Clear form ONLY on initial mount, then leave it alone
  React.useEffect(() => {
    // Only clear once on mount
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      birthDate: '',
      birthTime: '',
      birthPlace: '',
      agreeTerms: false,
      subscribeNewsletter: true
    });
  }, []);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        birthPlace: formData.birthPlace,
        subscribeNewsletter: formData.subscribeNewsletter
      });
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the store
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

      <form className="space-y-6" onSubmit={handleSubmit} key="register-form" autoComplete="off">
        {error && (
          <div className="rounded-md bg-error-50 p-4">
            <div className="text-sm text-error-700">
              {error}
            </div>
          </div>
        )}
        
        {/* Show validation errors summary */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="rounded-md bg-error-50 p-4">
            <div className="text-sm text-error-700">
              <p className="font-medium mb-2">Please fix the following errors:</p>
              <ul className="list-disc list-inside space-y-1">
                {Object.values(validationErrors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <Input
          type="text"
          label="Full Name"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={handleChange('fullName')}
          error={validationErrors.fullName}
          required
          autoComplete="off"
          startIcon={<UserIcon className="h-5 w-5" />}
        />

        <Input
          type="email"
          label="Email Address"
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleChange('email')}
          error={validationErrors.email}
          required
          autoComplete="off"
          startIcon={<EnvelopeIcon className="h-5 w-5" />}
        />



        <Input
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleChange('password')}
          error={validationErrors.password}
          required
          autoComplete="new-password"
          startIcon={<LockClosedIcon className="h-5 w-5" />}
          endIcon={
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
          }
          helperText="Must be at least 8 characters long"
        />

        <Input
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={validationErrors.confirmPassword}
          required
          autoComplete="new-password"
          startIcon={<LockClosedIcon className="h-5 w-5" />}
          endIcon={
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
          }
        />

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

export default RegisterPage;
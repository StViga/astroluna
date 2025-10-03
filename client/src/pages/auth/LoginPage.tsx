import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the store
      console.error('Login error:', error);
    }
  };

  const handleChange = (field: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
          Welcome back!
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to your AstroLuna account
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-error-50 p-4">
            <div className="text-sm text-error-700">
              {error}
            </div>
          </div>
        )}

        <Input
          type="email"
          label="Email Address"
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleChange('email')}
          required
          startIcon={<EnvelopeIcon className="h-5 w-5" />}
        />

        <Input
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange('password')}
          required
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
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={formData.remember}
              onChange={(e) => setFormData(prev => ({ ...prev, remember: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={!formData.email || !formData.password}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign up
            </Link>
          </span>
        </div>
      </form>

      {/* Demo credentials */}
      <div className="bg-gradient-cosmic bg-opacity-10 rounded-xl p-6 border border-primary-200">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
          <span className="mr-2">🌟</span>
          Demo Access
        </h3>
        <div className="text-sm text-gray-700 space-y-2 mb-4">
          <div className="bg-white rounded-lg p-3">
            <strong>Email:</strong> <code className="text-primary-600">demo@astroluna.com</code>
          </div>
          <div className="bg-white rounded-lg p-3">
            <strong>Password:</strong> <code className="text-primary-600">demo123</code>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-primary-300 text-primary-700 hover:bg-primary-50"
          onClick={() => {
            setFormData({
              email: 'demo@astroluna.com',
              password: 'demo123',
              remember: false
            });
          }}
        >
          ✨ Use Demo Credentials
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
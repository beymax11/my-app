"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';

const ResetPasswordPage: React.FC = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isValidSession, setIsValidSession] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user has a valid session for password reset
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        const { user } = await response.json();
        if (user) {
          setIsValidSession(true);
        } else {
          // Redirect to login if no valid session
          router.push('/');
        }
      } catch (error) {
        console.error('Session check error:', error);
        router.push('/');
      }
    };

    checkSession();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setMessage('Password has been successfully reset! You can now log in with your new password.');
        setFormData({ password: '', confirmPassword: '' });
        
        // Redirect to home page after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setMessage(result.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setMessage('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Icon icon="mdi:loading" className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          {message && (
            <div className={`mb-6 text-sm p-4 rounded-lg ${
              message.includes('successfully') 
                ? 'text-green-700 bg-green-50 border border-green-200' 
                : 'text-red-600 bg-red-50 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 text-base border-2 bg-white text-gray-900 placeholder-gray-400 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 rounded-lg`}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 transition-colors rounded-r-lg"
                >
                  <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} className="w-5 h-5 text-gray-500" />
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-12 text-base border-2 bg-white text-gray-900 placeholder-gray-400 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 rounded-lg`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 transition-colors rounded-r-lg"
                >
                  <Icon icon={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"} className="w-5 h-5 text-gray-500" />
                </button>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 px-6 text-base font-medium hover:bg-gray-800 transition-all duration-300 flex items-center justify-center disabled:opacity-50 rounded-lg"
            >
              {isLoading ? (
                <>
                  <Icon icon="mdi:loading" className="w-5 h-5 animate-spin mr-3" />
                  <span>Resetting Password...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;

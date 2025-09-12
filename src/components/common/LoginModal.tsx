"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useUserContext } from '../../context/UserContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageError, setImageError] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, register } = useUserContext();
  const slides = ['slide.jpg', 'slide2.jpg', 'slide3.jpg'];

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        confirmPassword: ''
      });
      setErrors({});
    }
  }, [isOpen, isLogin]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Slideshow timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const handleImageError = () => {
    setImageError(true);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

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

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
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
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phoneNumber || undefined
        });
      }
      onClose();
    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({ general: 'Authentication failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    setErrors({ general: `Social login (${provider}) is not available in demo mode.` });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0 z-50">
        <div className="relative overflow-hidden rounded-2xl text-left sm:my-8 w-full max-w-5xl z-50 shadow-2xl" style={{ height: '600px', backgroundColor: '#FFFFFF' }}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 z-20" aria-label="Close modal">
            <Icon icon="fa6-solid:xmark" className="w-5 h-5 text-gray-500" />
          </button>
          <div className="relative z-10 flex flex-col lg:flex-row h-full">
            {/* Left side - Auth Form */}
            <div className="w-full lg:w-1/2 p-6 md:p-8 flex flex-col">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {isLogin ? 'Log in to your account' : 'Create an IZAJ account'}
                </h2>
                {errors.general && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                    {errors.general}
                  </div>
                )}
              </div>

              {isLogin && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="w-full flex items-center justify-center px-3 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Icon icon="mdi:google" className="w-4 h-4 mr-2" />
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('facebook')}
                    className="w-full flex items-center justify-center px-3 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Icon icon="mdi:facebook" className="w-4 h-4 mr-2 text-blue-600" />
                    Facebook
                  </button>
                </div>
              )}

              {isLogin && (
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-sm font-medium text-gray-600">Or continue with email</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Icon icon="mdi:account" className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`w-full pl-9 pr-9 py-2.5 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm`}
                          placeholder="Enter first name"
                        />
                        {errors.firstName && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center group">
                            <Icon icon="mdi:information" className="w-4 h-4 text-red-500" />
                            <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-red-50 text-red-600 text-xs p-2 rounded shadow-lg whitespace-nowrap z-50">
                              {errors.firstName}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Icon icon="mdi:account" className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`w-full pl-9 pr-9 py-2.5 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm`}
                          placeholder="Enter last name"
                        />
                        {errors.lastName && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center group">
                            <Icon icon="mdi:information" className="w-4 h-4 text-red-500" />
                            <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-red-50 text-red-600 text-xs p-2 rounded shadow-lg whitespace-nowrap z-50">
                              {errors.lastName}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon icon="mdi:phone" className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className={`w-full pl-9 pr-9 py-2.5 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm`}
                        placeholder="Enter phone number"
                        pattern="[0-9]{11}"
                        maxLength={11}
                      />
                      {errors.phoneNumber && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center group">
                          <Icon icon="mdi:information" className="w-4 h-4 text-red-500" />
                          <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-red-50 text-red-600 text-xs p-2 rounded shadow-lg whitespace-nowrap z-50">
                            {errors.phoneNumber}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon icon="mdi:email" className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-9 py-2.5 border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm`}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center group">
                        <Icon icon="mdi:information" className="w-4 h-4 text-red-500" />
                        <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-red-50 text-red-600 text-xs p-2 rounded shadow-lg whitespace-nowrap z-50">
                          {errors.email}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {!isLogin ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Icon icon="mdi:lock" className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full pl-9 pr-9 py-2.5 border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm`}
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </button>
                        {errors.password && (
                          <div className="absolute inset-y-0 right-8 pr-3 flex items-center group">
                            <Icon icon="mdi:information" className="w-4 h-4 text-red-500" />
                            <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-red-50 text-red-600 text-xs p-2 rounded shadow-lg whitespace-nowrap z-50">
                              {errors.password}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Icon icon="mdi:lock-check" className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full pl-9 pr-9 py-2.5 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm`}
                          placeholder="Confirm password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <Icon icon={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"} className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </button>
                        {errors.confirmPassword && (
                          <div className="absolute inset-y-0 right-8 pr-3 flex items-center group">
                            <Icon icon="mdi:information" className="w-4 h-4 text-red-500" />
                            <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-red-50 text-red-600 text-xs p-2 rounded shadow-lg whitespace-nowrap z-50">
                              {errors.confirmPassword}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon icon="mdi:lock" className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-9 pr-9 py-2.5 border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      </button>
                      {errors.password && (
                        <div className="absolute inset-y-0 right-8 pr-3 flex items-center group">
                          <Icon icon="mdi:information" className="w-4 h-4 text-red-500" />
                          <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-red-50 text-red-600 text-xs p-2 rounded shadow-lg whitespace-nowrap z-50">
                            {errors.password}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-3.5 w-3.5 text-black focus:ring-black border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-gray-700">
                        Remember me
                      </label>
                    </div>
                    <a href="#" className="font-medium text-black hover:text-gray-700">
                      Forgot password?
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white py-2.5 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 text-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                      <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                    </>
                  ) : (
                    <>
                      <Icon icon={isLogin ? "mdi:login" : "mdi:account-plus"} className="w-4 h-4" />
                      <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    </>
                  )}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-sm font-medium text-gray-600">
                      {isLogin ? 'New at IZAJ?' : 'Already have an account?'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleMode}
                  className="w-full bg-white text-black py-2.5 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center space-x-2 border border-gray-300 shadow-sm hover:shadow-md text-sm"
                >
                  <Icon icon={isLogin ? "mdi:account-plus" : "mdi:login"} className="w-4 h-4" />
                  <span>{isLogin ? 'Create Account' : 'Sign In'}</span>
                </button>
              </form>
            </div>

            {/* Right side - Image Slideshow */}
            <div className="w-full lg:w-1/2 relative overflow-hidden bg-gray-100 mt-6 lg:mt-0">
              {!imageError ? (
                <>
                  {slides.map((slide, index) => (
                    <div
                      key={slide}
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        currentSlide === index ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <img
                        src={`/images/${slide}`}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 flex items-center justify-center">
                        <div className="text-center text-white px-8 max-w-2xl">
                          <h2 className="text-5xl font-bold mb-6 text-shadow-lg" style={{ 
                            fontFamily: "'Playfair Display', serif",
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
                          }}>
                            Welcome to IZAJ
                          </h2>
                          <p className="text-xl mb-8 opacity-95 leading-relaxed text-shadow-md" style={{
                            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.4)'
                          }}>
                            {index === 0 ? "Discover our exquisite collection of lighting fixtures" :
                             index === 1 ? "Transform your space with our premium designs" :
                             "Experience luxury lighting at its finest"}
                          </p>
                          <div className="flex items-center justify-center space-x-3">
                            {slides.map((_, dotIndex) => (
                              <div 
                                key={dotIndex}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                  currentSlide === dotIndex ? 'bg-white scale-110' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          currentSlide === index ? 'bg-white' : 'bg-white/50'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8">
                    <Icon icon="mdi:image-off" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Images not found. Please make sure the images are placed in the public/images directory.</p>
                    <p className="text-sm text-gray-400 mt-2">Required images: slide.jpg, slide2.jpg, slide3.jpg</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
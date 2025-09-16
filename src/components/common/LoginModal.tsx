"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
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
  const [showForgot, setShowForgot] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const { login, register } = useUserContext();
  const slides = ['slide.jpg', 'slide2.jpg', 'slide3.jpg'];

  const passwordScore = useMemo(() => {
    const pwd = formData.password;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  }, [formData.password]);

  const passwordStrengthLabel = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'][Math.min(passwordScore, 4)];

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
  const handleFocusTrap = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const container = modalRef.current;
    if (!container) return;
    const focusable = container.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const elements = Array.from(focusable).filter(el => !el.hasAttribute('disabled'));
    if (elements.length === 0) return;
    const first = elements[0];
    const last = elements[elements.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey) {
      if (active === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') handleFocusTrap(e);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, handleFocusTrap]);

  // Slideshow timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isOpen && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [isOpen]);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
            onClick={onClose}
          />
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0 z-50">
            <motion.div
              ref={modalRef}
              initial={{ y: 16, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 16, scale: 0.98, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="relative overflow-hidden rounded-2xl text-left w-full max-w-lg lg:max-w-5xl z-50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-200/60 to-transparent" />
              <div className="relative rounded-2xl bg-white/85 backdrop-blur-md ring-1 ring-black/5 shadow-xl h-auto lg:h-[600px]">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black z-20" aria-label="Close modal">
                  <Icon icon="fa6-solid:xmark" className="w-5 h-5 text-gray-500" />
                </button>
                <div className="relative z-10 flex flex-col lg:flex-row h-full">
                  {/* Left side - Auth Form */}
                  <div className="w-full lg:w-1/2 p-6 md:p-8 flex flex-col">
                    <div className="mb-4">
                      <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl">
                        <button
                          type="button"
                          onClick={() => { setIsLogin(true); setShowForgot(false); setErrors({}); }}
                          className={`${isLogin ? 'bg-white shadow text-gray-900' : 'text-gray-600'} py-2 rounded-lg text-sm font-medium transition-colors`}
                        >
                          Sign in
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsLogin(false); setShowForgot(false); setErrors({}); }}
                          className={`${!isLogin ? 'bg-white shadow text-gray-900' : 'text-gray-600'} py-2 rounded-lg text-sm font-medium transition-colors`}
                        >
                          Create account
                        </button>
                      </div>
                    </div>
                    <div className="text-center mb-4">
                      <h2 id="login-modal-title" className="text-2xl font-bold text-gray-900 mb-1">
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
                          className="w-full flex items-center justify-center px-3 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors active:scale-[.98]"
                        >
                          <Icon icon="mdi:google" className="w-4 h-4 mr-2" />
                          Continue with Google
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSocialLogin('facebook')}
                          className="w-full flex items-center justify-center px-3 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors active:scale-[.98]"
                        >
                          <Icon icon="mdi:facebook" className="w-4 h-4 mr-2 text-blue-600" />
                          Continue with Facebook
                        </button>
                      </div>
                    )}

                    {isLogin && (
                      <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="px-4 bg-white/85 text-sm font-medium text-gray-600">Or continue with email</span>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-black">First Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Icon icon="mdi:account" className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`w-full pl-9 pr-9 py-3 text-[15px] border bg-white text-black placeholder-gray-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm`}
                          placeholder="Enter first name"
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-black">Last Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Icon icon="mdi:account" className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`w-full pl-9 pr-9 py-3 text-[15px] border bg-white text-black placeholder-gray-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm`}
                          placeholder="Enter last name"
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-black">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon icon="mdi:phone" className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className={`w-full pl-9 pr-9 py-3 text-[15px] border bg-white text-black placeholder-gray-500 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm`}
                        placeholder="Enter phone number"
                        pattern="[0-9]{11}"
                        maxLength={11}
                      />
                      {errors.phoneNumber && (
                        <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-black">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon icon="mdi:email" className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      ref={emailInputRef}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-help' : undefined}
                      className={`w-full pl-9 pr-9 py-3 text-[15px] border bg-white text-black placeholder-gray-500 ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm`}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p id="email-help" className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>
                {!isLogin ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-black">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Icon icon="mdi:lock" className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full pl-9 pr-9 py-3 text-[15px] border bg-white text-black placeholder-gray-500 ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm`}
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center p-2 -m-2"
                        >
                          <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </button>
                        {errors.password && (
                          <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                        )}
                        {!errors.password && formData.password && (
                          <div className="mt-2">
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${passwordScore <= 1 ? 'bg-red-500' : passwordScore === 2 ? 'bg-yellow-500' : passwordScore === 3 ? 'bg-lime-500' : 'bg-green-600'}`}
                                style={{ width: `${(passwordScore / 5) * 100}%` }}
                              />
                            </div>
                            <p className="mt-1 text-xs text-gray-600">Strength: {passwordStrengthLabel}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-black">Confirm Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Icon icon="mdi:lock-check" className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full pl-9 pr-9 py-3 text-[15px] border bg-white text-black placeholder-gray-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm`}
                          placeholder="Confirm password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center p-2 -m-2"
                        >
                          <Icon icon={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"} className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </button>
                        {errors.confirmPassword && (
                          <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-black">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon icon="mdi:lock" className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-9 pr-9 py-3 text-[15px] border bg-white text-black placeholder-gray-500 ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-black focus:border-black transition-colors text-sm`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center p-2 -m-2"
                      >
                        <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      </button>
                      {errors.password && (
                        <p className="mt-1 text-xs text-red-600">{errors.password}</p>
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
                      <label htmlFor="remember-me" className="ml-2 block text-black">
                        Remember me
                      </label>
                    </div>
                    <button type="button" onClick={() => setShowForgot(v => !v)} className="font-medium text-black hover:text-gray-700">
                      Forgot password?
                    </button>
                  </div>
                )}
                {isLogin && showForgot && (
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 p-2 rounded">
                    Password reset is not available in demo mode.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gradient-to-r hover:from-black hover:to-zinc-700 transition-colors duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 text-sm disabled:opacity-50 active:scale-[.98]"
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

                <p className="text-[11px] text-gray-500 text-center">
                  By continuing, you agree to IZAJ's{' '}
                  <a className="underline hover:text-gray-700" href="/termofuse">Terms of Use</a> and{' '}
                  <a className="underline hover:text-gray-700" href="/privacypolicy">Privacy Policy</a>.
                </p>

                
              

               
              </form>
            </div>

            {/* Right side - Image Slideshow */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gray-100">
              {!imageError ? (
                <>
                  {slides.map((slide, index) => (
                    <div
                      key={slide}
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        currentSlide === index ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <Image
                        src={`/images/${slide}`}
                        alt={`Slide ${index + 1}`}
                        fill
                        sizes="(max-width:1024px) 100vw, 50vw"
                        className="object-cover"
                        onError={handleImageError as any}
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
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
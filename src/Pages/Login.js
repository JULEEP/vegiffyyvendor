import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import VeggyfyLogo from '../Images/veggifylogo.jpeg';
import { 
  FiCheckCircle, FiX, FiEye, FiEyeOff, FiMail, FiLock, 
  FiRefreshCw, FiClock, FiArrowLeft, FiKey, FiShield,
  FiUsers, FiShoppingBag, FiTrendingUp,
  FiUserPlus
} from 'react-icons/fi';

const LoginPage = () => {
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP State
  const [step, setStep] = useState('login');
  const [otp, setOtp] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [storedOtp, setStoredOtp] = useState('');
  
  // Common State
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupCountdown, setPopupCountdown] = useState(60);
  
  const navigate = useNavigate();
  const otpInputRef = useRef(null);

  // Countdown for success popup
  useEffect(() => {
    let timer;
    if (showSuccessPopup && popupCountdown > 0) {
      timer = setTimeout(() => {
        setPopupCountdown(popupCountdown - 1);
      }, 1000);
    } else if (showSuccessPopup && popupCountdown === 0) {
      handleClosePopup();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccessPopup, popupCountdown]);

  // Countdown for OTP expiry
  useEffect(() => {
    if (step === 'verify-otp' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === 'verify-otp' && countdown === 0) {
      setCanResend(true);
    }
  }, [step, countdown]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('https://api.vegiffyy.com/api/vendor/vendorlogin', {
        email: email.toLowerCase(),
        password
      });

      if (response.data.success) {
        setVendorId(response.data.vendorId);
        setStoredOtp(response.data.otp);
        setStep('verify-otp');
        setSuccess('OTP sent successfully! Please check your email.');
        setOtp('');
        setCountdown(300);
        setCanResend(false);
        
        setTimeout(() => {
          if (otpInputRef.current) {
            otpInputRef.current.focus();
          }
        }, 100);
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    let value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    if (value.length > 4) value = value.substring(0, 4);
    setOtp(value);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length !== 4) {
      setError('Please enter the complete 4-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('https://api.vegiffyy.com/api/vendor/verify-otp', {
        vendorId,
        otp: otp
      });

      if (response.data.success) {
        const vendorData = response.data.vendor;
        
        localStorage.setItem('vendorId', vendorData.id);
        localStorage.setItem('vendorData', JSON.stringify(vendorData));
        localStorage.setItem('restaurantName', vendorData.restaurantName || '');
        localStorage.setItem('vendorEmail', vendorData.email || '');
        localStorage.setItem('vendorPhone', vendorData.mobile || '');
        localStorage.setItem('vendorLocation', vendorData.locationName || '');
        localStorage.setItem('vendorImage', vendorData.image || '');

        setShowSuccessPopup(true);
        setPopupCountdown(60);
        setError('');
      } else {
        setError(response.data.message || 'OTP verification failed');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend && countdown > 0) return;
    
    setResendLoading(true);
    setError('');
    
    try {
      const response = await axios.post('https://api.vegiffyy.com/api/vendor/resend-otp', {
        vendorId
      });

      if (response.data.success) {
        setSuccess('New OTP sent successfully!');
        setStoredOtp(response.data.otp);
        setCountdown(300);
        setCanResend(false);
        setOtp('');
        setTimeout(() => {
          if (otpInputRef.current) {
            otpInputRef.current.focus();
          }
        }, 100);
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleUseDemoOtp = () => {
    if (storedOtp && storedOtp.length === 4) {
      setOtp(storedOtp);
      setSuccess('Demo OTP filled! Click Verify to continue.');
      setTimeout(() => {
        if (otpInputRef.current) {
          otpInputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleBackToLogin = () => {
    setStep('login');
    setError('');
    setSuccess('');
    setOtp('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleClosePopup = () => {
    setShowSuccessPopup(false);
    setPopupCountdown(60);
    navigate('/dashboard');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const SuccessPopup = () => (
    showSuccessPopup && (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white text-center relative">
            <button
              onClick={handleClosePopup}
              className="absolute top-3 right-3 text-white hover:text-green-200 transition-colors"
            >
              <FiX size={20} />
            </button>
            
            <div className="flex justify-center mb-4">
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <FiCheckCircle className="text-3xl" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">
              Welcome to Vegiffy! 🎉
            </h3>
            <p className="text-green-100 text-sm">
              Login successful. Redirecting to dashboard...
            </p>
          </div>
          
          {/* Content */}
          <div className="p-5 text-center">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-yellow-800 font-semibold text-sm mb-1">
                🚀 Ready to Grow Your Business?
              </p>
              <p className="text-gray-700 text-xs">
                Access your restaurant dashboard and start managing orders, menu, and earnings!
              </p>
            </div>
            
            {/* Countdown Timer */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-blue-700 text-xs">
                  Auto redirect in: <span className="font-bold text-blue-800">{formatTime(popupCountdown)}</span>
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${((60 - popupCountdown) / 60) * 100}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-xs text-gray-600">
                  {popupCountdown > 30 ? "Loading dashboard..." : 
                   popupCountdown > 10 ? "Almost there..." : "Redirecting now!"}
                </span>
              </div>
              <button
                onClick={handleClosePopup}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-xs"
              >
                <span>Go to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  const renderLoginForm = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiMail className="text-gray-400" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300"
            placeholder="vendor@example.com"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiLock className="text-gray-400" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300"
            placeholder="••••••••"
            required
            minLength="6"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isLoading}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Signing in...
          </>
        ) : (
          <>
            <FiUsers className="mr-2" />
            Login to Dashboard
          </>
        )}
      </button>

      {/* REGISTER BUTTON */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleRegisterClick}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center shadow-lg"
        >
          <FiUserPlus className="mr-2" />
          Register New Vendor
        </button>
        <p className="text-xs text-center text-gray-500 mt-2">
          New to Vegiffy? Register your restaurant to get started
        </p>
      </div>
    </form>
  );

  const renderOtpVerification = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-5">
      {storedOtp && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 font-medium text-xs">Demo OTP: <span className="font-bold">{storedOtp}</span></p>
            </div>
            <button
              onClick={handleUseDemoOtp}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-0.5 rounded text-xs hover:from-yellow-600 hover:to-orange-600 transition-colors"
            >
              Auto-fill
            </button>
          </div>
        </div>
      )}

      <div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded p-2 text-center">
          <div className="flex items-center justify-center space-x-1.5">
            <FiClock className="text-blue-500" size={12} />
            <span className="text-blue-700 text-xs">
              OTP expires: <span className="font-bold">{formatTime(countdown)}</span>
            </span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
          4-Digit OTP
        </label>
        <input
          ref={otpInputRef}
          type="text"
          inputMode="numeric"
          maxLength="4"
          value={otp}
          onChange={handleOtpChange}
          className="w-full p-3 text-center text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300"
          placeholder="0000"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <button
          type="submit"
          disabled={isLoading || otp.length !== 4}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Verifying...
            </>
          ) : (
            'Verify & Continue'
          )}
        </button>

        <button
          type="button"
          onClick={handleResendOtp}
          disabled={!canResend || resendLoading}
          className={`w-full py-2 border rounded text-sm flex items-center justify-center space-x-1.5 transition-all duration-300 ${
            canResend
              ? 'border-green-500 text-green-600 hover:bg-green-50'
              : 'border-gray-300 text-gray-400 cursor-not-allowed'
          }`}
        >
          {resendLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-green-500 border-solid"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <FiRefreshCw size={12} />
              <span>
                {canResend ? 'Resend OTP' : `Resend in ${formatTime(countdown)}`}
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Form */}
          <div className="w-full lg:w-1/2 p-6 lg:p-8">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">VEGIFFY</h1>
                <p className="text-gray-600 mt-1 text-sm">Vendor Portal</p>
              </div>

              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {step === 'login' ? 'Vendor Login' : 'OTP Verification'}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {step === 'login' 
                    ? 'Sign in to access your restaurant dashboard'
                    : `Enter OTP sent to ${email}`
                  }
                </p>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className={`flex items-center ${step === 'login' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step === 'login' ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'} text-xs`}>
                    1
                  </div>
                  <span className="ml-1.5 text-xs">Login</span>
                </div>
                <div className="w-6 h-px bg-gray-300"></div>
                <div className={`flex items-center ${step === 'verify-otp' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step === 'verify-otp' ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'} text-xs`}>
                    2
                  </div>
                  <span className="ml-1.5 text-xs">OTP</span>
                </div>
              </div>

              {error && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-600 text-xs overflow-hidden">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-3 p-2.5 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-600 text-xs overflow-hidden">
                  <FiCheckCircle className="mr-2 flex-shrink-0" size={12} />
                  {success}
                </div>
              )}

              <div>
                {step === 'login' ? renderLoginForm() : renderOtpVerification()}
              </div>

              {step !== 'login' && (
                <div className="mt-3">
                  <button
                    onClick={handleBackToLogin}
                    className="inline-flex items-center text-xs text-gray-600 hover:text-gray-800"
                  >
                    <FiArrowLeft className="mr-1" size={12} />
                    Back to login
                  </button>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center">
                  <FiShield className="text-green-500 mr-2" size={12} />
                  <p className="text-xs text-gray-500">
                    Secure vendor authentication system
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Logo */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center p-6 lg:p-8">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-64 h-64 bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-center">
                <div className="w-full h-full rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-2xl">
                  <img
                    src={VeggyfyLogo}
                    alt="VEGIFFY Logo"
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      <SuccessPopup />
    </div>
  );
};

export default LoginPage;
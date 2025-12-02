import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import VeggyfyLogo from '../Images/veggifylogo.jpeg';
import { 
  FiCheckCircle, FiX, FiEye, FiEyeOff, FiMail, FiLock, 
  FiRefreshCw, FiClock, FiArrowLeft 
} from 'react-icons/fi';

const LoginPage = () => {
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP State
  const [step, setStep] = useState('login'); // 'login' or 'verify-otp'
  const [otp, setOtp] = useState(['', '', '', '']);
  const [vendorId, setVendorId] = useState('');
  const [storedOtp, setStoredOtp] = useState('');
  
  // Common State
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes for OTP
  const [canResend, setCanResend] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupCountdown, setPopupCountdown] = useState(60);
  
  const navigate = useNavigate();
  const inputRefs = useRef([]);

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

  // Login Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
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
      const response = await axios.post('http://31.97.206.144:5051/api/vendor/vendorlogin', {
        email: email.toLowerCase(),
        password
      });

      if (response.data.success) {
        // Store vendorId for OTP verification
        setVendorId(response.data.vendorId);
        setStoredOtp(response.data.otp);
        
        // Switch to OTP verification step
        setStep('verify-otp');
        setSuccess('OTP sent successfully! Please check your email.');
        
        // Reset OTP fields
        setOtp(['', '', '', '']);
        setCountdown(300);
        setCanResend(false);
        
        // Focus first OTP input
        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
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
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Handlers
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{4}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[3].focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      setError('Please enter the complete 4-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://31.97.206.144:5051/api/vendor/verify-otp', {
        vendorId,
        otp: otpValue
      });

      if (response.data.success) {
        // Store vendor data
        const vendorData = response.data.vendor;
        localStorage.setItem('vendorId', vendorData.id);
        localStorage.setItem('vendorData', JSON.stringify({
          id: vendorData.id,
          restaurantName: vendorData.restaurantName,
          email: vendorData.email,
          mobile: vendorData.mobile,
          locationName: vendorData.locationName,
          image: vendorData.image
        }));
        
        localStorage.setItem('userInfo', JSON.stringify({
          fullName: vendorData.restaurantName,
          email: vendorData.email,
          mobile: vendorData.mobile
        }));

        // Show success popup
        setShowSuccessPopup(true);
        setPopupCountdown(60);
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
      // Call resend OTP endpoint
      const response = await axios.post('http://31.97.206.144:5051/api/vendor/resend-otp', {
        vendorId
      });

      if (response.data.success) {
        setSuccess('New OTP sent successfully!');
        setStoredOtp(response.data.otp);
        setCountdown(300);
        setCanResend(false);
        setOtp(['', '', '', '']);
        inputRefs.current[0].focus();
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleUseDemoOtp = () => {
    if (storedOtp && storedOtp.length === 4) {
      const digits = storedOtp.split('');
      setOtp(digits);
      setSuccess('Demo OTP filled! Click Verify to continue.');
    }
  };

  const handleBackToLogin = () => {
    setStep('login');
    setError('');
    setSuccess('');
    setOtp(['', '', '', '']);
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-gradient-to-br from-green-50 to-blue-50">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-scale-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-t-2xl text-white text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <FiCheckCircle className="text-4xl" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Login Successful!</h3>
              <p className="text-green-100">Welcome to Vegiffyy Dashboard</p>
            </div>
            
            {/* Content */}
            <div className="p-6 text-center">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 font-semibold text-lg">
                  🎉 Welcome Aboard! 🎉
                </p>
                <p className="text-gray-700 mt-2">
                  You are now logged into your vendor dashboard.
                </p>
              </div>
              
              {/* Countdown Timer */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-700 font-medium">
                    Auto redirect in: <span className="font-bold text-blue-800">{formatTime(popupCountdown)}</span>
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  This popup will automatically close in {popupCountdown} seconds
                </p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">
                  {popupCountdown > 30 
                    ? "Preparing dashboard..." 
                    : popupCountdown > 10 
                    ? "Loading features..." 
                    : "Redirecting now..."}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClosePopup}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <span>Go to Dashboard</span>
                </button>
                <button
                  onClick={() => setShowSuccessPopup(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full border border-green-100">
        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-green-600 mb-2">Vegiffyy</h1>
            <div className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              100% Pure Vegetarian
            </div>
          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-2">
            <div className={`flex items-center ${step === 'login' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'login' ? 'bg-green-100' : 'bg-gray-100'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Login</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center ${step === 'verify-otp' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'verify-otp' ? 'bg-green-100' : 'bg-gray-100'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Verify OTP</span>
            </div>
          </div>

          {step === 'login' ? (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-800">Vendor Login</h2>

              {error && (
                <div className="p-3 text-red-600 bg-red-100 rounded-lg border border-red-200 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  {error}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                    htmlFor="email"
                  >
                    <FiMail className="mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                    placeholder="Enter your registered email"
                    required
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                    htmlFor="password"
                  >
                    <FiLock className="mr-2" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                      placeholder="Enter your password"
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <button
                  type="submit"
                  className={`w-full p-3 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition duration-200 transform font-semibold ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    'Login to Dashboard'
                  )}
                </button>
              </form>

              {/* Forgot Password */}
              <div className="text-center">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="text-green-600 hover:text-green-700 text-sm font-medium hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Become a Vendor Section */}
              <div className="text-center mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-700">
                  Don't have an account?{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="text-green-600 font-semibold hover:text-green-700 hover:underline transition-colors"
                  >
                    Become a Vendor Partner
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* OTP Verification Step */}
              <div className="text-center mb-2">
                <button
                  onClick={handleBackToLogin}
                  className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium mb-4"
                >
                  <FiArrowLeft className="mr-1" />
                  Back to Login
                </button>
                <h2 className="text-2xl font-bold text-gray-800">OTP Verification</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Enter the 4-digit OTP sent to {email}
                </p>
              </div>

              {/* Demo OTP Banner */}
              {storedOtp && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-800 font-medium text-sm">Demo OTP Available</p>
                      <p className="text-yellow-600 text-xs">
                        Click "Auto-fill" to use: <span className="font-bold">{storedOtp}</span>
                      </p>
                    </div>
                    <button
                      onClick={handleUseDemoOtp}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-colors text-xs"
                    >
                      Auto-fill
                    </button>
                  </div>
                </div>
              )}

              {/* Countdown Timer */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <FiClock className="text-blue-500" />
                  <span className="text-blue-700 font-medium">
                    OTP expires in: <span className="font-bold text-blue-800">{formatTime(countdown)}</span>
                  </span>
                </div>
                {countdown < 60 && (
                  <p className="text-xs text-red-600 animate-pulse">
                    Hurry! OTP expiring soon
                  </p>
                )}
              </div>

              {success && (
                <div className="p-3 text-green-700 bg-green-100 rounded-lg border border-green-200 flex items-center">
                  <FiCheckCircle className="mr-2" />
                  {success}
                </div>
              )}

              {error && (
                <div className="p-3 text-red-600 bg-red-100 rounded-lg border border-red-200 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    4-Digit OTP
                  </label>
                  <div className="flex justify-center space-x-3" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-14 h-14 text-2xl text-center border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition duration-200"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    type="submit"
                    className={`w-full p-3 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition duration-200 transform font-semibold ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
                        <span>Verifying OTP...</span>
                      </div>
                    ) : (
                      'Verify & Continue'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={!canResend || resendLoading}
                    className={`w-full p-2 border-2 rounded-lg font-medium flex items-center justify-center space-x-2 ${
                      canResend
                        ? 'border-green-500 text-green-600 hover:bg-green-50'
                        : 'border-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {resendLoading ? (
                      <>
                        <div className="w-4 h-4 border-t-2 border-green-500 border-solid rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <FiRefreshCw />
                        <span>
                          {canResend ? 'Resend OTP' : `Resend available in ${formatTime(countdown)}`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Image Section */}
        <div className="w-full md:w-1/2 flex justify-center p-8 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="relative">
            <img
              src={VeggyfyLogo}
              alt="Veggyfy - Pure Vegetarian Food Delivery"
              className="object-cover w-full h-auto rounded-2xl shadow-lg"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg backdrop-blur-sm">
              <p className="text-sm font-semibold text-center">
                {step === 'login' 
                  ? "Join India's First Pure Vegetarian Food Delivery Revolution! 🌱"
                  : "Secure OTP Verification - Keep your account safe! 🔒"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
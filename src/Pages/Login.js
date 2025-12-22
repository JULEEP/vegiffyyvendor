import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import VeggyfyLogo from '../Images/veggifylogo.jpeg';
import { 
  FiCheckCircle, FiX, FiEye, FiEyeOff, FiMail, FiLock, 
  FiRefreshCw, FiClock, FiArrowLeft, FiKey, FiShield,
  FiAlertTriangle, FiPhone, FiMessageSquare, FiUserCheck,
  FiExternalLink, FiInfo, FiHelpCircle
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
  
  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetStep, setResetStep] = useState('enter-email'); // 'enter-email', 'verify-otp', 'new-password'
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetCountdown, setResetCountdown] = useState(900); // 15 minutes for reset OTP
  
  // Inactive Account State
  const [showInactivePopup, setShowInactivePopup] = useState(false);
  const [inactiveMessage, setInactiveMessage] = useState('');
  const [inactiveDetails, setInactiveDetails] = useState({
    status: '',
    contactEmail: 'support@vegiffyy.com',
    whatsapp: '+911234567890',
    restaurantName: ''
  });
  
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
  const forgotOtpRefs = useRef([]);

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

  // Countdown for Reset OTP expiry
  useEffect(() => {
    if (showForgotPassword && resetStep === 'verify-otp' && resetCountdown > 0) {
      const timer = setTimeout(() => setResetCountdown(resetCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showForgotPassword, resetStep, resetCountdown]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Login Handler with Status Check
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
      const response = await axios.post('https://api.vegiffyy.com/api/vendor/vendorlogin', {
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
        // Check if it's an inactive account error
        if (err.response.data.vendorStatus && err.response.data.vendorStatus !== "active") {
          setShowInactivePopup(true);
          setInactiveMessage(err.response.data.message);
          setInactiveDetails({
            status: err.response.data.vendorStatus,
            contactEmail: err.response.data.contactEmail || "support@vegiffyy.com",
            whatsapp: err.response.data.whatsapp || "+911234567890",
            restaurantName: err.response.data.restaurantName || ""
          });
          setError(''); // Clear error since we're showing popup
        } else {
          setError(err.response.data.message || 'Something went wrong. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
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

  // Forgot OTP Handlers
  const handleForgotOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...forgotOtp];
    newOtp[index] = value;
    setForgotOtp(newOtp);

    // Auto focus next input
    if (value && index < 3) {
      forgotOtpRefs.current[index + 1].focus();
    }
  };

  const handleForgotKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !forgotOtp[index] && index > 0) {
      forgotOtpRefs.current[index - 1].focus();
    }
  };

  const handleForgotPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{4}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setForgotOtp(digits);
      forgotOtpRefs.current[3].focus();
    }
  };

  // In handleVerifyOtp function, replace it with this:
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
    const response = await axios.post('https://api.vegiffyy.com/api/vendor/verify-otp', {
      vendorId,
      otp: otpValue
    });

    if (response.data.success) {
      // ✅ Store ALL vendor data from response
      const vendorData = response.data.vendor;
      
      console.log('Vendor data from OTP response:', vendorData);
      
      // Store everything in localStorage
      localStorage.setItem('vendorId', vendorData.id);
      localStorage.setItem('vendorData', JSON.stringify(vendorData));
      
      // Store individual fields for easy access
      localStorage.setItem('restaurantName', vendorData.restaurantName || '');
      localStorage.setItem('vendorEmail', vendorData.email || '');
      localStorage.setItem('vendorPhone', vendorData.mobile || '');
      localStorage.setItem('vendorLocation', vendorData.locationName || '');
      localStorage.setItem('vendorImage', vendorData.image || '');

      // Show success popup
      setShowSuccessPopup(true);
      setPopupCountdown(60);
      
      // Clear any error
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

  // Forgot Password Functions
  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
    setResetStep('enter-email');
    setForgotEmail('');
    setError('');
    setSuccess('');
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setResetStep('enter-email');
    setForgotEmail('');
    setForgotOtp(['', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!forgotEmail || !validateEmail(forgotEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('https://api.vegiffyy.com/api/vendor/forgot-password', {
        email: forgotEmail.toLowerCase()
      });

      if (response.data.success) {
        setSuccess('OTP sent to your email!');
        setResetStep('verify-otp');
        setResetCountdown(900); // 15 minutes
        setTimeout(() => {
          if (forgotOtpRefs.current[0]) {
            forgotOtpRefs.current[0].focus();
          }
        }, 100);
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyResetOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    const otpValue = forgotOtp.join('');
    if (otpValue.length !== 4) {
      setError('Please enter the complete 4-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      setResetStep('new-password');
      setSuccess('OTP verified! Now set your new password.');
      setIsLoading(false);
    } catch (err) {
      setError('Failed to verify OTP');
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('https://api.vegiffyy.com/api/vendor/reset-password', {
        email: forgotEmail.toLowerCase(),
        otp: forgotOtp.join(''),
        newPassword,
        confirmPassword
      });

      if (response.data.success) {
        setSuccess('Password reset successful! You can now login with your new password.');
        
        // Close forgot password modal and show success
        setTimeout(() => {
          handleCloseForgotPassword();
          setEmail(forgotEmail);
          setPassword('');
          setError('');
          setSuccess('Password reset successful! Please login with your new password.');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendResetOtp = async () => {
    if (resetCountdown > 0) return;
    
    setResendLoading(true);
    setError('');
    
    try {
      const response = await axios.post('https://api.vegiffyy.com/api/vendor/forgot-password', {
        email: forgotEmail.toLowerCase()
      });

      if (response.data.success) {
        setSuccess('New OTP sent successfully!');
        setResetCountdown(900);
        setForgotOtp(['', '', '', '']);
        forgotOtpRefs.current[0].focus();
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
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

  const handleCloseInactivePopup = () => {
    setShowInactivePopup(false);
    setEmail('');
    setPassword('');
  };

  // Inactive Account Popup Component
  const InactiveAccountPopup = () => {
    if (!showInactivePopup) return null;

    const getStatusInfo = (status) => {
      switch(status) {
        case 'pending':
          return {
            title: 'Account Pending Approval ⏳',
            description: 'Your vendor account is currently under review.',
            icon: <FiClock className="text-yellow-500 text-3xl" />,
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            textColor: 'text-yellow-800',
            iconBg: 'bg-yellow-100'
          };
        case 'suspended':
          return {
            title: 'Account Suspended ⚠️',
            description: 'Your account has been temporarily suspended.',
            icon: <FiAlertTriangle className="text-red-500 text-3xl" />,
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            textColor: 'text-red-800',
            iconBg: 'bg-red-100'
          };
        case 'rejected':
          return {
            title: 'Account Rejected ❌',
            description: 'Your vendor application was not approved.',
            icon: <FiX className="text-red-500 text-3xl" />,
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            textColor: 'text-red-800',
            iconBg: 'bg-red-100'
          };
        case 'inactive':
          return {
            title: 'Account Inactive 😴',
            description: 'Your account is currently inactive.',
            icon: <FiUserCheck className="text-gray-500 text-3xl" />,
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200',
            textColor: 'text-gray-800',
            iconBg: 'bg-gray-100'
          };
        default:
          return {
            title: 'Account Not Active',
            description: 'Your account status needs attention.',
            icon: <FiAlertTriangle className="text-orange-500 text-3xl" />,
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            textColor: 'text-orange-800',
            iconBg: 'bg-orange-100'
          };
      }
    };

    const statusInfo = getStatusInfo(inactiveDetails.status);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform scale-100 transition-transform duration-200">
          {/* Header */}
          <div className={`p-6 rounded-t-2xl ${statusInfo.bgColor} ${statusInfo.borderColor} border-b relative`}>
            <div className="absolute top-3 right-3">
              <button
                onClick={handleCloseInactivePopup}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 ${statusInfo.iconBg} rounded-full flex items-center justify-center mb-4`}>
                {statusInfo.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {statusInfo.title}
              </h3>
              <p className="text-gray-600">
                {statusInfo.description}
              </p>
            </div>
          </div>

          {/* Status Info */}
          <div className="p-6">
            {/* Status Badge */}
            <div className="flex justify-center mb-6">
              <div className={`px-4 py-2 rounded-full ${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor} font-semibold`}>
                Status: {inactiveDetails.status?.toUpperCase() || 'INACTIVE'}
              </div>
            </div>

            {/* Restaurant Info if available */}
            {inactiveDetails.restaurantName && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <FiInfo className="text-blue-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Restaurant</p>
                    <p className="text-blue-600">{inactiveDetails.restaurantName}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Message */}
            <div className={`p-4 ${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg mb-6`}>
              <div className="flex items-start">
                <FiHelpCircle className={`mr-2 mt-0.5 flex-shrink-0 ${statusInfo.textColor}`} />
                <p className={`text-sm ${statusInfo.textColor}`}>
                  {inactiveMessage || "Your account needs admin approval before you can access the dashboard."}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700 text-center">Need Assistance?</h4>
              
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 gap-3">
                  {/* Email Contact */}
                  <a 
                    href={`mailto:${inactiveDetails.contactEmail}?subject=Account%20Status%20Query%20-%20${email}&body=Hello%20Vegiffyy%20Support,%0A%0AMy%20registered%20email%20is:%20${encodeURIComponent(email)}%0A%0AMy%20account%20status%20shows%20as:%20${inactiveDetails.status}%0A%0APlease%20help%20me%20activate%20my%20account.%0A%0AThank%20you`}
                    className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-blue-50 transition-all duration-200 hover:shadow-sm"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <FiMail className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Email Support</p>
                      <p className="text-xs text-gray-500 truncate">{inactiveDetails.contactEmail}</p>
                    </div>
                    <FiExternalLink className="text-gray-400 ml-2" />
                  </a>

                  {/* WhatsApp Contact */}
                  <a 
                    href={`https://wa.me/${inactiveDetails.whatsapp?.replace(/\D/g, '')}?text=Hello%20Vegiffyy%20Support,%20I%20need%20help%20with%20my%20vendor%20account%20status.%20My%20email%20is:%20${encodeURIComponent(email)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-green-50 transition-all duration-200 hover:shadow-sm"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <FiMessageSquare className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">WhatsApp Support</p>
                      <p className="text-xs text-gray-500">{inactiveDetails.whatsapp}</p>
                    </div>
                    <FiExternalLink className="text-gray-400 ml-2" />
                  </a>

                  {/* Phone Contact */}
                  <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <FiPhone className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Call Support</p>
                      <p className="text-xs text-gray-500">Monday - Saturday, 10 AM - 7 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Steps */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-medium text-green-800 mb-3 flex items-center">
                  <FiCheckCircle className="mr-2" />
                  What to do next?
                </h5>
                <ul className="text-sm text-green-700 space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">•</span>
                    Contact support with your registered email address
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">•</span>
                    Check your email inbox for any status updates
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">•</span>
                    Complete any pending verification steps if required
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">•</span>
                    Wait for admin approval (typically 24-48 hours)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
            <div className="flex flex-col gap-3">
              <a
                href={`mailto:${inactiveDetails.contactEmail}?subject=Urgent:%20Account%20Activation%20Required&body=Dear%20Vegiffyy%20Support,%0A%0AThis%20is%20urgent.%20I%20need%20my%20vendor%20account%20activated%20immediately.%0A%0ARegistered%20Email:%20${encodeURIComponent(email)}%0AStatus:%20${inactiveDetails.status}%0A%0APlease%20expedite%20the%20process.%0A%0AThank%20you`}
                className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-sm hover:shadow"
              >
                <FiMail className="mr-2" />
                Send Urgent Email
              </a>
              <button
                onClick={handleCloseInactivePopup}
                className="px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Success Popup Component
  const SuccessPopup = () => {
    if (!showSuccessPopup) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform scale-100 transition-transform duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 rounded-t-2xl text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <FiCheckCircle className="text-5xl" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Welcome to Vegiffyy! 🎉</h3>
            <p className="text-green-100">Login successful. Redirecting to dashboard...</p>
          </div>
          
          {/* Content */}
          <div className="p-6 text-center">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 font-semibold text-lg mb-2">
                🚀 Ready to Grow Your Business?
              </p>
              <p className="text-gray-700">
                Access your restaurant dashboard and start managing orders, menu, and earnings!
              </p>
            </div>
            
            {/* Countdown Timer */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-700 font-medium">
                  Auto redirect in: <span className="font-bold text-blue-800 text-lg">{formatTime(popupCountdown)}</span>
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((60 - popupCountdown) / 60) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                This popup will automatically close in {popupCountdown} seconds
              </p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">
                  {popupCountdown > 30 
                    ? "Loading dashboard..." 
                    : popupCountdown > 10 
                    ? "Almost there..." 
                    : "Redirecting now!"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClosePopup}
                  className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow"
                >
                  <span>Go to Dashboard Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Forgot Password Modal Component
  const ForgotPasswordModal = () => {
    if (!showForgotPassword) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
                  <FiKey className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 ml-3">
                  Reset Password
                </h3>
              </div>
              <button
                onClick={handleCloseForgotPassword}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center space-x-8 mb-6">
              <div className={`flex flex-col items-center ${resetStep === 'enter-email' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${resetStep === 'enter-email' ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                  1
                </div>
                <span className="text-xs mt-1 font-medium">Enter Email</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className={`flex flex-col items-center ${resetStep === 'verify-otp' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${resetStep === 'verify-otp' ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                  2
                </div>
                <span className="text-xs mt-1 font-medium">Verify OTP</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className={`flex flex-col items-center ${resetStep === 'new-password' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${resetStep === 'new-password' ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                  3
                </div>
                <span className="text-xs mt-1 font-medium">New Password</span>
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="p-3 text-green-700 bg-green-100 rounded-lg border border-green-200 flex items-center mb-4">
                <FiCheckCircle className="mr-2" />
                {success}
              </div>
            )}

            {error && (
              <div className="p-3 text-red-600 bg-red-100 rounded-lg border border-red-200 flex items-center mb-4">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                {error}
              </div>
            )}

            {/* Enter Email Step */}
            {resetStep === 'enter-email' && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your registered email address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="vendor@example.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all shadow-sm hover:shadow"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    'Send Reset OTP'
                  )}
                </button>
              </form>
            )}

            {/* Verify OTP Step */}
            {resetStep === 'verify-otp' && (
              <form onSubmit={handleVerifyResetOtp} className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    OTP sent to: <span className="font-semibold">{forgotEmail}</span>
                  </p>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-center space-x-2">
                      <FiClock className="text-blue-500" />
                      <span className="text-blue-700">
                        OTP expires in: <span className="font-bold">{formatTime(resetCountdown)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    4-Digit OTP
                  </label>
                  <div className="flex justify-center space-x-3" onPaste={handleForgotPaste}>
                    {forgotOtp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (forgotOtpRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleForgotOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleForgotKeyDown(index, e)}
                        className="w-14 h-14 text-2xl text-center border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all shadow-sm hover:shadow"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                        Verifying...
                      </div>
                    ) : (
                      'Verify OTP'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendResetOtp}
                    disabled={resetCountdown > 0 || resendLoading}
                    className={`w-full p-2 border rounded-lg flex items-center justify-center space-x-2 transition-all ${
                      resetCountdown === 0
                        ? 'border-green-500 text-green-600 hover:bg-green-50 hover:shadow'
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
                          {resetCountdown > 0 
                            ? `Resend in ${formatTime(resetCountdown)}` 
                            : 'Resend OTP'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* New Password Step */}
            {resetStep === 'new-password' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter new password"
                      minLength="6"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 6 characters long
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all shadow-sm hover:shadow"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                      Resetting Password...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Inactive Account Popup */}
      <InactiveAccountPopup />

      {/* Success Popup */}
      <SuccessPopup />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal />

      {/* Main Content */}
      <div className="flex flex-col md:flex-row items-center bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full border border-green-100">
        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-green-600 mb-2">Vegiffyy</h1>
            <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              100% Pure Vegetarian
            </div>
          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-2">
            <div className={`flex items-center ${step === 'login' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'login' ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Login</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center ${step === 'verify-otp' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'verify-otp' ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Verify OTP</span>
            </div>
          </div>

          {step === 'login' ? (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-800">Vendor Login</h2>

              {/* Error/Success Messages */}
              {error && (
                <div className="p-3 text-red-600 bg-red-100 rounded-lg border border-red-200 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 text-green-700 bg-green-100 rounded-lg border border-green-200 flex items-center">
                  <FiCheckCircle className="mr-2" />
                  {success}
                </div>
              )}

              {/* Login Form */}
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

                {/* Login Button */}
                <button
                  type="submit"
                  className={`w-full p-3 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition duration-200 transform font-semibold shadow-sm hover:shadow ${
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
                  onClick={handleForgotPasswordClick}
                  className="text-green-600 hover:text-green-700 text-sm font-medium hover:underline transition-colors flex items-center justify-center mx-auto"
                >
                  <FiShield className="mr-2" />
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
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-800 font-medium text-sm">Demo OTP Available</p>
                      <p className="text-yellow-600 text-xs">
                        Click "Auto-fill" to use: <span className="font-bold">{storedOtp}</span>
                      </p>
                    </div>
                    <button
                      onClick={handleUseDemoOtp}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors text-xs shadow-sm hover:shadow"
                    >
                      Auto-fill
                    </button>
                  </div>
                </div>
              )}

              {/* Countdown Timer */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <FiClock className="text-blue-500" />
                  <span className="text-blue-700 font-medium">
                    OTP expires in: <span className="font-bold text-blue-800">{formatTime(countdown)}</span>
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-1 mt-2">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-1000"
                    style={{ width: `${((300 - countdown) / 300) * 100}%` }}
                  ></div>
                </div>
                {countdown < 60 && (
                  <p className="text-xs text-red-600 animate-pulse mt-2">
                    Hurry! OTP expiring soon
                  </p>
                )}
              </div>

              {/* Success/Error Messages */}
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

              {/* OTP Form */}
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
                    className={`w-full p-3 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition duration-200 transform font-semibold shadow-sm hover:shadow ${
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
                    className={`w-full p-2 border-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all ${
                      canResend
                        ? 'border-green-500 text-green-600 hover:bg-green-50 hover:shadow'
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
        <div className="w-full md:w-1/2 flex justify-center p-8 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
          <div className="relative w-full max-w-md">
            <img
              src={VeggyfyLogo}
              alt="Veggyfy - Pure Vegetarian Food Delivery"
              className="object-cover w-full h-auto rounded-2xl shadow-lg border-4 border-white"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-black/80 to-black/60 text-white p-4 rounded-lg backdrop-blur-sm border border-white/20">
              <p className="text-sm font-semibold text-center">
                {step === 'login' 
                  ? "Join India's First Pure Vegetarian Food Delivery Revolution! 🌱" 
                  : "Secure OTP Verification - Your account safety is our priority! 🔒"}
              </p>
              <p className="text-xs text-gray-300 text-center mt-1">
                {step === 'login' 
                  ? "Manage orders, track earnings, and grow your restaurant business" 
                  : "Protecting your business with two-factor authentication"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Need help? Contact us at{' '}
          <a href="mailto:support@vegiffyy.com" className="text-green-600 hover:text-green-700 font-medium">
            support@vegiffyy.com
          </a>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          © {new Date().getFullYear()} Vegiffyy. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
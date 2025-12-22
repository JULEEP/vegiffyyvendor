import React, { useState, useEffect } from 'react';
import { 
  FiCreditCard, 
  FiLock, 
  FiCheck, 
  FiArrowRight,
  FiShield,
  FiDollarSign,
  FiUser,
  FiLoader,
  FiInfo,
  FiCalendar,
  FiCheckCircle,
  FiPackage,
  FiStar,
  FiSmartphone
} from 'react-icons/fi';
import axios from 'axios';

const VendorJoiningFee = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plansLoading, setPlansLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [showUpiInput, setShowUpiInput] = useState(false);
  
  // GST rate constant
  const GST_RATE = 18;

  // Calculate GST and total amounts
  const calculateGSTDetails = (basePrice) => {
    const baseAmount = parseFloat(basePrice) || 0;
    const gstAmount = Math.round((baseAmount * GST_RATE) / 100);
    const totalAmount = Math.round(baseAmount + gstAmount);
    
    return {
      baseAmount,
      gstAmount,
      totalAmount
    };
  };

  // Fetch user data and plans from API
  useEffect(() => {
    fetchUserData();
    fetchPlans();
  }, []);

  const fetchUserData = async () => {
    try {
      // First check localStorage for vendor data (from login)
      const storedVendorData = localStorage.getItem('vendorData');
      
      if (storedVendorData) {
        const vendorData = JSON.parse(storedVendorData);
        console.log('Using vendor data from localStorage:', vendorData);
        
        setUserData({
          businessName: vendorData.restaurantName || 'Restaurant Name',
          phone: vendorData.mobile || 'N/A',
          email: vendorData.email || 'N/A',
          location: vendorData.locationName || 'N/A',
          image: vendorData.image || ''
        });
        setUserError(false);
        setUserLoading(false);
        return;
      }
      
      const vendorId = localStorage.getItem('vendorId');
      if (!vendorId) {
        console.error('Vendor ID not found in localStorage');
        setUserError(true);
        setUserLoading(false);
        return;
      }

      const response = await axios.get(`https://api.vegiffyy.com/api/vendor/profile/${vendorId}`);
      if (response.data.success) {
        const apiData = response.data.data;
        setUserData({
          businessName: apiData.restaurantName || 'Restaurant Name',
          phone: apiData.mobile || 'N/A',
          email: apiData.email || 'N/A',
          location: apiData.locationName || 'N/A',
          image: apiData.image || ''
        });
        setUserError(false);
      } else {
        console.error('Failed to fetch user data:', response.data.message);
        setUserError(true);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      
      const restaurantName = localStorage.getItem('restaurantName');
      const vendorPhone = localStorage.getItem('vendorPhone');
      
      if (restaurantName || vendorPhone) {
        setUserData({
          businessName: restaurantName || 'Restaurant Name',
          phone: vendorPhone || 'N/A',
          email: localStorage.getItem('vendorEmail') || 'N/A',
          location: localStorage.getItem('vendorLocation') || 'N/A',
          image: localStorage.getItem('vendorImage') || ''
        });
        setUserError(false);
      } else {
        setUserError(true);
      }
    } finally {
      setUserLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await axios.get('https://api.vegiffyy.com/api/admin/vendorplans');
      if (response.data.success) {
        const plansData = response.data.data || [];
        setPlans(plansData);
        if (plansData.length > 0) {
          setSelectedPlan(plansData[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching vendor plans:', error);
      setPaymentError('Failed to load plans. Please refresh the page.');
    } finally {
      setPlansLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setPaymentError('');
  };

  const validateUpiId = (upi) => {
    const upiRegex = /^[\w.-]+@[\w]+$/;
    return upiRegex.test(upi);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleUpiPayment = async () => {
    if (!validateUpiId(upiId)) {
      setPaymentError('Please enter a valid UPI ID (e.g., username@okicici)');
      return;
    }

    setLoading(true);
    setPaymentError('');

    try {
      const vendorId = localStorage.getItem('vendorId');
      if (!vendorId) {
        setPaymentError('Please login again to continue');
        setLoading(false);
        return;
      }

      // Calculate total amount with GST
      const { baseAmount, gstAmount, totalAmount } = calculateGSTDetails(selectedPlan.price);

      // Get vendor data
      const storedVendorData = localStorage.getItem('vendorData');
      let vendorName = 'Vendor';
      let vendorEmail = '';
      let vendorPhone = '';

      if (storedVendorData) {
        const vendorData = JSON.parse(storedVendorData);
        vendorName = vendorData.restaurantName || 'Vendor';
        vendorEmail = vendorData.email || '';
        vendorPhone = vendorData.mobile || '';
      } else {
        vendorName = localStorage.getItem('restaurantName') || 'Vendor';
        vendorEmail = localStorage.getItem('vendorEmail') || '';
        vendorPhone = localStorage.getItem('vendorPhone') || '';
      }

      const razorpayPrefill = {
        name: vendorName,
        email: vendorEmail,
        contact: vendorPhone,
      };

      const options = {
        key: 'rzp_live_RppTI8LWcKMPyz',
        amount: totalAmount * 100, // Convert to paise
        currency: 'INR',
        name: 'Vegiffyy Vendor Program',
        description: `Vendor Plan: ${selectedPlan.name} - UPI Payment`,
        image: 'https://res.cloudinary.com/dwmna13fi/image/upload/v1766050725/restaurants/images/vogulshuhb31u93ny8s9.jpg',
        prefill: razorpayPrefill,
        handler: async function (response) {
          try {
            console.log('🔄 UPI Payment Success:', response);
            
            // 🔥 FIXED: Send ONLY planId and transactionId (backend will calculate GST)
            const captureResponse = await axios.post(
              `https://api.vegiffyy.com/api/vendor/pay/${vendorId}`,
              {
                planId: selectedPlan._id,
                transactionId: response.razorpay_payment_id,
                // 🔥 NOT sending amount - backend will calculate from plan price
              }
            );

            if (captureResponse.data.success) {
              setStep(3);
              setPaymentSuccess(true);
            } else {
              setPaymentError('Payment verification failed: ' + (captureResponse.data.message || 'Unknown error'));
            }
          } catch (error) {
            console.error('Error capturing payment:', error);
            setPaymentError(
              error.response?.data?.message || 
              error.response?.data?.error?.description || 
              'Payment verification failed. Please contact support.'
            );
          } finally {
            setLoading(false);
            setShowUpiInput(false);
          }
        },
        notes: {
          plan: selectedPlan.name,
          planId: selectedPlan._id,
          vendorId: vendorId,
          businessName: vendorName,
          paymentMethod: 'UPI',
          upiId: upiId,
          includesGST: 'true'
        },
        theme: {
          color: '#10B981'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            setShowUpiInput(false);
          }
        },
        method: {
          upi: true,
          netbanking: true,
          card: true,
          wallet: true
        },
        upi: {
          flow: "collect",
          vpa: upiId
        }
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', function (response) {
        console.error('UPI Payment Failed:', response.error);
        setPaymentError(`Payment failed: ${response.error.description}`);
        setLoading(false);
        setShowUpiInput(false);
      });

      paymentObject.open();

    } catch (error) {
      console.error('UPI payment error:', error);
      setPaymentError('UPI payment failed. Please try again.');
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan) {
      setPaymentError('Please select a plan');
      return;
    }

    setLoading(true);
    setPaymentError('');

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPaymentError('Payment gateway failed to load. Check your internet connection.');
        setLoading(false);
        return;
      }

      const vendorId = localStorage.getItem('vendorId');
      if (!vendorId) {
        setPaymentError('Please login again to continue');
        setLoading(false);
        return;
      }

      // Calculate total amount with GST
      const { baseAmount, gstAmount, totalAmount } = calculateGSTDetails(selectedPlan.price);

      // Get vendor data
      const storedVendorData = localStorage.getItem('vendorData');
      let vendorName = 'Vendor';
      let vendorEmail = '';
      let vendorPhone = '';

      if (storedVendorData) {
        const vendorData = JSON.parse(storedVendorData);
        vendorName = vendorData.restaurantName || 'Vendor';
        vendorEmail = vendorData.email || '';
        vendorPhone = vendorData.mobile || '';
      } else {
        vendorName = localStorage.getItem('restaurantName') || 'Vendor';
        vendorEmail = localStorage.getItem('vendorEmail') || '';
        vendorPhone = localStorage.getItem('vendorPhone') || '';
      }

      const razorpayPrefill = {
        name: vendorName,
        email: vendorEmail,
        contact: vendorPhone,
      };

      const options = {
        key: 'rzp_test_BxtRNvflG06PTV', // Use test key for now
        amount: totalAmount * 100, // Convert to paise
        currency: 'INR',
        name: 'Vegiffyy Vendor Program',
        description: `Vendor Plan: ${selectedPlan.name} (Includes 18% GST)`,
        image: 'https://res.cloudinary.com/dwmna13fi/image/upload/v1766050725/restaurants/images/vogulshuhb31u93ny8s9.jpg',
        handler: async function (response) {
          try {
            console.log('🔄 Payment Success:', {
              razorpay_payment_id: response.razorpay_payment_id,
              planId: selectedPlan._id,
              planName: selectedPlan.name,
              totalAmount: totalAmount
            });

            // 🔥 FIXED: Send ONLY planId and transactionId (backend will calculate GST)
            const captureResponse = await axios.post(
              `https://api.vegiffyy.com/api/vendor/pay/${vendorId}`,
              {
                planId: selectedPlan._id,
                transactionId: response.razorpay_payment_id,
                // 🔥 NOT sending amount - backend will calculate from plan price
              }
            );

            if (captureResponse.data.success) {
              setStep(3);
              setPaymentSuccess(true);
              
              // Update localStorage with new plan info
              const updatedVendorData = {
                ...(storedVendorData ? JSON.parse(storedVendorData) : {}),
                currentPlan: selectedPlan._id,
                planExpiry: new Date(Date.now() + selectedPlan.validity * 24 * 60 * 60 * 1000),
                planStatus: 'active',
                isPlanActive: true
              };
              localStorage.setItem('vendorData', JSON.stringify(updatedVendorData));
              
            } else {
              setPaymentError('Payment verification failed: ' + (captureResponse.data.message || 'Unknown error'));
            }
          } catch (error) {
            console.error('❌ Error capturing payment:', error);
            setPaymentError(
              error.response?.data?.message || 
              error.response?.data?.error?.description || 
              'Payment verification failed. Please contact support.'
            );
          } finally {
            setLoading(false);
          }
        },
        prefill: razorpayPrefill,
        notes: {
          plan: selectedPlan.name,
          planId: selectedPlan._id,
          vendorId: vendorId,
          businessName: vendorName,
          includesGST: 'true'
        },
        theme: {
          color: '#10B981'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            setPaymentError('Payment cancelled by user');
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setPaymentError(`Payment failed: ${response.error.description || 'Unknown error'}`);
        setLoading(false);
      });

      paymentObject.open();

    } catch (error) {
      console.error('Payment initialization error:', error);
      setPaymentError('Payment initialization failed. Please try again.');
      setLoading(false);
    }
  };

  const renderStep1 = () => {
    const { baseAmount, gstAmount, totalAmount } = selectedPlan 
      ? calculateGSTDetails(selectedPlan.price)
      : { baseAmount: 0, gstAmount: 0, totalAmount: 0 };

    const displayBusinessName = userData?.businessName || 'Your Restaurant';
    const displayPhone = userData?.phone || 'N/A';
    const displayLocation = userData?.location || 'N/A';

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPackage className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Activate Your Restaurant</h2>
          <p className="text-gray-600 mt-2">Choose a plan to start receiving orders on Vegiffyy</p>
          
          {/* User Info */}
          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 inline-block">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-left">
                <p className="text-sm font-semibold text-green-800">{displayBusinessName}</p>
                <p className="text-xs text-green-600">{displayPhone} • {displayLocation}</p>
              </div>
              {userData?.image && (
                <img 
                  src={userData.image} 
                  alt="Restaurant" 
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                />
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {paymentError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <FiInfo className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-red-700 text-sm font-medium">Payment Error</p>
                <p className="text-red-600 text-xs mt-1">{paymentError}</p>
              </div>
            </div>
          </div>
        )}

        {/* UPI Input Modal */}
        {showUpiInput && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Enter UPI ID</h3>
                <button 
                  onClick={() => setShowUpiInput(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your UPI ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSmartphone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@okicici"
                    className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter your UPI ID (e.g., username@okicici, username@ybl, username@paytm)
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowUpiInput(false)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpiPayment}
                  disabled={!upiId || loading}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Plans Loading */}
        {plansLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <FiLoader className="w-8 h-8 text-green-600 animate-spin mb-3" />
            <p className="text-gray-600">Loading plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
            <FiInfo className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
            <p className="text-yellow-800">No vendor plans available at the moment.</p>
            <p className="text-yellow-600 text-sm mt-1">Please contact support.</p>
          </div>
        ) : (
          <>
            {/* Plans List */}
            <div className="space-y-4">
              {plans.map((plan) => {
                const planGST = calculateGSTDetails(plan.price);
                const isSelected = selectedPlan?._id === plan._id;
                
                return (
                  <div
                    key={plan._id}
                    onClick={() => handlePlanSelect(plan)}
                    className={`p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-green-500 bg-green-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
                            {plan.tagline && (
                              <p className="text-sm text-gray-600 mt-1">{plan.tagline}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">₹{plan.price}</div>
                            <div className="text-xs text-gray-500">
                              + ₹{planGST.gstAmount} GST
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          {plan.benefits && plan.benefits.slice(0, 4).map((benefit, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <FiCheck className="w-3 h-3 text-green-600" />
                              </div>
                              <span className="text-sm text-gray-700">{benefit}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <FiCalendar className="w-4 h-4 mr-2" />
                          <span>{plan.validity} days validity</span>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center ml-4 flex-shrink-0">
                          <FiCheck className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Breakdown */}
            {selectedPlan && (
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FiDollarSign className="w-4 h-4 mr-2 text-green-600" />
                  Payment Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plan Price</span>
                    <span className="font-semibold">₹{baseAmount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">GST ({GST_RATE}%)</span>
                    <span className="font-semibold">₹{gstAmount}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total Amount</span>
                      <span className="text-2xl font-bold text-green-600">₹{totalAmount}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      Payable in INR
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Options */}
            {selectedPlan && (
              <div className="space-y-4">
                {/* UPI Payment Button */}
                <button
                  onClick={() => setShowUpiInput(true)}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 font-bold text-lg flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                >
                  <FiSmartphone className="w-5 h-5" />
                  <span>Pay via UPI</span>
                </button>

                {/* Regular Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold text-lg flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <FiLoader className="w-5 h-5 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <FiCreditCard className="w-5 h-5" />
                      <span>Other Payment Methods</span>
                      <FiArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
            
            {/* Security Note */}
            <div className="flex items-center justify-center space-x-2 mt-4 text-sm text-gray-500">
              <FiShield className="w-4 h-4" />
              <span>Secure payment by Razorpay • 100% Safe</span>
            </div>
            
            {/* Support Info */}
            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Need help?{' '}
                <a 
                  href="mailto:support@vegiffyy.com" 
                  className="text-green-600 font-semibold hover:text-green-700 hover:underline"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderStep3 = () => {
    if (!selectedPlan) return null;
    
    const { baseAmount, gstAmount, totalAmount } = calculateGSTDetails(selectedPlan.price);
    
    const displayBusinessName = userData?.businessName || localStorage.getItem('restaurantName') || 'N/A';
    const displayPhone = userData?.phone || localStorage.getItem('vendorPhone') || 'N/A';
    const displayEmail = userData?.email || localStorage.getItem('vendorEmail') || 'N/A';

    return (
      <div className="space-y-6">
        {/* Success Icon */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Vegiffyy Family! 🎉</h2>
          <p className="text-gray-600">
            Your restaurant is now active and ready to receive orders
          </p>
        </div>

        {/* Success Message */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center">
            <FiStar className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800">Congratulations {displayBusinessName}! 🚀</p>
              <p className="text-sm text-green-700 mt-1">
                Your {selectedPlan.name} plan is now activated. Start managing your restaurant dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
            <FiPackage className="w-5 h-5 mr-2 text-green-600" />
            Order Details
          </h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Business</p>
                <p className="font-semibold text-gray-900 truncate">{displayBusinessName}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Plan</p>
                <p className="font-semibold text-gray-900">{selectedPlan.name}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-3 text-sm">Payment Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Plan Amount</span>
                  <span className="font-semibold">₹{baseAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST ({GST_RATE}%)</span>
                  <span className="font-semibold">₹{gstAmount}</span>
                </div>
                <div className="border-t border-blue-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-blue-900">Total Paid</span>
                    <span className="text-xl font-bold text-green-600">₹{totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h4 className="font-semibold text-green-900 mb-2 text-sm">Plan Validity</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiCalendar className="w-4 h-4 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Active</p>
                    <p className="text-xs text-gray-600">From today</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{selectedPlan.validity} days</p>
                  <p className="text-xs text-gray-600">Valid until</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
            <FiArrowRight className="w-5 h-5 mr-2" />
            Ready to Start?
          </h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <span className="text-sm text-blue-800">Access your vendor dashboard</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <span className="text-sm text-blue-800">Set up your menu and prices</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <span className="text-sm text-blue-800">Start receiving orders from customers</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-bold text-blue-600">4</span>
              </div>
              <span className="text-sm text-blue-800">Manage earnings and analytics</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3 pt-4">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-bold text-lg flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
          >
            <span>Go to Dashboard</span>
            <FiArrowRight className="w-5 h-5" />
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={() => window.print()}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Print Receipt
            </button>
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 border-2 border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors font-semibold"
            >
              Back to Plans
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Logo/Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-600 mb-2">Vegiffyy</h1>
          <p className="text-gray-600">Vendor Activation Portal</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              step >= 1 ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
            }`}>
              1
            </div>
            <span className="ml-2 font-medium">Select Plan</span>
          </div>
          
          <div className="w-16 h-1 mx-4 bg-gray-300"></div>
          
          <div className={`flex items-center ${step === 3 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              step === 3 ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
            }`}>
              2
            </div>
            <span className="ml-2 font-medium">Activated</span>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {step === 1 && renderStep1()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <FiShield className="w-4 h-4 mr-1 text-green-600" />
              <span>100% Secure</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center">
              <FiCheckCircle className="w-4 h-4 mr-1 text-green-600" />
              <span>Instant Activation</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            © {new Date().getFullYear()} Vegiffyy. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VendorJoiningFee;
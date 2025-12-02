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
} from 'react-icons/fi';
import axios from 'axios';

const VendorJoiningFee = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plansLoading, setPlansLoading] = useState(true);
  
  // Fetch plans from API
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get('http://31.97.206.144:5051/api/admin/vendorplans');
      if (response.data.success) {
        setPlans(response.data.data || []);
        // Auto-select the first plan if available
        if (response.data.data && response.data.data.length > 0) {
          setSelectedPlan(response.data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching vendor plans:', error);
    } finally {
      setPlansLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
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

  const handlePayment = async () => {
    if (!selectedPlan) {
      alert('Please select a plan');
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Razorpay SDK failed to load. Are you online?');
        setLoading(false);
        return;
      }

      const vendorId = localStorage.getItem('vendorId');
      if (!vendorId) {
        alert('Vendor ID not found. Please login again.');
        setLoading(false);
        return;
      }

      // Create Razorpay options
      const options = {
        key: 'rzp_test_BxtRNvflG06PTV', // Your Razorpay key
        amount: selectedPlan.price * 100, // Amount in paise
        currency: 'INR',
        name: 'Veggyfy Vendor Program',
        description: `Vendor Plan: ${selectedPlan.name}`,
        image: '/logo.png', // Your logo URL
        handler: async function (response) {
          // Payment successful - capture payment
          try {
            const captureResponse = await axios.post(
              `http://31.97.206.144:5051/api/vendor/pay/${vendorId}`,
              {
                planId: selectedPlan._id, // Send selected plan ID
                transactionId: response.razorpay_payment_id // Send Razorpay payment ID
              }
            );

            if (captureResponse.data.success) {
              setStep(3); // Show success screen
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Error capturing payment:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: 'Vendor User',
          email: 'vendor@example.com',
          contact: '9999999999'
        },
        notes: {
          plan: selectedPlan.name,
          planId: selectedPlan._id,
          vendorId: vendorId
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      paymentObject.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment initialization failed. Please try again.');
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
        </div>
        <h2 className="text-xl font-bold text-gray-900">Choose Your Vendor Plan</h2>
        <p className="text-gray-600 text-sm mt-1">Select a vendor plan to activate your restaurant</p>
      </div>

      {/* Plans Loading */}
      {plansLoading ? (
        <div className="flex justify-center items-center py-8">
          <FiLoader className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading plans...</span>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No vendor plans available at the moment.</p>
        </div>
      ) : (
        <>
          {/* Plans List */}
          <div className="space-y-3">
            {plans.map((plan) => (
              <div
                key={plan._id}
                onClick={() => handlePlanSelect(plan)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPlan?._id === plan._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">₹{plan.price}</div>
                        <div className="text-xs text-gray-500">{plan.validity} days validity</div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {plan.benefits.slice(0, 3).map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FiCheck className="w-2 h-2 text-blue-600" />
                          </div>
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </div>
                      ))}
                      {plan.benefits.length > 3 && (
                        <div className="text-xs text-blue-600 mt-1">
                          +{plan.benefits.length - 3} more benefits
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedPlan?._id === plan._id && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center ml-3 flex-shrink-0">
                      <FiCheck className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          {selectedPlan && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Plan Price</span>
                <span className="font-semibold">₹{selectedPlan.price}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-600">Validity</span>
                <span className="font-semibold">{selectedPlan.validity} days</span>
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total Amount</span>
                  <span className="font-bold text-blue-600">₹{selectedPlan.price}</span>
                </div>
              </div>
            </div>
          )}

          {/* Direct Pay Button */}
          <button
            onClick={handlePayment}
            disabled={!selectedPlan || loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FiCreditCard className="w-4 h-4" />
                <span>Pay ₹{selectedPlan?.price || 0}</span>
              </>
            )}
          </button>
        </>
      )}

      {/* Security Note */}
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
        <FiShield className="w-3 h-3" />
        <span>Secure payment by Razorpay</span>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center space-y-4">
      {/* Success Icon */}
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <FiCheck className="w-8 h-8 text-green-600" />
      </div>

      {/* Success Message */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 text-sm">
          Your vendor plan has been activated successfully
        </p>
      </div>

      {/* Order Summary */}
      {selectedPlan && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Order Summary</h3>
          
          <div className="space-y-2 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Plan</span>
              <span className="font-semibold">{selectedPlan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Plan ID</span>
              <span className="font-mono text-xs">{selectedPlan._id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Validity</span>
              <span className="font-semibold">{selectedPlan.validity} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid</span>
              <span className="font-semibold">₹{selectedPlan.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Activation Date</span>
              <span className="text-xs">{new Date().toLocaleDateString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expiry Date</span>
              <span className="text-xs">
                {new Date(Date.now() + selectedPlan.validity * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="text-green-600 font-semibold">Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="font-semibold text-blue-900 mb-2 text-sm">What's Next?</h4>
        <ul className="text-xs text-blue-800 space-y-1 text-left">
          <li>• Your restaurant is now active on Veggyfy</li>
          <li>• Access vendor dashboard to manage orders</li>
          <li>• Start receiving customer orders</li>
          <li>• Manage your menu and pricing</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-3">
        <button
          onClick={() => window.print()}
          className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Print Receipt
        </button>
        <button
          onClick={() => window.location.href = '/vendor/dashboard'}
          className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm flex items-center justify-center space-x-1"
        >
          <span>Go to Dashboard</span>
          <FiArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 flex items-center justify-center">
      <div className="w-full max-w-lg mx-4">
        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-6">
          {[1, 2].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                step >= stepNumber 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 2 && (
                <div className={`flex-1 h-1 ${
                  step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          {step === 1 && renderStep1()}
          {step === 3 && renderStep3()}
        </div>

        {/* Support Info */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            Need help? <a href="mailto:support@veggyfy.com" className="text-blue-600 hover:text-blue-700">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VendorJoiningFee;
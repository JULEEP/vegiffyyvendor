import React, { useState, useEffect } from 'react';
import { 
  FiCreditCard, 
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
  FiSmartphone,
  FiAlertCircle,
  FiUpload,
  FiX,
  FiCamera,
  FiFile,
  FiMessageCircle
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
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
  const [paymentMethod, setPaymentMethod] = useState(''); // 'razorpay', 'bank'
  
  // New state for payment screenshot upload
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  // GST rate constant
  const GST_RATE = 18;

  // Bank account details
  const bankAccountDetails = {
    accountName: "JAINITY EATS INDIA PRIVATE LIMITED",
    accountNumber: "259391973675",
    bankName: "INDUSIND BANK",
    ifscCode: "INDB0001764",
    upiId: "9292103965-xad8-4@ybl",
    accountType: "Current Account"
  };

  // WhatsApp contact for vendors
  const whatsappContact = {
    number: "9391973675",
    message: "Hi, I have made payment for Vegiffy Vendor Program. Here is my payment screenshot:"
  };

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
      const storedVendorData = localStorage.getItem('vendorData');
      
      if (storedVendorData) {
        const vendorData = JSON.parse(storedVendorData);
        
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

  // Handle file upload for payment screenshot
  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setPaymentError('Please upload only JPG, PNG or PDF files (max 5MB)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setPaymentError('File size should be less than 5MB');
      return;
    }

    setPaymentScreenshot(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setScreenshotPreview(null);
    }

    setPaymentError('');
  };

  const removeScreenshot = () => {
    setPaymentScreenshot(null);
    setScreenshotPreview(null);
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

  const handleBankPayment = async () => {
    if (!selectedPlan) {
      setPaymentError('Please select a plan');
      return;
    }

    setLoading(true);
    setUploading(true);
    setPaymentError('');

    try {
      const vendorId = localStorage.getItem('vendorId');
      if (!vendorId) {
        setPaymentError('Please login again to continue');
        setLoading(false);
        setUploading(false);
        return;
      }

      // Calculate total amount with GST
      const { totalAmount } = calculateGSTDetails(selectedPlan.price);

      // Create bank details object
      const bankDetails = {
        accountName: bankAccountDetails.accountName,
        accountNumber: bankAccountDetails.accountNumber,
        bankName: bankAccountDetails.bankName,
        ifscCode: bankAccountDetails.ifscCode
      };

      // Create form data for file upload
      const formData = new FormData();
      formData.append('planId', selectedPlan._id);
      formData.append('paymentMethod', 'bank_transfer');
      formData.append('bankDetails', JSON.stringify(bankDetails));
      formData.append('amount', totalAmount);
      formData.append('restaurantName', userData?.businessName || localStorage.getItem('restaurantName') || 'N/A');

      // Add screenshot if uploaded
      if (paymentScreenshot) {
        formData.append('paymentScreenshot', paymentScreenshot);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Send bank payment request with file
      const response = await axios.post(
        `https://api.vegiffyy.com/api/vendor/pay/${vendorId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.data.success) {
        setStep(3);
        setPaymentSuccess(true);
        
        // Update localStorage
        const storedVendorData = localStorage.getItem('vendorData');
        if (storedVendorData) {
          const updatedVendorData = {
            ...JSON.parse(storedVendorData),
            pendingPlan: selectedPlan._id,
            paymentStatus: 'pending_verification',
            screenshotUrl: response.data.data?.screenshotUrl
          };
          localStorage.setItem('vendorData', JSON.stringify(updatedVendorData));
        }
      } else {
        setPaymentError(response.data.message || 'Bank payment submission failed');
      }
    } catch (error) {
      console.error('Bank payment error:', error);
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           'Bank payment submission failed. Please try again.';
      setPaymentError(errorMessage);
    } finally {
      setLoading(false);
      setUploading(false);
      setUploadProgress(0);
    }
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
      const { totalAmount } = calculateGSTDetails(selectedPlan.price);

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
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'Vegiffy Vendor Program',
        description: `Vendor Plan: ${selectedPlan.name} - UPI Payment`,
        image: 'https://res.cloudinary.com/dwmna13fi/image/upload/v1766050725/restaurants/images/vogulshuhb31u93ny8s9.jpg',
        prefill: razorpayPrefill,
        handler: async function (response) {
          try {
            console.log('🔄 UPI Payment Success:', response);
            
            const captureResponse = await axios.post(
              `https://api.vegiffyy.com/api/vendor/pay/${vendorId}`,
              {
                planId: selectedPlan._id,
                transactionId: response.razorpay_payment_id,
                paymentMethod: 'upi'
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

  const handleRazorpayPayment = async () => {
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
      const { totalAmount } = calculateGSTDetails(selectedPlan.price);

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
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'Vegiffy Vendor Program',
        description: `Vendor Plan: ${selectedPlan.name} (Includes 18% GST)`,
        image: 'https://res.cloudinary.com/dwmna13fi/image/upload/v1766050725/restaurants/images/vogulshuhb31u93ny8s9.jpg',
        handler: async function (response) {
          try {
            console.log('🔄 Payment Success:', response);

            const captureResponse = await axios.post(
              `https://api.vegiffyy.com/api/vendor/pay/${vendorId}`,
              {
                planId: selectedPlan._id,
                transactionId: response.razorpay_payment_id,
                paymentMethod: 'razorpay'
              }
            );

            if (captureResponse.data.success) {
              setStep(3);
              setPaymentSuccess(true);
              
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

  const renderFileUploadSection = () => {
    return (
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <FiCamera className="w-4 h-4 mr-2 text-blue-600" />
            Payment Receipt Proof
          </h3>
          <span className="text-xs text-gray-600 font-medium">Optional</span>
        </div>

        {!paymentScreenshot ? (
          <label htmlFor="screenshot-upload" className="block cursor-pointer">
            <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <FiUpload className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Upload Payment Receipt (Optional)
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Screenshot or photo of bank transfer
                </p>
                <div className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-colors">
                  Choose File
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  JPG, PNG or PDF (Max 5MB)
                </p>
              </div>
            </div>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleScreenshotUpload}
              className="hidden"
              id="screenshot-upload"
            />
          </label>
        ) : (
          <div className="border border-green-200 bg-green-50 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                {screenshotPreview ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 mr-3 flex-shrink-0">
                    <img 
                      src={screenshotPreview} 
                      alt="Receipt Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <FiFile className="w-8 h-8 text-blue-600" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">
                    {paymentScreenshot.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {(paymentScreenshot.size / 1024).toFixed(2)} KB • {paymentScreenshot.type}
                  </p>
                  <p className="text-xs text-green-700 mt-2">
                    ✓ File uploaded successfully
                  </p>
                </div>
              </div>
              <button
                onClick={removeScreenshot}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove file"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* WhatsApp Option */}
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-start">
            <div className="bg-green-100 p-2 rounded-lg mr-3 flex-shrink-0">
              <FaWhatsapp className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-800 mb-1">
                Send Screenshot via WhatsApp
              </h4>
              <p className="text-sm text-green-700 mb-2">
                You can also send payment screenshot on WhatsApp:
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="bg-white px-3 py-2 rounded-lg border border-green-200">
                  <p className="font-bold text-green-900 text-lg">{whatsappContact.number}</p>
                </div>
                <a
                  href={`https://wa.me/91${whatsappContact.number}?text=${encodeURIComponent(whatsappContact.message)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <FaWhatsapp className="w-4 h-4 mr-2" />
                  Send on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
          <FiInfo className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
          <div>
            <p className="font-medium text-blue-800 mb-1">Two Ways to Submit Receipt:</p>
            <ol className="space-y-1 pl-4 list-decimal">
              <li>Upload screenshot here (Recommended for faster verification)</li>
              <li>Send screenshot directly to WhatsApp number: <span className="font-bold">{whatsappContact.number}</span></li>
            </ol>
          </div>
        </div>
      </div>
    );
  };

  const renderBankPaymentSection = () => {
    const { baseAmount, gstAmount, totalAmount } = selectedPlan 
      ? calculateGSTDetails(selectedPlan.price)
      : { baseAmount: 0, gstAmount: 0, totalAmount: 0 };

    return (
      <div className="space-y-6">
        <button
          onClick={() => setPaymentMethod('')}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-2"
        >
          <FiArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Back to Payment Options
        </button>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-blue-900 flex items-center">
              Bank Transfer Details
            </h3>
            <div className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold">
              Offline Payment
            </div>
          </div>
          
          <div className="space-y-3">
            {Object.entries(bankAccountDetails).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center bg-white p-3 rounded-lg border border-blue-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="font-semibold text-gray-900">{value}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(value);
                    // Show toast notification
                    const event = new CustomEvent('showToast', {
                      detail: {
                        message: `${key.replace(/([A-Z])/g, ' $1').trim()} copied to clipboard`,
                        type: 'success'
                      }
                    });
                    window.dispatchEvent(event);
                  }}
                  className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  <span className="text-blue-600 font-bold text-xs">Copy</span>
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <FiAlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">Important Instructions</p>
                <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                  <li>• Transfer <span className="font-bold">₹{totalAmount}</span> (₹{baseAmount} + ₹{gstAmount} GST)</li>
                  <li>• Plan will be activated after manual verification (1-2 hours)</li>
                  <li>• Include your Restaurant Name in payment description</li>
                  <li>• <span className="font-bold">Upload screenshot below OR send to WhatsApp: {whatsappContact.number}</span></li>
                  <li>• After payment & verification, click submit button</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        {renderFileUploadSection()}

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-blue-700 font-medium">Uploading...</span>
              <span className="text-blue-600 font-semibold">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <button
          onClick={handleBankPayment}
          disabled={loading || uploading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold text-lg flex items-center justify-center space-x-3"
        >
          {loading ? (
            <>
              <FiLoader className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <FiCheck className="w-5 h-5" />
              <span>Submit Payment Details</span>
            </>
          )}
        </button>
        
        <div className="text-center text-sm text-gray-600 space-y-1">
          <p>Screenshot upload is optional but recommended for faster verification.</p>
          <p>You can also send screenshot on WhatsApp: <span className="font-bold">{whatsappContact.number}</span></p>
          <p>Plan will be activated within 1-2 hours after verification.</p>
        </div>
      </div>
    );
  };

  const renderPaymentMethods = () => {
    if (paymentMethod === 'bank') {
      return renderBankPaymentSection();
    }

    return (
      <div className="space-y-4">
        <button
          onClick={handleRazorpayPayment}
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
              <span>Pay with Card/Netbanking/Wallet</span>
              <FiArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        <button
          onClick={() => setPaymentMethod('bank')}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 font-bold text-lg flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
        >
          <FiUpload className="w-5 h-5" />
          <span>Pay via Bank Transfer</span>
        </button>
      </div>
    );
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
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPackage className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Activate Your Restaurant</h2>
          <p className="text-gray-600 mt-2">Choose a plan to start receiving orders on Vegiffy</p>
          
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
            {paymentMethod !== 'bank' && (
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
            )}

            {/* Price Breakdown */}
            {selectedPlan && paymentMethod !== 'bank' && (
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
                  </div>
                </div>
              </div>
            )}

            {/* Payment Options */}
            {selectedPlan && renderPaymentMethods()}
            
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
                  href={`https://wa.me/91${whatsappContact.number}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 font-semibold hover:text-green-700 hover:underline"
                >
                  WhatsApp: {whatsappContact.number}
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

    const isPendingPayment = paymentMethod === 'bank';

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isPendingPayment 
              ? 'bg-gradient-to-br from-yellow-100 to-orange-100' 
              : 'bg-gradient-to-br from-green-100 to-emerald-100'
          }`}>
            {isPendingPayment ? (
              <FiLoader className="w-10 h-10 text-yellow-600 animate-spin" />
            ) : (
              <FiCheckCircle className="w-10 h-10 text-green-600" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isPendingPayment ? 'Payment Submitted! ⏳' : 'Welcome to Vegiffy Family! 🎉'}
          </h2>
          <p className="text-gray-600">
            {isPendingPayment 
              ? 'Your payment details have been submitted for verification'
              : 'Your restaurant is now active and ready to receive orders'
            }
          </p>
        </div>

        <div className={`border rounded-xl p-4 ${
          isPendingPayment 
            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' 
            : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
        }`}>
          <div className="flex items-center">
            {isPendingPayment ? (
              <FiAlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" />
            ) : (
              <FiStar className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
            )}
            <div>
              <p className={`font-semibold ${
                isPendingPayment ? 'text-yellow-800' : 'text-green-800'
              }`}>
                {isPendingPayment 
                  ? 'Pending Verification 🔍' 
                  : `Congratulations ${displayBusinessName}! 🚀`
                }
              </p>
              <p className={`text-sm mt-1 ${
                isPendingPayment ? 'text-yellow-700' : 'text-green-700'
              }`}>
                {isPendingPayment
                  ? `Your plan will be activated within 1-2 hours after verification. For faster verification, send payment screenshot to WhatsApp: ${whatsappContact.number}`
                  : `Your ${selectedPlan.name} plan is now activated.`
                }
              </p>
            </div>
          </div>
        </div>

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
                    <span className="font-bold text-blue-900">
                      {isPendingPayment ? 'Amount to Pay' : 'Total Paid'}
                    </span>
                    <span className="text-xl font-bold text-green-600">₹{totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border ${
              isPendingPayment
                ? 'bg-yellow-50 border-yellow-100'
                : 'bg-green-50 border-green-100'
            }`}>
              <h4 className={`font-semibold mb-2 text-sm ${
                isPendingPayment ? 'text-yellow-900' : 'text-green-900'
              }`}>
                {isPendingPayment ? 'Verification Status' : 'Plan Validity'}
              </h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiCalendar className={`w-4 h-4 mr-2 ${
                    isPendingPayment ? 'text-yellow-600' : 'text-green-600'
                  }`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {isPendingPayment ? 'Pending' : 'Active'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {isPendingPayment ? 'Awaiting verification' : 'From today'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{selectedPlan.validity} days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isPendingPayment && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
            <h4 className="font-bold text-green-900 mb-3 flex items-center">
              <FaWhatsapp className="w-5 h-5 mr-2 text-green-600" />
              For Faster Verification
            </h4>
            <p className="text-sm text-green-800 mb-3">
              Send your payment screenshot to WhatsApp for faster verification:
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="bg-white px-4 py-3 rounded-lg border border-green-200 flex-1">
                <p className="font-bold text-green-900 text-lg">{whatsappContact.number}</p>
              </div>
              <a
                href={`https://wa.me/91${whatsappContact.number}?text=${encodeURIComponent(`Payment screenshot for ${selectedPlan.name} plan - ${displayBusinessName}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
              >
                <FaWhatsapp className="w-5 h-5 mr-2" />
                Send Screenshot on WhatsApp
              </a>
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-3 pt-4">
          {isPendingPayment ? (
            <>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 font-bold text-lg flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
              >
                <span>Go to Dashboard</span>
                <FiArrowRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setStep(1)}
                className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Back to Plans
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-bold text-lg flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
              >
                <span>Go to Dashboard</span>
                <FiArrowRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setStep(1)}
                className="w-full py-3 border-2 border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors font-semibold"
              >
                Back to Plans
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-600 mb-2">Vegiffy</h1>
          <p className="text-gray-600">Vendor Activation Portal</p>
        </div>

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

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {step === 1 && renderStep1()}
          {step === 3 && renderStep3()}
        </div>

        <div className="text-center mt-6">
          <div className="inline-flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <FiShield className="w-4 h-4 mr-1 text-green-600" />
              <span>100% Secure</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center">
              <FaWhatsapp className="w-4 h-4 mr-1 text-green-600" />
              <span>Support: {whatsappContact.number}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            © {new Date().getFullYear()} Vegiffy. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VendorJoiningFee;
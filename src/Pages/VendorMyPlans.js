import React, { useState, useEffect } from 'react';
import { 
  FiCalendar, 
  FiDollarSign, 
  FiCheck, 
  FiClock,
  FiAward,
  FiUser,
  FiX,
  FiAlertCircle,
  FiPercent,
  FiTag,
  FiCreditCard,
  FiFileText,
  FiImage,
  FiShield,
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';

const VendorMyPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => {
    fetchMyPlans();
  }, []);

  const formatCurrency = (amount) => {
    if (typeof amount === 'number') {
      return amount.toFixed(0);
    }
    return amount || '0';
  };

  const fetchMyPlans = async () => {
    try {
      const vendorId = localStorage.getItem('vendorId');
      if (!vendorId) {
        console.error('Vendor ID not found');
        return;
      }

      const response = await fetch(`https://api.vegiffyy.com/api/vendor/myplan/${vendorId}`);
      const result = await response.json();

      console.log('API Response:', result); // Debug log

      // FIXED: Check for different success messages
      if (result.success) {
        // Agar data hai to array mein convert karo
        if (result.data) {
          // Single object ko array mein convert karo
          const plansData = Array.isArray(result.data) ? result.data : [result.data];
          setPlans(plansData);
        } else {
          console.log('No data in response');
          setPlans([]);
        }
      } else {
        console.error('Failed to fetch plans:', result.message);
        setPlans([]);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPlanData = (plan) => {
    if (!plan) return null;
    
    const purchaseDate = new Date(plan.planPurchaseDate || plan.purchaseDate);
    const expiryDate = new Date(plan.expiryDate);
    const now = new Date();
    const isActive = now < expiryDate;
    const daysRemaining = Math.max(0, Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)));

    // Check if it's bank transfer or razorpay
    const isBankTransfer = plan.transactionId?.startsWith('BANK_') || plan.paymentMethod === 'bank_transfer';
    
    return {
      _id: plan._id || plan.id,
      planName: plan.planId?.name || 'Vendor Plan',
      planId: plan.planId?._id || plan.planId,
      baseAmount: plan.amount || plan.baseAmount || 0,
      gstAmount: plan.gstAmount || 0,
      totalAmount: plan.totalAmount || 0,
      formattedTotalAmount: formatCurrency(plan.totalAmount || 0),
      validity: plan.planId?.validity || plan.validity || 1,
      benefits: plan.planId?.benefits || ['Restaurant listing', 'Order management', 'Customer analytics'],
      transactionId: plan.transactionId || 'N/A',
      razorpayPaymentId: plan.razorpayPaymentId || null,
      purchaseDate: plan.planPurchaseDate || plan.purchaseDate,
      expiryDate: plan.expiryDate,
      isPurchased: plan.isPurchased || true,
      status: plan.status || (isActive ? 'active' : 'expired'),
      daysRemaining: isActive ? daysRemaining : 0,
      isActive,
      vendorId: plan.vendorId,
      
      // Bank Transfer Details
      bankDetails: plan.bankDetails || null,
      paymentScreenshot: plan.paymentScreenshot || null,
      screenshotUploadedAt: plan.screenshotUploadedAt || null,
      paymentMethod: isBankTransfer ? 'bank_transfer' : 'razorpay',
      isBankTransfer,
      
      // Additional fields from response
      submittedAt: plan.submittedAt,
      verifiedAt: plan.verifiedAt,
      verifiedBy: plan.verifiedBy,
      addedBy: plan.addedBy,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    };
  };

  const openPlanDetails = (plan) => {
    setSelectedPlan(plan);
    setShowPlanModal(true);
  };

  const closePlanDetails = () => {
    setSelectedPlan(null);
    setShowPlanModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'active':
        return <FiCheck className="w-4 h-4 text-green-600" />;
      case 'pending_verification':
        return <FiClock className="w-4 h-4 text-yellow-600" />;
      case 'expired':
        return <FiX className="w-4 h-4 text-red-600" />;
      case 'failed':
        return <FiAlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FiClock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed & Active';
      case 'active':
        return 'Active';
      case 'pending_verification':
        return 'Pending Verification';
      case 'expired':
        return 'Expired';
      case 'failed':
        return 'Payment Failed';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your plans...</p>
        </div>
      </div>
    );
  }

  // Filter out null plans
  const formattedPlans = plans.map(formatPlanData).filter(plan => plan !== null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiTag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Vendor Plans</h1>
                <p className="text-gray-600">Your purchased vendor plans and their status</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">{formattedPlans.length}</p>
              <p className="text-sm text-gray-600">Total Plans</p>
              {formattedPlans.length > 0 && (
                <div className="flex space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(formattedPlans[0]?.status || '')}`}>
                    {getStatusText(formattedPlans[0]?.status || '')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formattedPlans.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Plans Found</h3>
                <p className="text-gray-500 mb-6">
                  You haven't purchased any vendor plans yet.
                </p>
                <button
                  onClick={() => window.location.href = '/vendor/payments'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  Purchase a Plan
                </button>
              </div>
            </div>
          ) : (
            formattedPlans.map((plan) => (
              <div
                key={plan._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Plan Header */}
                <div className={`p-6 text-white ${plan.isBankTransfer ? 'bg-gradient-to-r from-purple-600 to-purple-700' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{plan.planName}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-sm opacity-90">
                          {plan.isBankTransfer ? 'Bank Transfer' : 'Razorpay'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold flex items-center">
                        <FaRupeeSign className="w-5 h-5 mr-1" />
                        {plan.formattedTotalAmount}
                      </div>
                      <div className="text-sm opacity-90 mt-1">
                        {plan.validity} Day{plan.validity > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs opacity-80">
                    <div className="flex justify-between">
                      <span>Base: ₹{plan.baseAmount}</span>
                      <span>GST: ₹{formatCurrency(plan.gstAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Plan Content */}
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(plan.status)}`}>
                      {getStatusIcon(plan.status)}
                      <span className="ml-1 capitalize">{getStatusText(plan.status)}</span>
                    </span>
                    {plan.isActive && plan.status === 'completed' && (
                      <span className="text-sm text-green-600 font-medium">
                        {plan.daysRemaining} days left
                      </span>
                    )}
                  </div>

                  {/* Payment Method Badge */}
                  <div className="mb-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${plan.isBankTransfer ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                      <span className="font-medium">
                        {plan.isBankTransfer ? 'Bank Transfer' : 'Online Payment'}
                      </span>
                    </div>
                  </div>

                  {/* Transaction ID */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Transaction ID</div>
                    <div className="font-mono text-sm truncate" title={plan.transactionId}>
                      {plan.transactionId}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Purchased:</span>
                      <span className="font-medium">
                        {formatDate(plan.purchaseDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Expires:</span>
                      <span className="font-medium">
                        {formatDate(plan.expiryDate)}
                      </span>
                    </div>
                  </div>

                  {/* Screenshot Preview (if available) */}
                  {plan.paymentScreenshot && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">Payment Screenshot</div>
                      <div 
                        className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => window.open(plan.paymentScreenshot, '_blank')}
                      >
                        <div className="text-center">
                          <FiImage className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                          <span className="text-xs text-gray-600">View Receipt</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => openPlanDetails(plan)}
                    className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <FiFileText className="w-4 h-4 mr-2" />
                    View Complete Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Plan Details Modal */}
        {showPlanModal && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Vendor Plan Details</h3>
                    <p className="text-gray-500 text-sm">Complete payment and plan information</p>
                  </div>
                  <button
                    onClick={closePlanDetails}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Plan Header */}
                  <div className={`rounded-lg p-5 text-white ${selectedPlan.isBankTransfer ? 'bg-gradient-to-r from-purple-600 to-purple-700' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div className="mb-4 md:mb-0">
                        <div className="flex items-center">
                          <h4 className="text-xl font-bold">{selectedPlan.planName}</h4>
                          <span className="ml-2 text-sm bg-white/20 px-2 py-0.5 rounded">
                            Vendor Plan
                          </span>
                        </div>
                        <div className="flex items-center mt-2">
                          <span className="text-sm opacity-90">
                            {selectedPlan.isBankTransfer ? 'Bank Transfer Payment' : 'Online Payment'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold flex items-center justify-end">
                          <FaRupeeSign className="w-6 h-6 mr-1" />
                          {selectedPlan.formattedTotalAmount}
                        </div>
                        <div className="mt-1 opacity-90">
                          {selectedPlan.validity} Day{selectedPlan.validity > 1 ? 's' : ''} Validity
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-sm opacity-80 grid grid-cols-2 gap-2">
                      <div>Base Amount: ₹{selectedPlan.baseAmount}</div>
                      <div className="text-right">GST (18%): ₹{formatCurrency(selectedPlan.gstAmount)}</div>
                    </div>
                  </div>

                  {/* Status Card */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getStatusIcon(selectedPlan.status)}
                        <div className="ml-3">
                          <h5 className="font-semibold text-gray-900">Payment Status</h5>
                          <p className={`text-sm font-medium ${getStatusColor(selectedPlan.status).split(' ')[1]}`}>
                            {getStatusText(selectedPlan.status)}
                          </p>
                        </div>
                      </div>
                      {selectedPlan.isActive && selectedPlan.daysRemaining > 0 && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{selectedPlan.daysRemaining}</div>
                          <div className="text-xs text-gray-600">days remaining</div>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      {selectedPlan.verifiedAt ? (
                        <p>Verified on {formatDate(selectedPlan.verifiedAt)} by {selectedPlan.verifiedBy || 'Admin'}</p>
                      ) : (
                        <p>Submitted on {formatDate(selectedPlan.submittedAt)}</p>
                      )}
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="bg-white border rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <FiAward className="w-5 h-5 text-gray-400 mr-2" />
                          <h6 className="font-semibold text-gray-900">Transaction Details</h6>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-500">Transaction ID</p>
                            <p className="font-mono text-sm font-medium" title={selectedPlan.transactionId}>
                              {selectedPlan.transactionId}
                            </p>
                          </div>
                          {selectedPlan.razorpayPaymentId && (
                            <div>
                              <p className="text-xs text-gray-500">Razorpay Payment ID</p>
                              <p className="font-mono text-sm font-medium">
                                {selectedPlan.razorpayPaymentId}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-gray-500">Payment Method</p>
                            <p className="text-sm font-medium">
                              {selectedPlan.isBankTransfer ? 'Bank Transfer' : 'Online Payment'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <FiCalendar className="w-5 h-5 text-gray-400 mr-2" />
                          <h6 className="font-semibold text-gray-900">Plan Dates</h6>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-500">Purchase Date</p>
                            <p className="text-sm font-medium">{formatDate(selectedPlan.purchaseDate)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Expiry Date</p>
                            <p className="text-sm font-medium">{formatDate(selectedPlan.expiryDate)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Submitted At</p>
                            <p className="text-sm font-medium">{formatDate(selectedPlan.submittedAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Bank Details (if bank transfer) */}
                      {selectedPlan.bankDetails && (
                        <div className="bg-white border rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <FiDollarSign className="w-5 h-5 text-gray-400 mr-2" />
                            <h6 className="font-semibold text-gray-900">Bank Details</h6>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-gray-500">Account Name</p>
                              <p className="text-sm font-medium">{selectedPlan.bankDetails.accountName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Account Number</p>
                              <p className="font-mono text-sm font-medium">{selectedPlan.bankDetails.accountNumber}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Bank Name</p>
                              <p className="text-sm font-medium">{selectedPlan.bankDetails.bankName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">IFSC Code</p>
                              <p className="font-mono text-sm font-medium">{selectedPlan.bankDetails.ifscCode}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Payment Screenshot (if available) */}
                      {selectedPlan.paymentScreenshot && (
                        <div className="bg-white border rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <FiImage className="w-5 h-5 text-gray-400 mr-2" />
                            <h6 className="font-semibold text-gray-900">Payment Receipt</h6>
                          </div>
                          <div className="text-center">
                            <div 
                              className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                              onClick={() => window.open(selectedPlan.paymentScreenshot, '_blank')}
                            >
                              <img 
                                src={selectedPlan.paymentScreenshot} 
                                alt="Payment Screenshot" 
                                className="w-full h-full object-contain"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-sm font-medium">Click to view full image</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Uploaded on {formatDate(selectedPlan.screenshotUploadedAt)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <FiDollarSign className="w-5 h-5 text-gray-400 mr-2" />
                      <h6 className="font-semibold text-gray-900">Payment Breakdown</h6>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Base Plan Amount</span>
                        <span className="font-medium">₹{selectedPlan.baseAmount}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">GST (18%)</span>
                        <span className="font-medium">₹{formatCurrency(selectedPlan.gstAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-800 font-semibold">Total Amount Paid</span>
                        <span className="text-lg font-bold text-blue-600">
                          ₹{selectedPlan.formattedTotalAmount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* System Information */}
                  <div className="bg-gray-50 border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <FiShield className="w-5 h-5 text-gray-400 mr-2" />
                      <h6 className="font-semibold text-gray-900">System Information</h6>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Vendor ID</p>
                        <p className="font-mono font-medium truncate">{selectedPlan.vendorId}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Plan ID</p>
                        <p className="font-mono font-medium truncate">{selectedPlan.planId}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-medium">{formatDate(selectedPlan.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Updated</p>
                        <p className="font-medium">{formatDate(selectedPlan.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  {selectedPlan.paymentScreenshot && (
                    <button
                      onClick={() => window.open(selectedPlan.paymentScreenshot, '_blank')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                    >
                      <FiImage className="w-4 h-4 mr-2" />
                      View Receipt
                    </button>
                  )}
                  {!selectedPlan.isActive && selectedPlan.status === 'expired' && (
                    <button
                      onClick={() => window.location.href = '/vendor/payments'}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Renew Plan
                    </button>
                  )}
                  <button
                    onClick={closePlanDetails}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorMyPlans;
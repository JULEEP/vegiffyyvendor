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
} from 'react-icons/fi';

const VendorMyPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => {
    fetchMyPlans();
  }, []);

  const formatCurrency = (amount) => {
    // Format amount to show only one decimal place
    if (typeof amount === 'number') {
      return amount.toFixed(1);
    }
    return amount || '0.0';
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

      if (result.success && result.message === "Vendor payment details fetched successfully") {
        // Convert single plan object to array for consistent handling
        const plansData = result.data ? [result.data] : [];
        setPlans(plansData);
      } else {
        console.error('Failed to fetch plans:', result.message);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPlanData = (plan) => {
    const purchaseDate = new Date(plan.planPurchaseDate);
    const expiryDate = new Date(plan.expiryDate);
    const now = new Date();
    const isActive = now < expiryDate;
    const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    return {
      _id: plan._id,
      planName: plan.planId?.name || 'Vendor Plan',
      baseAmount: plan.amount || 0,
      gstAmount: plan.gstAmount || 0,
      totalAmount: plan.totalAmount || 0,
      formattedTotalAmount: formatCurrency(plan.totalAmount || 0),
      validity: plan.planId?.validity || 1,
      benefits: plan.planId?.benefits || ['Restaurant listing', 'Order management', 'Customer analytics'],
      transactionId: plan.transactionId || 'N/A',
      razorpayPaymentId: plan.razorpayPaymentId || 'N/A',
      purchaseDate: plan.planPurchaseDate,
      expiryDate: plan.expiryDate,
      isPurchased: plan.isPurchased,
      status: isActive ? 'active' : 'expired',
      daysRemaining: isActive ? daysRemaining : 0,
      isActive,
      vendorId: plan.vendorId,
      planId: plan.planId
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
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FiCheck className="w-4 h-4 text-green-600" />;
      case 'expired':
        return <FiX className="w-4 h-4 text-red-600" />;
      case 'completed':
        return <FiCheck className="w-4 h-4 text-blue-600" />;
      default:
        return <FiClock className="w-4 h-4 text-gray-600" />;
    }
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

  const formattedPlans = plans.map(formatPlanData);

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
              <p className="text-sm text-green-600">
                {formattedPlans.filter(p => p.isActive).length} Active
              </p>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formattedPlans.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Plans Found</h3>
                <p className="text-gray-500 mb-6">
                  You haven't purchased any vendor plans yet.
                </p>
                <button
                  onClick={() => window.location.href = '/vendor/payments'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
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
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{plan.planName}</h3>
                      <p className="text-blue-100 text-sm mt-1">Vendor Plan</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">₹{plan.formattedTotalAmount}</div>
                      <div className="text-blue-100 text-sm">{plan.validity} Days</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-100">
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
                      <span className="ml-1 capitalize">{plan.status}</span>
                    </span>
                    {plan.isActive && (
                      <span className="text-sm text-green-600 font-medium">
                        {plan.daysRemaining} days left
                      </span>
                    )}
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2 mb-4">
                    <h4 className="font-semibold text-gray-900 text-sm">Benefits:</h4>
                    <ul className="space-y-1">
                      {plan.benefits.slice(0, 3).map((benefit, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <FiCheck className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          <span className="truncate">{benefit}</span>
                        </li>
                      ))}
                      {plan.benefits.length > 3 && (
                        <li className="text-xs text-blue-600">
                          +{plan.benefits.length - 3} more benefits
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Purchased:</span>
                      <span className="font-medium">
                        {new Date(plan.purchaseDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Expires:</span>
                      <span className="font-medium">
                        {new Date(plan.expiryDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => openPlanDetails(plan)}
                    className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Plan Details Modal */}
        {showPlanModal && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Vendor Plan Details</h3>
                  <button
                    onClick={closePlanDetails}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Plan Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-lg font-bold">{selectedPlan.planName}</h4>
                        <p className="text-blue-100">Vendor Subscription Plan</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">₹{selectedPlan.formattedTotalAmount}</div>
                        <div className="text-blue-100">{selectedPlan.validity} day validity</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-blue-100 grid grid-cols-2 gap-2">
                      <div>Base: ₹{selectedPlan.baseAmount}</div>
                      <div className="text-right">GST: ₹{formatCurrency(selectedPlan.gstAmount)}</div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {getStatusIcon(selectedPlan.status)}
                      <span className="ml-2 font-medium text-gray-900 capitalize">
                        {selectedPlan.status}
                      </span>
                    </div>
                    {selectedPlan.isActive && (
                      <div className="text-green-600 font-medium">
                        {selectedPlan.daysRemaining} days remaining
                      </div>
                    )}
                  </div>

                  {/* Transaction Details */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiDollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Base Amount</p>
                        <p className="font-medium text-gray-900">
                          ₹{selectedPlan.baseAmount}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiPercent className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">GST Amount</p>
                        <p className="font-medium text-gray-900">
                          ₹{formatCurrency(selectedPlan.gstAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiDollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Total Amount Paid</p>
                        <p className="font-bold text-blue-600 text-lg">
                          ₹{selectedPlan.formattedTotalAmount}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiAward className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Transaction ID</p>
                        <p className="font-medium text-gray-900 font-mono text-sm">
                          {selectedPlan.transactionId}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiAward className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Razorpay Payment ID</p>
                        <p className="font-medium text-gray-900 font-mono text-sm">
                          {selectedPlan.razorpayPaymentId}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiCalendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Purchase Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedPlan.purchaseDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiClock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Expiry Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedPlan.expiryDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <FiUser className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Vendor ID</p>
                        <p className="font-medium text-gray-900 font-mono text-sm">
                          {selectedPlan.vendorId}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="p-4 bg-white border rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Plan Benefits</h4>
                    <ul className="space-y-2">
                      {selectedPlan.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <FiCheck className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {!selectedPlan.isActive && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <FiAlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                        <p className="text-sm text-yellow-800">
                          This plan has expired. Purchase a new plan to continue your restaurant services.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  {!selectedPlan.isActive && (
                    <button
                      onClick={() => window.location.href = '/vendor/payments'}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Renew Plan
                    </button>
                  )}
                  <button
                    onClick={closePlanDetails}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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
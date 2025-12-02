import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiDollarSign,
  FiCreditCard,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiArrowUp,
  FiArrowDown,
  FiRefreshCw,
  FiX,
  FiAlertCircle,
  FiCheck,
  FiLoader
} from 'react-icons/fi';

const MyWallet = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Withdrawal form state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [accountDetails, setAccountDetails] = useState({
    bankName: '',
    accountNumber: '',
    ifsc: '',
    accountHolder: ''
  });

  const vendorId = localStorage.getItem("vendorId");

  const fetchWalletData = async () => {
    try {
      setError('');
      const res = await axios.get(`http://31.97.206.144:5051/api/getwallet/${vendorId}`);

      if (res.data?.success) {
        setWalletData(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to fetch wallet data');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Server error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchWalletData();
    } else {
      setError('Vendor ID not found. Please login again.');
      setLoading(false);
    }
  }, [vendorId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWalletData();
  };

  const handleWithdraw = async () => {
    // Validation
    if (!withdrawAmount || isNaN(withdrawAmount) || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawAmount) > (walletData?.walletBalance || 0)) {
      alert('Insufficient balance for withdrawal');
      return;
    }

    if (!accountDetails.bankName || !accountDetails.accountNumber || !accountDetails.ifsc || !accountDetails.accountHolder) {
      alert('Please fill all bank account details');
      return;
    }

    setWithdrawLoading(true);
    try {
      const res = await axios.post(`http://31.97.206.144:5051/api/walletwithdraw/${vendorId}`, {
        amount: parseFloat(withdrawAmount),
        accountDetails: {
          bankName: accountDetails.bankName,
          accountNumber: accountDetails.accountNumber,
          ifsc: accountDetails.ifsc,
          accountHolder: accountDetails.accountHolder
        }
      });

      if (res.data?.success) {
        alert('Withdrawal request submitted successfully!');
        setShowWithdraw(false);
        resetWithdrawForm();
        fetchWalletData(); // Refresh wallet data
      } else {
        alert(res.data?.message || 'Failed to submit withdrawal request');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Server error');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const resetWithdrawForm = () => {
    setWithdrawAmount('');
    setAccountDetails({
      bankName: '',
      accountNumber: '',
      ifsc: '',
      accountHolder: ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    return type === 'credit' ?
      <FiArrowUp className="text-green-500" /> :
      <FiArrowDown className="text-red-500" />;
  };

  const getTransactionColor = (type) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionBgColor = (type) => {
    return type === 'credit' ? 'bg-green-50' : 'bg-red-50';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FiCheck className="mr-1" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FiLoader className="mr-1" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FiX className="mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <FiCreditCard className="text-red-500 text-4xl mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Wallet</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiCreditCard className="text-gray-400 text-4xl mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-600">No Wallet Data Found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FiCreditCard className="text-blue-600" />
              My Wallet
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your earnings and track transactions
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowWithdraw(true)}
              disabled={!walletData.walletBalance || walletData.walletBalance <= 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDollarSign />
              Withdraw
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Wallet Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Balance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Balance</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ₹{walletData.walletBalance?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FiDollarSign className="text-blue-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <FiTrendingUp />
              <span>Available for withdrawal</span>
            </div>
          </div>

          {/* Total Earnings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ₹{walletData.totalEarnings?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FiTrendingUp className="text-green-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <FiClock />
              <span>All time earnings</span>
            </div>
          </div>

          {/* Restaurant Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Restaurant</p>
                <p className="text-lg font-semibold text-gray-900 mt-2 truncate">
                  {walletData.restaurantName}
                </p>
                <p className="text-sm text-gray-500 mt-1 truncate">
                  {walletData.email}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FiCheckCircle className="text-purple-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              ID: {walletData._id}
            </div>
          </div>
        </div>

        {/* Transactions and Withdrawal Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Transactions Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FiClock className="text-gray-500" />
                Recent Transactions
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {walletData.transactions?.length || 0} transactions found
              </p>
            </div>

            <div className="p-6">
              {!walletData.transactions || walletData.transactions.length === 0 ? (
                <div className="text-center py-8">
                  <FiCreditCard className="text-gray-400 text-4xl mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Transactions Yet</h3>
                  <p className="text-gray-500">Your transaction history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {walletData.transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${getTransactionBgColor(transaction.type)}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="capitalize">{transaction.transactionType}</span>
                            <span>•</span>
                            <span>{formatDate(transaction.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`text-lg font-semibold ${getTransactionColor(transaction.type)}`}>
                          {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Balance: ₹{transaction.balanceAfter}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Withdrawal Requests Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FiDollarSign className="text-gray-500" />
                Withdrawal Requests
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {walletData.withdrawalRequests?.length || 0} requests found
              </p>
            </div>

            <div className="p-6">
              {!walletData.withdrawalRequests || walletData.withdrawalRequests.length === 0 ? (
                <div className="text-center py-8">
                  <FiDollarSign className="text-gray-400 text-4xl mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Withdrawal Requests</h3>
                  <p className="text-gray-500">Your withdrawal requests will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {walletData.withdrawalRequests.map((request) => (
                        <tr key={request._id} className="hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-900">
                              ₹{request.amount?.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(request.status)}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {formatDate(request.createdAt)}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {request._id.slice(-8)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Wallet Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Funds are available for withdrawal immediately</li>
              <li>• Track all your earnings and expenses here</li>
              <li>• Contact support for any wallet-related issues</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Need Help?</h3>
            <p className="text-sm text-green-700">
              If you have any questions about your wallet balance or transactions,
              please contact our support team.
            </p>
          </div>
        </div>

      </div>

      {/* Withdrawal Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => {
                setShowWithdraw(false);
                resetWithdrawForm();
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiCreditCard className="text-green-600" />
              Withdraw Funds
            </h3>

            <div className="space-y-4">
              {/* Current Balance Info */}
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">Available Balance: ₹{walletData.walletBalance?.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Restaurant: {walletData.restaurantName}</p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Withdrawal Amount (₹) *
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount to withdraw"
                  min="1"
                  max={walletData.walletBalance}
                  step="0.01"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: ₹{walletData.walletBalance?.toLocaleString()}
                </p>
              </div>

              {/* Bank Details */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Bank Account Details *</h4>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={accountDetails.accountHolder}
                    onChange={(e) => setAccountDetails(prev => ({
                      ...prev,
                      accountHolder: e.target.value
                    }))}
                    placeholder="Enter account holder name"
                    className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={accountDetails.bankName}
                    onChange={(e) => setAccountDetails(prev => ({
                      ...prev,
                      bankName: e.target.value
                    }))}
                    placeholder="Enter bank name"
                    className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Account Number</label>
                  <input
                    type="text"
                    inputMode="numeric" // 👈 numeric keyboard but value string rahegi
                    pattern="[0-9]*"
                    value={accountDetails.accountNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) {   // only digits allowed
                        setAccountDetails(prev => ({
                          ...prev,
                          accountNumber: val
                        }));
                      }
                    }}
                    maxLength={50} // 👈 optional (increase limit)
                    placeholder="Enter account number"
                    className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />

                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={accountDetails.ifsc}
                    onChange={(e) => setAccountDetails(prev => ({
                      ...prev,
                      ifsc: e.target.value
                    }))}
                    placeholder="Enter IFSC code"
                    className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Info Note */}
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-800">
                  Withdrawal requests are processed within 2-3 business days. You will receive a confirmation email once processed.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowWithdraw(false);
                  resetWithdrawForm();
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
                disabled={withdrawLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawLoading || !withdrawAmount || !accountDetails.bankName || !accountDetails.accountNumber || !accountDetails.ifsc || !accountDetails.accountHolder}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {withdrawLoading ? "Processing..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyWallet;
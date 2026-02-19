import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaRupeeSign,
  FaCreditCard,
  FaUser,
  FaPhone,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendar,
  FaBuilding,
  FaMapMarkerAlt
} from "react-icons/fa";
import axios from "axios";

const AccountManagement = () => {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [viewingAccount, setViewingAccount] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    ifscCode: "",
    branchName: "",
    accountType: "savings",
    phoneNumber: "",
    email: "",
    isPrimary: false
  });

  const vendorId = localStorage.getItem("vendorId");
  const API_BASE_URL = "https://api.vegiffyy.com/api/vendor";

  // Show message
  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  // Fetch accounts on component mount
  useEffect(() => {
    if (vendorId) {
      fetchAccounts();
    }
  }, [vendorId]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/allaccounts/${vendorId}`
      );
      
      if (response.data.success) {
        setAccounts(response.data.data || []);
      } else {
        showMessage(response.data.message || "Failed to fetch accounts", "error");
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      showMessage("Failed to load accounts. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.accountHolderName.trim()) {
      showMessage("Account holder name is required", "error");
      return false;
    }
    if (!formData.accountNumber.trim()) {
      showMessage("Account number is required", "error");
      return false;
    }
    if (!formData.bankName.trim()) {
      showMessage("Bank name is required", "error");
      return false;
    }
    if (!formData.ifscCode.trim()) {
      showMessage("IFSC Code is required", "error");
      return false;
    }
    if (!formData.branchName.trim()) {
      showMessage("Branch name is required", "error");
      return false;
    }
    if (formData.ifscCode.length !== 11) {
      showMessage("IFSC Code must be 11 characters", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const payload = {
        vendorId,
        ...formData,
        status: "active"
      };

      let response;
      if (editingId) {
        // Update existing account
        response = await axios.put(
          `${API_BASE_URL}/updateaccount/${editingId}`,
          payload
        );
        showMessage("Account updated successfully!");
      } else {
        // Create new account
        response = await axios.post(
          "https://api.vegiffyy.com/api/vendor/createaccounts",
          payload
        );
        showMessage("Account added successfully!");
      }

      if (response.data.success) {
        // Reset form
        setFormData({
          accountHolderName: "",
          accountNumber: "",
          bankName: "",
          ifscCode: "",
          branchName: "",
          accountType: "savings",
          phoneNumber: "",
          email: "",
          isPrimary: false
        });
        setEditingId(null);
        
        // Refresh accounts list
        fetchAccounts();
      } else {
        showMessage(response.data.message || "Operation failed", "error");
      }
    } catch (error) {
      console.error("Error saving account:", error);
      showMessage(error.response?.data?.message || "Failed to save account", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (account) => {
    setFormData({
      accountHolderName: account.accountHolderName || "",
      accountNumber: account.accountNumber || "",
      bankName: account.bankName || "",
      ifscCode: account.ifscCode || "",
      branchName: account.branchName || "",
      accountType: account.accountType || "savings",
      phoneNumber: account.phoneNumber || "",
      email: account.email || "",
      isPrimary: account.isPrimary || false
    });
    setEditingId(account._id);
    
    // Scroll to form
    document.getElementById('accountForm').scrollIntoView({ behavior: 'smooth' });
  };

  const handleView = (account) => {
    setViewingAccount(account);
  };

  const closePopup = () => {
    setViewingAccount(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(
        `${API_BASE_URL}/deleteaccount/${id}`
      );

      if (response.data.success) {
        showMessage("Account deleted successfully!");
        fetchAccounts();
      } else {
        showMessage(response.data.message || "Failed to delete account", "error");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      showMessage("Failed to delete account", "error");
    } finally {
      setLoading(false);
    }
  };

  const setAsPrimary = async (id) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}/updateaccount/${id}`,
        { 
          vendorId,
          isPrimary: true 
        }
      );

      if (response.data.success) {
        showMessage("Primary account updated!");
        fetchAccounts();
      } else {
        showMessage(response.data.message || "Failed to update primary account", "error");
      }
    } catch (error) {
      console.error("Error setting primary account:", error);
      showMessage("Failed to set primary account", "error");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      accountHolderName: "",
      accountNumber: "",
      bankName: "",
      ifscCode: "",
      branchName: "",
      accountType: "savings",
      phoneNumber: "",
      email: "",
      isPrimary: false
    });
    setEditingId(null);
  };

  // Mask account number for security
  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return '';
    const lastFour = accountNumber.slice(-4);
    return `**** **** **** ${lastFour}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Message Display */}
        {message.text && (
          <div className={`mb-4 p-4 rounded-xl border-2 font-medium ${
            message.type === "error" 
              ? "bg-red-50 text-red-800 border-red-300" 
              : "bg-green-50 text-green-800 border-green-300"
          }`}>
            {message.text}
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-l-4 border-blue-600">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Account Management
              </h1>
              <p className="text-gray-600">
                Manage your bank accounts for receiving payments
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {accounts.length} Accounts
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {accounts.filter(a => a.isPrimary).length} Primary
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Add/Edit Account Form */}
          <div className="lg:col-span-1">
            <div id="accountForm" className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      {editingId ? (
                        <>
                          <FaEdit className="inline mr-2" />
                          Edit Account
                        </>
                      ) : (
                        <>
                          <FaPlus className="inline mr-2" />
                          Add New Account
                        </>
                      )}
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      {editingId ? "Update your account details" : "Add a new bank account to receive payments"}
                    </p>
                  </div>
                  {editingId && (
                    <button
                      onClick={clearForm}
                      className="text-white hover:text-blue-200 transition-colors"
                    >
                      <FaTimesCircle className="text-xl" />
                    </button>
                  )}
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Account Holder Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline mr-2 text-blue-600" />
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="Enter account holder name as per bank"
                    required
                  />
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCreditCard className="inline mr-2 text-blue-600" />
                    Account Number *
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="Enter bank account number"
                    required
                  />
                </div>

                {/* Bank Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaBuilding className="inline mr-2 text-blue-600" />
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="Enter bank name"
                    required
                  />
                </div>

                {/* IFSC Code */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaFileAlt className="inline mr-2 text-blue-600" />
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 uppercase"
                    placeholder="Enter 11-character IFSC code"
                    maxLength="11"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Example: SBIN0001234 (11 characters)
                  </p>
                </div>

                {/* Branch Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaMapMarkerAlt className="inline mr-2 text-blue-600" />
                    Branch Name *
                  </label>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="Enter branch name and city"
                    required
                  />
                </div>

                {/* Account Type and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type *
                    </label>
                    <select
                      name="accountType"
                      value={formData.accountType}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      required
                    >
                      <option value="savings">Savings Account</option>
                      <option value="current">Current Account</option>
                      <option value="salary">Salary Account</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaPhone className="inline mr-2 text-blue-600" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      placeholder="Linked phone number"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="Linked email address"
                  />
                </div>

                {/* Primary Account Checkbox */}
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    name="isPrimary"
                    checked={formData.isPrimary}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isPrimary" className="text-gray-700 font-medium">
                    Set as Primary Account
                  </label>
                  <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Recommended
                  </span>
                </div>
                <p className="text-sm text-gray-500 -mt-3">
                  Primary account will be used for all automatic payouts
                </p>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-blue-900 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-bold text-lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        {editingId ? "Updating..." : "Adding..."}
                      </div>
                    ) : (
                      <>
                        {editingId ? (
                          <>
                            <FaEdit className="inline mr-2" />
                            Update Account
                          </>
                        ) : (
                          <>
                            <FaPlus className="inline mr-2" />
                            Add Account
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Account List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
              {/* List Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      <FaCreditCard className="inline mr-2" />
                      Your Bank Accounts
                    </h2>
                    <p className="text-green-100 text-sm mt-1">
                      {accounts.length} account(s) registered
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{accounts.length}</div>
                    <div className="text-green-200 text-xs">Accounts</div>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && !accounts.length ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading accounts...</p>
                </div>
              ) : accounts.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 text-gray-300">
                    <FaCreditCard className="w-full h-full" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Accounts Found</h3>
                  <p className="text-gray-500 mb-6">Add your first bank account to start receiving payments</p>
                </div>
              ) : (
                <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                  {accounts.map((account) => (
                    <div
                      key={account._id}
                      className={`border-2 rounded-xl p-5 transition-all duration-300 hover:shadow-md ${
                        account.isPrimary
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      {/* Account Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-800 text-lg">
                              {account.accountHolderName}
                            </h3>
                            {account.isPrimary && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full flex items-center gap-1">
                                <FaCheckCircle className="text-xs" />
                                PRIMARY
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">
                            {account.bankName} • {account.accountType.toUpperCase()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(account)}
                            className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-2 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          {!account.isPrimary && (
                            <button
                              onClick={() => setAsPrimary(account._id)}
                              className="text-green-600 hover:text-green-800 hover:bg-green-50 p-2 rounded-lg transition-colors"
                              title="Set as Primary"
                            >
                              <FaCheckCircle />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(account)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                            title="Edit Account"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(account._id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            title="Delete Account"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      {/* Account Details */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Account Number</p>
                            <p className="font-mono font-semibold text-gray-800">
                              {maskAccountNumber(account.accountNumber)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">IFSC Code</p>
                            <p className="font-semibold text-gray-800">
                              {account.ifscCode}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">Branch</p>
                          <p className="font-medium text-gray-700">
                            {account.branchName}
                          </p>
                        </div>

                        {/* Contact Info */}
                        {(account.phoneNumber || account.email) && (
                          <div className="pt-3 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {account.phoneNumber && (
                                <div className="flex items-center gap-2">
                                  <FaPhone className="text-gray-400 text-sm" />
                                  <span className="text-sm text-gray-600">
                                    {account.phoneNumber}
                                  </span>
                                </div>
                              )}
                              {account.email && (
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                  </svg>
                                  <span className="text-sm text-gray-600">
                                    {account.email}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                          <div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              account.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : account.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {account.status?.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <FaCalendar className="mr-1" />
                            {new Date(account.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer Info */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                      <FaRupeeSign className="inline mr-1" />
                      Payout Information
                    </h4>
                    <p className="text-xs text-gray-500">
                      Payments are processed to your primary account every 7 days
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Last Updated</div>
                    <div className="text-sm font-semibold text-gray-700">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Account Details Modal */}
        {viewingAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      <FaEye className="inline mr-2" />
                      Account Details
                    </h2>
                    <p className="text-purple-100 text-sm mt-1">
                      Complete account information
                    </p>
                  </div>
                  <button
                    onClick={closePopup}
                    className="text-white hover:text-purple-200 transition-colors"
                  >
                    <FaTimesCircle className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Account Status Badge */}
                <div className="mb-6 text-center">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    viewingAccount.isPrimary
                      ? 'bg-green-100 text-green-800 border-2 border-green-300'
                      : 'bg-gray-100 text-gray-800 border-2 border-gray-300'
                  }`}>
                    {viewingAccount.isPrimary ? 'PRIMARY ACCOUNT' : 'SECONDARY ACCOUNT'}
                  </span>
                </div>

                {/* Account Details Grid */}
                <div className="space-y-5">
                  {/* Account Holder */}
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="text-xs text-blue-600 font-medium mb-1 flex items-center">
                      <FaUser className="mr-2" />
                      Account Holder
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {viewingAccount.accountHolderName}
                    </div>
                  </div>

                  {/* Account Number - Full View */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-xs text-gray-600 font-medium mb-1 flex items-center">
                      <FaCreditCard className="mr-2" />
                      Account Number
                    </div>
                    <div className="font-mono text-lg font-bold text-gray-800 tracking-wider text-center py-2">
                      {viewingAccount.accountNumber}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      Complete number visible for verification
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 p-4 rounded-xl">
                      <div className="text-xs text-gray-600 font-medium mb-1 flex items-center">
                        <FaBuilding className="mr-2" />
                        Bank Name
                      </div>
                      <div className="font-semibold text-gray-800">
                        {viewingAccount.bankName}
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-xl">
                      <div className="text-xs text-gray-600 font-medium mb-1">
                        Account Type
                      </div>
                      <div className="font-semibold text-gray-800 capitalize">
                        {viewingAccount.accountType}
                      </div>
                    </div>
                  </div>

                  {/* IFSC Code */}
                  <div className="bg-yellow-50 p-4 rounded-xl">
                    <div className="text-xs text-yellow-700 font-medium mb-1 flex items-center">
                      <FaFileAlt className="mr-2" />
                      IFSC Code
                    </div>
                    <div className="font-mono text-lg font-bold text-gray-800 text-center">
                      {viewingAccount.ifscCode}
                    </div>
                  </div>

                  {/* Branch Details */}
                  <div className="bg-white border border-gray-200 p-4 rounded-xl">
                    <div className="text-xs text-gray-600 font-medium mb-1 flex items-center">
                      <FaMapMarkerAlt className="mr-2" />
                      Branch Details
                    </div>
                    <div className="font-semibold text-gray-800">
                      {viewingAccount.branchName}
                    </div>
                  </div>

                  {/* Contact Information */}
                  {(viewingAccount.phoneNumber || viewingAccount.email) && (
                    <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200">
                      <div className="text-xs text-gray-600 font-medium mb-3">
                        Contact Information
                      </div>
                      <div className="space-y-3">
                        {viewingAccount.phoneNumber && (
                          <div className="flex items-center">
                            <FaPhone className="text-gray-400 mr-3" />
                            <div>
                              <div className="text-xs text-gray-500">Phone Number</div>
                              <div className="font-medium text-gray-800">
                                {viewingAccount.phoneNumber}
                              </div>
                            </div>
                          </div>
                        )}
                        {viewingAccount.email && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            <div>
                              <div className="text-xs text-gray-500">Email Address</div>
                              <div className="font-medium text-gray-800">
                                {viewingAccount.email}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status and Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 p-4 rounded-xl">
                      <div className="text-xs text-gray-600 font-medium mb-1">
                        Status
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          viewingAccount.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : viewingAccount.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {viewingAccount.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-xl">
                      <div className="text-xs text-gray-600 font-medium mb-1 flex items-center">
                        <FaCalendar className="mr-2" />
                        Added Date
                      </div>
                      <div className="font-medium text-gray-800">
                        {new Date(viewingAccount.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
                  <button
                    onClick={() => {
                      closePopup();
                      handleEdit(viewingAccount);
                    }}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FaEdit className="mr-2" />
                    Edit Account
                  </button>
                  {!viewingAccount.isPrimary && (
                    <button
                      onClick={() => {
                        closePopup();
                        setAsPrimary(viewingAccount._id);
                      }}
                      className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center"
                    >
                      <FaCheckCircle className="mr-2" />
                      Set as Primary
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information Card */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-start">
            <div className="mr-4 text-purple-600">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Important Information</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Ensure account holder name matches your legal name as per bank records
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Double-check IFSC code and account number for accuracy
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Primary account receives all automatic payouts from Vegiffy
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Payments are processed every Monday for the previous week's earnings
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManagement;
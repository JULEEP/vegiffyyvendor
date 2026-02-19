import React, { useState, useEffect } from 'react';
import { 
  FiShoppingBag, 
  FiSearch, 
  FiEye, 
  FiCalendar,
  FiPhone,
  FiUser,
  FiMapPin,
  FiDollarSign,
  FiPackage,
  FiTruck,
  FiX,
  FiCreditCard,
  FiHome,
  FiMail
} from 'react-icons/fi';

const VendorUserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const vendorId = localStorage.getItem('vendorId');
      if (!vendorId) {
        console.error('Vendor ID not found');
        return;
      }

      const response = await fetch(`https://api.vegiffyy.com/api/vendor/alluserorders/${vendorId}`);
      const result = await response.json();

      if (result.success) {
        setOrders(result.data || []);
      } else {
        console.error('Failed to fetch orders:', result.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatOrderData = (order) => {
    return {
      _id: order._id,
      orderId: order._id?.substring(0, 8).toUpperCase() || 'N/A',
      customerName: `${order.userId?.firstName || ''} ${order.userId?.lastName || ''}`.trim() || 'N/A',
      customerPhone: order.userId?.phoneNumber || 'N/A',
      customerEmail: order.userId?.email || 'N/A',
      restaurantName: order.restaurantId?.restaurantName || 'N/A',
      totalAmount: order.totalPayable || 0,
      commission: order.commission || 0,
      orderStatus: order.orderStatus || 'Pending',
      paymentStatus: order.paymentStatus || 'Pending',
      deliveryStatus: order.deliveryStatus || 'Pending',
      orderDate: order.createdAt,
      totalItems: order.totalItems || 0,
      products: order.products || [],
      deliveryAddress: order.deliveryAddress,
      paymentMethod: order.paymentMethod,
      deliveryBoy: order.deliveryBoyId,
      subtotal: order.subtotal || 0,
      taxes: order.taxes || 0,
      deliveryCharge: order.deliveryCharge || 0,
      discount: order.discount || 0
    };
  };

  // Format phone number with X
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber || phoneNumber === 'N/A') return 'XXXXXX';
    
    const phoneStr = phoneNumber.toString();
    const phoneLength = phoneStr.length;
    
    if (phoneLength <= 4) return phoneStr;
    
    const lastFourDigits = phoneStr.slice(-4);
    const maskedPart = 'X'.repeat(phoneLength - 4);
    
    return `${maskedPart}${lastFourDigits}`;
  };

  // Format name with X
  const formatName = (firstName = '', lastName = '') => {
    if (!firstName && !lastName) return 'XXXXXX';
    
    const firstLetter = firstName.charAt(0) || 'X';
    const formattedLastName = lastName || 'XXXX';
    
    return `${firstLetter}. ${formattedLastName}`;
  };

  // Format email with X
  const formatEmail = (email) => {
    if (!email || email === 'N/A') return 'xxxxxx@xxxxx.xxx';
    
    const [username, domain] = email.split('@');
    if (!username || !domain) return 'xxxxxx@xxxxx.xxx';
    
    let maskedUsername = 'X'.repeat(Math.min(username.length, 6));
    if (username.length > 1) {
      maskedUsername = username.charAt(0) + 'X'.repeat(Math.max(0, username.length - 2)) + (username.length > 1 ? username.charAt(username.length - 1) : '');
    }
    
    const domainParts = domain.split('.');
    if (domainParts.length >= 2) {
      const maskedDomain = 'x'.repeat(Math.min(domainParts[0].length, 6));
      const extension = domainParts.slice(1).join('.');
      return `${maskedUsername}@${maskedDomain}.${extension}`;
    }
    
    return `${maskedUsername}@xxxxx.xxx`;
  };

  const filteredOrders = orders
    .map(formatOrderData)
    .filter(order =>
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.restaurantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.includes(searchTerm) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(order => ({
      ...order,
      customerName: formatName(order.customerName.split(' ')[0] || '', order.customerName.split(' ')[1] || ''),
      customerPhone: formatPhoneNumber(order.customerPhone),
      customerEmail: formatEmail(order.customerEmail)
    }));

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setShowOrderModal(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Calculate statistics
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalCommission = filteredOrders.reduce((sum, order) => sum + (order.commission || 0), 0);
  const netRevenue = totalRevenue - totalCommission;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FiShoppingBag className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Restaurant Orders</h1>
                <p className="text-gray-600">All orders from your restaurant customers</p>
              </div>
            </div>
            <div className="flex space-x-6">
              <div className="text-right">
                <p className="text-3xl font-bold text-orange-600">{totalOrders}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">{formatCurrency(netRevenue)}</p>
                <p className="text-sm text-gray-600">Net Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Commission</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalCommission)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiCreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Order Value</p>
                <p className="text-2xl font-bold text-purple-600">
                  {totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders) : formatCurrency(0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders by customer name, phone, email, restaurant or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'No orders match your search' : 'No orders found from your restaurant customers'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiPackage className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {order.orderId}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.totalItems} item{order.totalItems !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customerEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 flex items-center">
                          <FiPhone className="w-3 h-3 mr-1" />
                          <span className="font-mono">{order.customerPhone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(order.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-blue-600">
                          {formatCurrency(order.commission)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                          {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openOrderDetails(order)}
                          className="flex items-center space-x-1 text-orange-600 hover:text-orange-900 transition-colors"
                        >
                          <FiEye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Order Details - {selectedOrder.orderId}</h3>
                  <button
                    onClick={closeOrderDetails}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Order Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <FiUser className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{selectedOrder.customerName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiPhone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 font-mono">{selectedOrder.customerPhone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiMail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{selectedOrder.customerEmail}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Restaurant Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <FiHome className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{selectedOrder.restaurantName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Breakdown */}
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                    <h4 className="text-sm font-medium text-orange-700 mb-2 flex items-center">
                      <FiCreditCard className="w-4 h-4 mr-2" />
                      Revenue Breakdown
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-orange-700">Gross Revenue:</span>
                        <span className="text-sm font-semibold text-orange-900">{formatCurrency(selectedOrder.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Platform Commission:</span>
                        <span className="text-sm font-semibold text-blue-900">- {formatCurrency(selectedOrder.commission)}</span>
                      </div>
                      <div className="pt-2 border-t border-orange-200 flex justify-between">
                        <span className="text-sm font-medium text-green-700">Net Revenue:</span>
                        <span className="text-sm font-bold text-green-900">
                          {formatCurrency(selectedOrder.totalAmount - selectedOrder.commission)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {selectedOrder.deliveryAddress && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                        <FiMapPin className="w-4 h-4 mr-2" />
                        Delivery Address
                      </h4>
                      <p className="text-sm text-blue-900">
                        {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city}, 
                        {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.postalCode}
                      </p>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="border rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 p-4 border-b">Order Items ({selectedOrder.totalItems})</h4>
                    <div className="p-4 space-y-3">
                      {selectedOrder.products.map((product, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-500">Qty: {product.quantity}</p>
                              {product.addOn && (
                                <p className="text-xs text-gray-500">
                                  {product.addOn.variation} • {product.addOn.plateitems} plates
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(product.basePrice * product.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment & Delivery Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="text-sm font-medium text-green-700 mb-2">Payment Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-green-800">Method:</span>
                          <span className="text-sm font-medium text-green-900">{selectedOrder.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-green-800">Status:</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.paymentStatus)}`}>
                            {selectedOrder.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="text-sm font-medium text-purple-700 mb-2">Delivery Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-purple-800">Status:</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.deliveryStatus)}`}>
                            {selectedOrder.deliveryStatus}
                          </span>
                        </div>
                        {selectedOrder.deliveryBoy && (
                          <div className="flex justify-between">
                            <span className="text-sm text-purple-800">Delivery Partner:</span>
                            <span className="text-sm font-medium text-purple-900">
                              {selectedOrder.deliveryBoy.fullName || 'N/A'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Gross Order Value:</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(selectedOrder.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeOrderDetails}
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

export default VendorUserOrders;
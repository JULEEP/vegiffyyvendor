import React, { useState, useEffect } from 'react';
import { 
  FiBell, 
  FiSearch, 
  FiEye, 
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiPackage,
  FiUser,
  FiX,
  FiTrash2,
  FiCheckSquare,
  FiSquare,
  FiLoader
} from 'react-icons/fi';

const VendorNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  // State for delete functionality
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const vendorId = localStorage.getItem('vendorId');
      if (!vendorId) {
        console.error('Vendor ID not found');
        setLoading(false);
        return;
      }

      const response = await fetch(`https://api.vegiffyy.com/api/vendor/notification/${vendorId}`);
      const result = await response.json();

      if (result.success) {
        // Sort by date (newest first)
        const sortedNotifications = (result.data || []).sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sortedNotifications);
        // Clear selected notifications when fetching new data
        setSelectedNotifications([]);
      } else {
        console.error('Failed to fetch notifications:', result.message);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // DELETE NOTIFICATION FUNCTION - Single delete
  const deleteNotification = async (notificationId) => {
    // Show confirmation
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const vendorId = localStorage.getItem('vendorId');
      
      if (!vendorId) {
        alert('Vendor ID not found');
        return;
      }

      // API call for delete
      const response = await fetch(`https://api.vegiffyy.com/api/vendor/deletenotification/${vendorId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: [notificationId]
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state - remove deleted notification
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        
        // Close modal if deleting the viewed notification
        if (selectedNotification && selectedNotification._id === notificationId) {
          closeNotificationDetails();
        }
        
        // Remove from selected notifications if present
        setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
        
        // Show success message
        alert(result.message);
      } else {
        alert(result.message || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Error deleting notification. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // BULK DELETE FUNCTION - Delete multiple selected notifications
  const deleteSelectedNotifications = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      setIsDeleting(true);
      const vendorId = localStorage.getItem('vendorId');
      
      if (!vendorId) {
        alert('Vendor ID not found');
        return;
      }

      // API call for bulk delete
      const response = await fetch(`https://api.vegiffyy.com/api/vendor/deletenotification/${vendorId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: selectedNotifications
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state - remove all selected notifications
        setNotifications(prev => prev.filter(notif => !selectedNotifications.includes(notif._id)));
        
        // Clear selected notifications
        setSelectedNotifications([]);
        
        // Close modal if viewing a deleted notification
        if (selectedNotification && selectedNotifications.includes(selectedNotification._id)) {
          closeNotificationDetails();
        }
        
        // Hide delete confirmation modal
        setShowDeleteConfirm(false);
        
        // Show success message
        alert(result.message);
      } else {
        alert(result.message || 'Failed to delete notifications');
      }
    } catch (error) {
      console.error('Error deleting notifications:', error);
      alert('Error deleting notifications. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // SELECT/DESELECT ALL notifications
  const toggleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      // Deselect all
      setSelectedNotifications([]);
    } else {
      // Select all
      setSelectedNotifications(filteredNotifications.map(n => n._id));
    }
  };

  // SELECT/DESELECT single notification
  const toggleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };

  // Format notification type
  const getNotificationTypeInfo = (type) => {
    switch (type) {
      case 'order_placed':
        return { 
          color: 'bg-blue-100 text-blue-800',
          icon: FiPackage,
          label: 'New Order'
        };
      case 'order_cancelled':
        return { 
          color: 'bg-red-100 text-red-800',
          icon: FiXCircle,
          label: 'Order Cancelled'
        };
      case 'order_accepted':
        return { 
          color: 'bg-green-100 text-green-800',
          icon: FiCheckCircle,
          label: 'Order Accepted'
        };
      case 'order_delivered':
        return { 
          color: 'bg-purple-100 text-purple-800',
          icon: FiCheckCircle,
          label: 'Order Delivered'
        };
      case 'review_added':
        return { 
          color: 'bg-yellow-100 text-yellow-800',
          icon: FiUser,
          label: 'New Review'
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800',
          icon: FiBell,
          label: 'Notification'
        };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      notification.title?.toLowerCase().includes(searchLower) ||
      notification.message?.toLowerCase().includes(searchLower) ||
      (notification.data?.customerName?.toLowerCase() || '').includes(searchLower) ||
      (notification.data?.orderNumber?.toLowerCase() || '').includes(searchLower)
    );
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const openNotificationDetails = (notification) => {
    setSelectedNotification(notification);
    setShowNotificationModal(true);
  };

  const closeNotificationDetails = () => {
    setSelectedNotification(null);
    setShowNotificationModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiBell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Restaurant Notifications</h1>
                <p className="text-gray-600">Stay updated with your restaurant activities</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{filteredNotifications.length}</p>
                <p className="text-sm text-gray-600">Total Notifications</p>
              </div>
              {unreadCount > 0 && (
                <div className="relative">
                  <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    {unreadCount} unread
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar - NO MARK AS READ BUTTONS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search notifications by title, message, customer name or order number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Bulk Delete Button */}
              {selectedNotifications.length > 0 && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <FiLoader className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiTrash2 className="w-4 h-4" />
                  )}
                  <span>Delete Selected ({selectedNotifications.length})</span>
                </button>
              )}
              
              <button
                onClick={fetchNotifications}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiBell className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <FiBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No matching notifications found' : 'No notifications available'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'You will receive notifications when customers place orders or perform actions on your restaurant'
                }
              </p>
            </div>
          ) : (
            <div>
              {/* Select All Header */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  {selectedNotifications.length === filteredNotifications.length ? (
                    <FiCheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <FiSquare className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">
                    {selectedNotifications.length === filteredNotifications.length 
                      ? 'Deselect All' 
                      : 'Select All'}
                  </span>
                </button>
                {selectedNotifications.length > 0 && (
                  <span className="ml-4 text-sm text-gray-500">
                    {selectedNotifications.length} selected
                  </span>
                )}
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => {
                  const typeInfo = getNotificationTypeInfo(notification.type);
                  const TypeIcon = typeInfo.icon;
                  const isSelected = selectedNotifications.includes(notification._id);
                  
                  return (
                    <div 
                      key={notification._id} 
                      className={`p-6 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        {/* Checkbox for selection */}
                        <div className="flex-shrink-0 mr-4">
                          <button
                            onClick={() => toggleSelectNotification(notification._id)}
                            className="focus:outline-none"
                          >
                            {isSelected ? (
                              <FiCheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                              <FiSquare className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        </div>
                        
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                            <TypeIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                                {typeInfo.label}
                              </span>
                              {!notification.isRead && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  New
                                </span>
                              )}
                              <span className="text-xs text-gray-500 flex items-center">
                                <FiClock className="w-3 h-3 mr-1" />
                                {formatDate(notification.createdAt)}
                              </span>
                            </div>
                            
                            <h4 className="font-medium text-gray-900 mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-gray-600 text-sm mb-2">
                              {notification.message}
                            </p>
                            
                            {/* Order details if available */}
                            {notification.data && notification.data.orderNumber && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-gray-500">Order #:</span>
                                    <span className="ml-2 font-medium text-gray-900">
                                      {notification.data.orderNumber}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Amount:</span>
                                    <span className="ml-2 font-medium text-green-600">
                                      ₹{notification.data.totalAmount || 'N/A'}
                                    </span>
                                  </div>
                                  {notification.data.customerName && (
                                    <div>
                                      <span className="text-gray-500">Customer:</span>
                                      <span className="ml-2 font-medium text-gray-900">
                                        {notification.data.customerName}
                                      </span>
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-gray-500">Payment:</span>
                                    <span className={`ml-2 font-medium ${
                                      notification.data.paymentStatus === 'Paid' 
                                        ? 'text-green-600' 
                                        : 'text-yellow-600'
                                    }`}>
                                      {notification.data.paymentMethod || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-3 flex items-center space-x-3">
                              <button
                                onClick={() => openNotificationDetails(notification)}
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors text-sm"
                              >
                                <FiEye className="w-4 h-4" />
                                <span>View Details</span>
                              </button>
                              
                              {/* Delete Button */}
                              <button
                                onClick={() => deleteNotification(notification._id)}
                                className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition-colors text-sm"
                                disabled={isDeleting}
                              >
                                <FiTrash2 className="w-4 h-4" />
                                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notification Details Modal - NO MARK AS READ BUTTON */}
        {showNotificationModal && selectedNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Notification Details</h3>
                  <button
                    onClick={closeNotificationDetails}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Notification Header */}
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className={`p-3 rounded-lg ${getNotificationTypeInfo(selectedNotification.type).color}`}>
                        {React.createElement(getNotificationTypeInfo(selectedNotification.type).icon, { className: "w-6 h-6" })}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getNotificationTypeInfo(selectedNotification.type).color}`}>
                          {getNotificationTypeInfo(selectedNotification.type).label}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(selectedNotification.createdAt)}
                        </span>
                        {!selectedNotification.isRead && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Unread
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        {selectedNotification.title}
                      </h4>
                      <p className="text-gray-600">
                        {selectedNotification.message}
                      </p>
                    </div>
                  </div>

                  {/* Order Details */}
                  {selectedNotification.data && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        <h4 className="font-medium text-gray-900">Order Information</h4>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedNotification.data.orderId && (
                            <div>
                              <p className="text-sm text-gray-500">Order ID</p>
                              <p className="font-medium text-gray-900 font-mono">
                                {selectedNotification.data.orderNumber || 'N/A'}
                              </p>
                            </div>
                          )}
                          
                          {selectedNotification.data.totalAmount && (
                            <div>
                              <p className="text-sm text-gray-500">Total Amount</p>
                              <p className="text-xl font-bold text-green-600">
                                ₹{selectedNotification.data.totalAmount}
                              </p>
                            </div>
                          )}
                          
                          {selectedNotification.data.customerName && (
                            <div>
                              <p className="text-sm text-gray-500">Customer Name</p>
                              <p className="font-medium text-gray-900">
                                {selectedNotification.data.customerName}
                              </p>
                            </div>
                          )}
                          
                          {selectedNotification.data.customerPhone && (
                            <div>
                              <p className="text-sm text-gray-500">Customer Phone</p>
                              <p className="font-medium text-gray-900">
                                {selectedNotification.data.customerPhone}
                              </p>
                            </div>
                          )}
                          
                          {selectedNotification.data.paymentMethod && (
                            <div>
                              <p className="text-sm text-gray-500">Payment Method</p>
                              <p className="font-medium text-gray-900">
                                {selectedNotification.data.paymentMethod}
                              </p>
                            </div>
                          )}
                          
                          {selectedNotification.data.paymentStatus && (
                            <div>
                              <p className="text-sm text-gray-500">Payment Status</p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                selectedNotification.data.paymentStatus === 'Paid' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {selectedNotification.data.paymentStatus}
                              </span>
                            </div>
                          )}
                          
                          {selectedNotification.data.itemCount && (
                            <div>
                              <p className="text-sm text-gray-500">Items Count</p>
                              <p className="font-medium text-gray-900">
                                {selectedNotification.data.itemCount} items
                              </p>
                            </div>
                          )}
                          
                          {selectedNotification.data.timestamp && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-500">Timestamp</p>
                              <p className="font-medium text-gray-900">
                                {new Date(selectedNotification.data.timestamp).toLocaleString('en-IN')}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Products List */}
                        {selectedNotification.data.products && selectedNotification.data.products.length > 0 && (
                          <div className="mt-6">
                            <h5 className="font-medium text-gray-900 mb-3">Order Items</h5>
                            <div className="space-y-2">
                              {selectedNotification.data.products.map((product, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <p className="font-medium text-gray-900">{product.name}</p>
                                    <p className="text-sm text-gray-500">
                                      Qty: {product.quantity} × ₹{product.price}
                                    </p>
                                  </div>
                                  <p className="font-semibold text-gray-900">
                                    ₹{product.total}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Delivery Address */}
                        {selectedNotification.data.deliveryAddress && (
                          <div className="mt-6">
                            <h5 className="font-medium text-gray-900 mb-3">Delivery Address</h5>
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <p className="font-medium text-gray-900">
                                {selectedNotification.data.deliveryAddress.name}
                              </p>
                              <p className="text-gray-600 mt-1">
                                {selectedNotification.data.deliveryAddress.address}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span>{selectedNotification.data.deliveryAddress.city}</span>
                                <span>{selectedNotification.data.deliveryAddress.pincode}</span>
                                {selectedNotification.data.deliveryAddress.phone && (
                                  <span>{selectedNotification.data.deliveryAddress.phone}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Raw Data (for debugging) */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-6">
                      <details>
                        <summary className="cursor-pointer text-sm text-gray-500">View Raw Data</summary>
                        <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto max-h-60">
                          {JSON.stringify(selectedNotification, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>

                {/* Action Buttons - NO MARK AS READ BUTTON */}
                <div className="mt-6 flex justify-between">
                  <div className="flex space-x-3">
                    {/* Delete Button in Modal */}
                    <button
                      onClick={() => deleteNotification(selectedNotification._id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      disabled={isDeleting}
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  </div>
                  <button
                    onClick={closeNotificationDetails}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal for Bulk Delete */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                  <FiTrash2 className="w-6 h-6 text-red-600" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                  Delete {selectedNotifications.length} Notification{selectedNotifications.length > 1 ? 's' : ''}?
                </h3>
                
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to delete {selectedNotifications.length} selected notification{selectedNotifications.length > 1 ? 's' : ''}? This action cannot be undone.
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteSelectedNotifications}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <FiTrash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </>
                    )}
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

export default VendorNotifications;